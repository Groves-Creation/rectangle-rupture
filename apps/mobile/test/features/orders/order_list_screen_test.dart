import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/core/widgets/order_status_chip.dart';
import 'package:lit_distribution/features/orders/presentation/order_list_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

Future<void> _pump(WidgetTester tester, FakeApi api) async {
  await usePhoneSurface(tester);
  await tester.pumpWidget(
    wrapScreen(
      const OrderListScreen(),
      api: api,
      tokens: signedInTokens,
      selectedStoreId: storeOneId,
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('OrderListScreen lists orders with a status chip', (
    tester,
  ) async {
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on('GET', ApiPaths.orders, FakeResponse(200, orderPageJson()));
    await _pump(tester, api);

    expect(find.text('Orders'), findsOneWidget);
    expect(find.text('LIT-000001'), findsOneWidget);
    expect(find.text(r'$76.00'), findsOneWidget);
    expect(find.byType(OrderStatusChip), findsOneWidget);
    expect(tester.takeException(), isNull);

    final request = api.requests.firstWhere(
      (r) => r.uri.path == ApiPaths.orders,
    );
    expect(request.queryParameters['storeId'], storeOneId);
    expect(request.queryParameters['status'], isNull);
  });

  testWidgets('OrderListScreen filters by status', (tester) async {
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on('GET', ApiPaths.orders, FakeResponse(200, orderPageJson()));
    await _pump(tester, api);

    final approvedFilter = find.text('Approved');
    await tester.ensureVisible(approvedFilter);
    await tester.pumpAndSettle();
    await tester.tap(approvedFilter);
    await tester.pumpAndSettle();

    final request = api.requests.lastWhere(
      (r) => r.uri.path == ApiPaths.orders,
    );
    expect(request.queryParameters['status'], 'approved');
  });

  testWidgets('OrderListScreen shows an empty state', (tester) async {
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on(
        'GET',
        ApiPaths.orders,
        FakeResponse(200, <String, dynamic>{
          'items': <Object>[],
          'total': 0,
          'limit': 20,
          'offset': 0,
        }),
      );
    await _pump(tester, api);

    expect(find.text('No orders yet'), findsOneWidget);
  });
}
