import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/core/widgets/quantity_stepper.dart';
import 'package:lit_distribution/features/catalog/presentation/product_detail_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

FakeApi _api() => FakeApi()
  ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
  ..on(
    'GET',
    ApiPaths.catalogItem(variantOneId),
    FakeResponse(200, catalogItemJson(detail: true)),
  )
  ..on('GET', ApiPaths.cart, FakeResponse(200, cartJson()))
  ..on('POST', ApiPaths.cartLines, FakeResponse(200, cartJson()));

Future<void> _pump(WidgetTester tester, FakeApi api) async {
  await usePhoneSurface(tester);
  await tester.pumpWidget(
    wrapScreen(
      const ProductDetailScreen(variantId: variantOneId),
      api: api,
      tokens: signedInTokens,
      selectedStoreId: storeOneId,
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('ProductDetailScreen renders the detail-only fields', (
    tester,
  ) async {
    final api = _api();
    await _pump(tester, api);

    expect(find.text('Sparkling Water — Blue Razz'), findsOneWidget);
    expect(find.text('Lit Beverages · Drinks'), findsOneWidget);
    expect(find.text('SKU SKU-0001'), findsOneWidget);
    expect(find.text('Lightly carbonated, 12oz can.'), findsOneWidget);
    expect(find.text('012345678905'), findsOneWidget);
    expect(find.text('Available at warehouse: 240'), findsOneWidget);
    expect(find.byType(QuantityStepper), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('ProductDetailScreen steps the quantity and totals the line', (
    tester,
  ) async {
    final api = _api();
    await _pump(tester, api);

    // Default: 1 case at 38.0000.
    expect(find.text(r'$38.00'), findsWidgets);

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();

    expect(find.text('2'), findsOneWidget);
    expect(find.text(r'$76.00'), findsOneWidget);
  });

  testWidgets('ProductDetailScreen adds a line to the cart', (tester) async {
    final api = _api();
    await _pump(tester, api);

    await tester.tap(find.widgetWithText(FilledButton, 'Add to cart'));
    await tester.pumpAndSettle();

    expect(api.callsTo('POST', ApiPaths.cartLines), 1);
    final body =
        api.requests.firstWhere((r) => r.uri.path == ApiPaths.cartLines).data
            as Map<String, dynamic>;
    expect(body['storeId'], storeOneId);
    expect(body['variantId'], variantOneId);
    expect(body['unitType'], 'case');
    expect(body['quantity'], 1);
    expect(find.textContaining('Added 1 case'), findsOneWidget);
  });
}
