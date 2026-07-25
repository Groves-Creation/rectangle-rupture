import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/core/widgets/order_status_chip.dart';
import 'package:lit_distribution/features/orders/presentation/order_confirmation_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

void main() {
  testWidgets('OrderConfirmationScreen shows the new order number', (
    tester,
  ) async {
    await usePhoneSurface(tester);
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on(
        'GET',
        ApiPaths.order(orderOneId),
        FakeResponse(200, orderDetailJson(status: 'submitted')),
      );

    await tester.pumpWidget(
      wrapScreen(
        const OrderConfirmationScreen(orderId: orderOneId),
        api: api,
        tokens: signedInTokens,
        selectedStoreId: storeOneId,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Order submitted'), findsNWidgets(2)); // app bar + body
    expect(find.text('LIT-000001'), findsOneWidget);
    expect(find.byType(OrderStatusChip), findsOneWidget);
    expect(find.text('Submitted'), findsOneWidget);
    expect(find.text(r'$76.00'), findsOneWidget);
    expect(find.text('Downtown'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('OrderConfirmationScreen offers a way back into the app', (
    tester,
  ) async {
    await usePhoneSurface(tester);
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on(
        'GET',
        ApiPaths.order(orderOneId),
        FakeResponse(200, orderDetailJson()),
      );

    await tester.pumpWidget(
      wrapScreen(
        const OrderConfirmationScreen(orderId: orderOneId),
        api: api,
        tokens: signedInTokens,
        selectedStoreId: storeOneId,
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.widgetWithText(OutlinedButton, 'Back to catalog'));
    await tester.pumpAndSettle();

    expect(findNavigatedTo('/catalog'), findsOneWidget);
  });
}
