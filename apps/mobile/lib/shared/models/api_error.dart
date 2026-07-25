import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_error.freezed.dart';
part 'api_error.g.dart';

/// The single error shape used by every endpoint:
/// `{ "error": { "code": "...", "message": "..." } }`.
@freezed
abstract class ApiErrorDetail with _$ApiErrorDetail {
  const factory ApiErrorDetail({
    required String code,
    required String message,
  }) = _ApiErrorDetail;

  factory ApiErrorDetail.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorDetailFromJson(json);
}

@freezed
abstract class ApiErrorBody with _$ApiErrorBody {
  const factory ApiErrorBody({required ApiErrorDetail error}) = _ApiErrorBody;

  factory ApiErrorBody.fromJson(Map<String, dynamic> json) =>
      _$ApiErrorBodyFromJson(json);
}

/// Known error codes from the contract.
abstract final class ApiErrorCode {
  static const String validation = 'VALIDATION_ERROR';
  static const String unauthenticated = 'UNAUTHENTICATED';
  static const String forbidden = 'FORBIDDEN';
  static const String notFound = 'NOT_FOUND';
  static const String idempotencyKeyReused = 'IDEMPOTENCY_KEY_REUSED';
  static const String insufficientInventory = 'INSUFFICIENT_INVENTORY';
  static const String cutoffPassed = 'CUTOFF_PASSED';
  static const String rateLimited = 'RATE_LIMITED';
}
