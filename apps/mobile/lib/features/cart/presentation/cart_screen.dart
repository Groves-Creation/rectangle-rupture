import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../core/errors/error_mapper.dart';
import '../../../core/money/money.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../../core/widgets/confirm_dialog.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../core/widgets/product_thumbnail.dart';
import '../../../core/widgets/quantity_stepper.dart';
import '../../../shared/models/cart_models.dart';
import '../../orders/domain/order_submission.dart';
import '../domain/cart_controller.dart';
import '../domain/cart_totals.dart';

/// `GET /api/cart` plus line editing and order submission.
class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  final _notesController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..clearSnackBars()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          // Keep feedback clear of the persistent totals and submit controls.
          margin: const EdgeInsets.fromLTRB(16, 16, 16, 136),
        ),
      );
  }

  Future<void> _runCartAction(Future<void> Function() action) async {
    try {
      await action();
      // Any pending submit key belongs to the previous cart contents.
      ref.read(orderSubmissionProvider.notifier).reset();
    } on Object catch (error, stackTrace) {
      _showMessage(mapError(error, stackTrace).userMessage);
    }
  }

  Future<void> _removeLine(CartLine line) async {
    final confirmed = await confirmDestructive(
      context,
      title: 'Remove line?',
      message: '${line.displayName} will be removed from this order.',
    );
    if (!confirmed) return;
    await _runCartAction(
      () => ref.read(cartControllerProvider.notifier).removeLine(line.id),
    );
  }

  Future<void> _clearCart() async {
    final confirmed = await confirmDestructive(
      context,
      title: 'Clear the cart?',
      message: 'Every line will be removed. This cannot be undone.',
      confirmLabel: 'Clear cart',
    );
    if (!confirmed) return;
    await _runCartAction(
      () => ref.read(cartControllerProvider.notifier).clear(),
    );
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final order = await ref
          .read(orderSubmissionProvider.notifier)
          .submit(notes: _notesController.text.trim());
      await ref.read(cartControllerProvider.notifier).refresh();
      if (!mounted) return;
      context.go(AppRoute.orderConfirmation(order.id));
    } on Object catch (error, stackTrace) {
      final failure = mapError(error, stackTrace);
      _showMessage(
        failure.isRetryable
            ? '${failure.userMessage} Tap "Retry submit" — it is safe, the '
                  'same order key is reused.'
            : failure.userMessage,
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartControllerProvider);
    final submission = ref.watch(orderSubmissionProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cart'),
        actions: [
          if ((cart.value?.lines.isNotEmpty ?? false))
            IconButton(
              tooltip: 'Clear cart',
              onPressed: _clearCart,
              icon: const Icon(Icons.delete_sweep_outlined),
            ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: AsyncValueView<Cart>(
              value: cart,
              onRetry: () => ref.invalidate(cartControllerProvider),
              data: (value) => _buildCart(value, isRetry: submission.isRetry),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCart(Cart cart, {required bool isRetry}) {
    if (cart.lines.isEmpty) {
      return EmptyView(
        icon: Icons.shopping_cart_outlined,
        title: 'Your cart is empty',
        message: 'Add products from the catalog to start an order.',
        action: FilledButton.icon(
          onPressed: () => context.go(AppRoute.catalog),
          icon: const Icon(Icons.storefront_outlined),
          label: const Text('Browse catalog'),
        ),
      );
    }

    final totals = cartTotalsOf(cart);

    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.only(bottom: 16),
            itemCount: cart.lines.length + 1,
            separatorBuilder: (context, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              if (index == cart.lines.length) {
                return Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                  child: TextField(
                    controller: _notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Order notes (optional)',
                    ),
                  ),
                );
              }
              final line = cart.lines[index];
              return _CartLineTile(
                line: line,
                onQuantityChanged: (quantity) => _runCartAction(
                  () => ref
                      .read(cartControllerProvider.notifier)
                      .updateQuantity(lineId: line.id, quantity: quantity),
                ),
                onRemove: () => _removeLine(line),
              );
            },
          ),
        ),
        _CartSummaryBar(
          totals: totals,
          submitting: _submitting,
          isRetry: isRetry,
          onSubmit: _submitting || !totals.meetsMinimum ? null : _submit,
        ),
      ],
    );
  }
}

class _CartLineTile extends StatelessWidget {
  const _CartLineTile({
    required this.line,
    required this.onQuantityChanged,
    required this.onRemove,
  });

  final CartLine line;
  final ValueChanged<int> onQuantityChanged;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProductThumbnail(imageUrl: line.imageUrl, size: 56),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      line.displayName,
                      style: theme.textTheme.titleMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${line.sku} · ${UnitType.label(line.unitType)}'
                      '${line.unitType == UnitType.pack ? ' of ${line.unitsPerPack}' : ''}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Remove line',
                onPressed: onRemove,
                icon: const Icon(Icons.delete_outline),
              ),
            ],
          ),
          if (line.exceedsAvailable) ...[
            const SizedBox(height: 8),
            _ExceedsAvailableNotice(available: line.availableAtWarehouse),
          ],
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              QuantityStepper(
                value: line.quantity,
                min: 1,
                onChanged: onQuantityChanged,
                semanticLabel: 'Quantity for ${line.displayName}',
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${formatMoney(line.unitType == UnitType.pack ? line.packPrice : line.unitPrice)} each',
                    style: theme.textTheme.bodySmall,
                  ),
                  Text(
                    formatMoney(line.lineTotal),
                    style: theme.textTheme.headlineSmall,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ExceedsAvailableNotice extends StatelessWidget {
  const _ExceedsAvailableNotice({required this.available});

  final int available;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Row(
      children: [
        Icon(Icons.warning_amber_outlined, size: 18, color: scheme.error),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            'Only $available available — this line may be short-allocated',
            style: TextStyle(color: scheme.error, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}

class _CartSummaryBar extends StatelessWidget {
  const _CartSummaryBar({
    required this.totals,
    required this.submitting,
    required this.isRetry,
    required this.onSubmit,
  });

  final CartTotals totals;
  final bool submitting;
  final bool isRetry;
  final VoidCallback? onSubmit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(
            top: BorderSide(color: theme.colorScheme.outlineVariant),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Subtotal', style: theme.textTheme.titleMedium),
                Text(
                  totals.subtotal.format(),
                  style: theme.textTheme.headlineSmall,
                ),
              ],
            ),
            Text(
              '${totals.lineCount} line${totals.lineCount == 1 ? '' : 's'} · '
              '${totals.totalUnits} units',
              style: theme.textTheme.bodySmall,
            ),
            if (!totals.meetsMinimum) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 18,
                    color: theme.colorScheme.error,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Add ${totals.remainingToMinimum.format()} to reach the '
                      '${totals.orderMinimum.format()} minimum',
                      style: TextStyle(
                        color: theme.colorScheme.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: onSubmit,
              icon: submitting
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2.5),
                    )
                  : const Icon(Icons.send),
              label: Text(isRetry ? 'Retry submit' : 'Submit order'),
            ),
          ],
        ),
      ),
    );
  }
}
