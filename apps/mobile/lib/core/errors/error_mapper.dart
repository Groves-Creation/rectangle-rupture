import 'package:dio/dio.dart';

import '../../shared/models/api_error.dart';
import 'failure.dart';

/// Translates anything thrown by Dio into a [Failure].
///
/// The contract guarantees one error envelope
/// (`{ "error": { "code", "message" } }`), but a proxy or a crash can still
/// return HTML or an empty body, so parsing is defensive.
Failure mapError(Object error, [StackTrace? stackTrace]) {
  if (error is Failure) return error;
  if (error is DioException) return _mapDioException(error);
  return Failure.unexpected(message: 'Something went wrong.', cause: error);
}

Failure _mapDioException(DioException error) {
  switch (error.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
    case DioExceptionType.transformTimeout:
      return const Failure.timeout();
    case DioExceptionType.connectionError:
    case DioExceptionType.unknown:
      return const Failure.network();
    case DioExceptionType.cancel:
      return const Failure.cancelled();
    case DioExceptionType.badCertificate:
      return const Failure.network(
        message: 'The server certificate was rejected.',
      );
    case DioExceptionType.badResponse:
      break;
  }

  final response = error.response;
  final statusCode = response?.statusCode ?? 0;
  final detail = parseApiErrorDetail(response?.data);
  if (detail != null) {
    return Failure.api(
      statusCode: statusCode,
      code: detail.code,
      message: detail.message,
    );
  }
  return Failure.api(
    statusCode: statusCode,
    code: _fallbackCodeFor(statusCode),
    message: '',
  );
}

/// Best-effort parse of the contract error envelope out of a response body.
ApiErrorDetail? parseApiErrorDetail(Object? data) {
  if (data is! Map) return null;
  final error = data['error'];
  if (error is! Map) return null;
  final code = error['code'];
  final message = error['message'];
  if (code is! String) return null;
  return ApiErrorDetail(code: code, message: message is String ? message : '');
}

String _fallbackCodeFor(int statusCode) => switch (statusCode) {
  400 => ApiErrorCode.validation,
  401 => ApiErrorCode.unauthenticated,
  403 => ApiErrorCode.forbidden,
  404 => ApiErrorCode.notFound,
  429 => ApiErrorCode.rateLimited,
  _ => 'HTTP_$statusCode',
};
