// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'session_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$SessionState {

 AuthUser? get user; List<StoreSummary> get stores; String? get selectedStoreId;
/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SessionStateCopyWith<SessionState> get copyWith => _$SessionStateCopyWithImpl<SessionState>(this as SessionState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SessionState&&(identical(other.user, user) || other.user == user)&&const DeepCollectionEquality().equals(other.stores, stores)&&(identical(other.selectedStoreId, selectedStoreId) || other.selectedStoreId == selectedStoreId));
}


@override
int get hashCode => Object.hash(runtimeType,user,const DeepCollectionEquality().hash(stores),selectedStoreId);

@override
String toString() {
  return 'SessionState(user: $user, stores: $stores, selectedStoreId: $selectedStoreId)';
}


}

/// @nodoc
abstract mixin class $SessionStateCopyWith<$Res>  {
  factory $SessionStateCopyWith(SessionState value, $Res Function(SessionState) _then) = _$SessionStateCopyWithImpl;
@useResult
$Res call({
 AuthUser? user, List<StoreSummary> stores, String? selectedStoreId
});


$AuthUserCopyWith<$Res>? get user;

}
/// @nodoc
class _$SessionStateCopyWithImpl<$Res>
    implements $SessionStateCopyWith<$Res> {
  _$SessionStateCopyWithImpl(this._self, this._then);

  final SessionState _self;
  final $Res Function(SessionState) _then;

/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? user = freezed,Object? stores = null,Object? selectedStoreId = freezed,}) {
  return _then(_self.copyWith(
user: freezed == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as AuthUser?,stores: null == stores ? _self.stores : stores // ignore: cast_nullable_to_non_nullable
as List<StoreSummary>,selectedStoreId: freezed == selectedStoreId ? _self.selectedStoreId : selectedStoreId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}
/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuthUserCopyWith<$Res>? get user {
    if (_self.user == null) {
    return null;
  }

  return $AuthUserCopyWith<$Res>(_self.user!, (value) {
    return _then(_self.copyWith(user: value));
  });
}
}


/// Adds pattern-matching-related methods to [SessionState].
extension SessionStatePatterns on SessionState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SessionState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SessionState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SessionState value)  $default,){
final _that = this;
switch (_that) {
case _SessionState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SessionState value)?  $default,){
final _that = this;
switch (_that) {
case _SessionState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( AuthUser? user,  List<StoreSummary> stores,  String? selectedStoreId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SessionState() when $default != null:
return $default(_that.user,_that.stores,_that.selectedStoreId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( AuthUser? user,  List<StoreSummary> stores,  String? selectedStoreId)  $default,) {final _that = this;
switch (_that) {
case _SessionState():
return $default(_that.user,_that.stores,_that.selectedStoreId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( AuthUser? user,  List<StoreSummary> stores,  String? selectedStoreId)?  $default,) {final _that = this;
switch (_that) {
case _SessionState() when $default != null:
return $default(_that.user,_that.stores,_that.selectedStoreId);case _:
  return null;

}
}

}

/// @nodoc


class _SessionState extends SessionState {
  const _SessionState({this.user, final  List<StoreSummary> stores = const <StoreSummary>[], this.selectedStoreId}): _stores = stores,super._();
  

@override final  AuthUser? user;
 final  List<StoreSummary> _stores;
@override@JsonKey() List<StoreSummary> get stores {
  if (_stores is EqualUnmodifiableListView) return _stores;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_stores);
}

@override final  String? selectedStoreId;

/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SessionStateCopyWith<_SessionState> get copyWith => __$SessionStateCopyWithImpl<_SessionState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SessionState&&(identical(other.user, user) || other.user == user)&&const DeepCollectionEquality().equals(other._stores, _stores)&&(identical(other.selectedStoreId, selectedStoreId) || other.selectedStoreId == selectedStoreId));
}


@override
int get hashCode => Object.hash(runtimeType,user,const DeepCollectionEquality().hash(_stores),selectedStoreId);

@override
String toString() {
  return 'SessionState(user: $user, stores: $stores, selectedStoreId: $selectedStoreId)';
}


}

/// @nodoc
abstract mixin class _$SessionStateCopyWith<$Res> implements $SessionStateCopyWith<$Res> {
  factory _$SessionStateCopyWith(_SessionState value, $Res Function(_SessionState) _then) = __$SessionStateCopyWithImpl;
@override @useResult
$Res call({
 AuthUser? user, List<StoreSummary> stores, String? selectedStoreId
});


@override $AuthUserCopyWith<$Res>? get user;

}
/// @nodoc
class __$SessionStateCopyWithImpl<$Res>
    implements _$SessionStateCopyWith<$Res> {
  __$SessionStateCopyWithImpl(this._self, this._then);

  final _SessionState _self;
  final $Res Function(_SessionState) _then;

/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? user = freezed,Object? stores = null,Object? selectedStoreId = freezed,}) {
  return _then(_SessionState(
user: freezed == user ? _self.user : user // ignore: cast_nullable_to_non_nullable
as AuthUser?,stores: null == stores ? _self._stores : stores // ignore: cast_nullable_to_non_nullable
as List<StoreSummary>,selectedStoreId: freezed == selectedStoreId ? _self.selectedStoreId : selectedStoreId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

/// Create a copy of SessionState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuthUserCopyWith<$Res>? get user {
    if (_self.user == null) {
    return null;
  }

  return $AuthUserCopyWith<$Res>(_self.user!, (value) {
    return _then(_self.copyWith(user: value));
  });
}
}

// dart format on
