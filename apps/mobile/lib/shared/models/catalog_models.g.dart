// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CatalogItem _$CatalogItemFromJson(Map<String, dynamic> json) => _CatalogItem(
  variantId: json['variantId'] as String,
  productId: json['productId'] as String,
  name: json['name'] as String,
  variantName: json['variantName'] as String,
  sku: json['sku'] as String,
  brandName: json['brandName'] as String,
  categoryName: json['categoryName'] as String,
  imageUrl: json['imageUrl'] as String?,
  unitPrice: json['unitPrice'] as String,
  casePrice: json['casePrice'] as String,
  unitsPerCase: (json['unitsPerCase'] as num).toInt(),
  minimumOrderQuantity: (json['minimumOrderQuantity'] as num).toInt(),
  availableAtWarehouse: (json['availableAtWarehouse'] as num).toInt(),
  isAgeRestricted: json['isAgeRestricted'] as bool,
  description: json['description'] as String?,
  barcodes:
      (json['barcodes'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const <String>[],
  warehouseId: json['warehouseId'] as String?,
);

Map<String, dynamic> _$CatalogItemToJson(_CatalogItem instance) =>
    <String, dynamic>{
      'variantId': instance.variantId,
      'productId': instance.productId,
      'name': instance.name,
      'variantName': instance.variantName,
      'sku': instance.sku,
      'brandName': instance.brandName,
      'categoryName': instance.categoryName,
      'imageUrl': instance.imageUrl,
      'unitPrice': instance.unitPrice,
      'casePrice': instance.casePrice,
      'unitsPerCase': instance.unitsPerCase,
      'minimumOrderQuantity': instance.minimumOrderQuantity,
      'availableAtWarehouse': instance.availableAtWarehouse,
      'isAgeRestricted': instance.isAgeRestricted,
      'description': instance.description,
      'barcodes': instance.barcodes,
      'warehouseId': instance.warehouseId,
    };

_CatalogPage _$CatalogPageFromJson(Map<String, dynamic> json) => _CatalogPage(
  items:
      (json['items'] as List<dynamic>?)
          ?.map((e) => CatalogItem.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <CatalogItem>[],
  total: (json['total'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
  offset: (json['offset'] as num).toInt(),
);

Map<String, dynamic> _$CatalogPageToJson(_CatalogPage instance) =>
    <String, dynamic>{
      'items': instance.items,
      'total': instance.total,
      'limit': instance.limit,
      'offset': instance.offset,
    };
