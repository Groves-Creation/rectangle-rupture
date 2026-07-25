import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/features/authentication/presentation/store_picker_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

FakeApi _apiWithTwoStores() => FakeApi()
  ..on(
    'GET',
    ApiPaths.me,
    FakeResponse(
      200,
      meJson(
        stores: [
          storeJson(),
          storeJson(id: storeTwoId, code: 'STR-002', name: 'Riverside'),
        ],
      ),
    ),
  );

void main() {
  testWidgets('StorePickerScreen lists every accessible store', (tester) async {
    await usePhoneSurface(tester);
    final api = _apiWithTwoStores();

    await tester.pumpWidget(
      wrapScreen(const StorePickerScreen(), api: api, tokens: signedInTokens),
    );
    await tester.pumpAndSettle();

    expect(find.text('Choose a store'), findsOneWidget);
    expect(find.text('Downtown'), findsOneWidget);
    expect(find.text('STR-001'), findsOneWidget);
    expect(find.text('Riverside'), findsOneWidget);
    expect(find.text('STR-002'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('StorePickerScreen shows an empty state with no stores', (
    tester,
  ) async {
    await usePhoneSurface(tester);
    final api = FakeApi()
      ..on('GET', ApiPaths.me, FakeResponse(200, meJson(stores: const [])));

    await tester.pumpWidget(
      wrapScreen(const StorePickerScreen(), api: api, tokens: signedInTokens),
    );
    await tester.pumpAndSettle();

    expect(find.text('No stores assigned'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
