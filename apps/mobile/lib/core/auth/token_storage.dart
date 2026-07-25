import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../shared/models/auth_models.dart';

/// Where the access/refresh pair lives.
///
/// Tokens are secrets: the only production implementation is backed by
/// `flutter_secure_storage` (Android Keystore). They must never go into
/// SharedPreferences.
abstract interface class TokenStorage {
  Future<AuthTokens?> read();
  Future<void> write(AuthTokens tokens);
  Future<void> clear();
}

class SecureTokenStorage implements TokenStorage {
  SecureTokenStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const String _accessTokenKey = 'lit.auth.accessToken';
  static const String _refreshTokenKey = 'lit.auth.refreshToken';
  static const String _expiresInKey = 'lit.auth.expiresIn';

  final FlutterSecureStorage _storage;

  @override
  Future<AuthTokens?> read() async {
    final accessToken = await _storage.read(key: _accessTokenKey);
    final refreshToken = await _storage.read(key: _refreshTokenKey);
    if (accessToken == null || refreshToken == null) return null;
    final expiresIn = int.tryParse(
      await _storage.read(key: _expiresInKey) ?? '',
    );
    return AuthTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: expiresIn ?? 0,
    );
  }

  @override
  Future<void> write(AuthTokens tokens) async {
    await _storage.write(key: _accessTokenKey, value: tokens.accessToken);
    await _storage.write(key: _refreshTokenKey, value: tokens.refreshToken);
    await _storage.write(key: _expiresInKey, value: '${tokens.expiresIn}');
  }

  @override
  Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _expiresInKey);
  }
}

/// Non-persistent implementation used by tests and by widget previews.
class InMemoryTokenStorage implements TokenStorage {
  InMemoryTokenStorage([this._tokens]);

  AuthTokens? _tokens;

  @override
  Future<AuthTokens?> read() async => _tokens;

  @override
  Future<void> write(AuthTokens tokens) async => _tokens = tokens;

  @override
  Future<void> clear() async => _tokens = null;
}

/// Overridden in tests with an [InMemoryTokenStorage].
final tokenStorageProvider = Provider<TokenStorage>(
  (ref) => SecureTokenStorage(),
);
