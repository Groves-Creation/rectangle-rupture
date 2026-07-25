// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'catalog_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CatalogItem {

 String get variantId; String get productId; String get name; String get variantName; String get sku; String get brandName; String get categoryName; String? get imageUrl; String get unitPrice; String get casePrice; int get unitsPerCase; int get minimumOrderQuantity; int get availableAtWarehouse; bool get isAgeRestricted; String? get description; List<String> get barcodes; String? get warehouseId;
/// Create a copy of CatalogItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CatalogItemCopyWith<CatalogItem> get copyWith => _$CatalogItemCopyWithImpl<CatalogItem>(this as CatalogItem, _$identity);

  /// Serializes this CatalogItem to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CatalogItem&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.name, name) || other.name == name)&&(identical(other.variantName, variantName) || other.variantName == variantName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.brandName, brandName) || other.brandName == brandName)&&(identical(other.categoryName, categoryName) || other.categoryName == categoryName)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.unitPrice, unitPrice) || other.unitPrice == unitPrice)&&(identical(other.casePrice, casePrice) || other.casePrice == casePrice)&&(identical(other.unitsPerCase, unitsPerCase) || other.unitsPerCase == unitsPerCase)&&(identical(other.minimumOrderQuantity, minimumOrderQuantity) || other.minimumOrderQuantity == minimumOrderQuantity)&&(identical(other.availableAtWarehouse, availableAtWarehouse) || other.availableAtWarehouse == availableAtWarehouse)&&(identical(other.isAgeRestricted, isAgeRestricted) || other.isAgeRestricted == isAgeRestricted)&&(identical(other.description, description) || other.description == description)&&const DeepCollectionEquality().equals(other.barcodes, barcodes)&&(identical(other.warehouseId, warehouseId) || other.warehouseId == warehouseId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,variantId,productId,name,variantName,sku,brandName,categoryName,imageUrl,unitPrice,casePrice,unitsPerCase,minimumOrderQuantity,availableAtWarehouse,isAgeRestricted,description,const DeepCollectionEquality().hash(barcodes),warehouseId);

@override
String toString() {
  return 'CatalogItem(variantId: $variantId, productId: $productId, name: $name, variantName: $variantName, sku: $sku, brandName: $brandName, categoryName: $categoryName, imageUrl: $imageUrl, unitPrice: $unitPrice, casePrice: $casePrice, unitsPerCase: $unitsPerCase, minimumOrderQuantity: $minimumOrderQuantity, availableAtWarehouse: $availableAtWarehouse, isAgeRestricted: $isAgeRestricted, description: $description, barcodes: $barcodes, warehouseId: $warehouseId)';
}


}

/// @nodoc
abstract mixin class $CatalogItemCopyWith<$Res>  {
  factory $CatalogItemCopyWith(CatalogItem value, $Res Function(CatalogItem) _then) = _$CatalogItemCopyWithImpl;
@useResult
$Res call({
 String variantId, String productId, String name, String variantName, String sku, String brandName, String categoryName, String? imageUrl, String unitPrice, String casePrice, int unitsPerCase, int minimumOrderQuantity, int availableAtWarehouse, bool isAgeRestricted, String? description, List<String> barcodes, String? warehouseId
});




}
/// @nodoc
class _$CatalogItemCopyWithImpl<$Res>
    implements $CatalogItemCopyWith<$Res> {
  _$CatalogItemCopyWithImpl(this._self, this._then);

  final CatalogItem _self;
  final $Res Function(CatalogItem) _then;

/// Create a copy of CatalogItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? variantId = null,Object? productId = null,Object? name = null,Object? variantName = null,Object? sku = null,Object? brandName = null,Object? categoryName = null,Object? imageUrl = freezed,Object? unitPrice = null,Object? casePrice = null,Object? unitsPerCase = null,Object? minimumOrderQuantity = null,Object? availableAtWarehouse = null,Object? isAgeRestricted = null,Object? description = freezed,Object? barcodes = null,Object? warehouseId = freezed,}) {
  return _then(_self.copyWith(
variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,variantName: null == variantName ? _self.variantName : variantName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,brandName: null == brandName ? _self.brandName : brandName // ignore: cast_nullable_to_non_nullable
as String,categoryName: null == categoryName ? _self.categoryName : categoryName // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,unitPrice: null == unitPrice ? _self.unitPrice : unitPrice // ignore: cast_nullable_to_non_nullable
as String,casePrice: null == casePrice ? _self.casePrice : casePrice // ignore: cast_nullable_to_non_nullable
as String,unitsPerCase: null == unitsPerCase ? _self.unitsPerCase : unitsPerCase // ignore: cast_nullable_to_non_nullable
as int,minimumOrderQuantity: null == minimumOrderQuantity ? _self.minimumOrderQuantity : minimumOrderQuantity // ignore: cast_nullable_to_non_nullable
as int,availableAtWarehouse: null == availableAtWarehouse ? _self.availableAtWarehouse : availableAtWarehouse // ignore: cast_nullable_to_non_nullable
as int,isAgeRestricted: null == isAgeRestricted ? _self.isAgeRestricted : isAgeRestricted // ignore: cast_nullable_to_non_nullable
as bool,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,barcodes: null == barcodes ? _self.barcodes : barcodes // ignore: cast_nullable_to_non_nullable
as List<String>,warehouseId: freezed == warehouseId ? _self.warehouseId : warehouseId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [CatalogItem].
extension CatalogItemPatterns on CatalogItem {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CatalogItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CatalogItem() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CatalogItem value)  $default,){
final _that = this;
switch (_that) {
case _CatalogItem():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CatalogItem value)?  $default,){
final _that = this;
switch (_that) {
case _CatalogItem() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String variantId,  String productId,  String name,  String variantName,  String sku,  String brandName,  String categoryName,  String? imageUrl,  String unitPrice,  String casePrice,  int unitsPerCase,  int minimumOrderQuantity,  int availableAtWarehouse,  bool isAgeRestricted,  String? description,  List<String> barcodes,  String? warehouseId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CatalogItem() when $default != null:
return $default(_that.variantId,_that.productId,_that.name,_that.variantName,_that.sku,_that.brandName,_that.categoryName,_that.imageUrl,_that.unitPrice,_that.casePrice,_that.unitsPerCase,_that.minimumOrderQuantity,_that.availableAtWarehouse,_that.isAgeRestricted,_that.description,_that.barcodes,_that.warehouseId);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String variantId,  String productId,  String name,  String variantName,  String sku,  String brandName,  String categoryName,  String? imageUrl,  String unitPrice,  String casePrice,  int unitsPerCase,  int minimumOrderQuantity,  int availableAtWarehouse,  bool isAgeRestricted,  String? description,  List<String> barcodes,  String? warehouseId)  $default,) {final _that = this;
switch (_that) {
case _CatalogItem():
return $default(_that.variantId,_that.productId,_that.name,_that.variantName,_that.sku,_that.brandName,_that.categoryName,_that.imageUrl,_that.unitPrice,_that.casePrice,_that.unitsPerCase,_that.minimumOrderQuantity,_that.availableAtWarehouse,_that.isAgeRestricted,_that.description,_that.barcodes,_that.warehouseId);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String variantId,  String productId,  String name,  String variantName,  String sku,  String brandName,  String categoryName,  String? imageUrl,  String unitPrice,  String casePrice,  int unitsPerCase,  int minimumOrderQuantity,  int availableAtWarehouse,  bool isAgeRestricted,  String? description,  List<String> barcodes,  String? warehouseId)?  $default,) {final _that = this;
switch (_that) {
case _CatalogItem() when $default != null:
return $default(_that.variantId,_that.productId,_that.name,_that.variantName,_that.sku,_that.brandName,_that.categoryName,_that.imageUrl,_that.unitPrice,_that.casePrice,_that.unitsPerCase,_that.minimumOrderQuantity,_that.availableAtWarehouse,_that.isAgeRestricted,_that.description,_that.barcodes,_that.warehouseId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CatalogItem implements CatalogItem {
  const _CatalogItem({required this.variantId, required this.productId, required this.name, required this.variantName, required this.sku, required this.brandName, required this.categoryName, required this.imageUrl, required this.unitPrice, required this.casePrice, required this.unitsPerCase, required this.minimumOrderQuantity, required this.availableAtWarehouse, required this.isAgeRestricted, this.description, final  List<String> barcodes = const <String>[], this.warehouseId}): _barcodes = barcodes;
  factory _CatalogItem.fromJson(Map<String, dynamic> json) => _$CatalogItemFromJson(json);

@override final  String variantId;
@override final  String productId;
@override final  String name;
@override final  String variantName;
@override final  String sku;
@override final  String brandName;
@override final  String categoryName;
@override final  String? imageUrl;
@override final  String unitPrice;
@override final  String casePrice;
@override final  int unitsPerCase;
@override final  int minimumOrderQuantity;
@override final  int availableAtWarehouse;
@override final  bool isAgeRestricted;
@override final  String? description;
 final  List<String> _barcodes;
@override@JsonKey() List<String> get barcodes {
  if (_barcodes is EqualUnmodifiableListView) return _barcodes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_barcodes);
}

@override final  String? warehouseId;

/// Create a copy of CatalogItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CatalogItemCopyWith<_CatalogItem> get copyWith => __$CatalogItemCopyWithImpl<_CatalogItem>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CatalogItemToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CatalogItem&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.name, name) || other.name == name)&&(identical(other.variantName, variantName) || other.variantName == variantName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.brandName, brandName) || other.brandName == brandName)&&(identical(other.categoryName, categoryName) || other.categoryName == categoryName)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.unitPrice, unitPrice) || other.unitPrice == unitPrice)&&(identical(other.casePrice, casePrice) || other.casePrice == casePrice)&&(identical(other.unitsPerCase, unitsPerCase) || other.unitsPerCase == unitsPerCase)&&(identical(other.minimumOrderQuantity, minimumOrderQuantity) || other.minimumOrderQuantity == minimumOrderQuantity)&&(identical(other.availableAtWarehouse, availableAtWarehouse) || other.availableAtWarehouse == availableAtWarehouse)&&(identical(other.isAgeRestricted, isAgeRestricted) || other.isAgeRestricted == isAgeRestricted)&&(identical(other.description, description) || other.description == description)&&const DeepCollectionEquality().equals(other._barcodes, _barcodes)&&(identical(other.warehouseId, warehouseId) || other.warehouseId == warehouseId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,variantId,productId,name,variantName,sku,brandName,categoryName,imageUrl,unitPrice,casePrice,unitsPerCase,minimumOrderQuantity,availableAtWarehouse,isAgeRestricted,description,const DeepCollectionEquality().hash(_barcodes),warehouseId);

@override
String toString() {
  return 'CatalogItem(variantId: $variantId, productId: $productId, name: $name, variantName: $variantName, sku: $sku, brandName: $brandName, categoryName: $categoryName, imageUrl: $imageUrl, unitPrice: $unitPrice, casePrice: $casePrice, unitsPerCase: $unitsPerCase, minimumOrderQuantity: $minimumOrderQuantity, availableAtWarehouse: $availableAtWarehouse, isAgeRestricted: $isAgeRestricted, description: $description, barcodes: $barcodes, warehouseId: $warehouseId)';
}


}

/// @nodoc
abstract mixin class _$CatalogItemCopyWith<$Res> implements $CatalogItemCopyWith<$Res> {
  factory _$CatalogItemCopyWith(_CatalogItem value, $Res Function(_CatalogItem) _then) = __$CatalogItemCopyWithImpl;
@override @useResult
$Res call({
 String variantId, String productId, String name, String variantName, String sku, String brandName, String categoryName, String? imageUrl, String unitPrice, String casePrice, int unitsPerCase, int minimumOrderQuantity, int availableAtWarehouse, bool isAgeRestricted, String? description, List<String> barcodes, String? warehouseId
});




}
/// @nodoc
class __$CatalogItemCopyWithImpl<$Res>
    implements _$CatalogItemCopyWith<$Res> {
  __$CatalogItemCopyWithImpl(this._self, this._then);

  final _CatalogItem _self;
  final $Res Function(_CatalogItem) _then;

/// Create a copy of CatalogItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? variantId = null,Object? productId = null,Object? name = null,Object? variantName = null,Object? sku = null,Object? brandName = null,Object? categoryName = null,Object? imageUrl = freezed,Object? unitPrice = null,Object? casePrice = null,Object? unitsPerCase = null,Object? minimumOrderQuantity = null,Object? availableAtWarehouse = null,Object? isAgeRestricted = null,Object? description = freezed,Object? barcodes = null,Object? warehouseId = freezed,}) {
  return _then(_CatalogItem(
variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,variantName: null == variantName ? _self.variantName : variantName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,brandName: null == brandName ? _self.brandName : brandName // ignore: cast_nullable_to_non_nullable
as String,categoryName: null == categoryName ? _self.categoryName : categoryName // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,unitPrice: null == unitPrice ? _self.unitPrice : unitPrice // ignore: cast_nullable_to_non_nullable
as String,casePrice: null == casePrice ? _self.casePrice : casePrice // ignore: cast_nullable_to_non_nullable
as String,unitsPerCase: null == unitsPerCase ? _self.unitsPerCase : unitsPerCase // ignore: cast_nullable_to_non_nullable
as int,minimumOrderQuantity: null == minimumOrderQuantity ? _self.minimumOrderQuantity : minimumOrderQuantity // ignore: cast_nullable_to_non_nullable
as int,availableAtWarehouse: null == availableAtWarehouse ? _self.availableAtWarehouse : availableAtWarehouse // ignore: cast_nullable_to_non_nullable
as int,isAgeRestricted: null == isAgeRestricted ? _self.isAgeRestricted : isAgeRestricted // ignore: cast_nullable_to_non_nullable
as bool,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,barcodes: null == barcodes ? _self._barcodes : barcodes // ignore: cast_nullable_to_non_nullable
as List<String>,warehouseId: freezed == warehouseId ? _self.warehouseId : warehouseId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$CatalogPage {

 List<CatalogItem> get items; int get total; int get limit; int get offset;
/// Create a copy of CatalogPage
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CatalogPageCopyWith<CatalogPage> get copyWith => _$CatalogPageCopyWithImpl<CatalogPage>(this as CatalogPage, _$identity);

  /// Serializes this CatalogPage to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CatalogPage&&const DeepCollectionEquality().equals(other.items, items)&&(identical(other.total, total) || other.total == total)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.offset, offset) || other.offset == offset));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(items),total,limit,offset);

@override
String toString() {
  return 'CatalogPage(items: $items, total: $total, limit: $limit, offset: $offset)';
}


}

/// @nodoc
abstract mixin class $CatalogPageCopyWith<$Res>  {
  factory $CatalogPageCopyWith(CatalogPage value, $Res Function(CatalogPage) _then) = _$CatalogPageCopyWithImpl;
@useResult
$Res call({
 List<CatalogItem> items, int total, int limit, int offset
});




}
/// @nodoc
class _$CatalogPageCopyWithImpl<$Res>
    implements $CatalogPageCopyWith<$Res> {
  _$CatalogPageCopyWithImpl(this._self, this._then);

  final CatalogPage _self;
  final $Res Function(CatalogPage) _then;

/// Create a copy of CatalogPage
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? items = null,Object? total = null,Object? limit = null,Object? offset = null,}) {
  return _then(_self.copyWith(
items: null == items ? _self.items : items // ignore: cast_nullable_to_non_nullable
as List<CatalogItem>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,offset: null == offset ? _self.offset : offset // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [CatalogPage].
extension CatalogPagePatterns on CatalogPage {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CatalogPage value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CatalogPage() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CatalogPage value)  $default,){
final _that = this;
switch (_that) {
case _CatalogPage():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CatalogPage value)?  $default,){
final _that = this;
switch (_that) {
case _CatalogPage() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<CatalogItem> items,  int total,  int limit,  int offset)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CatalogPage() when $default != null:
return $default(_that.items,_that.total,_that.limit,_that.offset);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<CatalogItem> items,  int total,  int limit,  int offset)  $default,) {final _that = this;
switch (_that) {
case _CatalogPage():
return $default(_that.items,_that.total,_that.limit,_that.offset);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<CatalogItem> items,  int total,  int limit,  int offset)?  $default,) {final _that = this;
switch (_that) {
case _CatalogPage() when $default != null:
return $default(_that.items,_that.total,_that.limit,_that.offset);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CatalogPage implements CatalogPage {
  const _CatalogPage({final  List<CatalogItem> items = const <CatalogItem>[], required this.total, required this.limit, required this.offset}): _items = items;
  factory _CatalogPage.fromJson(Map<String, dynamic> json) => _$CatalogPageFromJson(json);

 final  List<CatalogItem> _items;
@override@JsonKey() List<CatalogItem> get items {
  if (_items is EqualUnmodifiableListView) return _items;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_items);
}

@override final  int total;
@override final  int limit;
@override final  int offset;

/// Create a copy of CatalogPage
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CatalogPageCopyWith<_CatalogPage> get copyWith => __$CatalogPageCopyWithImpl<_CatalogPage>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CatalogPageToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CatalogPage&&const DeepCollectionEquality().equals(other._items, _items)&&(identical(other.total, total) || other.total == total)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.offset, offset) || other.offset == offset));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_items),total,limit,offset);

@override
String toString() {
  return 'CatalogPage(items: $items, total: $total, limit: $limit, offset: $offset)';
}


}

/// @nodoc
abstract mixin class _$CatalogPageCopyWith<$Res> implements $CatalogPageCopyWith<$Res> {
  factory _$CatalogPageCopyWith(_CatalogPage value, $Res Function(_CatalogPage) _then) = __$CatalogPageCopyWithImpl;
@override @useResult
$Res call({
 List<CatalogItem> items, int total, int limit, int offset
});




}
/// @nodoc
class __$CatalogPageCopyWithImpl<$Res>
    implements _$CatalogPageCopyWith<$Res> {
  __$CatalogPageCopyWithImpl(this._self, this._then);

  final _CatalogPage _self;
  final $Res Function(_CatalogPage) _then;

/// Create a copy of CatalogPage
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? items = null,Object? total = null,Object? limit = null,Object? offset = null,}) {
  return _then(_CatalogPage(
items: null == items ? _self._items : items // ignore: cast_nullable_to_non_nullable
as List<CatalogItem>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,offset: null == offset ? _self.offset : offset // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
