import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';

import '../../../core/auth/session_controller.dart';
import '../../../core/errors/failure.dart';
import '../../../shared/models/order_models.dart';
import '../data/orders_repository.dart';

part 'order_submission.g.dart';

/// State of the "submit this cart" attempt.
class OrderSubmissionState {
  const OrderSubmissionState({
    this.idempotencyKey,
    this.isSubmitting = false,
    this.failure,
  });

  /// The key for the **current attempt**. Non-null once a submit has been
  /// tried and has not yet succeeded.
  final String? idempotencyKey;
  final bool isSubmitting;
  final Failure? failure;

  bool get isRetry => idempotencyKey != null && failure != null;
}

/// Owns the `Idempotency-Key` lifecycle for order submission.
///
/// The key is minted **once per attempt** and deliberately survives failures:
/// if the phone loses Wi-Fi mid-request the order may well have been created
/// server-side, so retrying with a *fresh* key would create a second one.
/// Retrying with the same key returns the original order instead.
///
/// The key is dropped only when the submit succeeds, or when [reset] is called
/// because the cart changed (a different cart is a different order).
@riverpod
class OrderSubmission extends _$OrderSubmission {
  static const Uuid _uuid = Uuid();

  @override
  OrderSubmissionState build() => const OrderSubmissionState();

  /// Throws [Failure] on failure; the key is retained for the next attempt.
  Future<OrderDetail> submit({String? notes}) async {
    final storeId = ref.read(selectedStoreIdProvider);
    if (storeId == null) {
      throw const Failure.unexpected(message: 'Choose a store first.');
    }

    // Reuse the pending key if this is a retry.
    final key = state.idempotencyKey ?? _uuid.v4();
    state = OrderSubmissionState(idempotencyKey: key, isSubmitting: true);

    try {
      final order = await ref
          .read(ordersRepositoryProvider)
          .submitOrder(storeId: storeId, idempotencyKey: key, notes: notes);
      // Success: the key is spent.
      state = const OrderSubmissionState();
      return order;
    } on Failure catch (failure) {
      state = OrderSubmissionState(
        idempotencyKey: key,
        isSubmitting: false,
        failure: failure,
      );
      rethrow;
    }
  }

  /// Abandons the pending key. Call this when the cart contents change.
  void reset() => state = const OrderSubmissionState();
}
