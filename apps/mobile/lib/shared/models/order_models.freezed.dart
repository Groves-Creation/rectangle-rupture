// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'order_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$OrderSummary {

 String get id; String get orderNumber; String get storeId; String get storeName; String get status; String get orderTotal; int get lineCount; DateTime get submittedAt; String get submittedByName;
/// Create a copy of OrderSummary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderSummaryCopyWith<OrderSummary> get copyWith => _$OrderSummaryCopyWithImpl<OrderSummary>(this as OrderSummary, _$identity);

  /// Serializes this OrderSummary to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderSummary&&(identical(other.id, id) || other.id == id)&&(identical(other.orderNumber, orderNumber) || other.orderNumber == orderNumber)&&(identical(other.storeId, storeId) || other.storeId == storeId)&&(identical(other.storeName, storeName) || other.storeName == storeName)&&(identical(other.status, status) || other.status == status)&&(identical(other.orderTotal, orderTotal) || other.orderTotal == orderTotal)&&(identical(other.lineCount, lineCount) || other.lineCount == lineCount)&&(identical(other.submittedAt, submittedAt) || other.submittedAt == submittedAt)&&(identical(other.submittedByName, submittedByName) || other.submittedByName == submittedByName));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,orderNumber,storeId,storeName,status,orderTotal,lineCount,submittedAt,submittedByName);

@override
String toString() {
  return 'OrderSummary(id: $id, orderNumber: $orderNumber, storeId: $storeId, storeName: $storeName, status: $status, orderTotal: $orderTotal, lineCount: $lineCount, submittedAt: $submittedAt, submittedByName: $submittedByName)';
}


}

/// @nodoc
abstract mixin class $OrderSummaryCopyWith<$Res>  {
  factory $OrderSummaryCopyWith(OrderSummary value, $Res Function(OrderSummary) _then) = _$OrderSummaryCopyWithImpl;
@useResult
$Res call({
 String id, String orderNumber, String storeId, String storeName, String status, String orderTotal, int lineCount, DateTime submittedAt, String submittedByName
});




}
/// @nodoc
class _$OrderSummaryCopyWithImpl<$Res>
    implements $OrderSummaryCopyWith<$Res> {
  _$OrderSummaryCopyWithImpl(this._self, this._then);

  final OrderSummary _self;
  final $Res Function(OrderSummary) _then;

/// Create a copy of OrderSummary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? orderNumber = null,Object? storeId = null,Object? storeName = null,Object? status = null,Object? orderTotal = null,Object? lineCount = null,Object? submittedAt = null,Object? submittedByName = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,orderNumber: null == orderNumber ? _self.orderNumber : orderNumber // ignore: cast_nullable_to_non_nullable
as String,storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,storeName: null == storeName ? _self.storeName : storeName // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,orderTotal: null == orderTotal ? _self.orderTotal : orderTotal // ignore: cast_nullable_to_non_nullable
as String,lineCount: null == lineCount ? _self.lineCount : lineCount // ignore: cast_nullable_to_non_nullable
as int,submittedAt: null == submittedAt ? _self.submittedAt : submittedAt // ignore: cast_nullable_to_non_nullable
as DateTime,submittedByName: null == submittedByName ? _self.submittedByName : submittedByName // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderSummary].
extension OrderSummaryPatterns on OrderSummary {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderSummary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderSummary() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderSummary value)  $default,){
final _that = this;
switch (_that) {
case _OrderSummary():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderSummary value)?  $default,){
final _that = this;
switch (_that) {
case _OrderSummary() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String orderNumber,  String storeId,  String storeName,  String status,  String orderTotal,  int lineCount,  DateTime submittedAt,  String submittedByName)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderSummary() when $default != null:
return $default(_that.id,_that.orderNumber,_that.storeId,_that.storeName,_that.status,_that.orderTotal,_that.lineCount,_that.submittedAt,_that.submittedByName);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String orderNumber,  String storeId,  String storeName,  String status,  String orderTotal,  int lineCount,  DateTime submittedAt,  String submittedByName)  $default,) {final _that = this;
switch (_that) {
case _OrderSummary():
return $default(_that.id,_that.orderNumber,_that.storeId,_that.storeName,_that.status,_that.orderTotal,_that.lineCount,_that.submittedAt,_that.submittedByName);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String orderNumber,  String storeId,  String storeName,  String status,  String orderTotal,  int lineCount,  DateTime submittedAt,  String submittedByName)?  $default,) {final _that = this;
switch (_that) {
case _OrderSummary() when $default != null:
return $default(_that.id,_that.orderNumber,_that.storeId,_that.storeName,_that.status,_that.orderTotal,_that.lineCount,_that.submittedAt,_that.submittedByName);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderSummary implements OrderSummary {
  const _OrderSummary({required this.id, required this.orderNumber, required this.storeId, required this.storeName, required this.status, required this.orderTotal, required this.lineCount, required this.submittedAt, required this.submittedByName});
  factory _OrderSummary.fromJson(Map<String, dynamic> json) => _$OrderSummaryFromJson(json);

@override final  String id;
@override final  String orderNumber;
@override final  String storeId;
@override final  String storeName;
@override final  String status;
@override final  String orderTotal;
@override final  int lineCount;
@override final  DateTime submittedAt;
@override final  String submittedByName;

/// Create a copy of OrderSummary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderSummaryCopyWith<_OrderSummary> get copyWith => __$OrderSummaryCopyWithImpl<_OrderSummary>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderSummaryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderSummary&&(identical(other.id, id) || other.id == id)&&(identical(other.orderNumber, orderNumber) || other.orderNumber == orderNumber)&&(identical(other.storeId, storeId) || other.storeId == storeId)&&(identical(other.storeName, storeName) || other.storeName == storeName)&&(identical(other.status, status) || other.status == status)&&(identical(other.orderTotal, orderTotal) || other.orderTotal == orderTotal)&&(identical(other.lineCount, lineCount) || other.lineCount == lineCount)&&(identical(other.submittedAt, submittedAt) || other.submittedAt == submittedAt)&&(identical(other.submittedByName, submittedByName) || other.submittedByName == submittedByName));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,orderNumber,storeId,storeName,status,orderTotal,lineCount,submittedAt,submittedByName);

@override
String toString() {
  return 'OrderSummary(id: $id, orderNumber: $orderNumber, storeId: $storeId, storeName: $storeName, status: $status, orderTotal: $orderTotal, lineCount: $lineCount, submittedAt: $submittedAt, submittedByName: $submittedByName)';
}


}

/// @nodoc
abstract mixin class _$OrderSummaryCopyWith<$Res> implements $OrderSummaryCopyWith<$Res> {
  factory _$OrderSummaryCopyWith(_OrderSummary value, $Res Function(_OrderSummary) _then) = __$OrderSummaryCopyWithImpl;
@override @useResult
$Res call({
 String id, String orderNumber, String storeId, String storeName, String status, String orderTotal, int lineCount, DateTime submittedAt, String submittedByName
});




}
/// @nodoc
class __$OrderSummaryCopyWithImpl<$Res>
    implements _$OrderSummaryCopyWith<$Res> {
  __$OrderSummaryCopyWithImpl(this._self, this._then);

  final _OrderSummary _self;
  final $Res Function(_OrderSummary) _then;

/// Create a copy of OrderSummary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? orderNumber = null,Object? storeId = null,Object? storeName = null,Object? status = null,Object? orderTotal = null,Object? lineCount = null,Object? submittedAt = null,Object? submittedByName = null,}) {
  return _then(_OrderSummary(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,orderNumber: null == orderNumber ? _self.orderNumber : orderNumber // ignore: cast_nullable_to_non_nullable
as String,storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,storeName: null == storeName ? _self.storeName : storeName // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,orderTotal: null == orderTotal ? _self.orderTotal : orderTotal // ignore: cast_nullable_to_non_nullable
as String,lineCount: null == lineCount ? _self.lineCount : lineCount // ignore: cast_nullable_to_non_nullable
as int,submittedAt: null == submittedAt ? _self.submittedAt : submittedAt // ignore: cast_nullable_to_non_nullable
as DateTime,submittedByName: null == submittedByName ? _self.submittedByName : submittedByName // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}


/// @nodoc
mixin _$OrderLine {

 String get id; String get variantId; String get sku; String get name; String get unitType; int get unitsPerPack; int get quantityOrdered; int get quantityAllocated; String get unitPrice; String get lineTotal; bool get fullyAllocated;
/// Create a copy of OrderLine
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderLineCopyWith<OrderLine> get copyWith => _$OrderLineCopyWithImpl<OrderLine>(this as OrderLine, _$identity);

  /// Serializes this OrderLine to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderLine&&(identical(other.id, id) || other.id == id)&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.name, name) || other.name == name)&&(identical(other.unitType, unitType) || other.unitType == unitType)&&(identical(other.unitsPerPack, unitsPerPack) || other.unitsPerPack == unitsPerPack)&&(identical(other.quantityOrdered, quantityOrdered) || other.quantityOrdered == quantityOrdered)&&(identical(other.quantityAllocated, quantityAllocated) || other.quantityAllocated == quantityAllocated)&&(identical(other.unitPrice, unitPrice) || other.unitPrice == unitPrice)&&(identical(other.lineTotal, lineTotal) || other.lineTotal == lineTotal)&&(identical(other.fullyAllocated, fullyAllocated) || other.fullyAllocated == fullyAllocated));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,variantId,sku,name,unitType,unitsPerPack,quantityOrdered,quantityAllocated,unitPrice,lineTotal,fullyAllocated);

@override
String toString() {
  return 'OrderLine(id: $id, variantId: $variantId, sku: $sku, name: $name, unitType: $unitType, unitsPerPack: $unitsPerPack, quantityOrdered: $quantityOrdered, quantityAllocated: $quantityAllocated, unitPrice: $unitPrice, lineTotal: $lineTotal, fullyAllocated: $fullyAllocated)';
}


}

/// @nodoc
abstract mixin class $OrderLineCopyWith<$Res>  {
  factory $OrderLineCopyWith(OrderLine value, $Res Function(OrderLine) _then) = _$OrderLineCopyWithImpl;
@useResult
$Res call({
 String id, String variantId, String sku, String name, String unitType, int unitsPerPack, int quantityOrdered, int quantityAllocated, String unitPrice, String lineTotal, bool fullyAllocated
});




}
/// @nodoc
class _$OrderLineCopyWithImpl<$Res>
    implements $OrderLineCopyWith<$Res> {
  _$OrderLineCopyWithImpl(this._self, this._then);

  final OrderLine _self;
  final $Res Function(OrderLine) _then;

/// Create a copy of OrderLine
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? variantId = null,Object? sku = null,Object? name = null,Object? unitType = null,Object? unitsPerPack = null,Object? quantityOrdered = null,Object? quantityAllocated = null,Object? unitPrice = null,Object? lineTotal = null,Object? fullyAllocated = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,unitType: null == unitType ? _self.unitType : unitType // ignore: cast_nullable_to_non_nullable
as String,unitsPerPack: null == unitsPerPack ? _self.unitsPerPack : unitsPerPack // ignore: cast_nullable_to_non_nullable
as int,quantityOrdered: null == quantityOrdered ? _self.quantityOrdered : quantityOrdered // ignore: cast_nullable_to_non_nullable
as int,quantityAllocated: null == quantityAllocated ? _self.quantityAllocated : quantityAllocated // ignore: cast_nullable_to_non_nullable
as int,unitPrice: null == unitPrice ? _self.unitPrice : unitPrice // ignore: cast_nullable_to_non_nullable
as String,lineTotal: null == lineTotal ? _self.lineTotal : lineTotal // ignore: cast_nullable_to_non_nullable
as String,fullyAllocated: null == fullyAllocated ? _self.fullyAllocated : fullyAllocated // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderLine].
extension OrderLinePatterns on OrderLine {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderLine value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderLine() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderLine value)  $default,){
final _that = this;
switch (_that) {
case _OrderLine():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderLine value)?  $default,){
final _that = this;
switch (_that) {
case _OrderLine() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String variantId,  String sku,  String name,  String unitType,  int unitsPerPack,  int quantityOrdered,  int quantityAllocated,  String unitPrice,  String lineTotal,  bool fullyAllocated)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderLine() when $default != null:
return $default(_that.id,_that.variantId,_that.sku,_that.name,_that.unitType,_that.unitsPerPack,_that.quantityOrdered,_that.quantityAllocated,_that.unitPrice,_that.lineTotal,_that.fullyAllocated);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String variantId,  String sku,  String name,  String unitType,  int unitsPerPack,  int quantityOrdered,  int quantityAllocated,  String unitPrice,  String lineTotal,  bool fullyAllocated)  $default,) {final _that = this;
switch (_that) {
case _OrderLine():
return $default(_that.id,_that.variantId,_that.sku,_that.name,_that.unitType,_that.unitsPerPack,_that.quantityOrdered,_that.quantityAllocated,_that.unitPrice,_that.lineTotal,_that.fullyAllocated);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String variantId,  String sku,  String name,  String unitType,  int unitsPerPack,  int quantityOrdered,  int quantityAllocated,  String unitPrice,  String lineTotal,  bool fullyAllocated)?  $default,) {final _that = this;
switch (_that) {
case _OrderLine() when $default != null:
return $default(_that.id,_that.variantId,_that.sku,_that.name,_that.unitType,_that.unitsPerPack,_that.quantityOrdered,_that.quantityAllocated,_that.unitPrice,_that.lineTotal,_that.fullyAllocated);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderLine implements OrderLine {
  const _OrderLine({required this.id, required this.variantId, required this.sku, required this.name, required this.unitType, required this.unitsPerPack, required this.quantityOrdered, required this.quantityAllocated, required this.unitPrice, required this.lineTotal, required this.fullyAllocated});
  factory _OrderLine.fromJson(Map<String, dynamic> json) => _$OrderLineFromJson(json);

@override final  String id;
@override final  String variantId;
@override final  String sku;
@override final  String name;
@override final  String unitType;
@override final  int unitsPerPack;
@override final  int quantityOrdered;
@override final  int quantityAllocated;
@override final  String unitPrice;
@override final  String lineTotal;
@override final  bool fullyAllocated;

/// Create a copy of OrderLine
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderLineCopyWith<_OrderLine> get copyWith => __$OrderLineCopyWithImpl<_OrderLine>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderLineToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderLine&&(identical(other.id, id) || other.id == id)&&(identical(other.variantId, variantId) || other.variantId == variantId)&&(identical(other.sku, sku) || other.sku == sku)&&(identical(other.name, name) || other.name == name)&&(identical(other.unitType, unitType) || other.unitType == unitType)&&(identical(other.unitsPerPack, unitsPerPack) || other.unitsPerPack == unitsPerPack)&&(identical(other.quantityOrdered, quantityOrdered) || other.quantityOrdered == quantityOrdered)&&(identical(other.quantityAllocated, quantityAllocated) || other.quantityAllocated == quantityAllocated)&&(identical(other.unitPrice, unitPrice) || other.unitPrice == unitPrice)&&(identical(other.lineTotal, lineTotal) || other.lineTotal == lineTotal)&&(identical(other.fullyAllocated, fullyAllocated) || other.fullyAllocated == fullyAllocated));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,variantId,sku,name,unitType,unitsPerPack,quantityOrdered,quantityAllocated,unitPrice,lineTotal,fullyAllocated);

@override
String toString() {
  return 'OrderLine(id: $id, variantId: $variantId, sku: $sku, name: $name, unitType: $unitType, unitsPerPack: $unitsPerPack, quantityOrdered: $quantityOrdered, quantityAllocated: $quantityAllocated, unitPrice: $unitPrice, lineTotal: $lineTotal, fullyAllocated: $fullyAllocated)';
}


}

/// @nodoc
abstract mixin class _$OrderLineCopyWith<$Res> implements $OrderLineCopyWith<$Res> {
  factory _$OrderLineCopyWith(_OrderLine value, $Res Function(_OrderLine) _then) = __$OrderLineCopyWithImpl;
@override @useResult
$Res call({
 String id, String variantId, String sku, String name, String unitType, int unitsPerPack, int quantityOrdered, int quantityAllocated, String unitPrice, String lineTotal, bool fullyAllocated
});




}
/// @nodoc
class __$OrderLineCopyWithImpl<$Res>
    implements _$OrderLineCopyWith<$Res> {
  __$OrderLineCopyWithImpl(this._self, this._then);

  final _OrderLine _self;
  final $Res Function(_OrderLine) _then;

/// Create a copy of OrderLine
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? variantId = null,Object? sku = null,Object? name = null,Object? unitType = null,Object? unitsPerPack = null,Object? quantityOrdered = null,Object? quantityAllocated = null,Object? unitPrice = null,Object? lineTotal = null,Object? fullyAllocated = null,}) {
  return _then(_OrderLine(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,variantId: null == variantId ? _self.variantId : variantId // ignore: cast_nullable_to_non_nullable
as String,sku: null == sku ? _self.sku : sku // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,unitType: null == unitType ? _self.unitType : unitType // ignore: cast_nullable_to_non_nullable
as String,unitsPerPack: null == unitsPerPack ? _self.unitsPerPack : unitsPerPack // ignore: cast_nullable_to_non_nullable
as int,quantityOrdered: null == quantityOrdered ? _self.quantityOrdered : quantityOrdered // ignore: cast_nullable_to_non_nullable
as int,quantityAllocated: null == quantityAllocated ? _self.quantityAllocated : quantityAllocated // ignore: cast_nullable_to_non_nullable
as int,unitPrice: null == unitPrice ? _self.unitPrice : unitPrice // ignore: cast_nullable_to_non_nullable
as String,lineTotal: null == lineTotal ? _self.lineTotal : lineTotal // ignore: cast_nullable_to_non_nullable
as String,fullyAllocated: null == fullyAllocated ? _self.fullyAllocated : fullyAllocated // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}


/// @nodoc
mixin _$OrderStatusHistoryEntry {

 String get toStatus; String? get fromStatus; String? get changedByName; String? get notes; DateTime get createdAt;
/// Create a copy of OrderStatusHistoryEntry
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderStatusHistoryEntryCopyWith<OrderStatusHistoryEntry> get copyWith => _$OrderStatusHistoryEntryCopyWithImpl<OrderStatusHistoryEntry>(this as OrderStatusHistoryEntry, _$identity);

  /// Serializes this OrderStatusHistoryEntry to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderStatusHistoryEntry&&(identical(other.toStatus, toStatus) || other.toStatus == toStatus)&&(identical(other.fromStatus, fromStatus) || other.fromStatus == fromStatus)&&(identical(other.changedByName, changedByName) || other.changedByName == changedByName)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,toStatus,fromStatus,changedByName,notes,createdAt);

@override
String toString() {
  return 'OrderStatusHistoryEntry(toStatus: $toStatus, fromStatus: $fromStatus, changedByName: $changedByName, notes: $notes, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $OrderStatusHistoryEntryCopyWith<$Res>  {
  factory $OrderStatusHistoryEntryCopyWith(OrderStatusHistoryEntry value, $Res Function(OrderStatusHistoryEntry) _then) = _$OrderStatusHistoryEntryCopyWithImpl;
@useResult
$Res call({
 String toStatus, String? fromStatus, String? changedByName, String? notes, DateTime createdAt
});




}
/// @nodoc
class _$OrderStatusHistoryEntryCopyWithImpl<$Res>
    implements $OrderStatusHistoryEntryCopyWith<$Res> {
  _$OrderStatusHistoryEntryCopyWithImpl(this._self, this._then);

  final OrderStatusHistoryEntry _self;
  final $Res Function(OrderStatusHistoryEntry) _then;

/// Create a copy of OrderStatusHistoryEntry
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? toStatus = null,Object? fromStatus = freezed,Object? changedByName = freezed,Object? notes = freezed,Object? createdAt = null,}) {
  return _then(_self.copyWith(
toStatus: null == toStatus ? _self.toStatus : toStatus // ignore: cast_nullable_to_non_nullable
as String,fromStatus: freezed == fromStatus ? _self.fromStatus : fromStatus // ignore: cast_nullable_to_non_nullable
as String?,changedByName: freezed == changedByName ? _self.changedByName : changedByName // ignore: cast_nullable_to_non_nullable
as String?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderStatusHistoryEntry].
extension OrderStatusHistoryEntryPatterns on OrderStatusHistoryEntry {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderStatusHistoryEntry value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderStatusHistoryEntry() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderStatusHistoryEntry value)  $default,){
final _that = this;
switch (_that) {
case _OrderStatusHistoryEntry():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderStatusHistoryEntry value)?  $default,){
final _that = this;
switch (_that) {
case _OrderStatusHistoryEntry() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String toStatus,  String? fromStatus,  String? changedByName,  String? notes,  DateTime createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderStatusHistoryEntry() when $default != null:
return $default(_that.toStatus,_that.fromStatus,_that.changedByName,_that.notes,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String toStatus,  String? fromStatus,  String? changedByName,  String? notes,  DateTime createdAt)  $default,) {final _that = this;
switch (_that) {
case _OrderStatusHistoryEntry():
return $default(_that.toStatus,_that.fromStatus,_that.changedByName,_that.notes,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String toStatus,  String? fromStatus,  String? changedByName,  String? notes,  DateTime createdAt)?  $default,) {final _that = this;
switch (_that) {
case _OrderStatusHistoryEntry() when $default != null:
return $default(_that.toStatus,_that.fromStatus,_that.changedByName,_that.notes,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderStatusHistoryEntry implements OrderStatusHistoryEntry {
  const _OrderStatusHistoryEntry({required this.toStatus, this.fromStatus, this.changedByName, this.notes, required this.createdAt});
  factory _OrderStatusHistoryEntry.fromJson(Map<String, dynamic> json) => _$OrderStatusHistoryEntryFromJson(json);

@override final  String toStatus;
@override final  String? fromStatus;
@override final  String? changedByName;
@override final  String? notes;
@override final  DateTime createdAt;

/// Create a copy of OrderStatusHistoryEntry
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderStatusHistoryEntryCopyWith<_OrderStatusHistoryEntry> get copyWith => __$OrderStatusHistoryEntryCopyWithImpl<_OrderStatusHistoryEntry>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderStatusHistoryEntryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderStatusHistoryEntry&&(identical(other.toStatus, toStatus) || other.toStatus == toStatus)&&(identical(other.fromStatus, fromStatus) || other.fromStatus == fromStatus)&&(identical(other.changedByName, changedByName) || other.changedByName == changedByName)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,toStatus,fromStatus,changedByName,notes,createdAt);

@override
String toString() {
  return 'OrderStatusHistoryEntry(toStatus: $toStatus, fromStatus: $fromStatus, changedByName: $changedByName, notes: $notes, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$OrderStatusHistoryEntryCopyWith<$Res> implements $OrderStatusHistoryEntryCopyWith<$Res> {
  factory _$OrderStatusHistoryEntryCopyWith(_OrderStatusHistoryEntry value, $Res Function(_OrderStatusHistoryEntry) _then) = __$OrderStatusHistoryEntryCopyWithImpl;
@override @useResult
$Res call({
 String toStatus, String? fromStatus, String? changedByName, String? notes, DateTime createdAt
});




}
/// @nodoc
class __$OrderStatusHistoryEntryCopyWithImpl<$Res>
    implements _$OrderStatusHistoryEntryCopyWith<$Res> {
  __$OrderStatusHistoryEntryCopyWithImpl(this._self, this._then);

  final _OrderStatusHistoryEntry _self;
  final $Res Function(_OrderStatusHistoryEntry) _then;

/// Create a copy of OrderStatusHistoryEntry
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? toStatus = null,Object? fromStatus = freezed,Object? changedByName = freezed,Object? notes = freezed,Object? createdAt = null,}) {
  return _then(_OrderStatusHistoryEntry(
toStatus: null == toStatus ? _self.toStatus : toStatus // ignore: cast_nullable_to_non_nullable
as String,fromStatus: freezed == fromStatus ? _self.fromStatus : fromStatus // ignore: cast_nullable_to_non_nullable
as String?,changedByName: freezed == changedByName ? _self.changedByName : changedByName // ignore: cast_nullable_to_non_nullable
as String?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}


/// @nodoc
mixin _$OrderDetail {

 String get id; String get orderNumber; String get storeId; String get storeName; String? get warehouseId; String? get warehouseName; String get status; String get orderTotal; String? get notes; DateTime get submittedAt; String get submittedByName; DateTime? get approvedAt; String? get approvedByName; String? get rejectionReason; List<OrderLine> get lines; List<OrderStatusHistoryEntry> get statusHistory;
/// Create a copy of OrderDetail
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderDetailCopyWith<OrderDetail> get copyWith => _$OrderDetailCopyWithImpl<OrderDetail>(this as OrderDetail, _$identity);

  /// Serializes this OrderDetail to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderDetail&&(identical(other.id, id) || other.id == id)&&(identical(other.orderNumber, orderNumber) || other.orderNumber == orderNumber)&&(identical(other.storeId, storeId) || other.storeId == storeId)&&(identical(other.storeName, storeName) || other.storeName == storeName)&&(identical(other.warehouseId, warehouseId) || other.warehouseId == warehouseId)&&(identical(other.warehouseName, warehouseName) || other.warehouseName == warehouseName)&&(identical(other.status, status) || other.status == status)&&(identical(other.orderTotal, orderTotal) || other.orderTotal == orderTotal)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.submittedAt, submittedAt) || other.submittedAt == submittedAt)&&(identical(other.submittedByName, submittedByName) || other.submittedByName == submittedByName)&&(identical(other.approvedAt, approvedAt) || other.approvedAt == approvedAt)&&(identical(other.approvedByName, approvedByName) || other.approvedByName == approvedByName)&&(identical(other.rejectionReason, rejectionReason) || other.rejectionReason == rejectionReason)&&const DeepCollectionEquality().equals(other.lines, lines)&&const DeepCollectionEquality().equals(other.statusHistory, statusHistory));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,orderNumber,storeId,storeName,warehouseId,warehouseName,status,orderTotal,notes,submittedAt,submittedByName,approvedAt,approvedByName,rejectionReason,const DeepCollectionEquality().hash(lines),const DeepCollectionEquality().hash(statusHistory));

@override
String toString() {
  return 'OrderDetail(id: $id, orderNumber: $orderNumber, storeId: $storeId, storeName: $storeName, warehouseId: $warehouseId, warehouseName: $warehouseName, status: $status, orderTotal: $orderTotal, notes: $notes, submittedAt: $submittedAt, submittedByName: $submittedByName, approvedAt: $approvedAt, approvedByName: $approvedByName, rejectionReason: $rejectionReason, lines: $lines, statusHistory: $statusHistory)';
}


}

/// @nodoc
abstract mixin class $OrderDetailCopyWith<$Res>  {
  factory $OrderDetailCopyWith(OrderDetail value, $Res Function(OrderDetail) _then) = _$OrderDetailCopyWithImpl;
@useResult
$Res call({
 String id, String orderNumber, String storeId, String storeName, String? warehouseId, String? warehouseName, String status, String orderTotal, String? notes, DateTime submittedAt, String submittedByName, DateTime? approvedAt, String? approvedByName, String? rejectionReason, List<OrderLine> lines, List<OrderStatusHistoryEntry> statusHistory
});




}
/// @nodoc
class _$OrderDetailCopyWithImpl<$Res>
    implements $OrderDetailCopyWith<$Res> {
  _$OrderDetailCopyWithImpl(this._self, this._then);

  final OrderDetail _self;
  final $Res Function(OrderDetail) _then;

/// Create a copy of OrderDetail
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? orderNumber = null,Object? storeId = null,Object? storeName = null,Object? warehouseId = freezed,Object? warehouseName = freezed,Object? status = null,Object? orderTotal = null,Object? notes = freezed,Object? submittedAt = null,Object? submittedByName = null,Object? approvedAt = freezed,Object? approvedByName = freezed,Object? rejectionReason = freezed,Object? lines = null,Object? statusHistory = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,orderNumber: null == orderNumber ? _self.orderNumber : orderNumber // ignore: cast_nullable_to_non_nullable
as String,storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,storeName: null == storeName ? _self.storeName : storeName // ignore: cast_nullable_to_non_nullable
as String,warehouseId: freezed == warehouseId ? _self.warehouseId : warehouseId // ignore: cast_nullable_to_non_nullable
as String?,warehouseName: freezed == warehouseName ? _self.warehouseName : warehouseName // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,orderTotal: null == orderTotal ? _self.orderTotal : orderTotal // ignore: cast_nullable_to_non_nullable
as String,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,submittedAt: null == submittedAt ? _self.submittedAt : submittedAt // ignore: cast_nullable_to_non_nullable
as DateTime,submittedByName: null == submittedByName ? _self.submittedByName : submittedByName // ignore: cast_nullable_to_non_nullable
as String,approvedAt: freezed == approvedAt ? _self.approvedAt : approvedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,approvedByName: freezed == approvedByName ? _self.approvedByName : approvedByName // ignore: cast_nullable_to_non_nullable
as String?,rejectionReason: freezed == rejectionReason ? _self.rejectionReason : rejectionReason // ignore: cast_nullable_to_non_nullable
as String?,lines: null == lines ? _self.lines : lines // ignore: cast_nullable_to_non_nullable
as List<OrderLine>,statusHistory: null == statusHistory ? _self.statusHistory : statusHistory // ignore: cast_nullable_to_non_nullable
as List<OrderStatusHistoryEntry>,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderDetail].
extension OrderDetailPatterns on OrderDetail {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderDetail value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderDetail() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderDetail value)  $default,){
final _that = this;
switch (_that) {
case _OrderDetail():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderDetail value)?  $default,){
final _that = this;
switch (_that) {
case _OrderDetail() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String orderNumber,  String storeId,  String storeName,  String? warehouseId,  String? warehouseName,  String status,  String orderTotal,  String? notes,  DateTime submittedAt,  String submittedByName,  DateTime? approvedAt,  String? approvedByName,  String? rejectionReason,  List<OrderLine> lines,  List<OrderStatusHistoryEntry> statusHistory)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderDetail() when $default != null:
return $default(_that.id,_that.orderNumber,_that.storeId,_that.storeName,_that.warehouseId,_that.warehouseName,_that.status,_that.orderTotal,_that.notes,_that.submittedAt,_that.submittedByName,_that.approvedAt,_that.approvedByName,_that.rejectionReason,_that.lines,_that.statusHistory);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String orderNumber,  String storeId,  String storeName,  String? warehouseId,  String? warehouseName,  String status,  String orderTotal,  String? notes,  DateTime submittedAt,  String submittedByName,  DateTime? approvedAt,  String? approvedByName,  String? rejectionReason,  List<OrderLine> lines,  List<OrderStatusHistoryEntry> statusHistory)  $default,) {final _that = this;
switch (_that) {
case _OrderDetail():
return $default(_that.id,_that.orderNumber,_that.storeId,_that.storeName,_that.warehouseId,_that.warehouseName,_that.status,_that.orderTotal,_that.notes,_that.submittedAt,_that.submittedByName,_that.approvedAt,_that.approvedByName,_that.rejectionReason,_that.lines,_that.statusHistory);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String orderNumber,  String storeId,  String storeName,  String? warehouseId,  String? warehouseName,  String status,  String orderTotal,  String? notes,  DateTime submittedAt,  String submittedByName,  DateTime? approvedAt,  String? approvedByName,  String? rejectionReason,  List<OrderLine> lines,  List<OrderStatusHistoryEntry> statusHistory)?  $default,) {final _that = this;
switch (_that) {
case _OrderDetail() when $default != null:
return $default(_that.id,_that.orderNumber,_that.storeId,_that.storeName,_that.warehouseId,_that.warehouseName,_that.status,_that.orderTotal,_that.notes,_that.submittedAt,_that.submittedByName,_that.approvedAt,_that.approvedByName,_that.rejectionReason,_that.lines,_that.statusHistory);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderDetail implements OrderDetail {
  const _OrderDetail({required this.id, required this.orderNumber, required this.storeId, required this.storeName, this.warehouseId, this.warehouseName, required this.status, required this.orderTotal, this.notes, required this.submittedAt, required this.submittedByName, this.approvedAt, this.approvedByName, this.rejectionReason, final  List<OrderLine> lines = const <OrderLine>[], final  List<OrderStatusHistoryEntry> statusHistory = const <OrderStatusHistoryEntry>[]}): _lines = lines,_statusHistory = statusHistory;
  factory _OrderDetail.fromJson(Map<String, dynamic> json) => _$OrderDetailFromJson(json);

@override final  String id;
@override final  String orderNumber;
@override final  String storeId;
@override final  String storeName;
@override final  String? warehouseId;
@override final  String? warehouseName;
@override final  String status;
@override final  String orderTotal;
@override final  String? notes;
@override final  DateTime submittedAt;
@override final  String submittedByName;
@override final  DateTime? approvedAt;
@override final  String? approvedByName;
@override final  String? rejectionReason;
 final  List<OrderLine> _lines;
@override@JsonKey() List<OrderLine> get lines {
  if (_lines is EqualUnmodifiableListView) return _lines;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_lines);
}

 final  List<OrderStatusHistoryEntry> _statusHistory;
@override@JsonKey() List<OrderStatusHistoryEntry> get statusHistory {
  if (_statusHistory is EqualUnmodifiableListView) return _statusHistory;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_statusHistory);
}


/// Create a copy of OrderDetail
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderDetailCopyWith<_OrderDetail> get copyWith => __$OrderDetailCopyWithImpl<_OrderDetail>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderDetailToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderDetail&&(identical(other.id, id) || other.id == id)&&(identical(other.orderNumber, orderNumber) || other.orderNumber == orderNumber)&&(identical(other.storeId, storeId) || other.storeId == storeId)&&(identical(other.storeName, storeName) || other.storeName == storeName)&&(identical(other.warehouseId, warehouseId) || other.warehouseId == warehouseId)&&(identical(other.warehouseName, warehouseName) || other.warehouseName == warehouseName)&&(identical(other.status, status) || other.status == status)&&(identical(other.orderTotal, orderTotal) || other.orderTotal == orderTotal)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.submittedAt, submittedAt) || other.submittedAt == submittedAt)&&(identical(other.submittedByName, submittedByName) || other.submittedByName == submittedByName)&&(identical(other.approvedAt, approvedAt) || other.approvedAt == approvedAt)&&(identical(other.approvedByName, approvedByName) || other.approvedByName == approvedByName)&&(identical(other.rejectionReason, rejectionReason) || other.rejectionReason == rejectionReason)&&const DeepCollectionEquality().equals(other._lines, _lines)&&const DeepCollectionEquality().equals(other._statusHistory, _statusHistory));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,orderNumber,storeId,storeName,warehouseId,warehouseName,status,orderTotal,notes,submittedAt,submittedByName,approvedAt,approvedByName,rejectionReason,const DeepCollectionEquality().hash(_lines),const DeepCollectionEquality().hash(_statusHistory));

@override
String toString() {
  return 'OrderDetail(id: $id, orderNumber: $orderNumber, storeId: $storeId, storeName: $storeName, warehouseId: $warehouseId, warehouseName: $warehouseName, status: $status, orderTotal: $orderTotal, notes: $notes, submittedAt: $submittedAt, submittedByName: $submittedByName, approvedAt: $approvedAt, approvedByName: $approvedByName, rejectionReason: $rejectionReason, lines: $lines, statusHistory: $statusHistory)';
}


}

/// @nodoc
abstract mixin class _$OrderDetailCopyWith<$Res> implements $OrderDetailCopyWith<$Res> {
  factory _$OrderDetailCopyWith(_OrderDetail value, $Res Function(_OrderDetail) _then) = __$OrderDetailCopyWithImpl;
@override @useResult
$Res call({
 String id, String orderNumber, String storeId, String storeName, String? warehouseId, String? warehouseName, String status, String orderTotal, String? notes, DateTime submittedAt, String submittedByName, DateTime? approvedAt, String? approvedByName, String? rejectionReason, List<OrderLine> lines, List<OrderStatusHistoryEntry> statusHistory
});




}
/// @nodoc
class __$OrderDetailCopyWithImpl<$Res>
    implements _$OrderDetailCopyWith<$Res> {
  __$OrderDetailCopyWithImpl(this._self, this._then);

  final _OrderDetail _self;
  final $Res Function(_OrderDetail) _then;

/// Create a copy of OrderDetail
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? orderNumber = null,Object? storeId = null,Object? storeName = null,Object? warehouseId = freezed,Object? warehouseName = freezed,Object? status = null,Object? orderTotal = null,Object? notes = freezed,Object? submittedAt = null,Object? submittedByName = null,Object? approvedAt = freezed,Object? approvedByName = freezed,Object? rejectionReason = freezed,Object? lines = null,Object? statusHistory = null,}) {
  return _then(_OrderDetail(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,orderNumber: null == orderNumber ? _self.orderNumber : orderNumber // ignore: cast_nullable_to_non_nullable
as String,storeId: null == storeId ? _self.storeId : storeId // ignore: cast_nullable_to_non_nullable
as String,storeName: null == storeName ? _self.storeName : storeName // ignore: cast_nullable_to_non_nullable
as String,warehouseId: freezed == warehouseId ? _self.warehouseId : warehouseId // ignore: cast_nullable_to_non_nullable
as String?,warehouseName: freezed == warehouseName ? _self.warehouseName : warehouseName // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,orderTotal: null == orderTotal ? _self.orderTotal : orderTotal // ignore: cast_nullable_to_non_nullable
as String,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,submittedAt: null == submittedAt ? _self.submittedAt : submittedAt // ignore: cast_nullable_to_non_nullable
as DateTime,submittedByName: null == submittedByName ? _self.submittedByName : submittedByName // ignore: cast_nullable_to_non_nullable
as String,approvedAt: freezed == approvedAt ? _self.approvedAt : approvedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,approvedByName: freezed == approvedByName ? _self.approvedByName : approvedByName // ignore: cast_nullable_to_non_nullable
as String?,rejectionReason: freezed == rejectionReason ? _self.rejectionReason : rejectionReason // ignore: cast_nullable_to_non_nullable
as String?,lines: null == lines ? _self._lines : lines // ignore: cast_nullable_to_non_nullable
as List<OrderLine>,statusHistory: null == statusHistory ? _self._statusHistory : statusHistory // ignore: cast_nullable_to_non_nullable
as List<OrderStatusHistoryEntry>,
  ));
}


}


/// @nodoc
mixin _$OrderEnvelope {

 OrderDetail get order;
/// Create a copy of OrderEnvelope
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderEnvelopeCopyWith<OrderEnvelope> get copyWith => _$OrderEnvelopeCopyWithImpl<OrderEnvelope>(this as OrderEnvelope, _$identity);

  /// Serializes this OrderEnvelope to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderEnvelope&&(identical(other.order, order) || other.order == order));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,order);

@override
String toString() {
  return 'OrderEnvelope(order: $order)';
}


}

/// @nodoc
abstract mixin class $OrderEnvelopeCopyWith<$Res>  {
  factory $OrderEnvelopeCopyWith(OrderEnvelope value, $Res Function(OrderEnvelope) _then) = _$OrderEnvelopeCopyWithImpl;
@useResult
$Res call({
 OrderDetail order
});


$OrderDetailCopyWith<$Res> get order;

}
/// @nodoc
class _$OrderEnvelopeCopyWithImpl<$Res>
    implements $OrderEnvelopeCopyWith<$Res> {
  _$OrderEnvelopeCopyWithImpl(this._self, this._then);

  final OrderEnvelope _self;
  final $Res Function(OrderEnvelope) _then;

/// Create a copy of OrderEnvelope
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? order = null,}) {
  return _then(_self.copyWith(
order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as OrderDetail,
  ));
}
/// Create a copy of OrderEnvelope
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$OrderDetailCopyWith<$Res> get order {
  
  return $OrderDetailCopyWith<$Res>(_self.order, (value) {
    return _then(_self.copyWith(order: value));
  });
}
}


/// Adds pattern-matching-related methods to [OrderEnvelope].
extension OrderEnvelopePatterns on OrderEnvelope {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderEnvelope value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderEnvelope() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderEnvelope value)  $default,){
final _that = this;
switch (_that) {
case _OrderEnvelope():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderEnvelope value)?  $default,){
final _that = this;
switch (_that) {
case _OrderEnvelope() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( OrderDetail order)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderEnvelope() when $default != null:
return $default(_that.order);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( OrderDetail order)  $default,) {final _that = this;
switch (_that) {
case _OrderEnvelope():
return $default(_that.order);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( OrderDetail order)?  $default,) {final _that = this;
switch (_that) {
case _OrderEnvelope() when $default != null:
return $default(_that.order);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderEnvelope implements OrderEnvelope {
  const _OrderEnvelope({required this.order});
  factory _OrderEnvelope.fromJson(Map<String, dynamic> json) => _$OrderEnvelopeFromJson(json);

@override final  OrderDetail order;

/// Create a copy of OrderEnvelope
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderEnvelopeCopyWith<_OrderEnvelope> get copyWith => __$OrderEnvelopeCopyWithImpl<_OrderEnvelope>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderEnvelopeToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderEnvelope&&(identical(other.order, order) || other.order == order));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,order);

@override
String toString() {
  return 'OrderEnvelope(order: $order)';
}


}

/// @nodoc
abstract mixin class _$OrderEnvelopeCopyWith<$Res> implements $OrderEnvelopeCopyWith<$Res> {
  factory _$OrderEnvelopeCopyWith(_OrderEnvelope value, $Res Function(_OrderEnvelope) _then) = __$OrderEnvelopeCopyWithImpl;
@override @useResult
$Res call({
 OrderDetail order
});


@override $OrderDetailCopyWith<$Res> get order;

}
/// @nodoc
class __$OrderEnvelopeCopyWithImpl<$Res>
    implements _$OrderEnvelopeCopyWith<$Res> {
  __$OrderEnvelopeCopyWithImpl(this._self, this._then);

  final _OrderEnvelope _self;
  final $Res Function(_OrderEnvelope) _then;

/// Create a copy of OrderEnvelope
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? order = null,}) {
  return _then(_OrderEnvelope(
order: null == order ? _self.order : order // ignore: cast_nullable_to_non_nullable
as OrderDetail,
  ));
}

/// Create a copy of OrderEnvelope
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$OrderDetailCopyWith<$Res> get order {
  
  return $OrderDetailCopyWith<$Res>(_self.order, (value) {
    return _then(_self.copyWith(order: value));
  });
}
}


/// @nodoc
mixin _$OrderPage {

 List<OrderSummary> get items; int get total; int get limit; int get offset;
/// Create a copy of OrderPage
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderPageCopyWith<OrderPage> get copyWith => _$OrderPageCopyWithImpl<OrderPage>(this as OrderPage, _$identity);

  /// Serializes this OrderPage to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderPage&&const DeepCollectionEquality().equals(other.items, items)&&(identical(other.total, total) || other.total == total)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.offset, offset) || other.offset == offset));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(items),total,limit,offset);

@override
String toString() {
  return 'OrderPage(items: $items, total: $total, limit: $limit, offset: $offset)';
}


}

/// @nodoc
abstract mixin class $OrderPageCopyWith<$Res>  {
  factory $OrderPageCopyWith(OrderPage value, $Res Function(OrderPage) _then) = _$OrderPageCopyWithImpl;
@useResult
$Res call({
 List<OrderSummary> items, int total, int limit, int offset
});




}
/// @nodoc
class _$OrderPageCopyWithImpl<$Res>
    implements $OrderPageCopyWith<$Res> {
  _$OrderPageCopyWithImpl(this._self, this._then);

  final OrderPage _self;
  final $Res Function(OrderPage) _then;

/// Create a copy of OrderPage
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? items = null,Object? total = null,Object? limit = null,Object? offset = null,}) {
  return _then(_self.copyWith(
items: null == items ? _self.items : items // ignore: cast_nullable_to_non_nullable
as List<OrderSummary>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,offset: null == offset ? _self.offset : offset // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderPage].
extension OrderPagePatterns on OrderPage {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderPage value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderPage() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderPage value)  $default,){
final _that = this;
switch (_that) {
case _OrderPage():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderPage value)?  $default,){
final _that = this;
switch (_that) {
case _OrderPage() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<OrderSummary> items,  int total,  int limit,  int offset)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderPage() when $default != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<OrderSummary> items,  int total,  int limit,  int offset)  $default,) {final _that = this;
switch (_that) {
case _OrderPage():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<OrderSummary> items,  int total,  int limit,  int offset)?  $default,) {final _that = this;
switch (_that) {
case _OrderPage() when $default != null:
return $default(_that.items,_that.total,_that.limit,_that.offset);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderPage implements OrderPage {
  const _OrderPage({final  List<OrderSummary> items = const <OrderSummary>[], required this.total, required this.limit, required this.offset}): _items = items;
  factory _OrderPage.fromJson(Map<String, dynamic> json) => _$OrderPageFromJson(json);

 final  List<OrderSummary> _items;
@override@JsonKey() List<OrderSummary> get items {
  if (_items is EqualUnmodifiableListView) return _items;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_items);
}

@override final  int total;
@override final  int limit;
@override final  int offset;

/// Create a copy of OrderPage
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderPageCopyWith<_OrderPage> get copyWith => __$OrderPageCopyWithImpl<_OrderPage>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderPageToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderPage&&const DeepCollectionEquality().equals(other._items, _items)&&(identical(other.total, total) || other.total == total)&&(identical(other.limit, limit) || other.limit == limit)&&(identical(other.offset, offset) || other.offset == offset));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_items),total,limit,offset);

@override
String toString() {
  return 'OrderPage(items: $items, total: $total, limit: $limit, offset: $offset)';
}


}

/// @nodoc
abstract mixin class _$OrderPageCopyWith<$Res> implements $OrderPageCopyWith<$Res> {
  factory _$OrderPageCopyWith(_OrderPage value, $Res Function(_OrderPage) _then) = __$OrderPageCopyWithImpl;
@override @useResult
$Res call({
 List<OrderSummary> items, int total, int limit, int offset
});




}
/// @nodoc
class __$OrderPageCopyWithImpl<$Res>
    implements _$OrderPageCopyWith<$Res> {
  __$OrderPageCopyWithImpl(this._self, this._then);

  final _OrderPage _self;
  final $Res Function(_OrderPage) _then;

/// Create a copy of OrderPage
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? items = null,Object? total = null,Object? limit = null,Object? offset = null,}) {
  return _then(_OrderPage(
items: null == items ? _self._items : items // ignore: cast_nullable_to_non_nullable
as List<OrderSummary>,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,limit: null == limit ? _self.limit : limit // ignore: cast_nullable_to_non_nullable
as int,offset: null == offset ? _self.offset : offset // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
