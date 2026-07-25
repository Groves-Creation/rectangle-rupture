import 'package:freezed_annotation/freezed_annotation.dart';

import '../../shared/models/api_error.dart';

part 'failure.freezed.dart';

/// Everything that can go wrong, normalised into one closed set.
///
/// Repositories only ever throw a [Failure]; the presentation layer only ever
/// renders [Failure.userMessage].
@freezed
sealed class Failure with _$Failure {
  const Failure._();

  /// No usable connection, DNS failure, connection refused, socket error.
  const factory Failure.network({
    @Default('No connection to the server. Check your network and try again.')
    String message,
  }) = NetworkFailure;

  /// The request was sent but the server did not answer in time.
  const factory Failure.timeout({
    @Default('The server took too long to respond.') String message,
  }) = TimeoutFailure;

  /// The server answered with the contract error envelope.
  const factory Failure.api({
    required int statusCode,
    required String code,
    required String message,
  }) = ApiFailure;

  /// The request was cancelled (e.g. the screen was disposed).
  const factory Failure.cancelled() = CancelledFailure;

  /// Anything else, including malformed payloads.
  const factory Failure.unexpected({
    @Default('Something went wrong.') String message,
    Object? cause,
  }) = UnexpectedFailure;

  /// Message safe to put in front of a warehouse user.
  String get userMessage => switch (this) {
    NetworkFailure(:final message) => message,
    TimeoutFailure(:final message) => message,
    ApiFailure(:final code, :final message) => _apiMessage(code, message),
    CancelledFailure() => 'Request cancelled.',
    UnexpectedFailure(:final message) => message,
  };

  /// True when the session is gone and the user must sign in again.
  bool get isUnauthenticated => switch (this) {
    ApiFailure(:final statusCode) => statusCode == 401,
    _ => false,
  };

  /// True when retrying the exact same request is sensible.
  bool get isRetryable => switch (this) {
    NetworkFailure() || TimeoutFailure() => true,
    ApiFailure(:final statusCode) => statusCode >= 500 || statusCode == 429,
    _ => false,
  };

  static String _apiMessage(String code, String message) {
    if (message.trim().isNotEmpty) return message;
    return switch (code) {
      ApiErrorCode.validation => 'That request was not valid.',
      ApiErrorCode.unauthenticated => 'Your session has expired.',
      ApiErrorCode.forbidden => 'You do not have access to that.',
      ApiErrorCode.notFound => 'Not found.',
      ApiErrorCode.idempotencyKeyReused => 'That order was already submitted.',
      ApiErrorCode.insufficientInventory => 'Not enough stock available.',
      ApiErrorCode.cutoffPassed => 'The ordering cut-off has passed.',
      ApiErrorCode.rateLimited => 'Too many requests. Wait a moment.',
      _ => 'Something went wrong.',
    };
  }
}
