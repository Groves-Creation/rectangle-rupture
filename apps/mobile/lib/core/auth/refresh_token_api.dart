import 'package:dio/dio.dart';

import '../../shared/models/auth_models.dart';
import '../api/api_config.dart';
import 'token_refresher.dart';

/// `POST /api/auth/refresh`, issued on a Dio instance that has **no** auth
/// interceptor attached so a failing refresh can never recurse.
class RefreshTokenApi implements TokenRefresher {
  RefreshTokenApi(this._dio);

  final Dio _dio;

  @override
  Future<AuthTokens?> refresh(String refreshToken) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        ApiPaths.refresh,
        data: <String, dynamic>{'refreshToken': refreshToken},
      );
      final data = response.data;
      if (data == null) return null;
      // The refresh response is the full login shape; only the tokens matter
      // to the interceptor.
      return AuthSession.fromJson(data).tokens;
    } on DioException {
      return null;
    } on Object {
      // A malformed body is as fatal as a 401 for our purposes.
      return null;
    }
  }
}
