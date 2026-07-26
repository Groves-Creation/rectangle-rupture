import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_models.freezed.dart';
part 'auth_models.g.dart';

/// The authenticated user, as returned by `POST /api/auth/login` and
/// `GET /api/auth/me`.
@freezed
abstract class AuthUser with _$AuthUser {
  const factory AuthUser({
    required String id,
    required String email,
    required String fullName,
    @Default(<String>[]) List<String> roles,
  }) = _AuthUser;

  factory AuthUser.fromJson(Map<String, dynamic> json) =>
      _$AuthUserFromJson(json);
}

/// A location the signed-in user may act on. Contract: `stores[]` on login/me.
@freezed
abstract class StoreSummary with _$StoreSummary {
  const factory StoreSummary({
    required String id,
    required String code,
    required String name,
    required String type,
  }) = _StoreSummary;

  factory StoreSummary.fromJson(Map<String, dynamic> json) =>
      _$StoreSummaryFromJson(json);
}

/// The token pair half of a login/refresh response.
///
/// Kept separate from [AuthSession] so the Dio auth interceptor can depend on
/// tokens without depending on the authentication feature.
@freezed
abstract class AuthTokens with _$AuthTokens {
  const factory AuthTokens({
    required String accessToken,
    required String refreshToken,
    required int expiresIn,
  }) = _AuthTokens;

  factory AuthTokens.fromJson(Map<String, dynamic> json) =>
      _$AuthTokensFromJson(json);
}

/// Full `POST /api/auth/login` / `POST /api/auth/refresh` response.
@freezed
abstract class AuthSession with _$AuthSession {
  const factory AuthSession({
    required String accessToken,
    required String refreshToken,
    required int expiresIn,
    required AuthUser user,
    @Default(<StoreSummary>[]) List<StoreSummary> stores,
  }) = _AuthSession;

  factory AuthSession.fromJson(Map<String, dynamic> json) =>
      _$AuthSessionFromJson(json);
}

/// `GET /api/auth/me` response.
@freezed
abstract class MeResponse with _$MeResponse {
  const factory MeResponse({
    required AuthUser user,
    @Default(<StoreSummary>[]) List<StoreSummary> stores,
  }) = _MeResponse;

  factory MeResponse.fromJson(Map<String, dynamic> json) =>
      _$MeResponseFromJson(json);
}

/// `POST /api/auth/login` request body.
@freezed
abstract class LoginRequest with _$LoginRequest {
  const factory LoginRequest({
    required String email,
    required String password,
    @JsonKey(includeIfNull: false)
    String? deviceIdentifier,
  }) = _LoginRequest;

  factory LoginRequest.fromJson(Map<String, dynamic> json) =>
      _$LoginRequestFromJson(json);
}

extension AuthSessionX on AuthSession {
  AuthTokens get tokens => AuthTokens(
    accessToken: accessToken,
    refreshToken: refreshToken,
    expiresIn: expiresIn,
  );
}
