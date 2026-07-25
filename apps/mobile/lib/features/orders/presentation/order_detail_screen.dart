import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/money/money.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../shared/models/cart_models.dart';
import '../../../shared/models/order_models.dart';
import '../domain/orders_providers.dart';
import 'order_list_screen.dart' show formatDateTime;

/// `GET /api/orders/:id`.
///
/// Every price here is a submit-time snapshot; nothing on this screen is
/// recomputed from the live catalog.
class OrderDetailScreen extends ConsumerWidget {
  const OrderDetailScreen({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Order'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: () => ref.invalidate(orderDetailProvider(orderId)),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async =>
                  ref.invalidate(orderDetailProvider(orderId)),
              child: AsyncValueView<OrderDetail>(
                value: order,
                onRetry: () => ref.invalidate(orderDetailProvider(orderId)),
                data: (value) => _OrderDetailBody(order: value),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderDetailBody extends StatelessWidget {
  const _OrderDetailBody({required this.order});

  final OrderDetail order;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                order.orderNumber,
                style: theme.textTheme.headlineSmall,
              ),
            ),
            Text(
              formatMoney(order.orderTotal),
              style: theme.textTheme.headlineSmall,
            ),
          ],
        ),
        const SizedBox(height: 12),
        OrderStatusChip(status: order.status),
        const SizedBox(height: 20),
        _InfoRow(label: 'Store', value: order.storeName),
        if (order.warehouseName != null)
          _InfoRow(label: 'Warehouse', value: order.warehouseName!),
        _InfoRow(
          label: 'Submitted',
          value:
              '${formatDateTime(order.submittedAt)} '
              'by ${order.submittedByName}',
        ),
        if (order.approvedAt != null)
          _InfoRow(
            label: 'Approved',
            value:
                '${formatDateTime(order.approvedAt!)}'
                '${order.approvedByName != null ? ' by ${order.approvedByName}' : ''}',
          ),
        if (order.notes != null && order.notes!.trim().isNotEmpty)
          _InfoRow(label: 'Notes', value: order.notes!),
        if (order.rejectionReason != null) ...[
          const SizedBox(height: 12),
          _RejectionNotice(reason: order.rejectionReason!),
        ],
        const SizedBox(height: 24),
        Text(
          'Lines (${order.lines.length})',
          style: theme.textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        for (final line in order.lines) _OrderLineTile(line: line),
        const SizedBox(height: 24),
        Text('History', style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        for (final entry in order.statusHistory) _HistoryTile(entry: entry),
      ],
    );
  }
}

class _OrderLineTile extends StatelessWidget {
  const _OrderLineTile({required this.line});

  final OrderLine line;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(line.name, style: theme.textTheme.titleMedium),
            const SizedBox(height: 2),
            Text(
              '${line.sku} · ${UnitType.label(line.unitType)}'
              '${line.unitType == UnitType.pack ? ' of ${line.unitsPerPack}' : ''}',
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _Metric(label: 'Ordered', value: '${line.quantityOrdered}'),
                const SizedBox(width: 24),
                _Metric(
                  label: 'Allocated',
                  value: '${line.quantityAllocated}',
                  warn: !line.fullyAllocated,
                ),
                const Spacer(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${formatMoney(line.unitPrice)} each',
                      style: theme.textTheme.bodySmall,
                    ),
                    Text(
                      formatMoney(line.lineTotal),
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            if (!line.fullyAllocated) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.warning_amber_outlined,
                    size: 18,
                    color: theme.colorScheme.error,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Short by ${line.shortfall} units',
                      style: TextStyle(
                        color: theme.colorScheme.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value, this.warn = false});

  final String label;
  final String value;
  final bool warn;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: theme.textTheme.bodySmall),
        Text(
          value,
          style: theme.textTheme.headlineSmall?.copyWith(
            color: warn ? theme.colorScheme.error : null,
          ),
        ),
      ],
    );
  }
}

class _HistoryTile extends StatelessWidget {
  const _HistoryTile({required this.entry});

  final OrderStatusHistoryEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: OrderStatusChip(status: entry.toStatus, dense: true),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  formatDateTime(entry.createdAt),
                  style: theme.textTheme.bodyMedium,
                ),
                if (entry.changedByName != null)
                  Text(
                    entry.changedByName!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                if (entry.notes != null && entry.notes!.trim().isNotEmpty)
                  Text(entry.notes!, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 108,
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(child: Text(value, style: theme.textTheme.bodyLarge)),
        ],
      ),
    );
  }
}

class _RejectionNotice extends StatelessWidget {
  const _RejectionNotice({required this.reason});

  final String reason;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: scheme.errorContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.block_outlined, color: scheme.onErrorContainer),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Rejected: $reason',
              style: TextStyle(
                color: scheme.onErrorContainer,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
