import '../../shared/models/auth_models.dart';

/// The one operation the Dio auth interceptor needs from the authentication
/// feature. Declared in `core` so `core/api` never imports `features/`.
abstract interface class TokenRefresher {
  /// Exchanges [refreshToken] for a fresh pair.
  ///
  /// Returns `null` when the server rejected the refresh token — the caller
  /// must then end the session. Implementations must not throw.
  Future<AuthTokens?> refresh(String refreshToken);
}
