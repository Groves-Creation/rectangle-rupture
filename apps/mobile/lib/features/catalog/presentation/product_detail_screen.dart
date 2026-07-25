import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../core/errors/error_mapper.dart';
import '../../../core/money/money.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../../core/widgets/product_thumbnail.dart';
import '../../../core/widgets/quantity_stepper.dart';
import '../../../shared/models/cart_models.dart';
import '../../../shared/models/catalog_models.dart';
import '../../cart/domain/cart_controller.dart';
import '../../cart/presentation/cart_button.dart';
import '../../orders/domain/order_submission.dart';
import '../domain/catalog_providers.dart';

/// `GET /api/catalog/:variantId` plus the add-to-cart action.
class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.variantId});

  final String variantId;

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  String _unitType = UnitType.pack;
  int _quantity = 1;
  bool _adding = false;

  Future<void> _addToCart(CatalogItem item) async {
    setState(() => _adding = true);
    try {
      await ref
          .read(cartControllerProvider.notifier)
          .addLine(
            variantId: item.variantId,
            unitType: _unitType,
            quantity: _quantity,
          );
      // The cart changed, so any pending order idempotency key is stale.
      ref.read(orderSubmissionProvider.notifier).reset();
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..clearSnackBars()
        ..showSnackBar(
          SnackBar(
            content: Text(
              'Added $_quantity ${UnitType.label(_unitType).toLowerCase()}'
              '${_quantity == 1 ? '' : 's'} of ${item.name}',
            ),
            action: SnackBarAction(
              label: 'View cart',
              onPressed: () => context.push(AppRoute.cart),
            ),
          ),
        );
    } on Object catch (error, stackTrace) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..clearSnackBars()
        ..showSnackBar(
          SnackBar(content: Text(mapError(error, stackTrace).userMessage)),
        );
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final item = ref.watch(catalogItemProvider(widget.variantId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Product'),
        actions: const [CartButton()],
      ),
      body: AsyncValueView<CatalogItem>(
        value: item,
        onRetry: () => ref.invalidate(catalogItemProvider(widget.variantId)),
        data: _buildDetail,
      ),
    );
  }

  Widget _buildDetail(CatalogItem item) {
    final theme = Theme.of(context);
    final minimum = item.minimumOrderQuantity < 1
        ? 1
        : item.minimumOrderQuantity;
    if (_quantity < minimum) _quantity = minimum;

    final unitPrice = _unitType == UnitType.pack
        ? item.casePrice
        : item.unitPrice;
    final lineTotal = (Money.tryParse(unitPrice) ?? Money.zero) * _quantity;

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: [
              Center(
                child: ProductThumbnail(imageUrl: item.imageUrl, size: 180),
              ),
              const SizedBox(height: 20),
              Text(item.displayName, style: theme.textTheme.headlineSmall),
              const SizedBox(height: 6),
              Text(
                '${item.brandName} · ${item.categoryName}',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 4),
              Text('SKU ${item.sku}', style: theme.textTheme.bodySmall),
              if (item.isAgeRestricted) ...[
                const SizedBox(height: 12),
                const _AgeRestrictedNotice(),
              ],
              const SizedBox(height: 20),
              _PriceRow(
                label: 'Case of ${item.unitsPerCase}',
                value: formatMoney(item.casePrice),
                emphasise: _unitType == UnitType.pack,
              ),
              const SizedBox(height: 8),
              _PriceRow(
                label: 'Single unit',
                value: formatMoney(item.unitPrice),
                emphasise: _unitType == UnitType.unit,
              ),
              const SizedBox(height: 20),
              Text(
                'Available at warehouse: ${item.availableAtWarehouse}',
                style: theme.textTheme.titleMedium,
              ),
              if (item.minimumOrderQuantity > 1) ...[
                const SizedBox(height: 4),
                Text(
                  'Minimum order quantity: ${item.minimumOrderQuantity}',
                  style: theme.textTheme.bodyMedium,
                ),
              ],
              if (item.description != null &&
                  item.description!.trim().isNotEmpty) ...[
                const SizedBox(height: 20),
                Text('Description', style: theme.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(item.description!, style: theme.textTheme.bodyMedium),
              ],
              if (item.barcodes.isNotEmpty) ...[
                const SizedBox(height: 20),
                Text('Barcodes', style: theme.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(
                  item.barcodes.join(', '),
                  style: theme.textTheme.bodyMedium,
                ),
              ],
              const SizedBox(height: 24),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(
                    value: UnitType.pack,
                    icon: Icon(Icons.inventory_2_outlined),
                    label: Text('Cases'),
                  ),
                  ButtonSegment(
                    value: UnitType.unit,
                    icon: Icon(Icons.widgets_outlined),
                    label: Text('Units'),
                  ),
                ],
                selected: {_unitType},
                onSelectionChanged: (selection) =>
                    setState(() => _unitType = selection.first),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Quantity', style: theme.textTheme.titleMedium),
                  QuantityStepper(
                    value: _quantity,
                    min: minimum,
                    onChanged: (value) => setState(() => _quantity = value),
                  ),
                ],
              ),
            ],
          ),
        ),
        _AddToCartBar(
          total: lineTotal,
          busy: _adding,
          onPressed: _adding ? null : () => _addToCart(item),
        ),
      ],
    );
  }
}

class _PriceRow extends StatelessWidget {
  const _PriceRow({
    required this.label,
    required this.value,
    required this.emphasise,
  });

  final String label;
  final String value;
  final bool emphasise;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: theme.textTheme.bodyLarge),
        Text(
          value,
          style: (emphasise
              ? theme.textTheme.headlineSmall
              : theme.textTheme.titleMedium),
        ),
      ],
    );
  }
}

class _AgeRestrictedNotice extends StatelessWidget {
  const _AgeRestrictedNotice();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: scheme.tertiaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.no_adult_content, color: scheme.onTertiaryContainer),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Age restricted — ID check required at delivery',
              style: TextStyle(
                color: scheme.onTertiaryContainer,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AddToCartBar extends StatelessWidget {
  const _AddToCartBar({
    required this.total,
    required this.busy,
    required this.onPressed,
  });

  final Money total;
  final bool busy;
  final VoidCallback? onPressed;

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
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Line total', style: theme.textTheme.bodySmall),
                Text(total.format(), style: theme.textTheme.headlineSmall),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: FilledButton.icon(
                onPressed: onPressed,
                icon: busy
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2.5),
                      )
                    : const Icon(Icons.add_shopping_cart),
                label: const Text('Add to cart'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
