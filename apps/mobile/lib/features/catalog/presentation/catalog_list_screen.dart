import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../core/auth/session_controller.dart';
import '../../../core/money/money.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../core/widgets/product_thumbnail.dart';
import '../../../shared/models/catalog_models.dart';
import '../../cart/presentation/cart_button.dart';
import '../domain/catalog_providers.dart';

/// `GET /api/catalog` for the selected store.
class CatalogListScreen extends ConsumerStatefulWidget {
  const CatalogListScreen({super.key});

  @override
  ConsumerState<CatalogListScreen> createState() => _CatalogListScreenState();
}

class _CatalogListScreenState extends ConsumerState<CatalogListScreen> {
  final _searchController = TextEditingController();
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      ref.read(catalogSearchQueryProvider.notifier).update(value.trim());
    });
  }

  @override
  Widget build(BuildContext context) {
    final catalog = ref.watch(catalogPageProvider);
    final store = ref.watch(sessionControllerProvider).value?.selectedStore;
    final canSwitchStore =
        ref.watch(sessionControllerProvider).value?.canSwitchStore ?? false;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Catalog'),
            if (store != null)
              Text(
                '${store.name} · ${store.code}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Orders',
            onPressed: () => context.push(AppRoute.orders),
            icon: const Icon(Icons.receipt_long_outlined),
          ),
          const CartButton(),
          PopupMenuButton<String>(
            tooltip: 'More',
            onSelected: (value) async {
              final controller = ref.read(sessionControllerProvider.notifier);
              if (value == 'switch-store') {
                await controller.clearStoreSelection();
              } else if (value == 'sign-out') {
                await controller.signOut();
              }
            },
            itemBuilder: (context) => [
              if (canSwitchStore)
                const PopupMenuItem(
                  value: 'switch-store',
                  child: ListTile(
                    leading: Icon(Icons.storefront_outlined),
                    title: Text('Switch store'),
                  ),
                ),
              const PopupMenuItem(
                value: 'sign-out',
                child: ListTile(
                  leading: Icon(Icons.logout),
                  title: Text('Sign out'),
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Search products or SKU',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isEmpty
                    ? null
                    : IconButton(
                        tooltip: 'Clear search',
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          _searchController.clear();
                          _onSearchChanged('');
                          setState(() {});
                        },
                      ),
              ),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.invalidate(catalogPageProvider),
              child: AsyncValueView<CatalogPage>(
                value: catalog,
                onRetry: () => ref.invalidate(catalogPageProvider),
                data: (page) => _CatalogList(page: page),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CatalogList extends StatelessWidget {
  const _CatalogList({required this.page});

  final CatalogPage page;

  @override
  Widget build(BuildContext context) {
    if (page.items.isEmpty) {
      return ListView(
        children: const [
          SizedBox(height: 80),
          EmptyView(
            icon: Icons.search_off,
            title: 'No products found',
            message: 'Try a different search term.',
          ),
        ],
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.only(bottom: 24),
      itemCount: page.items.length,
      separatorBuilder: (context, _) => const Divider(height: 1),
      itemBuilder: (context, index) => _CatalogRow(item: page.items[index]),
    );
  }
}

class _CatalogRow extends StatelessWidget {
  const _CatalogRow({required this.item});

  final CatalogItem item;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: () => context.push(AppRoute.productDetail(item.variantId)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ProductThumbnail(imageUrl: item.imageUrl, size: 64),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.displayName,
                    style: theme.textTheme.titleMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${item.brandName} · ${item.sku}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text(
                        formatMoney(item.casePrice),
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          '/ case of ${item.unitsPerCase}',
                          style: theme.textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${formatMoney(item.unitPrice)} / unit',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _AvailabilityChip(available: item.availableAtWarehouse),
                ],
              ),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }
}

class _AvailabilityChip extends StatelessWidget {
  const _AvailabilityChip({required this.available});

  final int available;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final inStock = available > 0;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          inStock ? Icons.check_circle_outline : Icons.remove_circle_outline,
          size: 16,
          color: inStock ? scheme.primary : scheme.error,
        ),
        const SizedBox(width: 6),
        Text(
          inStock ? '$available available' : 'Out of stock',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: inStock ? scheme.onSurface : scheme.error,
          ),
        ),
      ],
    );
  }
}
