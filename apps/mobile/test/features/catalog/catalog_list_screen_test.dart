import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/features/catalog/presentation/catalog_list_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

FakeApi _api() => FakeApi()
  ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
  ..on('GET', ApiPaths.catalog, FakeResponse(200, catalogPageJson()));

void main() {
  testWidgets('CatalogListScreen shows the catalog for the selected store', (
    tester,
  ) async {
    await usePhoneSurface(tester);
    final api = _api();

    await tester.pumpWidget(
      wrapScreen(
        const CatalogListScreen(),
        api: api,
        tokens: signedInTokens,
        selectedStoreId: storeOneId,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Catalog'), findsOneWidget);
    expect(find.text('Downtown · STR-001'), findsOneWidget);
    expect(find.text('Sparkling Water — Blue Razz'), findsOneWidget);
    expect(find.text('Energy Drink — Blue Razz'), findsOneWidget);
    // Prices are displayed from the contract's 4-decimal strings.
    expect(find.text(r'$38.00'), findsNWidgets(2));
    expect(find.text('240 available'), findsNWidgets(2));
    expect(tester.takeException(), isNull);
  });

  testWidgets('CatalogListScreen scopes the request to the store', (
    tester,
  ) async {
    await usePhoneSurface(tester);
    final api = _api();

    await tester.pumpWidget(
      wrapScreen(
        const CatalogListScreen(),
        api: api,
        tokens: signedInTokens,
        selectedStoreId: storeOneId,
      ),
    );
    await tester.pumpAndSettle();

    final request = api.requests.firstWhere(
      (r) => r.uri.path == ApiPaths.catalog,
    );
    expect(request.queryParameters['storeId'], storeOneId);
    expect(request.queryParameters['limit'], 50);
    expect(request.queryParameters['offset'], 0);
  });

  testWidgets('CatalogListScreen shows an empty state', (tester) async {
    await usePhoneSurface(tester);
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on(
        'GET',
        ApiPaths.catalog,
        FakeResponse(200, <String, dynamic>{
          'items': <Object>[],
          'total': 0,
          'limit': 50,
          'offset': 0,
        }),
      );

    await tester.pumpWidget(
      wrapScreen(
        const CatalogListScreen(),
        api: api,
        tokens: signedInTokens,
        selectedStoreId: storeOneId,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No products found'), findsOneWidget);
  });

  testWidgets('CatalogListScreen surfaces a failure with a retry', (
    tester,
  ) async {
    await usePhoneSurface(tester);
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson()))
      ..on(
        'GET',
        ApiPaths.catalog,
        FakeResponse.error(500, 'INTERNAL', 'Catalog is down'),
      );

    await tester.pumpWidget(
      wrapScreen(
        const CatalogListScreen(),
        api: api,
        tokens: signedInTokens,
        selectedStoreId: storeOneId,
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Catalog is down'), findsOneWidget);
    expect(find.text('Try again'), findsOneWidget);
  });
}
