import 'dart:async';

import 'package:dio/dio.dart';

import '../../shared/models/auth_models.dart';
import '../auth/token_refresher.dart';
import '../auth/token_storage.dart';
import 'api_config.dart';

/// Attaches the bearer token, and on a `401` refreshes it once and replays the
/// original request.
///
/// The hard part is concurrency. A screen typically fires several requests at
/// once; when the access token expires they all come back `401` at roughly the
/// same moment. Refreshing per failure would burn N refresh tokens, and the
/// contract says presenting an already-consumed refresh token **revokes the
/// entire session family** — so the naive version logs the user out.
///
/// Two guarantees are implemented here:
///
/// 1. A [Completer]-based mutex ([_inFlight]). It is assigned synchronously,
///    before any `await`, so every concurrent failure either starts the one
///    refresh or awaits the one already running. Exactly one
///    `POST /api/auth/refresh` is issued.
/// 2. A stale-token check. A request that was already in flight when the
///    refresh completed will fail with the *old* access token afterwards.
///    Rather than starting a second refresh (and burning the freshly rotated
///    refresh token), it notices storage already holds a different access
///    token and simply replays with it.
///
/// Each request is replayed at most once, tracked by [_retriedFlag].
class AuthInterceptor extends Interceptor {
  AuthInterceptor({
    required this.tokenStorage,
    required this.refresher,
    required this.replayClient,
    this.onSessionExpired,
  });

  /// Marks a request as "already replayed after a refresh".
  static const String _retriedFlag = 'lit.auth.retried';

  /// Opt a request out of the whole mechanism (used for login/refresh).
  static const String skipAuthFlag = 'lit.auth.skip';

  /// Convenience for building request `extra` maps.
  static Map<String, dynamic> get skipAuth => <String, dynamic>{
    skipAuthFlag: true,
  };

  final TokenStorage tokenStorage;
  final TokenRefresher refresher;

  /// Returns the Dio used to replay the original request. It is a callback
  /// because the interceptor is constructed before the client it belongs to.
  final Dio Function() replayClient;

  /// Called when refreshing failed and the session is unrecoverable.
  final void Function()? onSessionExpired;

  Completer<AuthTokens?>? _inFlight;

  /// Visible for tests: whether a refresh is currently running.
  bool get isRefreshing => _inFlight != null;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra[skipAuthFlag] == true) {
      handler.next(options);
      return;
    }
    // An explicit Authorization header wins: it is how a replayed request
    // carries the token it was retried with.
    if (!options.headers.containsKey(ApiHeaders.authorization)) {
      final tokens = await tokenStorage.read();
      if (tokens != null) {
        options.headers[ApiHeaders.authorization] =
            'Bearer ${tokens.accessToken}';
      }
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final options = err.requestOptions;
    final isUnauthorized = err.response?.statusCode == 401;
    final optedOut = options.extra[skipAuthFlag] == true;
    final alreadyRetried = options.extra[_retriedFlag] == true;

    if (!isUnauthorized || optedOut || alreadyRetried) {
      handler.next(err);
      return;
    }

    final sentAccessToken = _bearerOf(
      options.headers[ApiHeaders.authorization],
    );
    final tokens = await _refreshOnce(sentAccessToken);

    if (tokens == null) {
      onSessionExpired?.call();
      handler.next(err);
      return;
    }

    options.extra[_retriedFlag] = true;
    options.headers[ApiHeaders.authorization] = 'Bearer ${tokens.accessToken}';

    try {
      final response = await replayClient().fetch<dynamic>(options);
      handler.resolve(response);
    } on DioException catch (error) {
      handler.next(error);
    }
  }

  /// The mutex. [_inFlight] is read and written with no `await` in between, so
  /// concurrent callers cannot both observe `null`.
  Future<AuthTokens?> _refreshOnce(String? sentAccessToken) {
    final inFlight = _inFlight;
    if (inFlight != null) return inFlight.future;

    final completer = Completer<AuthTokens?>();
    _inFlight = completer;

    _performRefresh(sentAccessToken)
        .then((tokens) {
          _inFlight = null;
          completer.complete(tokens);
        })
        .catchError((Object _, StackTrace _) {
          _inFlight = null;
          completer.complete(null);
        });

    return completer.future;
  }

  Future<AuthTokens?> _performRefresh(String? sentAccessToken) async {
    final current = await tokenStorage.read();
    if (current == null) return null;

    // Someone already rotated the tokens while this request was in flight.
    // Replay with what is stored instead of consuming another refresh token.
    if (sentAccessToken != null && current.accessToken != sentAccessToken) {
      return current;
    }

    final refreshed = await refresher.refresh(current.refreshToken);
    if (refreshed == null) {
      await tokenStorage.clear();
      return null;
    }
    await tokenStorage.write(refreshed);
    return refreshed;
  }

  static String? _bearerOf(Object? headerValue) {
    if (headerValue is! String) return null;
    const prefix = 'Bearer ';
    if (!headerValue.startsWith(prefix)) return null;
    return headerValue.substring(prefix.length);
  }
}
