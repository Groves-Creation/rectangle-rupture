import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Whether the device currently has any network transport.
///
/// This is a hint for the UI banner only — it says nothing about whether the
/// API is actually reachable, so requests are still attempted and their real
/// failures are what the user sees.
final connectivityProvider = StreamProvider<bool>((ref) async* {
  final connectivity = Connectivity();
  yield _isOnline(await connectivity.checkConnectivity());
  yield* connectivity.onConnectivityChanged.map(_isOnline);
});

bool _isOnline(List<ConnectivityResult> results) =>
    results.isNotEmpty && results.any((r) => r != ConnectivityResult.none);
