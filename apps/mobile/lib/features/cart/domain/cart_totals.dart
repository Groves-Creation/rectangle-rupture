import '../../../core/money/money.dart';
import '../../../shared/models/cart_models.dart';

/// Everything the cart screen needs to render, derived once.
class CartTotals {
  const CartTotals({
    required this.subtotal,
    required this.computedSubtotal,
    required this.orderMinimum,
    required this.meetsMinimum,
    required this.lineCount,
    required this.totalUnits,
  });

  /// The server's `subtotal`. **This is the authoritative figure** — it is what
  /// the order will be priced at.
  final Money subtotal;

  /// The same figure recomputed locally from the line totals. Only used to
  /// detect drift ([isConsistent]); never sent anywhere.
  final Money computedSubtotal;

  final Money orderMinimum;
  final bool meetsMinimum;
  final int lineCount;

  /// Base units across every line (cases multiplied out).
  final int totalUnits;

  /// How much more is needed to reach the store's order minimum.
  Money get remainingToMinimum {
    final remaining = orderMinimum - subtotal;
    return remaining.isNegative ? Money.zero : remaining;
  }

  /// False if the server subtotal and the sum of the lines disagree, which
  /// would mean the client and server are computing money differently.
  bool get isConsistent => subtotal == computedSubtotal;
}

/// Pure derivation from a [Cart]. No I/O, no rounding surprises: all sums are
/// integer arithmetic on 1/10000ths.
CartTotals cartTotalsOf(Cart cart) {
  final computed = Money.sumOf(cart.lines.map((line) => line.lineTotal));
  var units = 0;
  for (final line in cart.lines) {
    units += line.totalUnits;
  }
  return CartTotals(
    subtotal: Money.tryParse(cart.subtotal) ?? computed,
    computedSubtotal: computed,
    orderMinimum: Money.tryParse(cart.orderMinimum) ?? Money.zero,
    meetsMinimum: cart.meetsMinimum,
    lineCount: cart.lines.length,
    totalUnits: units,
  );
}

/// What a line *should* total, given its unit type and quantity.
///
/// Used to render an optimistic figure while a quantity change is in flight;
/// the server's `lineTotal` replaces it as soon as the response lands.
Money expectedLineTotal({
  required String unitType,
  required String unitPrice,
  required String packPrice,
  required int quantity,
}) {
  final price = unitType == UnitType.pack
      ? Money.tryParse(packPrice)
      : Money.tryParse(unitPrice);
  return (price ?? Money.zero) * quantity;
}
