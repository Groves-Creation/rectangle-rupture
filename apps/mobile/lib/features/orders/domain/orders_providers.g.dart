// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'orders_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Status filter on the order list. `null` means "all statuses".

@ProviderFor(OrderStatusFilter)
final orderStatusFilterProvider = OrderStatusFilterProvider._();

/// Status filter on the order list. `null` means "all statuses".
final class OrderStatusFilterProvider
    extends $NotifierProvider<OrderStatusFilter, String?> {
  /// Status filter on the order list. `null` means "all statuses".
  OrderStatusFilterProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'orderStatusFilterProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$orderStatusFilterHash();

  @$internal
  @override
  OrderStatusFilter create() => OrderStatusFilter();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(String? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<String?>(value),
    );
  }
}

String _$orderStatusFilterHash() => r'1ede790cca5d645d581cd75841c96358593da542';

/// Status filter on the order list. `null` means "all statuses".

abstract class _$OrderStatusFilter extends $Notifier<String?> {
  String? build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<String?, String?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<String?, String?>,
              String?,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}

/// Orders for the selected store, newest first (server ordering).

@ProviderFor(ordersPage)
final ordersPageProvider = OrdersPageProvider._();

/// Orders for the selected store, newest first (server ordering).

final class OrdersPageProvider
    extends
        $FunctionalProvider<
          AsyncValue<OrderPage>,
          OrderPage,
          FutureOr<OrderPage>
        >
    with $FutureModifier<OrderPage>, $FutureProvider<OrderPage> {
  /// Orders for the selected store, newest first (server ordering).
  OrdersPageProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'ordersPageProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$ordersPageHash();

  @$internal
  @override
  $FutureProviderElement<OrderPage> $createElement($ProviderPointer pointer) =>
      $FutureProviderElement(pointer);

  @override
  FutureOr<OrderPage> create(Ref ref) {
    return ordersPage(ref);
  }
}

String _$ordersPageHash() => r'e1f1477e970789c107fe43bfbbb8df2a0da2a593';

/// A single order with its lines and status history.

@ProviderFor(orderDetail)
final orderDetailProvider = OrderDetailFamily._();

/// A single order with its lines and status history.

final class OrderDetailProvider
    extends
        $FunctionalProvider<
          AsyncValue<OrderDetail>,
          OrderDetail,
          FutureOr<OrderDetail>
        >
    with $FutureModifier<OrderDetail>, $FutureProvider<OrderDetail> {
  /// A single order with its lines and status history.
  OrderDetailProvider._({
    required OrderDetailFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'orderDetailProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$orderDetailHash();

  @override
  String toString() {
    return r'orderDetailProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<OrderDetail> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<OrderDetail> create(Ref ref) {
    final argument = this.argument as String;
    return orderDetail(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is OrderDetailProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$orderDetailHash() => r'a16ceaa41e259ae72f2ca445db936015f4901a88';

/// A single order with its lines and status history.

final class OrderDetailFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<OrderDetail>, String> {
  OrderDetailFamily._()
    : super(
        retry: null,
        name: r'orderDetailProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// A single order with its lines and status history.

  OrderDetailProvider call(String orderId) =>
      OrderDetailProvider._(argument: orderId, from: this);

  @override
  String toString() => r'orderDetailProvider';
}
