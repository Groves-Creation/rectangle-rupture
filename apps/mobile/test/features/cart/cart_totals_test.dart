import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/money/money.dart';
import 'package:lit_distribution/features/cart/domain/cart_totals.dart';
import 'package:lit_distribution/shared/models/cart_models.dart';

import '../../support/fixtures.dart';

Cart cartWith(List<Map<String, dynamic>> lines, String subtotal) =>
    Cart.fromJson(cartJson(lines: lines, subtotal: subtotal));

void main() {
  group('Money', () {
    test('parses the contract 4-decimal string exactly', () {
      expect(Money.parse('12.5000').scaled, 125000);
      expect(Money.parse('0.0001').scaled, 1);
      expect(Money.parse('38.0000').toWire(), '38.0000');
    });

    test('round-trips through the wire format', () {
      for (final value in ['0.0000', '3.5000', '76.0000', '1234.5678']) {
        expect(Money.parse(value).toWire(), value);
      }
    });

    test('is exact where doubles are not', () {
      // 0.1 + 0.2 != 0.3 in binary floating point. Here it must be exact.
      final sum = Money.parse('0.1000') + Money.parse('0.2000');
      expect(sum.toWire(), '0.3000');
      expect(sum, Money.parse('0.3000'));
    });

    test('multiplies by whole quantities without drift', () {
      final total = Money.parse('3.3300') * 3;
      expect(total.toWire(), '9.9900');

      var accumulated = Money.zero;
      for (var i = 0; i < 100; i++) {
        accumulated += Money.parse('0.0700');
      }
      expect(accumulated.toWire(), '7.0000');
    });

    test('formats for display with grouping and 2 decimals', () {
      expect(Money.parse('1234.5000').format(), r'$1,234.50');
      expect(Money.parse('38.0000').format(), r'$38.00');
      expect(Money.parse('0.0000').format(), r'$0.00');
      expect(Money.parse('-12.3450').format(), r'-$12.35');
      expect(Money.parse('1000000.0000').format(), r'$1,000,000.00');
    });

    test('tryParse rejects junk instead of throwing', () {
      expect(Money.tryParse('abc'), isNull);
      expect(Money.tryParse(''), isNull);
      expect(Money.tryParse(null), isNull);
      expect(Money.tryParse('1.2.3'), isNull);
      expect(formatMoney('not-a-price'), 'not-a-price');
    });
  });

  group('cartTotalsOf', () {
    test('sums line totals to the server subtotal', () {
      final cart = cartWith([
        cartLineJson(lineTotal: '76.0000'),
        cartLineJson(
          id: 'c0000000-0000-4000-8000-000000000002',
          quantity: 1,
          lineTotal: '38.0000',
        ),
      ], '114.0000');

      final totals = cartTotalsOf(cart);

      expect(totals.subtotal.toWire(), '114.0000');
      expect(totals.computedSubtotal.toWire(), '114.0000');
      expect(totals.isConsistent, isTrue);
      expect(totals.lineCount, 2);
    });

    test('counts base units, multiplying cases out', () {
      final cart = cartWith([
        // 2 cases of 12 = 24 units
        cartLineJson(quantity: 2),
        // 1 case of 12 = 12 units
        cartLineJson(
          id: 'c0000000-0000-4000-8000-000000000002',
          quantity: 1,
          lineTotal: '38.0000',
        ),
      ], '114.0000');

      expect(cartTotalsOf(cart).totalUnits, 36);
    });

    test('reports the shortfall against the order minimum', () {
      final cart = cartWith([cartLineJson()], '76.0000');
      final totals = cartTotalsOf(cart);

      expect(totals.orderMinimum.toWire(), '100.0000');
      expect(totals.remainingToMinimum.toWire(), '24.0000');
      expect(totals.meetsMinimum, isFalse);
    });

    test('never reports a negative shortfall once the minimum is met', () {
      final cart = Cart.fromJson(
        cartJson(subtotal: '150.0000', meetsMinimum: true),
      );
      final totals = cartTotalsOf(cart);

      expect(totals.remainingToMinimum, Money.zero);
      expect(totals.meetsMinimum, isTrue);
    });

    test('flags drift between the server subtotal and the lines', () {
      final cart = cartWith([cartLineJson(lineTotal: '76.0000')], '99.0000');
      final totals = cartTotalsOf(cart);

      // The server value still wins — it is what the order will be priced at.
      expect(totals.subtotal.toWire(), '99.0000');
      expect(totals.isConsistent, isFalse);
    });

    test('an empty cart totals zero', () {
      final cart = Cart.fromJson(
        cartJson(lines: <Map<String, dynamic>>[], subtotal: '0.0000'),
      );
      final totals = cartTotalsOf(cart);

      expect(totals.subtotal, Money.zero);
      expect(totals.totalUnits, 0);
      expect(totals.lineCount, 0);
    });
  });

  group('expectedLineTotal', () {
    test('uses the pack price for case lines', () {
      expect(
        expectedLineTotal(
          unitType: UnitType.pack,
          unitPrice: '3.5000',
          packPrice: '38.0000',
          quantity: 2,
        ).toWire(),
        '76.0000',
      );
    });

    test('uses the unit price for unit lines', () {
      expect(
        expectedLineTotal(
          unitType: UnitType.unit,
          unitPrice: '3.5000',
          packPrice: '38.0000',
          quantity: 3,
        ).toWire(),
        '10.5000',
      );
    });
  });
}
