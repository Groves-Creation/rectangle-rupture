import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../shared/models/auth_models.dart';

part 'session_state.freezed.dart';

/// Who is signed in and which store they are acting on.
@freezed
abstract class SessionState with _$SessionState {
  const factory SessionState({
    AuthUser? user,
    @Default(<StoreSummary>[]) List<StoreSummary> stores,
    String? selectedStoreId,
  }) = _SessionState;

  const SessionState._();

  static const SessionState signedOut = SessionState();

  bool get isAuthenticated => user != null;

  StoreSummary? get selectedStore {
    final id = selectedStoreId;
    if (id == null) return null;
    for (final store in stores) {
      if (store.id == id) return store;
    }
    return null;
  }

  /// The picker is skipped entirely when the user has exactly one store.
  bool get needsStoreSelection => isAuthenticated && selectedStore == null;

  bool get canSwitchStore => stores.length > 1;
}
