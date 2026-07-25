import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_config.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/errors/error_mapper.dart';
import '../../../core/errors/failure.dart';
import '../../../shared/models/auth_models.dart';

/// `/api/auth/*` except `refresh`, which lives in `core/auth` because the Dio
/// interceptor owns it.
class AuthRepository {
  AuthRepository({
    required Dio unauthenticatedDio,
    required Dio authenticatedDio,
  }) : _authDio = unauthenticatedDio,
       _dio = authenticatedDio;

  /// No auth interceptor: login and logout must not trigger a token refresh.
  final Dio _authDio;

  /// Carries the bearer token: used for `/api/auth/me`.
  final Dio _dio;

  Future<AuthSession> login({
    required String email,
    required String password,
    String? deviceIdentifier,
  }) async {
    try {
      final response = await _authDio.post<Map<String, dynamic>>(
        ApiPaths.login,
        data: LoginRequest(
          email: email,
          password: password,
          deviceIdentifier: deviceIdentifier,
        ).toJson(),
      );
      return AuthSession.fromJson(_require(response.data));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
  }

  /// Best effort: a failed logout must never block the local sign-out.
  Future<void> logout(String refreshToken) async {
    try {
      await _authDio.post<void>(
        ApiPaths.logout,
        data: <String, dynamic>{'refreshToken': refreshToken},
      );
    } on Object {
      // Ignored on purpose.
    }
  }

  Future<MeResponse> me() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(ApiPaths.me);
      return MeResponse.fromJson(_require(response.data));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
  }

  static Map<String, dynamic> _require(Map<String, dynamic>? data) {
    if (data == null) {
      throw const Failure.unexpected(message: 'The server returned no data.');
    }
    return data;
  }
}

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(
    unauthenticatedDio: ref.watch(authDioProvider),
    authenticatedDio: ref.watch(dioProvider),
  ),
);
