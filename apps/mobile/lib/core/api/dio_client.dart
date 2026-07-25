import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_events.dart';
import '../auth/refresh_token_api.dart';
import '../auth/token_refresher.dart';
import '../auth/token_storage.dart';
import 'api_config.dart';
import 'auth_interceptor.dart';

BaseOptions _baseOptions() => BaseOptions(
  baseUrl: ApiConfig.baseUrl,
  connectTimeout: ApiConfig.connectTimeout,
  receiveTimeout: ApiConfig.receiveTimeout,
  sendTimeout: ApiConfig.sendTimeout,
  responseType: ResponseType.json,
  contentType: Headers.jsonContentType,
  headers: <String, dynamic>{'Accept': 'application/json'},
);

/// Overridden in tests with a stub adapter so no socket is ever opened.
/// `null` means "use Dio's platform default".
final httpClientAdapterProvider = Provider<HttpClientAdapter?>((ref) => null);

/// A Dio with **no** auth interceptor, used for login, logout and refresh.
/// Keeping it separate is what stops a failing refresh recursing forever.
final authDioProvider = Provider<Dio>((ref) {
  final dio = Dio(_baseOptions());
  final adapter = ref.watch(httpClientAdapterProvider);
  if (adapter != null) dio.httpClientAdapter = adapter;
  ref.onDispose(() => dio.close());
  return dio;
});

final tokenRefresherProvider = Provider<TokenRefresher>(
  (ref) => RefreshTokenApi(ref.watch(authDioProvider)),
);

/// The client every authenticated repository uses.
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(_baseOptions());
  final adapter = ref.watch(httpClientAdapterProvider);
  if (adapter != null) dio.httpClientAdapter = adapter;

  final events = ref.watch(authEventsProvider);
  dio.interceptors.add(
    AuthInterceptor(
      tokenStorage: ref.watch(tokenStorageProvider),
      refresher: ref.watch(tokenRefresherProvider),
      replayClient: () => dio,
      onSessionExpired: events.emitSessionExpired,
    ),
  );

  ref.onDispose(() => dio.close());
  return dio;
});
