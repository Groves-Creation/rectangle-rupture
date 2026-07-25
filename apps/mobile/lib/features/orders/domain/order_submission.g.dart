// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_submission.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Owns the `Idempotency-Key` lifecycle for order submission.
///
/// The key is minted **once per attempt** and deliberately survives failures:
/// if the phone loses Wi-Fi mid-request the order may well have been created
/// server-side, so retrying with a *fresh* key would create a second one.
/// Retrying with the same key returns the original order instead.
///
/// The key is dropped only when the submit succeeds, or when [reset] is called
/// because the cart changed (a different cart is a different order).

@ProviderFor(OrderSubmission)
final orderSubmissionProvider = OrderSubmissionProvider._();

/// Owns the `Idempotency-Key` lifecycle for order submission.
///
/// The key is minted **once per attempt** and deliberately survives failures:
/// if the phone loses Wi-Fi mid-request the order may well have been created
/// server-side, so retrying with a *fresh* key would create a second one.
/// Retrying with the same key returns the original order instead.
///
/// The key is dropped only when the submit succeeds, or when [reset] is called
/// because the cart changed (a different cart is a different order).
final class OrderSubmissionProvider
    extends $NotifierProvider<OrderSubmission, OrderSubmissionState> {
  /// Owns the `Idempotency-Key` lifecycle for order submission.
  ///
  /// The key is minted **once per attempt** and deliberately survives failures:
  /// if the phone loses Wi-Fi mid-request the order may well have been created
  /// server-side, so retrying with a *fresh* key would create a second one.
  /// Retrying with the same key returns the original order instead.
  ///
  /// The key is dropped only when the submit succeeds, or when [reset] is called
  /// because the cart changed (a different cart is a different order).
  OrderSubmissionProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'orderSubmissionProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$orderSubmissionHash();

  @$internal
  @override
  OrderSubmission create() => OrderSubmission();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(OrderSubmissionState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<OrderSubmissionState>(value),
    );
  }
}

String _$orderSubmissionHash() => r'c348640bbb62330e09cfbb33014bec8227e16014';

/// Owns the `Idempotency-Key` lifecycle for order submission.
///
/// The key is minted **once per attempt** and deliberately survives failures:
/// if the phone loses Wi-Fi mid-request the order may well have been created
/// server-side, so retrying with a *fresh* key would create a second one.
/// Retrying with the same key returns the original order instead.
///
/// The key is dropped only when the submit succeeds, or when [reset] is called
/// because the cart changed (a different cart is a different order).

abstract class _$OrderSubmission extends $Notifier<OrderSubmissionState> {
  OrderSubmissionState build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<OrderSubmissionState, OrderSubmissionState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<OrderSubmissionState, OrderSubmissionState>,
              OrderSubmissionState,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}
