import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

/// A tiny one-way bus so the Dio auth interceptor can tell the session
/// controller "the refresh token is dead, sign out" without either of them
/// depending on the other (which would be a provider cycle).
class AuthEvents {
  final StreamController<void> _sessionExpired =
      StreamController<void>.broadcast();

  /// Emits every time a refresh attempt failed unrecoverably.
  Stream<void> get sessionExpired => _sessionExpired.stream;

  void emitSessionExpired() {
    if (!_sessionExpired.isClosed) _sessionExpired.add(null);
  }

  void dispose() {
    unawaited(_sessionExpired.close());
  }
}

final authEventsProvider = Provider<AuthEvents>((ref) {
  final events = AuthEvents();
  ref.onDispose(events.dispose);
  return events;
});
