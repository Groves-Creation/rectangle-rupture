// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CartLine _$CartLineFromJson(Map<String, dynamic> json) => _CartLine(
  id: json['id'] as String,
  variantId: json['variantId'] as String,
  name: json['name'] as String,
  variantName: json['variantName'] as String,
  sku: json['sku'] as String,
  imageUrl: json['imageUrl'] as String?,
  unitType: json['unitType'] as String,
  unitsPerPack: (json['unitsPerPack'] as num).toInt(),
  quantity: (json['quantity'] as num).toInt(),
  unitPrice: json['unitPrice'] as String,
  packPrice: json['packPrice'] as String,
  lineTotal: json['lineTotal'] as String,
  availableAtWarehouse: (json['availableAtWarehouse'] as num).toInt(),
  exceedsAvailable: json['exceedsAvailable'] as bool,
);

Map<String, dynamic> _$CartLineToJson(_CartLine instance) => <String, dynamic>{
  'id': instance.id,
  'variantId': instance.variantId,
  'name': instance.name,
  'variantName': instance.variantName,
  'sku': instance.sku,
  'imageUrl': instance.imageUrl,
  'unitType': instance.unitType,
  'unitsPerPack': instance.unitsPerPack,
  'quantity': instance.quantity,
  'unitPrice': instance.unitPrice,
  'packPrice': instance.packPrice,
  'lineTotal': instance.lineTotal,
  'availableAtWarehouse': instance.availableAtWarehouse,
  'exceedsAvailable': instance.exceedsAvailable,
};

_Cart _$CartFromJson(Map<String, dynamic> json) => _Cart(
  cartId: json['cartId'] as String,
  storeId: json['storeId'] as String,
  lines:
      (json['lines'] as List<dynamic>?)
          ?.map((e) => CartLine.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <CartLine>[],
  subtotal: json['subtotal'] as String,
  orderMinimum: json['orderMinimum'] as String,
  meetsMinimum: json['meetsMinimum'] as bool,
);

Map<String, dynamic> _$CartToJson(_Cart instance) => <String, dynamic>{
  'cartId': instance.cartId,
  'storeId': instance.storeId,
  'lines': instance.lines,
  'subtotal': instance.subtotal,
  'orderMinimum': instance.orderMinimum,
  'meetsMinimum': instance.meetsMinimum,
};

_AddCartLineRequest _$AddCartLineRequestFromJson(Map<String, dynamic> json) =>
    _AddCartLineRequest(
      storeId: json['storeId'] as String,
      variantId: json['variantId'] as String,
      unitType: json['unitType'] as String,
      quantity: (json['quantity'] as num).toInt(),
    );

Map<String, dynamic> _$AddCartLineRequestToJson(_AddCartLineRequest instance) =>
    <String, dynamic>{
      'storeId': instance.storeId,
      'variantId': instance.variantId,
      'unitType': instance.unitType,
      'quantity': instance.quantity,
    };
