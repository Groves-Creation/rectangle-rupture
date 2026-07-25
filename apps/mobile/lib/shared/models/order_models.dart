import 'package:freezed_annotation/freezed_annotation.dart';

part 'order_models.freezed.dart';
part 'order_models.g.dart';

/// A row from `GET /api/orders`.
@freezed
abstract class OrderSummary with _$OrderSummary {
  const factory OrderSummary({
    required String id,
    required String orderNumber,
    required String storeId,
    required String storeName,
    required String status,
    required String orderTotal,
    required int lineCount,
    required DateTime submittedAt,
    required String submittedByName,
  }) = _OrderSummary;

  factory OrderSummary.fromJson(Map<String, dynamic> json) =>
      _$OrderSummaryFromJson(json);
}

/// A line of `GET /api/orders/:id`. Prices here are submit-time snapshots and
/// must never be recomputed from the live catalog.
@freezed
abstract class OrderLine with _$OrderLine {
  const factory OrderLine({
    required String id,
    required String variantId,
    required String sku,
    required String name,
    required String unitType,
    required int unitsPerPack,
    required int quantityOrdered,
    required int quantityAllocated,
    required String unitPrice,
    required String lineTotal,
    required bool fullyAllocated,
  }) = _OrderLine;

  factory OrderLine.fromJson(Map<String, dynamic> json) =>
      _$OrderLineFromJson(json);
}

/// One entry of the order's `statusHistory`.
@freezed
abstract class OrderStatusHistoryEntry with _$OrderStatusHistoryEntry {
  const factory OrderStatusHistoryEntry({
    required String toStatus,
    String? fromStatus,
    String? changedByName,
    String? notes,
    required DateTime createdAt,
  }) = _OrderStatusHistoryEntry;

  factory OrderStatusHistoryEntry.fromJson(Map<String, dynamic> json) =>
      _$OrderStatusHistoryEntryFromJson(json);
}

/// `GET /api/orders/:id` and the `order` payload of `POST /api/orders`.
@freezed
abstract class OrderDetail with _$OrderDetail {
  const factory OrderDetail({
    required String id,
    required String orderNumber,
    required String storeId,
    required String storeName,
    String? warehouseId,
    String? warehouseName,
    required String status,
    required String orderTotal,
    String? notes,
    required DateTime submittedAt,
    required String submittedByName,
    DateTime? approvedAt,
    String? approvedByName,
    String? rejectionReason,
    @Default(<OrderLine>[]) List<OrderLine> lines,
    @Default(<OrderStatusHistoryEntry>[])
    List<OrderStatusHistoryEntry> statusHistory,
  }) = _OrderDetail;

  factory OrderDetail.fromJson(Map<String, dynamic> json) =>
      _$OrderDetailFromJson(json);
}

/// Envelope returned by `POST /api/orders`: `{ "order": { ... } }`.
@freezed
abstract class OrderEnvelope with _$OrderEnvelope {
  const factory OrderEnvelope({required OrderDetail order}) = _OrderEnvelope;

  factory OrderEnvelope.fromJson(Map<String, dynamic> json) =>
      _$OrderEnvelopeFromJson(json);
}

/// Paged `GET /api/orders` response.
@freezed
abstract class OrderPage with _$OrderPage {
  const factory OrderPage({
    @Default(<OrderSummary>[]) List<OrderSummary> items,
    required int total,
    required int limit,
    required int offset,
  }) = _OrderPage;

  factory OrderPage.fromJson(Map<String, dynamic> json) =>
      _$OrderPageFromJson(json);
}

extension OrderLineX on OrderLine {
  /// Units short of what was ordered, in base units.
  int get shortfall {
    final ordered = unitType == 'case'
        ? quantityOrdered * unitsPerPack
        : quantityOrdered;
    final missing = ordered - quantityAllocated;
    return missing > 0 ? missing : 0;
  }
}
