import 'package:freezed_annotation/freezed_annotation.dart';

part 'catalog_models.freezed.dart';
part 'catalog_models.g.dart';

/// A catalog row from `GET /api/catalog`, or a single item from
/// `GET /api/catalog/:variantId` (which returns the same shape plus
/// [description], [barcodes] and [warehouseId]).
///
/// All money values are 4-decimal strings on the wire and stay strings here.
@freezed
abstract class CatalogItem with _$CatalogItem {
  const factory CatalogItem({
    required String variantId,
    required String productId,
    required String name,
    required String variantName,
    required String sku,
    required String brandName,
    required String categoryName,
    required String? imageUrl,
    required String unitPrice,
    required String casePrice,
    required int unitsPerCase,
    required int minimumOrderQuantity,
    required int availableAtWarehouse,
    required bool isAgeRestricted,
    // Detail-only fields.
    String? description,
    @Default(<String>[]) List<String> barcodes,
    String? warehouseId,
  }) = _CatalogItem;

  factory CatalogItem.fromJson(Map<String, dynamic> json) =>
      _$CatalogItemFromJson(json);
}

/// Paged `GET /api/catalog` response.
@freezed
abstract class CatalogPage with _$CatalogPage {
  const factory CatalogPage({
    @Default(<CatalogItem>[]) List<CatalogItem> items,
    required int total,
    required int limit,
    required int offset,
  }) = _CatalogPage;

  factory CatalogPage.fromJson(Map<String, dynamic> json) =>
      _$CatalogPageFromJson(json);
}

extension CatalogItemX on CatalogItem {
  /// `"Product Name — Blue Razz"`, or just the product name when the variant
  /// name is empty or duplicates it.
  String get displayName {
    if (variantName.isEmpty || variantName == name) return name;
    return '$name — $variantName';
  }

  bool get isInStock => availableAtWarehouse > 0;
}
