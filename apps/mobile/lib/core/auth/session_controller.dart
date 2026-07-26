import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../api/api_config.dart';
import '../../features/authentication/data/auth_repository.dart';
import '../../features/authentication/domain/session_state.dart';
import '../../shared/models/auth_models.dart';
import '../errors/failure.dart';
import 'auth_events.dart';
import 'selected_store_storage.dart';
import 'token_storage.dart';

part 'session_controller.g.dart';

/// Owns "who is signed in and where are they ordering from".
///
/// It is the only thing that writes tokens on sign-in and clears them on
/// sign-out; the Dio interceptor rotates them underneath.
@Riverpod(keepAlive: true)
class SessionController extends _$SessionController {
  @override
  Future<SessionState> build() async {
    // The interceptor gave up on refreshing: drop the session.
    final subscription = ref
        .watch(authEventsProvider)
        .sessionExpired
        .listen((_) => _clearLocalSession());
    ref.onDispose(subscription.cancel);

    return _restore();
  }

  Future<SessionState> _restore() async {
    final tokens = await ref.read(tokenStorageProvider).read();
    if (tokens == null) {
      debugPrint(
        'Dev auto-login: enabled=${DevConfig.autoLogin}, '
        'api=${ApiConfig.baseUrl}',
      );
      if (!DevConfig.autoLogin) return SessionState.signedOut;

      try {
        final session = await ref
            .read(authRepositoryProvider)
            .login(email: DevConfig.email, password: DevConfig.password);
        await ref.read(tokenStorageProvider).write(session.tokens);
        return _withStoreSelection(user: session.user, stores: session.stores);
      } on Failure catch (failure) {
        debugPrint('Dev auto-login failed: $failure');
        // Keep the login screen available when the local development API is
        // offline or has not been seeded yet.
        return SessionState.signedOut;
      }
    }

    try {
      final me = await ref.read(authRepositoryProvider).me();
      return _withStoreSelection(user: me.user, stores: me.stores);
    } on Failure {
      // Expired or revoked. Start clean rather than showing a broken shell.
      await ref.read(tokenStorageProvider).clear();
      return SessionState.signedOut;
    }
  }

  Future<void> signIn({
    required String email,
    required String password,
    String? deviceIdentifier,
  }) async {
    final session = await ref
        .read(authRepositoryProvider)
        .login(
          email: email,
          password: password,
          deviceIdentifier: deviceIdentifier,
        );
    await ref.read(tokenStorageProvider).write(session.tokens);
    state = AsyncData(
      await _withStoreSelection(user: session.user, stores: session.stores),
    );
  }

  Future<void> signOut() async {
    final tokens = await ref.read(tokenStorageProvider).read();
    if (tokens != null) {
      await ref.read(authRepositoryProvider).logout(tokens.refreshToken);
    }
    await _clearLocalSession();
  }

  Future<void> selectStore(String storeId) async {
    final current = state.value ?? SessionState.signedOut;
    if (!current.stores.any((store) => store.id == storeId)) return;
    await ref.read(selectedStoreStorageProvider).write(storeId);
    state = AsyncData(current.copyWith(selectedStoreId: storeId));
  }

  /// Returns to the store picker without signing out.
  Future<void> clearStoreSelection() async {
    final current = state.value ?? SessionState.signedOut;
    await ref.read(selectedStoreStorageProvider).clear();
    state = AsyncData(SessionState(user: current.user, stores: current.stores));
  }

  Future<void> _clearLocalSession() async {
    await ref.read(tokenStorageProvider).clear();
    await ref.read(selectedStoreStorageProvider).clear();
    state = const AsyncData(SessionState.signedOut);
  }

  /// Applies the "one store means no picker" rule, and re-applies a previously
  /// remembered store when it is still accessible.
  Future<SessionState> _withStoreSelection({
    required AuthUser user,
    required List<StoreSummary> stores,
  }) async {
    final storage = ref.read(selectedStoreStorageProvider);

    if (stores.length == 1) {
      await storage.write(stores.single.id);
      return SessionState(
        user: user,
        stores: stores,
        selectedStoreId: stores.single.id,
      );
    }

    final remembered = await storage.read();
    final stillAccessible =
        remembered != null && stores.any((store) => store.id == remembered);
    if (!stillAccessible && remembered != null) {
      await storage.clear();
    }
    return SessionState(
      user: user,
      stores: stores,
      selectedStoreId: stillAccessible ? remembered : null,
    );
  }
}

/// The store every data request is scoped to. `null` until one is chosen.
@Riverpod(keepAlive: true)
String? selectedStoreId(Ref ref) {
  return ref.watch(sessionControllerProvider).value?.selectedStoreId;
}
