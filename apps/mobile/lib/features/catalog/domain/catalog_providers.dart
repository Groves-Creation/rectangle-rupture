import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/auth/session_controller.dart';
import '../../../core/errors/failure.dart';
import '../../../shared/models/catalog_models.dart';
import '../data/catalog_repository.dart';

part 'catalog_providers.g.dart';

/// Free-text search box contents. Debounced by the screen before it lands
/// here, so every change is a real request.
@riverpod
class CatalogSearchQuery extends _$CatalogSearchQuery {
  @override
  String build() => '';

  void update(String value) => state = value;
}

/// The catalog for the selected store, filtered by the current search.
@riverpod
Future<CatalogPage> catalogPage(Ref ref) async {
  final storeId = ref.watch(selectedStoreIdProvider);
  if (storeId == null) {
    throw const Failure.unexpected(message: 'Choose a store first.');
  }
  final search = ref.watch(catalogSearchQueryProvider);
  return ref
      .watch(catalogRepositoryProvider)
      .fetchCatalog(storeId: storeId, search: search);
}

/// A single catalog item, including the detail-only fields.
@riverpod
Future<CatalogItem> catalogItem(Ref ref, String variantId) async {
  final storeId = ref.watch(selectedStoreIdProvider);
  if (storeId == null) {
    throw const Failure.unexpected(message: 'Choose a store first.');
  }
  return ref
      .watch(catalogRepositoryProvider)
      .fetchItem(variantId: variantId, storeId: storeId);
}
