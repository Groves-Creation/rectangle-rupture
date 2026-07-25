import 'package:freezed_annotation/freezed_annotation.dart';

part 'cart_models.freezed.dart';
part 'cart_models.g.dart';

/// Wire values for `unitType`. The contract only shows `"case"`; `"unit"` is
/// the other member of the pair implied by `unitPrice` / `packPrice`.
abstract final class UnitType {
  static const String unit = 'unit';
  static const String pack = 'case';

  static const List<String> values = <String>[unit, pack];

  static String label(String value) => switch (value) {
    unit => 'Unit',
    pack => 'Case',
    _ => value,
  };
}

/// A single line of `GET /api/cart`.
@freezed
abstract class CartLine with _$CartLine {
  const factory CartLine({
    required String id,
    required String variantId,
    required String name,
    required String variantName,
    required String sku,
    required String? imageUrl,
    required String unitType,
    required int unitsPerPack,
    required int quantity,
    required String unitPrice,
    required String packPrice,
    required String lineTotal,
    required int availableAtWarehouse,
    required bool exceedsAvailable,
  }) = _CartLine;

  factory CartLine.fromJson(Map<String, dynamic> json) =>
      _$CartLineFromJson(json);
}

/// The per (store, user) cart. Every cart mutation returns this whole shape.
@freezed
abstract class Cart with _$Cart {
  const factory Cart({
    required String cartId,
    required String storeId,
    @Default(<CartLine>[]) List<CartLine> lines,
    required String subtotal,
    required String orderMinimum,
    required bool meetsMinimum,
  }) = _Cart;

  factory Cart.fromJson(Map<String, dynamic> json) => _$CartFromJson(json);
}

/// `POST /api/cart/lines` request body.
@freezed
abstract class AddCartLineRequest with _$AddCartLineRequest {
  const factory AddCartLineRequest({
    required String storeId,
    required String variantId,
    required String unitType,
    required int quantity,
  }) = _AddCartLineRequest;

  factory AddCartLineRequest.fromJson(Map<String, dynamic> json) =>
      _$AddCartLineRequestFromJson(json);
}

extension CartLineX on CartLine {
  String get displayName {
    if (variantName.isEmpty || variantName == name) return name;
    return '$name — $variantName';
  }

  /// Number of sellable units this line represents.
  int get totalUnits =>
      unitType == UnitType.pack ? quantity * unitsPerPack : quantity;
}

extension CartX on Cart {
  bool get isEmpty => lines.isEmpty;

  int get lineCount => lines.length;

  bool get hasAvailabilityProblem => lines.any((l) => l.exceedsAvailable);
}
