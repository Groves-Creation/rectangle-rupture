import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/auth/session_controller.dart';
import '../../../core/errors/failure.dart';
import '../../../shared/models/order_models.dart';
import '../data/orders_repository.dart';

part 'orders_providers.g.dart';

/// Status filter on the order list. `null` means "all statuses".
@riverpod
class OrderStatusFilter extends _$OrderStatusFilter {
  @override
  String? build() => null;

  void update(String? status) => state = status;
}

/// Orders for the selected store, newest first (server ordering).
@riverpod
Future<OrderPage> ordersPage(Ref ref) async {
  final storeId = ref.watch(selectedStoreIdProvider);
  if (storeId == null) {
    throw const Failure.unexpected(message: 'Choose a store first.');
  }
  final status = ref.watch(orderStatusFilterProvider);
  return ref
      .watch(ordersRepositoryProvider)
      .fetchOrders(storeId: storeId, status: status);
}

/// A single order with its lines and status history.
@riverpod
Future<OrderDetail> orderDetail(Ref ref, String orderId) =>
    ref.watch(ordersRepositoryProvider).fetchOrder(orderId);
