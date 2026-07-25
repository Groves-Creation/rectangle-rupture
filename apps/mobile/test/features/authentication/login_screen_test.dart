import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lit_distribution/core/api/api_config.dart';
import 'package:lit_distribution/features/authentication/presentation/login_screen.dart';

import '../../support/fake_api.dart';
import '../../support/fixtures.dart';
import '../../support/harness.dart';

void main() {
  testWidgets('LoginScreen renders the sign-in form', (tester) async {
    await usePhoneSurface(tester);
    final api = FakeApi();

    await tester.pumpWidget(wrapScreen(const LoginScreen(), api: api));
    await tester.pumpAndSettle();

    expect(find.text('LIT Distribution'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Email'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Password'), findsOneWidget);
    expect(find.widgetWithText(FilledButton, 'Sign in'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('LoginScreen validates before calling the API', (tester) async {
    await usePhoneSurface(tester);
    final api = FakeApi();

    await tester.pumpWidget(wrapScreen(const LoginScreen(), api: api));
    await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
    await tester.pumpAndSettle();

    expect(find.text('Enter your email'), findsOneWidget);
    expect(find.text('Enter your password'), findsOneWidget);
    expect(api.callsTo('POST', ApiPaths.login), 0);
  });

  testWidgets('LoginScreen posts credentials and surfaces API errors', (
    tester,
  ) async {
    await usePhoneSurface(tester);
    final api = FakeApi()
      ..on(
        'POST',
        ApiPaths.login,
        FakeResponse.error(401, 'UNAUTHENTICATED', 'Invalid credentials'),
      );

    await tester.pumpWidget(wrapScreen(const LoginScreen(), api: api));

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Email'),
      'manager@lit.test',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Password'),
      'Password123!',
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
    await tester.pumpAndSettle();

    expect(api.callsTo('POST', ApiPaths.login), 1);
    final body = api.requests.single.data as Map<String, dynamic>;
    expect(body['email'], 'manager@lit.test');
    expect(body['password'], 'Password123!');
    expect(find.text('Invalid credentials'), findsOneWidget);
  });

  testWidgets('LoginScreen signs in successfully', (tester) async {
    await usePhoneSurface(tester);
    final api = FakeApi()
      ..on('POST', ApiPaths.login, FakeResponse(200, loginJson()));

    await tester.pumpWidget(wrapScreen(const LoginScreen(), api: api));

    await tester.enterText(
      find.widgetWithText(TextFormField, 'Email'),
      'manager@lit.test',
    );
    await tester.enterText(
      find.widgetWithText(TextFormField, 'Password'),
      'Password123!',
    );
    await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
    await tester.pumpAndSettle();

    expect(api.callsTo('POST', ApiPaths.login), 1);
    expect(find.textContaining('Invalid'), findsNothing);
    expect(tester.takeException(), isNull);
  });
}
