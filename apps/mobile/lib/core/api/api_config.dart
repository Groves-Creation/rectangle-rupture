/// Environment configuration for the API.
///
/// The base URL is injected at build time:
///
/// ```
/// flutter run --flavor dev --dart-define=API_BASE_URL=http://192.168.1.144:3000
/// ```
///
/// It must never be hardcoded in a widget or repository.
abstract final class ApiConfig {
  /// Defaults to the Android emulator's alias for the host machine's loopback.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 20);
  static const Duration sendTimeout = Duration(seconds: 20);
}

/// Every path used by the app, relative to [ApiConfig.baseUrl].
abstract final class ApiPaths {
  static const String login = '/api/auth/login';
  static const String refresh = '/api/auth/refresh';
  static const String logout = '/api/auth/logout';
  static const String me = '/api/auth/me';

  static const String catalog = '/api/catalog';
  static String catalogItem(String variantId) => '/api/catalog/$variantId';

  static const String cart = '/api/cart';
  static const String cartLines = '/api/cart/lines';
  static String cartLine(String lineId) => '/api/cart/lines/$lineId';

  static const String orders = '/api/orders';
  static String order(String id) => '/api/orders/$id';
}

/// Header names agreed with the API team.
abstract final class ApiHeaders {
  static const String authorization = 'Authorization';
  static const String idempotencyKey = 'Idempotency-Key';
}
