// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// The active cart for the selected store.
///
/// Every mutation replaces the state with the cart the server returned, so the
/// client never has to reimplement pricing.

@ProviderFor(CartController)
final cartControllerProvider = CartControllerProvider._();

/// The active cart for the selected store.
///
/// Every mutation replaces the state with the cart the server returned, so the
/// client never has to reimplement pricing.
final class CartControllerProvider
    extends $AsyncNotifierProvider<CartController, Cart> {
  /// The active cart for the selected store.
  ///
  /// Every mutation replaces the state with the cart the server returned, so the
  /// client never has to reimplement pricing.
  CartControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'cartControllerProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$cartControllerHash();

  @$internal
  @override
  CartController create() => CartController();
}

String _$cartControllerHash() => r'12c3663052aa2a30b10ed636cded67d7e809ddbd';

/// The active cart for the selected store.
///
/// Every mutation replaces the state with the cart the server returned, so the
/// client never has to reimplement pricing.

abstract class _$CartController extends $AsyncNotifier<Cart> {
  FutureOr<Cart> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<Cart>, Cart>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<Cart>, Cart>,
              AsyncValue<Cart>,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}

/// Badge count for the app bar. Zero while the cart is loading or errored.

@ProviderFor(cartLineCount)
final cartLineCountProvider = CartLineCountProvider._();

/// Badge count for the app bar. Zero while the cart is loading or errored.

final class CartLineCountProvider extends $FunctionalProvider<int, int, int>
    with $Provider<int> {
  /// Badge count for the app bar. Zero while the cart is loading or errored.
  CartLineCountProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'cartLineCountProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$cartLineCountHash();

  @$internal
  @override
  $ProviderElement<int> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  int create(Ref ref) {
    return cartLineCount(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(int value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<int>(value),
    );
  }
}

String _$cartLineCountHash() => r'6b65e06503ec8459d011030a296f66b8fba49dc4';
