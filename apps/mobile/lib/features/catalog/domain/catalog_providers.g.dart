// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'catalog_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning
/// Free-text search box contents. Debounced by the screen before it lands
/// here, so every change is a real request.

@ProviderFor(CatalogSearchQuery)
final catalogSearchQueryProvider = CatalogSearchQueryProvider._();

/// Free-text search box contents. Debounced by the screen before it lands
/// here, so every change is a real request.
final class CatalogSearchQueryProvider
    extends $NotifierProvider<CatalogSearchQuery, String> {
  /// Free-text search box contents. Debounced by the screen before it lands
  /// here, so every change is a real request.
  CatalogSearchQueryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'catalogSearchQueryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$catalogSearchQueryHash();

  @$internal
  @override
  CatalogSearchQuery create() => CatalogSearchQuery();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(String value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<String>(value),
    );
  }
}

String _$catalogSearchQueryHash() =>
    r'569c318bb978983dd05dc3318efbb31fee7789c4';

/// Free-text search box contents. Debounced by the screen before it lands
/// here, so every change is a real request.

abstract class _$CatalogSearchQuery extends $Notifier<String> {
  String build();
  @$mustCallSuper
  @override
  WhenComplete runBuild() {
    final ref = this.ref as $Ref<String, String>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<String, String>,
              String,
              Object?,
              Object?
            >;
    return element.handleCreate(ref, build);
  }
}

/// The catalog for the selected store, filtered by the current search.

@ProviderFor(catalogPage)
final catalogPageProvider = CatalogPageProvider._();

/// The catalog for the selected store, filtered by the current search.

final class CatalogPageProvider
    extends
        $FunctionalProvider<
          AsyncValue<CatalogPage>,
          CatalogPage,
          FutureOr<CatalogPage>
        >
    with $FutureModifier<CatalogPage>, $FutureProvider<CatalogPage> {
  /// The catalog for the selected store, filtered by the current search.
  CatalogPageProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'catalogPageProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$catalogPageHash();

  @$internal
  @override
  $FutureProviderElement<CatalogPage> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<CatalogPage> create(Ref ref) {
    return catalogPage(ref);
  }
}

String _$catalogPageHash() => r'0471e365afaea536ed2bf1b2034ad84b526a7fd0';

/// A single catalog item, including the detail-only fields.

@ProviderFor(catalogItem)
final catalogItemProvider = CatalogItemFamily._();

/// A single catalog item, including the detail-only fields.

final class CatalogItemProvider
    extends
        $FunctionalProvider<
          AsyncValue<CatalogItem>,
          CatalogItem,
          FutureOr<CatalogItem>
        >
    with $FutureModifier<CatalogItem>, $FutureProvider<CatalogItem> {
  /// A single catalog item, including the detail-only fields.
  CatalogItemProvider._({
    required CatalogItemFamily super.from,
    required String super.argument,
  }) : super(
         retry: null,
         name: r'catalogItemProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$catalogItemHash();

  @override
  String toString() {
    return r'catalogItemProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<CatalogItem> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<CatalogItem> create(Ref ref) {
    final argument = this.argument as String;
    return catalogItem(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is CatalogItemProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$catalogItemHash() => r'8465bd4181d7b58cf6044fd0b240ebf3270f757b';

/// A single catalog item, including the detail-only fields.

final class CatalogItemFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<CatalogItem>, String> {
  CatalogItemFamily._()
    : super(
        retry: null,
        name: r'catalogItemProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  /// A single catalog item, including the detail-only fields.

  CatalogItemProvider call(String variantId) =>
      CatalogItemProvider._(argument: variantId, from: this);

  @override
  String toString() => r'catalogItemProvider';
}
