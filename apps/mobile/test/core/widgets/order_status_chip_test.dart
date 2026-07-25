import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/app/theme.dart';
import 'package:lit_distribution/core/widgets/order_status_chip.dart';
import 'package:lit_distribution/shared/models/order_status.dart';

Widget _host(Widget child, {Brightness brightness = Brightness.light}) =>
    MaterialApp(
      theme: brightness == Brightness.light
          ? AppTheme.light()
          : AppTheme.dark(),
      home: Scaffold(body: Center(child: child)),
    );

void main() {
  group('OrderStatusChip', () {
    test('the enum covers all 17 contract statuses', () {
      expect(OrderStatus.values.length, 17);
    });

    testWidgets('renders every contract status with icon + label', (
      tester,
    ) async {
      for (final status in OrderStatus.values) {
        await tester.pumpWidget(
          _host(OrderStatusChip(status: status.wireValue)),
        );

        expect(
          find.text(status.label),
          findsOneWidget,
          reason: 'missing label for ${status.wireValue}',
        );
        // Colour alone is never enough: there must be an icon too.
        expect(
          find.descendant(
            of: find.byType(OrderStatusChip),
            matching: find.byType(Icon),
          ),
          findsOneWidget,
          reason: 'missing icon for ${status.wireValue}',
        );
        expect(tester.takeException(), isNull);
      }
    });

    testWidgets('renders every contract status in dark mode too', (
      tester,
    ) async {
      for (final status in OrderStatus.values) {
        await tester.pumpWidget(
          _host(
            OrderStatusChip(status: status.wireValue),
            brightness: Brightness.dark,
          ),
        );
        expect(find.text(status.label), findsOneWidget);
        expect(tester.takeException(), isNull);
      }
    });

    testWidgets('every status has a distinct icon', (tester) async {
      final icons = <IconData>{};
      for (final status in OrderStatus.values) {
        await tester.pumpWidget(
          _host(OrderStatusChip(status: status.wireValue)),
        );
        final icon = tester.widget<Icon>(
          find.descendant(
            of: find.byType(OrderStatusChip),
            matching: find.byType(Icon),
          ),
        );
        icons.add(icon.icon!);
      }
      expect(icons.length, OrderStatus.values.length);
    });

    testWidgets('degrades to a neutral chip on an unknown status', (
      tester,
    ) async {
      await tester.pumpWidget(
        _host(const OrderStatusChip(status: 'teleported_to_mars')),
      );

      expect(tester.takeException(), isNull);
      expect(find.text('Teleported to mars'), findsOneWidget);
      expect(find.byIcon(Icons.help_outline), findsOneWidget);
    });

    testWidgets('degrades on an empty status without throwing', (tester) async {
      await tester.pumpWidget(_host(const OrderStatusChip(status: '')));

      expect(tester.takeException(), isNull);
      expect(find.text('Unknown'), findsOneWidget);
    });

    testWidgets('the dense variant still shows icon and label', (tester) async {
      await tester.pumpWidget(
        _host(const OrderStatusChip(status: 'submitted', dense: true)),
      );

      expect(find.text('Submitted'), findsOneWidget);
      expect(find.byType(Icon), findsOneWidget);
    });

    testWidgets('exposes the status to assistive technology', (tester) async {
      await tester.pumpWidget(
        _host(const OrderStatusChip(status: 'inventory_allocated')),
      );

      expect(
        find.bySemanticsLabel('Order status: Inventory allocated'),
        findsOneWidget,
      );
    });
  });

  group('OrderStatus', () {
    test('tryParse resolves known wire values and rejects the rest', () {
      expect(
        OrderStatus.tryParse('inventory_allocated'),
        OrderStatus.inventoryAllocated,
      );
      expect(OrderStatus.tryParse('not_a_status'), isNull);
      expect(OrderStatus.tryParse(null), isNull);
    });

    test('labelFor humanises unknown values', () {
      expect(OrderStatus.labelFor('delivery_failed'), 'Delivery failed');
      expect(OrderStatus.labelFor('some_future_state'), 'Some future state');
      expect(OrderStatus.labelFor(null), 'Unknown');
    });

    test('terminal statuses are marked as such', () {
      expect(OrderStatus.completed.isTerminal, isTrue);
      expect(OrderStatus.rejected.isTerminal, isTrue);
      expect(OrderStatus.submitted.isTerminal, isFalse);
    });
  });
}
