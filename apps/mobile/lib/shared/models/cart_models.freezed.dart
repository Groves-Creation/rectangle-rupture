// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'cart_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CartLine {

 String get id; String get variantId; String get name; String get variantName; String get sku; String? get imageUrl; String get unitType; int get unitsPerPack; int get quantity; String get unitPrice; String get packPrice; String get lineTotal; int get availableAtWarehouse; bool get exceedsAvailable;
/// Create a copy of CartLine
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CartLineCopyWith<CartLine> get copyWith => _$CartLineCopyWithImpl<CartLine>(this as CartLine, _$identity);

  /// Serializes this CartLine to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CartLine&&(identical(other.id, id) || other.id == id)&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.name, name) || other.name == name)&&(identical(other.variantName, variantName) || other.variantName == variantName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.unitType, unitType) || other.unitType == unitType)&&(identical(other.unitsPerPack, unitsPerPack) || other.unitsPerPack == unitsPerPack)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.unitPrice, unitPrice) || other.unitPrice == unitPrice)&&(identical(other.packPrice, packPrice) || other.packPrice == packPrice)&&(identical(other.lineTotal, lineTotal) || other.lineTotal == lineTotal)&&(identical(other.availableAtWarehouse, availableAtWarehouse) || other.availableAtWarehouse == availableAtWarehouse)&&(identical(other.exceedsAvailable, exceedsAvailable) || other.exceedsAvailable == exceedsAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,variantId,name,variantName,sku,imageUrl,unitType,unitsPerPack,quantity,unitPrice,packPrice,lineTotal,availableAtWarehouse,exceedsAvailable);

@override
String toString() {
  return 'CartLine(id: $id, variantId: $variantId, name: $name, variantName: $variantName, sku: $sku, imageUrl: $imageUrl, unitType: $unitType, unitsPerPack: $unitsPerPack, quantity: $quantity, unitPrice: $unitPrice, packPrice: $packPrice, lineTotal: $lineTotal, availableAtWarehouse: $availableAtWarehouse, exceedsAvailable: $exceedsAvailable)';
}


}

/// @nodoc
abstract mixin class $CartLineCopyWith<$Res>  {
  factory $CartLineCopyWith(CartLine value, $Res Function(CartLine) _then) = _$CartLineCopyWithImpl;
@useResult
$Res call({
 String id, String variantId, String name, String variantName, String sku, String? imageUrl, String unitType, int unitsPerPack, int quantity, String unitPrice, String packPrice, String lineTotal, int availableAtWarehouse, bool exceedsAvailable
});




}
/// @nodoc
class _$CartLineCopyWithImpl<$Res>
    implements $CartLineCopyWith<$Res> {
  _$CartLineCopyWithImpl(this._self, this._then);

  final CartLine _self;
  final $Res Function(CartLine) _then;

/// Create a copy of CartLine
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? variantId = null,Object? name = null,Object? variantName = null,Object? sku = null,Object? imageUrl = freezed,Object? unitType = null,Object? unitsPerPack = null,Object? quantity = null,Object? unitPrice = null,Object? packPrice = null,Object? lineTotal = null,Object? availableAtWarehouse = null,Object? exceedsAvailable = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,variantName: null == variantName ? _self.variantName : variantName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,unitType: null == unitType ? _self.unitType : unitType // ignore: cast_nullable_to_non_nullable
as String,unitsPerPack: null == unitsPerPack ? _self.unitsPerPack : unitsPerPack // ignore: cast_nullable_to_non_nullable
as int,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,unitPrice: null == unitPrice ? _self.unitPrice : unitPrice // ignore: cast_nullable_to_non_nullable
as String,packPrice: null == packPrice ? _self.packPrice : packPrice // ignore: cast_nullable_to_non_nullable
as String,lineTotal: null == lineTotal ? _self.lineTotal : lineTotal // ignore: cast_nullable_to_non_nullable
as String,availableAtWarehouse: null == availableAtWarehouse ? _self.availableAtWarehouse : availableAtWarehouse // ignore: cast_nullable_to_non_nullable
as int,exceedsAvailable: null == exceedsAvailable ? _self.exceedsAvailable : exceedsAvailable // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [CartLine].
extension CartLinePatterns on CartLine {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CartLine value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CartLine() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CartLine value)  $default,){
final _that = this;
switch (_that) {
case _CartLine():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CartLine value)?  $default,){
final _that = this;
switch (_that) {
case _CartLine() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String variantId,  String name,  String variantName,  String sku,  String? imageUrl,  String unitType,  int unitsPerPack,  int quantity,  String unitPrice,  String packPrice,  String lineTotal,  int availableAtWarehouse,  bool exceedsAvailable)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CartLine() when $default != null:
return $default(_that.id,_that.variantId,_that.name,_that.variantName,_that.sku,_that.imageUrl,_that.unitType,_that.unitsPerPack,_that.quantity,_that.unitPrice,_that.packPrice,_that.lineTotal,_that.availableAtWarehouse,_that.exceedsAvailable);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String variantId,  String name,  String variantName,  String sku,  String? imageUrl,  String unitType,  int unitsPerPack,  int quantity,  String unitPrice,  String packPrice,  String lineTotal,  int availableAtWarehouse,  bool exceedsAvailable)  $default,) {final _that = this;
switch (_that) {
case _CartLine():
return $default(_that.id,_that.variantId,_that.name,_that.variantName,_that.sku,_that.imageUrl,_that.unitType,_that.unitsPerPack,_that.quantity,_that.unitPrice,_that.packPrice,_that.lineTotal,_that.availableAtWarehouse,_that.exceedsAvailable);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String variantId,  String name,  String variantName,  String sku,  String? imageUrl,  String unitType,  int unitsPerPack,  int quantity,  String unitPrice,  String packPrice,  String lineTotal,  int availableAtWarehouse,  bool exceedsAvailable)?  $default,) {final _that = this;
switch (_that) {
case _CartLine() when $default != null:
return $default(_that.id,_that.variantId,_that.name,_that.variantName,_that.sku,_that.imageUrl,_that.unitType,_that.unitsPerPack,_that.quantity,_that.unitPrice,_that.packPrice,_that.lineTotal,_that.availableAtWarehouse,_that.exceedsAvailable);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CartLine implements CartLine {
  const _CartLine({required this.id, required this.variantId, required this.name, required this.variantName, required this.sku, required this.imageUrl, required this.unitType, required this.unitsPerPack, required this.quantity, required this.unitPrice, required this.packPrice, required this.lineTotal, required this.availableAtWarehouse, required this.exceedsAvailable});
  factory _CartLine.fromJson(Map<String, dynamic> json) => _$CartLineFromJson(json);

@override final  String id;
@override final  String variantId;
@override final  String name;
@override final  String variantName;
@override final  String sku;
@override final  String? imageUrl;
@override final  String unitType;
@override final  int unitsPerPack;
@override final  int quantity;
@override final  String unitPrice;
@override final  String packPrice;
@override final  String lineTotal;
@override final  int availableAtWarehouse;
@override final  bool exceedsAvailable;

/// Create a copy of CartLine
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CartLineCopyWith<_CartLine> get copyWith => __$CartLineCopyWithImpl<_CartLine>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CartLineToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CartLine&&(identical(other.id, id) || other.id == id)&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.name, name) || other.name == name)&&(identical(other.variantName, variantName) || other.variantName == variantName)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.unitType, unitType) || other.unitType == unitType)&&(identical(other.unitsPerPack, unitsPerPack) || other.unitsPerPack == unitsPerPack)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.unitPrice, unitPrice) || other.unitPrice == unitPrice)&&(identical(other.packPrice, packPrice) || other.packPrice == packPrice)&&(identical(other.lineTotal, lineTotal) || other.lineTotal == lineTotal)&&(identical(other.availableAtWarehouse, availableAtWarehouse) || other.availableAtWarehouse == availableAtWarehouse)&&(identical(other.exceedsAvailable, exceedsAvailable) || other.exceedsAvailable == exceedsAvailable));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,variantId,name,variantName,sku,imageUrl,unitType,unitsPerPack,quantity,unitPrice,packPrice,lineTotal,availableAtWarehouse,exceedsAvailable);

@override
String toString() {
  return 'CartLine(id: $id, variantId: $variantId, name: $name, variantName: $variantName, sku: $sku, imageUrl: $imageUrl, unitType: $unitType, unitsPerPack: $unitsPerPack, quantity: $quantity, unitPrice: $unitPrice, packPrice: $packPrice, lineTotal: $lineTotal, availableAtWarehouse: $availableAtWarehouse, exceedsAvailable: $exceedsAvailable)';
}


}

/// @nodoc
abstract mixin class _$CartLineCopyWith<$Res> implements $CartLineCopyWith<$Res> {
  factory _$CartLineCopyWith(_CartLine value, $Res Function(_CartLine) _then) = __$CartLineCopyWithImpl;
@override @useResult
$Res call({
 String id, String variantId, String name, String variantName, String sku, String? imageUrl, String unitType, int unitsPerPack, int quantity, String unitPrice, String packPrice, String lineTotal, int availableAtWarehouse, bool exceedsAvailable
});




}
/// @nodoc
class __$CartLineCopyWithImpl<$Res>
    implements _$CartLineCopyWith<$Res> {
  __$CartLineCopyWithImpl(this._self, this._then);

  final _CartLine _self;
  final $Res Function(_CartLine) _then;

/// Create a copy of CartLine
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? variantId = null,Object? name = null,Object? variantName = null,Object? sku = null,Object? imageUrl = freezed,Object? unitType = null,Object? unitsPerPack = null,Object? quantity = null,Object? unitPrice = null,Object? packPrice = null,Object? lineTotal = null,Object? availableAtWarehouse = null,Object? exceedsAvailable = null,}) {
  return _then(_CartLine(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,variantName: null == variantName ? _self.variantName : variantName // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,unitType: null == unitType ? _self.unitType : unitType // ignore: cast_nullable_to_non_nullable
as String,unitsPerPack: null == unitsPerPack ? _self.unitsPerPack : unitsPerPack // ignore: cast_nullable_to_non_nullable
as int,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,unitPrice: null == unitPrice ? _self.unitPrice : unitPrice // ignore: cast_nullable_to_non_nullable
as String,packPrice: null == packPrice ? _self.packPrice : packPrice // ignore: cast_nullable_to_non_nullable
as String,lineTotal: null == lineTotal ? _self.lineTotal : lineTotal // ignore: cast_nullable_to_non_nullable
as String,availableAtWarehouse: null == availableAtWarehouse ? _self.availableAtWarehouse : availableAtWarehouse // ignore: cast_nullable_to_non_nullable
as int,exceedsAvailable: null == exceedsAvailable ? _self.exceedsAvailable : exceedsAvailable // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$Cart {

 String get cartId; String get storeId; List<CartLine> get lines; String get subtotal; String get orderMinimum; bool get meetsMinimum;
/// Create a copy of Cart
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CartCopyWith<Cart> get copyWith => _$CartCopyWithImpl<Cart>(this as Cart, _$identity);

  /// Serializes this Cart to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Cart&&(identical(other.cartId, cartId) || other.cartId == cartId)&&(identical(other.storeId, storeId) || other.storeId == storeId)&&const DeepCollectionEquality().equals(other.lines, lines)&&(identical(other.subtotal, subtotal) || other.subtotal == subtotal)&&(identical(other.orderMinimum, orderMinimum) || other.orderMinimum == orderMinimum)&&(identical(other.meetsMinimum, meetsMinimum) || other.meetsMinimum == meetsMinimum));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,cartId,storeId,const DeepCollectionEquality().hash(lines),subtotal,orderMinimum,meetsMinimum);

@override
String toString() {
  return 'Cart(cartId: $cartId, storeId: $storeId, lines: $lines, subtotal: $subtotal, orderMinimum: $orderMinimum, meetsMinimum: $meetsMinimum)';
}


}

/// @nodoc
abstract mixin class $CartCopyWith<$Res>  {
  factory $CartCopyWith(Cart value, $Res Function(Cart) _then) = _$CartCopyWithImpl;
@useResult
$Res call({
 String cartId, String storeId, List<CartLine> lines, String subtotal, String orderMinimum, bool meetsMinimum
});




}
/// @nodoc
class _$CartCopyWithImpl<$Res>
    implements $CartCopyWith<$Res> {
  _$CartCopyWithImpl(this._self, this._then);

  final Cart _self;
  final $Res Function(Cart) _then;

/// Create a copy of Cart
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? cartId = null,Object? storeId = null,Object? lines = null,Object? subtotal = null,Object? orderMinimum = null,Object? meetsMinimum = null,}) {
  return _then(_self.copyWith(
cartId: null == cartId ? _self.cartId : cartId // ignore: cast_nullable_to_non_nullable
as String,storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,lines: null == lines ? _self.lines : lines // ignore: cast_nullable_to_non_nullable
as List<CartLine>,subtotal: null == subtotal ? _self.subtotal : subtotal // ignore: cast_nullable_to_non_nullable
as String,orderMinimum: null == orderMinimum ? _self.orderMinimum : orderMinimum // ignore: cast_nullable_to_non_nullable
as String,meetsMinimum: null == meetsMinimum ? _self.meetsMinimum : meetsMinimum // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [Cart].
extension CartPatterns on Cart {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Cart value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Cart() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Cart value)  $default,){
final _that = this;
switch (_that) {
case _Cart():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Cart value)?  $default,){
final _that = this;
switch (_that) {
case _Cart() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String cartId,  String storeId,  List<CartLine> lines,  String subtotal,  String orderMinimum,  bool meetsMinimum)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Cart() when $default != null:
return $default(_that.cartId,_that.storeId,_that.lines,_that.subtotal,_that.orderMinimum,_that.meetsMinimum);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String cartId,  String storeId,  List<CartLine> lines,  String subtotal,  String orderMinimum,  bool meetsMinimum)  $default,) {final _that = this;
switch (_that) {
case _Cart():
return $default(_that.cartId,_that.storeId,_that.lines,_that.subtotal,_that.orderMinimum,_that.meetsMinimum);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String cartId,  String storeId,  List<CartLine> lines,  String subtotal,  String orderMinimum,  bool meetsMinimum)?  $default,) {final _that = this;
switch (_that) {
case _Cart() when $default != null:
return $default(_that.cartId,_that.storeId,_that.lines,_that.subtotal,_that.orderMinimum,_that.meetsMinimum);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Cart implements Cart {
  const _Cart({required this.cartId, required this.storeId, final  List<CartLine> lines = const <CartLine>[], required this.subtotal, required this.orderMinimum, required this.meetsMinimum}): _lines = lines;
  factory _Cart.fromJson(Map<String, dynamic> json) => _$CartFromJson(json);

@override final  String cartId;
@override final  String storeId;
 final  List<CartLine> _lines;
@override@JsonKey() List<CartLine> get lines {
  if (_lines is EqualUnmodifiableListView) return _lines;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_lines);
}

@override final  String subtotal;
@override final  String orderMinimum;
@override final  bool meetsMinimum;

/// Create a copy of Cart
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CartCopyWith<_Cart> get copyWith => __$CartCopyWithImpl<_Cart>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CartToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Cart&&(identical(other.cartId, cartId) || other.cartId == cartId)&&(identical(other.storeId, storeId) || other.storeId == storeId)&&const DeepCollectionEquality().equals(other._lines, _lines)&&(identical(other.subtotal, subtotal) || other.subtotal == subtotal)&&(identical(other.orderMinimum, orderMinimum) || other.orderMinimum == orderMinimum)&&(identical(other.meetsMinimum, meetsMinimum) || other.meetsMinimum == meetsMinimum));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,cartId,storeId,const DeepCollectionEquality().hash(_lines),subtotal,orderMinimum,meetsMinimum);

@override
String toString() {
  return 'Cart(cartId: $cartId, storeId: $storeId, lines: $lines, subtotal: $subtotal, orderMinimum: $orderMinimum, meetsMinimum: $meetsMinimum)';
}


}

/// @nodoc
abstract mixin class _$CartCopyWith<$Res> implements $CartCopyWith<$Res> {
  factory _$CartCopyWith(_Cart value, $Res Function(_Cart) _then) = __$CartCopyWithImpl;
@override @useResult
$Res call({
 String cartId, String storeId, List<CartLine> lines, String subtotal, String orderMinimum, bool meetsMinimum
});




}
/// @nodoc
class __$CartCopyWithImpl<$Res>
    implements _$CartCopyWith<$Res> {
  __$CartCopyWithImpl(this._self, this._then);

  final _Cart _self;
  final $Res Function(_Cart) _then;

/// Create a copy of Cart
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? cartId = null,Object? storeId = null,Object? lines = null,Object? subtotal = null,Object? orderMinimum = null,Object? meetsMinimum = null,}) {
  return _then(_Cart(
cartId: null == cartId ? _self.cartId : cartId // ignore: cast_nullable_to_non_nullable
as String,storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,lines: null == lines ? _self._lines : lines // ignore: cast_nullable_to_non_nullable
as List<CartLine>,subtotal: null == subtotal ? _self.subtotal : subtotal // ignore: cast_nullable_to_non_nullable
as String,orderMinimum: null == orderMinimum ? _self.orderMinimum : orderMinimum // ignore: cast_nullable_to_non_nullable
as String,meetsMinimum: null == meetsMinimum ? _self.meetsMinimum : meetsMinimum // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$AddCartLineRequest {

 String get storeId; String get variantId; String get unitType; int get quantity;
/// Create a copy of AddCartLineRequest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AddCartLineRequestCopyWith<AddCartLineRequest> get copyWith => _$AddCartLineRequestCopyWithImpl<AddCartLineRequest>(this as AddCartLineRequest, _$identity);

  /// Serializes this AddCartLineRequest to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AddCartLineRequest&&(identical(other.storeId, storeId) || other.storeId == storeId)&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.unitType, unitType) || other.unitType == unitType)&&(identical(other.quantity, quantity) || other.quantity == quantity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,storeId,variantId,unitType,quantity);

@override
String toString() {
  return 'AddCartLineRequest(storeId: $storeId, variantId: $variantId, unitType: $unitType, quantity: $quantity)';
}


}

/// @nodoc
abstract mixin class $AddCartLineRequestCopyWith<$Res>  {
  factory $AddCartLineRequestCopyWith(AddCartLineRequest value, $Res Function(AddCartLineRequest) _then) = _$AddCartLineRequestCopyWithImpl;
@useResult
$Res call({
 String storeId, String variantId, String unitType, int quantity
});




}
/// @nodoc
class _$AddCartLineRequestCopyWithImpl<$Res>
    implements $AddCartLineRequestCopyWith<$Res> {
  _$AddCartLineRequestCopyWithImpl(this._self, this._then);

  final AddCartLineRequest _self;
  final $Res Function(AddCartLineRequest) _then;

/// Create a copy of AddCartLineRequest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? storeId = null,Object? variantId = null,Object? unitType = null,Object? quantity = null,}) {
  return _then(_self.copyWith(
storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,unitType: null == unitType ? _self.unitType : unitType // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [AddCartLineRequest].
extension AddCartLineRequestPatterns on AddCartLineRequest {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AddCartLineRequest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AddCartLineRequest() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AddCartLineRequest value)  $default,){
final _that = this;
switch (_that) {
case _AddCartLineRequest():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AddCartLineRequest value)?  $default,){
final _that = this;
switch (_that) {
case _AddCartLineRequest() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String storeId,  String variantId,  String unitType,  int quantity)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AddCartLineRequest() when $default != null:
return $default(_that.storeId,_that.variantId,_that.unitType,_that.quantity);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String storeId,  String variantId,  String unitType,  int quantity)  $default,) {final _that = this;
switch (_that) {
case _AddCartLineRequest():
return $default(_that.storeId,_that.variantId,_that.unitType,_that.quantity);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String storeId,  String variantId,  String unitType,  int quantity)?  $default,) {final _that = this;
switch (_that) {
case _AddCartLineRequest() when $default != null:
return $default(_that.storeId,_that.variantId,_that.unitType,_that.quantity);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AddCartLineRequest implements AddCartLineRequest {
  const _AddCartLineRequest({required this.storeId, required this.variantId, required this.unitType, required this.quantity});
  factory _AddCartLineRequest.fromJson(Map<String, dynamic> json) => _$AddCartLineRequestFromJson(json);

@override final  String storeId;
@override final  String variantId;
@override final  String unitType;
@override final  int quantity;

/// Create a copy of AddCartLineRequest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AddCartLineRequestCopyWith<_AddCartLineRequest> get copyWith => __$AddCartLineRequestCopyWithImpl<_AddCartLineRequest>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AddCartLineRequestToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AddCartLineRequest&&(identical(other.storeId, storeId) || other.storeId == storeId)&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.unitType, unitType) || other.unitType == unitType)&&(identical(other.quantity, quantity) || other.quantity == quantity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,storeId,variantId,unitType,quantity);

@override
String toString() {
  return 'AddCartLineRequest(storeId: $storeId, variantId: $variantId, unitType: $unitType, quantity: $quantity)';
}


}

/// @nodoc
abstract mixin class _$AddCartLineRequestCopyWith<$Res> implements $AddCartLineRequestCopyWith<$Res> {
  factory _$AddCartLineRequestCopyWith(_AddCartLineRequest value, $Res Function(_AddCartLineRequest) _then) = __$AddCartLineRequestCopyWithImpl;
@override @useResult
$Res call({
 String storeId, String variantId, String unitType, int quantity
});




}
/// @nodoc
class __$AddCartLineRequestCopyWithImpl<$Res>
    implements _$AddCartLineRequestCopyWith<$Res> {
  __$AddCartLineRequestCopyWithImpl(this._self, this._then);

  final _AddCartLineRequest _self;
  final $Res Function(_AddCartLineRequest) _then;

/// Create a copy of AddCartLineRequest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? storeId = null,Object? variantId = null,Object? unitType = null,Object? quantity = null,}) {
  return _then(_AddCartLineRequest(
storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,unitType: null == unitType ? _self.unitType : unitType // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
