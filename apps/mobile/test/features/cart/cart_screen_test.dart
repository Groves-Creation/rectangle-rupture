import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/features/cart/presentation/cart_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

FakeApi _api({bool meetsMinimum = false}) => FakeApi()
  ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
  ..on(
    'GET',
    ApiPaths.cart,
    FakeResponse(
      200,
      cartJson(
        subtotal: meetsMinimum ? '150.0000' : '76.0000',
        meetsMinimum: meetsMinimum,
      ),
    ),
  );

Future<void> _pump(WidgetTester tester, FakeApi api) async {
  await usePhoneSurface(tester);
  await tester.pumpWidget(
    wrapScreen(
      const CartScreen(),
      api: api,
      tokens: signedInTokens,
      selectedStoreId: storeOneId,
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('CartScreen shows lines, totals and the minimum shortfall', (
    tester,
  ) async {
    await _pump(tester, _api());

    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Sparkling Water — Blue Razz'), findsOneWidget);
    expect(find.text(r'$76.00'), findsWidgets);
    expect(
      find.textContaining(r'Add $24.00 to reach the $100.00 minimum'),
      findsOneWidget,
    );
    // Below the minimum, submitting is disabled.
    final button = tester.widget<FilledButton>(
      find.widgetWithText(FilledButton, 'Submit order'),
    );
    expect(button.onPressed, isNull);
    expect(tester.takeException(), isNull);
  });

  testWidgets('CartScreen shows an empty state', (tester) async {
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on(
        'GET',
        ApiPaths.cart,
        FakeResponse(
          200,
          cartJson(lines: <Map<String, dynamic>>[], subtotal: '0.0000'),
        ),
      );
    await _pump(tester, api);

    expect(find.text('Your cart is empty'), findsOneWidget);
  });

  testWidgets('CartScreen confirms before removing a line', (tester) async {
    final api = _api()
      ..on('DELETE', ApiPaths.cartLine(cartLineOneId), const FakeResponse(204));
    await _pump(tester, api);

    await tester.tap(find.byTooltip('Remove line'));
    await tester.pumpAndSettle();

    expect(find.text('Remove line?'), findsOneWidget);
    // Cancelling must not call the API.
    await tester.tap(find.widgetWithText(TextButton, 'Cancel'));
    await tester.pumpAndSettle();
    expect(api.callsTo('DELETE', ApiPaths.cartLine(cartLineOneId)), 0);

    await tester.tap(find.byTooltip('Remove line'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Remove'));
    await tester.pumpAndSettle();

    expect(api.callsTo('DELETE', ApiPaths.cartLine(cartLineOneId)), 1);
  });

  testWidgets('CartScreen confirms before clearing the cart', (tester) async {
    final api = _api()..on('DELETE', ApiPaths.cart, const FakeResponse(204));
    await _pump(tester, api);

    await tester.tap(find.byTooltip('Clear cart'));
    await tester.pumpAndSettle();

    expect(find.text('Clear the cart?'), findsOneWidget);
    await tester.tap(find.widgetWithText(FilledButton, 'Clear cart'));
    await tester.pumpAndSettle();

    expect(api.callsTo('DELETE', ApiPaths.cart), 1);
  });

  testWidgets('CartScreen submits with an Idempotency-Key header', (
    tester,
  ) async {
    final api = _api(meetsMinimum: true)
      ..on('POST', ApiPaths.orders, FakeResponse(201, orderEnvelopeJson()));
    await _pump(tester, api);

    await tester.tap(find.widgetWithText(FilledButton, 'Submit order'));
    await tester.pumpAndSettle();

    final submit = api.requests.firstWhere(
      (r) => r.method == 'POST' && r.uri.path == ApiPaths.orders,
    );
    final key = submit.headers[ApiHeaders.idempotencyKey] as String?;
    expect(key, isNotNull);
    expect(key, isNotEmpty);
    expect((submit.data as Map<String, dynamic>)['storeId'], storeOneId);
    expect(findNavigatedTo('/orders/$orderOneId/confirmation'), findsOneWidget);
  });

  testWidgets(
    'CartScreen reuses the same Idempotency-Key when a submit is retried',
    (tester) async {
      var attempt = 0;
      final api = _api(meetsMinimum: true)
        ..onRequest('POST', ApiPaths.orders, (_) {
          attempt++;
          // First attempt dies mid-flight; the order may or may not exist.
          return attempt == 1
              ? FakeResponse.error(503, 'UNAVAILABLE', 'Gateway timeout')
              : FakeResponse(201, orderEnvelopeJson());
        });
      await _pump(tester, api);

      await tester.tap(find.widgetWithText(FilledButton, 'Submit order'));
      await tester.pumpAndSettle();

      // The button now offers a retry rather than a fresh submit.
      final retryButton = find.widgetWithText(FilledButton, 'Retry submit');
      expect(retryButton, findsOneWidget);

      await tester.ensureVisible(retryButton);
      await tester.pumpAndSettle();
      await tester.tap(retryButton);
      await tester.pumpAndSettle();

      final submits = api.requests
          .where((r) => r.method == 'POST' && r.uri.path == ApiPaths.orders)
          .toList();
      expect(submits.length, 2);
      expect(
        submits[1].headers[ApiHeaders.idempotencyKey],
        submits[0].headers[ApiHeaders.idempotencyKey],
        reason:
            'A fresh key on retry would create a duplicate order — the whole '
            'reason the header exists.',
      );
    },
  );
}
