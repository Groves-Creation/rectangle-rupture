import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:lit_distribution/app/theme.dart';
import 'package:lit_distribution/core/api/connectivity.dart';
import 'package:lit_distribution/core/api/dio_client.dart';
import 'package:lit_distribution/core/auth/selected_store_storage.dart';
import 'package:lit_distribution/core/auth/token_storage.dart';
import 'package:lit_distribution/shared/models/auth_models.dart';

import 'fake_api.dart';

const AuthTokens signedInTokens = AuthTokens(
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  expiresIn: 900,
);

/// Where a screen under test lives in the throwaway router below.
const String testRoute = '/screen-under-test';

/// Pumps a single screen with the real providers behind it, so the test
/// exercises repository parsing and controller wiring too.
///
/// Overrides keep the test entirely off the network and off platform
/// channels. A minimal [GoRouter] is supplied because the screens navigate
/// with `context.go` / `context.push`; every location other than [testRoute]
/// renders a [NavigationProbe], so a test can assert *where* a screen
/// navigated without dragging in the real route table and its redirects.
Widget wrapScreen(
  Widget child, {
  required FakeApi api,
  AuthTokens? tokens,
  String? selectedStoreId,
  bool online = true,
}) {
  final router = GoRouter(
    initialLocation: testRoute,
    routes: [
      GoRoute(path: testRoute, builder: (context, state) => child),
      for (final path in const ['/:a', '/:a/:b', '/:a/:b/:c'])
        GoRoute(
          path: path,
          builder: (context, state) =>
              NavigationProbe(location: state.uri.path),
        ),
    ],
  );
  addTearDown(router.dispose);

  return ProviderScope(
    overrides: [
      httpClientAdapterProvider.overrideWithValue(api.adapter),
      tokenStorageProvider.overrideWithValue(InMemoryTokenStorage(tokens)),
      selectedStoreStorageProvider.overrideWithValue(
        InMemorySelectedStoreStorage(selectedStoreId),
      ),
      // connectivity_plus talks to a platform channel that does not exist in
      // a widget test.
      connectivityProvider.overrideWith((ref) => Stream<bool>.value(online)),
    ],
    child: MaterialApp.router(theme: AppTheme.light(), routerConfig: router),
  );
}

/// Placeholder for "the screen navigated somewhere else".
class NavigationProbe extends StatelessWidget {
  const NavigationProbe({super.key, required this.location});

  final String location;

  @override
  Widget build(BuildContext context) =>
      Scaffold(body: Center(child: Text('navigated:$location')));
}

/// Matches the [NavigationProbe] for [location].
Finder findNavigatedTo(String location) => find.text('navigated:$location');

/// A phone-shaped surface. The default 800x600 test window is wider and
/// shorter than any target device and provokes irrelevant overflows.
Future<void> usePhoneSurface(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(420, 920));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}
