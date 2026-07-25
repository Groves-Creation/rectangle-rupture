/// The full order status vocabulary from the API contract (17 values).
///
/// The wire value is a plain string; models keep the raw string so an
/// unrecognised status from a newer API can still be displayed rather than
/// crashing deserialization. Use [OrderStatus.tryParse] to resolve one.
enum OrderStatus {
  submitted('submitted', 'Submitted'),
  underReview('under_review', 'Under review'),
  approved('approved', 'Approved'),
  inventoryAllocated('inventory_allocated', 'Inventory allocated'),
  picking('picking', 'Picking'),
  partiallyFulfilled('partially_fulfilled', 'Partially fulfilled'),
  picked('picked', 'Picked'),
  packed('packed', 'Packed'),
  routeAssigned('route_assigned', 'Route assigned'),
  outForDelivery('out_for_delivery', 'Out for delivery'),
  delivered('delivered', 'Delivered'),
  receivingRequired('receiving_required', 'Receiving required'),
  completed('completed', 'Completed'),
  backordered('backordered', 'Backordered'),
  cancelled('cancelled', 'Cancelled'),
  rejected('rejected', 'Rejected'),
  deliveryFailed('delivery_failed', 'Delivery failed');

  const OrderStatus(this.wireValue, this.label);

  /// The exact string the API sends and expects.
  final String wireValue;

  /// Human readable label, exactly as tabulated in the contract.
  final String label;

  /// Returns the matching status, or `null` for an unrecognised value.
  static OrderStatus? tryParse(String? value) {
    if (value == null) return null;
    for (final status in OrderStatus.values) {
      if (status.wireValue == value) return status;
    }
    return null;
  }

  /// A best-effort label for any wire value, including unknown ones.
  ///
  /// `some_new_status` degrades to `Some new status` rather than throwing.
  static String labelFor(String? value) {
    final known = tryParse(value);
    if (known != null) return known.label;
    if (value == null || value.isEmpty) return 'Unknown';
    final words = value.replaceAll('_', ' ').trim();
    if (words.isEmpty) return 'Unknown';
    return words[0].toUpperCase() + words.substring(1);
  }

  /// Terminal states: no further progress is expected.
  bool get isTerminal => switch (this) {
    OrderStatus.completed ||
    OrderStatus.cancelled ||
    OrderStatus.rejected ||
    OrderStatus.deliveryFailed => true,
    _ => false,
  };
}
