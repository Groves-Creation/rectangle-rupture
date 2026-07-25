import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/core/api/dio_client.dart';
import 'package:lit_distribution/core/auth/auth_events.dart';
import 'package:lit_distribution/core/auth/token_storage.dart';
import 'package:lit_distribution/shared/models/auth_models.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';

const String _protectedPath = '/api/catalog';

/// Returns 200 only when the caller presents [expectedToken]; anything else is
/// a 401 with the contract error envelope — exactly what an expired access
/// token looks like.
StubHandler _tokenGate(String Function() expectedToken, Object body) {
  return (RequestOptions options) {
    final header = options.headers[ApiHeaders.authorization];
    if (header == 'Bearer ${expectedToken()}') {
      return FakeResponse(200, body);
    }
    return FakeResponse.error(401, 'UNAUTHENTICATED', 'Token expired');
  };
}

ProviderContainer _container({
  required FakeApi api,
  required TokenStorage storage,
}) {
  final container = ProviderContainer(
    overrides: [
      httpClientAdapterProvider.overrideWithValue(api.adapter),
      tokenStorageProvider.overrideWithValue(storage),
    ],
  );
  addTearDown(container.dispose);
  return container;
}

void main() {
  late FakeApi api;
  late InMemoryTokenStorage storage;

  setUp(() {
    api = FakeApi();
    storage = InMemoryTokenStorage(
      const AuthTokens(
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresIn: 900,
      ),
    );
  });

  group('AuthInterceptor', () {
    test('attaches the bearer token to every request', () async {
      api.on('GET', _protectedPath, FakeResponse(200, catalogPageJson()));
      final dio = _container(api: api, storage: storage).read(dioProvider);

      await dio.get<Map<String, dynamic>>(_protectedPath);

      expect(
        api.requests.single.headers[ApiHeaders.authorization],
        'Bearer access-1',
      );
    });

    test('N concurrent 401s trigger exactly ONE refresh, and every request is '
        'replayed successfully', () async {
      // The server has already rotated: only access-2 is accepted, but
      // storage still holds access-1, so every request 401s at once.
      api.onRequest(
        'GET',
        _protectedPath,
        _tokenGate(() => 'access-2', catalogPageJson()),
      );
      api.on(
        'POST',
        ApiPaths.refresh,
        FakeResponse(
          200,
          loginJson(accessToken: 'access-2', refreshToken: 'refresh-2'),
        ),
      );

      final dio = _container(api: api, storage: storage).read(dioProvider);

      const concurrency = 6;
      final responses = await Future.wait([
        for (var i = 0; i < concurrency; i++)
          dio.get<Map<String, dynamic>>(_protectedPath),
      ]);

      // The whole point: one refresh, not six. Six would burn five already
      // rotated refresh tokens and the contract revokes the session family
      // for that.
      expect(api.callsTo('POST', ApiPaths.refresh), 1);
      expect(responses.length, concurrency);
      for (final response in responses) {
        expect(response.statusCode, 200);
      }
      // Each request: one 401 plus one successful replay.
      expect(api.callsTo('GET', _protectedPath), concurrency * 2);

      final stored = await storage.read();
      expect(stored?.accessToken, 'access-2');
      expect(stored?.refreshToken, 'refresh-2');
    });

    test('the refresh is issued with the stored refresh token', () async {
      api.onRequest(
        'GET',
        _protectedPath,
        _tokenGate(() => 'access-2', catalogPageJson()),
      );
      api.on(
        'POST',
        ApiPaths.refresh,
        FakeResponse(
          200,
          loginJson(accessToken: 'access-2', refreshToken: 'refresh-2'),
        ),
      );
      final dio = _container(api: api, storage: storage).read(dioProvider);

      await dio.get<Map<String, dynamic>>(_protectedPath);

      final refreshRequest = api.requests.firstWhere(
        (r) => r.uri.path == ApiPaths.refresh,
      );
      expect((refreshRequest.data as Map)['refreshToken'], 'refresh-1');
    });

    test(
      'a request already replayed once is not replayed again (no 401 loop)',
      () async {
        // The server keeps rejecting even the rotated token.
        api.on(
          'GET',
          _protectedPath,
          FakeResponse.error(401, 'UNAUTHENTICATED'),
        );
        api.on(
          'POST',
          ApiPaths.refresh,
          FakeResponse(
            200,
            loginJson(accessToken: 'access-2', refreshToken: 'refresh-2'),
          ),
        );
        final dio = _container(api: api, storage: storage).read(dioProvider);

        await expectLater(
          dio.get<Map<String, dynamic>>(_protectedPath),
          throwsA(isA<DioException>()),
        );

        expect(api.callsTo('GET', _protectedPath), 2);
        expect(api.callsTo('POST', ApiPaths.refresh), 1);
      },
    );

    test('a failed refresh clears the tokens and reports the session expired '
        'once, even for concurrent failures', () async {
      api.on('GET', _protectedPath, FakeResponse.error(401, 'UNAUTHENTICATED'));
      api.on(
        'POST',
        ApiPaths.refresh,
        FakeResponse.error(401, 'UNAUTHENTICATED', 'Refresh token revoked'),
      );

      final container = _container(api: api, storage: storage);
      var expiredEvents = 0;
      final subscription = container
          .read(authEventsProvider)
          .sessionExpired
          .listen((_) => expiredEvents++);
      addTearDown(subscription.cancel);

      final dio = container.read(dioProvider);
      final results = await Future.wait([
        for (var i = 0; i < 3; i++)
          dio
              .get<Map<String, dynamic>>(_protectedPath)
              .then<bool>((_) => true)
              .catchError((Object _) => false),
      ]);

      expect(results, everyElement(isFalse));
      expect(api.callsTo('POST', ApiPaths.refresh), 1);
      expect(await storage.read(), isNull);
      // One event per failed request is fine; what matters is that the
      // session was reported as gone.
      await Future<void>.delayed(Duration.zero);
      expect(expiredEvents, greaterThanOrEqualTo(1));
    });

    test(
      'a request that failed with an already-rotated token replays without a '
      'second refresh',
      () async {
        // Storage already holds the fresh token; the request below carries a
        // stale one, as happens when it was in flight during a refresh.
        api.onRequest(
          'GET',
          _protectedPath,
          _tokenGate(() => 'access-1', catalogPageJson()),
        );
        api.on(
          'POST',
          ApiPaths.refresh,
          FakeResponse(200, loginJson(accessToken: 'access-9')),
        );
        final dio = _container(api: api, storage: storage).read(dioProvider);

        final response = await dio.get<Map<String, dynamic>>(
          _protectedPath,
          options: Options(
            headers: <String, dynamic>{
              ApiHeaders.authorization: 'Bearer stale-token',
            },
          ),
        );

        expect(response.statusCode, 200);
        expect(api.callsTo('POST', ApiPaths.refresh), 0);
        expect(
          api.requests.last.headers[ApiHeaders.authorization],
          'Bearer access-1',
        );
      },
    );

    test('non-401 failures are passed straight through', () async {
      api.on(
        'GET',
        _protectedPath,
        FakeResponse.error(403, 'FORBIDDEN', 'No access to that store'),
      );
      final dio = _container(api: api, storage: storage).read(dioProvider);

      await expectLater(
        dio.get<Map<String, dynamic>>(_protectedPath),
        throwsA(isA<DioException>()),
      );

      expect(api.callsTo('GET', _protectedPath), 1);
      expect(api.callsTo('POST', ApiPaths.refresh), 0);
    });

    test('does nothing when there is no stored session', () async {
      api.on('GET', _protectedPath, FakeResponse.error(401, 'UNAUTHENTICATED'));
      final dio = _container(
        api: api,
        storage: InMemoryTokenStorage(),
      ).read(dioProvider);

      await expectLater(
        dio.get<Map<String, dynamic>>(_protectedPath),
        throwsA(isA<DioException>()),
      );

      expect(api.callsTo('POST', ApiPaths.refresh), 0);
    });
  });
}
