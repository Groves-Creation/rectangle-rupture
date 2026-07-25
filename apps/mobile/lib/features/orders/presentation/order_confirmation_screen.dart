import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../core/money/money.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../shared/models/order_models.dart';
import '../domain/orders_providers.dart';

/// Shown immediately after `POST /api/orders` succeeds.
class OrderConfirmationScreen extends ConsumerWidget {
  const OrderConfirmationScreen({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(orderDetailProvider(orderId));

    return PopScope(
      // The cart is gone; going "back" to it would be meaningless.
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) context.go(AppRoute.catalog);
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Order submitted'),
          automaticallyImplyLeading: false,
        ),
        body: AsyncValueView<OrderDetail>(
          value: order,
          onRetry: () => ref.invalidate(orderDetailProvider(orderId)),
          data: (value) => _Confirmation(order: value),
        ),
      ),
    );
  }
}

class _Confirmation extends StatelessWidget {
  const _Confirmation({required this.order});

  final OrderDetail order;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(24),
            children: [
              const SizedBox(height: 16),
              Icon(
                Icons.check_circle,
                size: 88,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(height: 20),
              Text(
                'Order submitted',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                order.orderNumber,
                textAlign: TextAlign.center,
                style: theme.textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 20),
              Center(child: OrderStatusChip(status: order.status)),
              const SizedBox(height: 28),
              _SummaryRow(label: 'Store', value: order.storeName),
              _SummaryRow(label: 'Lines', value: '${order.lines.length}'),
              _SummaryRow(
                label: 'Order total',
                value: formatMoney(order.orderTotal),
                emphasise: true,
              ),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                FilledButton.icon(
                  onPressed: () => context.go(AppRoute.orderDetail(order.id)),
                  icon: const Icon(Icons.receipt_long_outlined),
                  label: const Text('View order'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => context.go(AppRoute.catalog),
                  icon: const Icon(Icons.storefront_outlined),
                  label: const Text('Back to catalog'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.emphasise = false,
  });

  final String label;
  final String value;
  final bool emphasise;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodyLarge),
          Text(
            value,
            style: emphasise
                ? theme.textTheme.headlineSmall
                : theme.textTheme.titleMedium,
          ),
        ],
      ),
    );
  }
}
