import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/core/widgets/order_status_chip.dart';
import 'package:lit_distribution/features/orders/presentation/order_detail_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

Future<void> _pump(WidgetTester tester, FakeApi api) async {
  await usePhoneSurface(tester);
  await tester.pumpWidget(
    wrapScreen(
      const OrderDetailScreen(orderId: orderOneId),
      api: api,
      tokens: signedInTokens,
      selectedStoreId: storeOneId,
    ),
  );
  await tester.pumpAndSettle();
}

FakeApi _api({
  bool fullyAllocated = true,
  String status = 'inventory_allocated',
}) => FakeApi()
  ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
  ..on(
    'GET',
    ApiPaths.order(orderOneId),
    FakeResponse(
      200,
      orderDetailJson(status: status, fullyAllocated: fullyAllocated),
    ),
  );

void main() {
  testWidgets('OrderDetailScreen shows snapshot prices, lines and history', (
    tester,
  ) async {
    await _pump(tester, _api());

    expect(find.text('LIT-000001'), findsOneWidget);
    // The current status appears in the summary and in the status history.
    expect(find.text('Inventory allocated'), findsNWidgets(2));
    expect(find.text('Downtown'), findsOneWidget);
    expect(find.text('Main DC'), findsOneWidget);
    expect(find.text('Lines (1)'), findsOneWidget);
    expect(find.text('Sparkling Water'), findsOneWidget);
    expect(find.text(r'$3.50 each'), findsOneWidget);
    // One chip for the order plus one per history entry.
    expect(find.byType(OrderStatusChip), findsNWidgets(3));
    expect(tester.takeException(), isNull);
  });

  testWidgets('OrderDetailScreen flags a short-allocated line', (tester) async {
    await _pump(tester, _api(fullyAllocated: false));

    // 2 cases of 12 = 24 ordered, 12 allocated.
    expect(find.text('Short by 12 units'), findsOneWidget);
  });

  testWidgets('OrderDetailScreen renders an unknown status safely', (
    tester,
  ) async {
    await _pump(tester, _api(status: 'quantum_entangled'));

    expect(tester.takeException(), isNull);
    expect(find.text('Quantum entangled'), findsWidgets);
  });
}
