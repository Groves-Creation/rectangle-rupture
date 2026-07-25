import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../core/money/money.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../shared/models/order_models.dart';
import '../../../shared/models/order_status.dart';
import '../domain/orders_providers.dart';

/// `GET /api/orders` for the selected store.
class OrderListScreen extends ConsumerWidget {
  const OrderListScreen({super.key});

  /// The statuses the skeleton actually produces get a quick filter.
  static const List<OrderStatus> _quickFilters = [
    OrderStatus.submitted,
    OrderStatus.underReview,
    OrderStatus.approved,
    OrderStatus.inventoryAllocated,
    OrderStatus.rejected,
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersPageProvider);
    final activeFilter = ref.watch(orderStatusFilterProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: Column(
        children: [
          const OfflineBanner(),
          SizedBox(
            height: 64,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                for (final status in _quickFilters)
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 4,
                      vertical: 12,
                    ),
                    child: FilterChip(
                      label: Text(status.label),
                      selected: activeFilter == status.wireValue,
                      onSelected: (selected) => ref
                          .read(orderStatusFilterProvider.notifier)
                          .update(selected ? status.wireValue : null),
                    ),
                  ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(ordersPageProvider),
              child: AsyncValueView<OrderPage>(
                value: orders,
                onRetry: () => ref.invalidate(ordersPageProvider),
                data: (page) => _OrderList(page: page),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderList extends StatelessWidget {
  const _OrderList({required this.page});

  final OrderPage page;

  @override
  Widget build(BuildContext context) {
    if (page.items.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 80),
          EmptyView(
            icon: Icons.receipt_long_outlined,
            title: 'No orders yet',
            message: 'Submitted orders for this store will appear here.',
          ),
        ],
      );
    }

    return ListView.separated(
      itemCount: page.items.length,
      separatorBuilder: (context, _) => const Divider(height: 1),
      itemBuilder: (context, index) => _OrderRow(order: page.items[index]),
    );
  }
}

class _OrderRow extends StatelessWidget {
  const _OrderRow({required this.order});

  final OrderSummary order;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: () => context.push(AppRoute.orderDetail(order.id)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    order.orderNumber,
                    style: theme.textTheme.titleMedium,
                  ),
                ),
                Text(
                  formatMoney(order.orderTotal),
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                OrderStatusChip(status: order.status, dense: true),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '${order.lineCount} line${order.lineCount == 1 ? '' : 's'}'
                    ' · ${formatDateTime(order.submittedAt)}',
                    style: theme.textTheme.bodySmall,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// `2026-07-25 18:00` in the device's local time.
///
/// The API sends ISO-8601 UTC; `DateTime.parse` keeps the offset and
/// [DateTime.toLocal] shifts it for display.
String formatDateTime(DateTime value) {
  final local = value.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${local.year}-${two(local.month)}-${two(local.day)} '
      '${two(local.hour)}:${two(local.minute)}';
}
