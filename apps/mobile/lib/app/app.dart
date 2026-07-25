import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/auth/session_controller.dart';
import 'router.dart';
import 'theme.dart';

/// Root widget.
///
/// While the stored session is being restored (`GET /api/auth/me`) the router
/// is not built at all — otherwise the first frame would redirect to `/login`
/// and immediately bounce back, which reads as a flash of the wrong screen.
class LitDistributionApp extends ConsumerWidget {
  const LitDistributionApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(sessionControllerProvider);

    if (session.isLoading && !session.hasValue) {
      return MaterialApp(
        title: 'LIT Distribution',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        home: const _Bootstrapping(),
      );
    }

    return MaterialApp.router(
      title: 'LIT Distribution',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      routerConfig: ref.watch(routerProvider),
    );
  }
}

class _Bootstrapping extends StatelessWidget {
  const _Bootstrapping();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 24),
            Text('Restoring your session…'),
          ],
        ),
      ),
    );
  }
}
