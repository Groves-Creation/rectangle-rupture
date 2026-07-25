// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_OrderSummary _$OrderSummaryFromJson(Map<String, dynamic> json) =>
    _OrderSummary(
      id: json['id'] as String,
      orderNumber: json['orderNumber'] as String,
      storeId: json['storeId'] as String,
      storeName: json['storeName'] as String,
      status: json['status'] as String,
      orderTotal: json['orderTotal'] as String,
      lineCount: (json['lineCount'] as num).toInt(),
      submittedAt: DateTime.parse(json['submittedAt'] as String),
      submittedByName: json['submittedByName'] as String,
    );

Map<String, dynamic> _$OrderSummaryToJson(_OrderSummary instance) =>
    <String, dynamic>{
      'id': instance.id,
      'orderNumber': instance.orderNumber,
      'storeId': instance.storeId,
      'storeName': instance.storeName,
      'status': instance.status,
      'orderTotal': instance.orderTotal,
      'lineCount': instance.lineCount,
      'submittedAt': instance.submittedAt.toIso8601String(),
      'submittedByName': instance.submittedByName,
    };

_OrderLine _$OrderLineFromJson(Map<String, dynamic> json) => _OrderLine(
  id: json['id'] as String,
  variantId: json['variantId'] as String,
  sku: json['sku'] as String,
  name: json['name'] as String,
  unitType: json['unitType'] as String,
  unitsPerPack: (json['unitsPerPack'] as num).toInt(),
  quantityOrdered: (json['quantityOrdered'] as num).toInt(),
  quantityAllocated: (json['quantityAllocated'] as num).toInt(),
  unitPrice: json['unitPrice'] as String,
  lineTotal: json['lineTotal'] as String,
  fullyAllocated: json['fullyAllocated'] as bool,
);

Map<String, dynamic> _$OrderLineToJson(_OrderLine instance) =>
    <String, dynamic>{
      'id': instance.id,
      'variantId': instance.variantId,
      'sku': instance.sku,
      'name': instance.name,
      'unitType': instance.unitType,
      'unitsPerPack': instance.unitsPerPack,
      'quantityOrdered': instance.quantityOrdered,
      'quantityAllocated': instance.quantityAllocated,
      'unitPrice': instance.unitPrice,
      'lineTotal': instance.lineTotal,
      'fullyAllocated': instance.fullyAllocated,
    };

_OrderStatusHistoryEntry _$OrderStatusHistoryEntryFromJson(
  Map<String, dynamic> json,
) => _OrderStatusHistoryEntry(
  toStatus: json['toStatus'] as String,
  fromStatus: json['fromStatus'] as String?,
  changedByName: json['changedByName'] as String?,
  notes: json['notes'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
);

Map<String, dynamic> _$OrderStatusHistoryEntryToJson(
  _OrderStatusHistoryEntry instance,
) => <String, dynamic>{
  'toStatus': instance.toStatus,
  'fromStatus': instance.fromStatus,
  'changedByName': instance.changedByName,
  'notes': instance.notes,
  'createdAt': instance.createdAt.toIso8601String(),
};

_OrderDetail _$OrderDetailFromJson(Map<String, dynamic> json) => _OrderDetail(
  id: json['id'] as String,
  orderNumber: json['orderNumber'] as String,
  storeId: json['storeId'] as String,
  storeName: json['storeName'] as String,
  warehouseId: json['warehouseId'] as String?,
  warehouseName: json['warehouseName'] as String?,
  status: json['status'] as String,
  orderTotal: json['orderTotal'] as String,
  notes: json['notes'] as String?,
  submittedAt: DateTime.parse(json['submittedAt'] as String),
  submittedByName: json['submittedByName'] as String,
  approvedAt: json['approvedAt'] == null
      ? null
      : DateTime.parse(json['approvedAt'] as String),
  approvedByName: json['approvedByName'] as String?,
  rejectionReason: json['rejectionReason'] as String?,
  lines:
      (json['lines'] as List<dynamic>?)
          ?.map((e) => OrderLine.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <OrderLine>[],
  statusHistory:
      (json['statusHistory'] as List<dynamic>?)
          ?.map(
            (e) => OrderStatusHistoryEntry.fromJson(e as Map<String, dynamic>),
          )
          .toList() ??
      const <OrderStatusHistoryEntry>[],
);

Map<String, dynamic> _$OrderDetailToJson(_OrderDetail instance) =>
    <String, dynamic>{
      'id': instance.id,
      'orderNumber': instance.orderNumber,
      'storeId': instance.storeId,
      'storeName': instance.storeName,
      'warehouseId': instance.warehouseId,
      'warehouseName': instance.warehouseName,
      'status': instance.status,
      'orderTotal': instance.orderTotal,
      'notes': instance.notes,
      'submittedAt': instance.submittedAt.toIso8601String(),
      'submittedByName': instance.submittedByName,
      'approvedAt': instance.approvedAt?.toIso8601String(),
      'approvedByName': instance.approvedByName,
      'rejectionReason': instance.rejectionReason,
      'lines': instance.lines,
      'statusHistory': instance.statusHistory,
    };

_OrderEnvelope _$OrderEnvelopeFromJson(Map<String, dynamic> json) =>
    _OrderEnvelope(
      order: OrderDetail.fromJson(json['order'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$OrderEnvelopeToJson(_OrderEnvelope instance) =>
    <String, dynamic>{'order': instance.order};

_OrderPage _$OrderPageFromJson(Map<String, dynamic> json) => _OrderPage(
  items:
      (json['items'] as List<dynamic>?)
          ?.map((e) => OrderSummary.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const <OrderSummary>[],
  total: (json['total'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
  offset: (json['offset'] as num).toInt(),
);

Map<String, dynamic> _$OrderPageToJson(_OrderPage instance) =>
    <String, dynamic>{
      'items': instance.items,
      'total': instance.total,
      'limit': instance.limit,
      'offset': instance.offset,
    };
