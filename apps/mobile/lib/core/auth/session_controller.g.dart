// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_controller.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Owns "who is signed in and where are they ordering from".
///
/// It is the only thing that writes tokens on sign-in and clears them on
/// sign-out; the Dio interceptor rotates them underneath.

@ProviderFor(SessionController)
final sessionControllerProvider = SessionControllerProvider._();

/// Owns "who is signed in and where are they ordering from".
///
/// It is the only thing that writes tokens on sign-in and clears them on
/// sign-out; the Dio interceptor rotates them underneath.
final class SessionControllerProvider
    extends $AsyncNotifierProvider<SessionController, SessionState> {
  /// Owns "who is signed in and where are they ordering from".
  ///
  /// It is the only thing that writes tokens on sign-in and clears them on
  /// sign-out; the Dio interceptor rotates them underneath.
  SessionControllerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'sessionControllerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$sessionControllerHash();

  @$internal
  @override
  SessionController create() => SessionController();
}

String _$sessionControllerHash() => r'536c937acb85991145e04e5ff70fb1e87571421e';

/// Owns "who is signed in and where are they ordering from".
///
/// It is the only thing that writes tokens on sign-in and clears them on
/// sign-out; the Dio interceptor rotates them underneath.

abstract class _$SessionController extends $AsyncNotifier<SessionState> {
  FutureOr<SessionState> build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<AsyncValue<SessionState>, SessionState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<SessionState>, SessionState>,
              AsyncValue<SessionState>,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}

/// The store every data request is scoped to. `null` until one is chosen.

@ProviderFor(selectedStoreId)
final selectedStoreIdProvider = SelectedStoreIdProvider._();

/// The store every data request is scoped to. `null` until one is chosen.

final class SelectedStoreIdProvider
    extends $FunctionalProvider<String?, String?, String?>
    with $Provider<String?> {
  /// The store every data request is scoped to. `null` until one is chosen.
  SelectedStoreIdProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'selectedStoreIdProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$selectedStoreIdHash();

  @$internal
  @override
  $ProviderElement<String?> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  String? create(Ref ref) {
    return selectedStoreId(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(String? value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<String?>(value),
    );
  }
}

String _$selectedStoreIdHash() => r'44473446301e9f0db153dc611b964d7c1ae0b368';
