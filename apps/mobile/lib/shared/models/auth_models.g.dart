// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AuthUser _$AuthUserFromJson(Map<String, dynamic> json) => _AuthUser(
  id: json['id'] as String,
  email: json['email'] as String,
  fullName: json['fullName'] as String,
  roles:
      (json['roles'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const <String>[],
);

Map<String, dynamic> _$AuthUserToJson(_AuthUser instance) => <String, dynamic>{
  'id': instance.id,
  'email': instance.email,
  'fullName': instance.fullName,
  'roles': instance.roles,
};

_StoreSummary _$StoreSummaryFromJson(Map<String, dynamic> json) =>
    _StoreSummary(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
    );

Map<String, dynamic> _$StoreSummaryToJson(_StoreSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'code': instance.code,
      'name': instance.name,
      'type': instance.type,
    };

_AuthTokens _$AuthTokensFromJson(Map<String, dynamic> json) => _AuthTokens(
  accessToken: json['accessToken'] as String,
  refreshToken: json['refreshToken'] as String,
  expiresIn: (json['expiresIn'] as num).toInt(),
);

Map<String, dynamic> _$AuthTokensToJson(_AuthTokens instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
      'expiresIn': instance.expiresIn,
    };

_AuthSession _$AuthSessionFromJson(Map<String, dynamic> json) => _AuthSession(
  accessToken: json['accessToken'] as String,
  refreshToken: json['refreshToken'] as String,
  expiresIn: (json['expiresIn'] as num).toInt(),
  user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
  stores:
      (json['stores'] as List<dynamic>?)
          ?.map((e) => StoreSummary.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <StoreSummary>[],
);

Map<String, dynamic> _$AuthSessionToJson(_AuthSession instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
      'expiresIn': instance.expiresIn,
      'user': instance.user,
      'stores': instance.stores,
    };

_MeResponse _$MeResponseFromJson(Map<String, dynamic> json) => _MeResponse(
  user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
  stores:
      (json['stores'] as List<dynamic>?)
          ?.map((e) => StoreSummary.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <StoreSummary>[],
);

Map<String, dynamic> _$MeResponseToJson(_MeResponse instance) =>
    <String, dynamic>{'user': instance.user, 'stores': instance.stores};

_LoginRequest _$LoginRequestFromJson(Map<String, dynamic> json) =>
    _LoginRequest(
      email: json['email'] as String,
      password: json['password'] as String,
      deviceIdentifier: json['deviceIdentifier'] as String?,
    );

Map<String, dynamic> _$LoginRequestToJson(_LoginRequest instance) =>
    <String, dynamic>{
      'email': instance.email,
      'password': instance.password,
      'deviceIdentifier': instance.deviceIdentifier,
    };
