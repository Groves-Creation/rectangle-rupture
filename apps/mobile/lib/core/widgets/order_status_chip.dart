import 'package:flutter/material.dart';

import '../../shared/models/order_status.dart';

/// The **only** place an order status is rendered.
///
/// Spec §18 / contract "Order status vocabulary": clients must show
/// **icon + label + colour**, never colour alone, because a meaningful share of
/// warehouse and retail staff cannot distinguish the colours. Centralising it
/// in one widget is what stops that regressing screen by screen.
///
/// An unrecognised status (a newer API adding a value) degrades to a neutral
/// grey chip with a question-mark icon and a humanised label. It never throws.
class OrderStatusChip extends StatelessWidget {
  const OrderStatusChip({super.key, required this.status, this.dense = false});

  /// Raw wire value, e.g. `inventory_allocated`.
  final String status;

  /// Compact form for dense list rows.
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final parsed = OrderStatus.tryParse(status);
    final visual = _visualFor(parsed);
    final label = OrderStatus.labelFor(status);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final background = isDark ? visual.tone.onDark : visual.tone.onLight;
    final foreground = isDark ? visual.tone.textDark : visual.tone.textLight;

    return Semantics(
      label: 'Order status: $label',
      excludeSemantics: true,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: dense ? 8 : 12,
          vertical: dense ? 4 : 8,
        ),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(dense ? 8 : 10),
          border: Border.all(color: foreground.withValues(alpha: 0.35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(visual.icon, size: dense ? 16 : 20, color: foreground),
            SizedBox(width: dense ? 6 : 8),
            Flexible(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: foreground,
                  fontWeight: FontWeight.w700,
                  fontSize: dense ? 12 : 14,
                  height: 1.1,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Colour families. Each carries a light-theme and dark-theme pair chosen for
/// at least 4.5:1 text contrast against its own background.
class _Tone {
  const _Tone({
    required this.onLight,
    required this.textLight,
    required this.onDark,
    required this.textDark,
  });

  final Color onLight;
  final Color textLight;
  final Color onDark;
  final Color textDark;

  static const _Tone neutral = _Tone(
    onLight: Color(0xFFECEFF1),
    textLight: Color(0xFF37474F),
    onDark: Color(0xFF37474F),
    textDark: Color(0xFFECEFF1),
  );
  static const _Tone info = _Tone(
    onLight: Color(0xFFE3F2FD),
    textLight: Color(0xFF0D47A1),
    onDark: Color(0xFF0D47A1),
    textDark: Color(0xFFE3F2FD),
  );
  static const _Tone pending = _Tone(
    onLight: Color(0xFFFFF8E1),
    textLight: Color(0xFF7A4F01),
    onDark: Color(0xFF5D3A00),
    textDark: Color(0xFFFFECB3),
  );
  static const _Tone progress = _Tone(
    onLight: Color(0xFFE8EAF6),
    textLight: Color(0xFF283593),
    onDark: Color(0xFF283593),
    textDark: Color(0xFFE8EAF6),
  );
  static const _Tone success = _Tone(
    onLight: Color(0xFFE8F5E9),
    textLight: Color(0xFF1B5E20),
    onDark: Color(0xFF1B5E20),
    textDark: Color(0xFFC8E6C9),
  );
  static const _Tone warning = _Tone(
    onLight: Color(0xFFFFF3E0),
    textLight: Color(0xFF8A3D00),
    onDark: Color(0xFF6B2F00),
    textDark: Color(0xFFFFE0B2),
  );
  static const _Tone danger = _Tone(
    onLight: Color(0xFFFFEBEE),
    textLight: Color(0xFFB71C1C),
    onDark: Color(0xFFB71C1C),
    textDark: Color(0xFFFFCDD2),
  );
}

class _StatusVisual {
  const _StatusVisual(this.icon, this.tone);

  final IconData icon;
  final _Tone tone;
}

/// Every one of the 17 contract statuses gets its own icon so the chips remain
/// distinguishable without relying on the colour family.
_StatusVisual _visualFor(OrderStatus? status) => switch (status) {
  OrderStatus.submitted => const _StatusVisual(
    Icons.receipt_long_outlined,
    _Tone.info,
  ),
  OrderStatus.underReview => const _StatusVisual(
    Icons.hourglass_top_outlined,
    _Tone.pending,
  ),
  OrderStatus.approved => const _StatusVisual(
    Icons.check_circle_outline,
    _Tone.success,
  ),
  OrderStatus.inventoryAllocated => const _StatusVisual(
    Icons.inventory_2_outlined,
    _Tone.progress,
  ),
  OrderStatus.picking => const _StatusVisual(
    Icons.shopping_basket_outlined,
    _Tone.progress,
  ),
  OrderStatus.partiallyFulfilled => const _StatusVisual(
    Icons.donut_large_outlined,
    _Tone.warning,
  ),
  OrderStatus.picked => const _StatusVisual(
    Icons.playlist_add_check_outlined,
    _Tone.progress,
  ),
  OrderStatus.packed => const _StatusVisual(
    Icons.all_inbox_outlined,
    _Tone.progress,
  ),
  OrderStatus.routeAssigned => const _StatusVisual(
    Icons.alt_route_outlined,
    _Tone.progress,
  ),
  OrderStatus.outForDelivery => const _StatusVisual(
    Icons.local_shipping_outlined,
    _Tone.progress,
  ),
  OrderStatus.delivered => const _StatusVisual(
    Icons.where_to_vote_outlined,
    _Tone.success,
  ),
  OrderStatus.receivingRequired => const _StatusVisual(
    Icons.assignment_turned_in_outlined,
    _Tone.pending,
  ),
  OrderStatus.completed => const _StatusVisual(Icons.task_alt, _Tone.success),
  OrderStatus.backordered => const _StatusVisual(
    Icons.pending_actions_outlined,
    _Tone.warning,
  ),
  OrderStatus.cancelled => const _StatusVisual(
    Icons.cancel_outlined,
    _Tone.neutral,
  ),
  OrderStatus.rejected => const _StatusVisual(
    Icons.block_outlined,
    _Tone.danger,
  ),
  OrderStatus.deliveryFailed => const _StatusVisual(
    Icons.report_gmailerrorred_outlined,
    _Tone.danger,
  ),
  // Unknown / future status: neutral, never a crash.
  null => const _StatusVisual(Icons.help_outline, _Tone.neutral),
};
