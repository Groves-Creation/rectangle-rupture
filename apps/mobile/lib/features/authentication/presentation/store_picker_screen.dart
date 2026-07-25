import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../../../core/auth/session_controller.dart';
import '../../../core/widgets/async_value_view.dart';
import '../../../core/widgets/offline_banner.dart';
import '../../../shared/models/auth_models.dart';
import '../domain/session_state.dart';

/// Choose which store to order for.
///
/// Only reachable when the user has more than one accessible store — with
/// exactly one the session controller selects it and the router skips
/// straight past this screen.
class StorePickerScreen extends ConsumerWidget {
  const StorePickerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Choose a store'),
        actions: [
          TextButton.icon(
            onPressed: () =>
                ref.read(sessionControllerProvider.notifier).signOut(),
            icon: const Icon(Icons.logout),
            label: const Text('Sign out'),
          ),
        ],
      ),
      body: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: AsyncValueView<SessionState>(
              value: session,
              onRetry: () => ref.invalidate(sessionControllerProvider),
              data: (state) => _StoreList(
                stores: state.stores,
                selectedStoreId: state.selectedStoreId,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StoreList extends ConsumerWidget {
  const _StoreList({required this.stores, required this.selectedStoreId});

  final List<StoreSummary> stores;
  final String? selectedStoreId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (stores.isEmpty) {
      return const EmptyView(
        icon: Icons.store_mall_directory_outlined,
        title: 'No stores assigned',
        message: 'Ask an HQ administrator to grant you access to a store.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: stores.length,
      separatorBuilder: (context, _) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final store = stores[index];
        final isSelected = store.id == selectedStoreId;
        return ListTile(
          minVerticalPadding: 20,
          leading: CircleAvatar(
            radius: 24,
            child: Icon(
              store.type == 'warehouse'
                  ? Icons.warehouse_outlined
                  : Icons.storefront_outlined,
            ),
          ),
          title: Text(
            store.name,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
          subtitle: Text(store.code),
          trailing: isSelected
              ? const Icon(Icons.check_circle)
              : const Icon(Icons.chevron_right),
          onTap: () async {
            await ref
                .read(sessionControllerProvider.notifier)
                .selectStore(store.id);
            if (context.mounted) context.go(AppRoute.catalog);
          },
        );
      },
    );
  }
}
