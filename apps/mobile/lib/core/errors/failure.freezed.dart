// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'failure.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$Failure {





@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Failure);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'Failure()';
}


}

/// @nodoc
class $FailureCopyWith<$Res>  {
$FailureCopyWith(Failure _, $Res Function(Failure) __);
}


/// Adds pattern-matching-related methods to [Failure].
extension FailurePatterns on Failure {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( NetworkFailure value)?  network,TResult Function( TimeoutFailure value)?  timeout,TResult Function( ApiFailure value)?  api,TResult Function( CancelledFailure value)?  cancelled,TResult Function( UnexpectedFailure value)?  unexpected,required TResult orElse(),}){
final _that = this;
switch (_that) {
case NetworkFailure() when network != null:
return network(_that);case TimeoutFailure() when timeout != null:
return timeout(_that);case ApiFailure() when api != null:
return api(_that);case CancelledFailure() when cancelled != null:
return cancelled(_that);case UnexpectedFailure() when unexpected != null:
return unexpected(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( NetworkFailure value)  network,required TResult Function( TimeoutFailure value)  timeout,required TResult Function( ApiFailure value)  api,required TResult Function( CancelledFailure value)  cancelled,required TResult Function( UnexpectedFailure value)  unexpected,}){
final _that = this;
switch (_that) {
case NetworkFailure():
return network(_that);case TimeoutFailure():
return timeout(_that);case ApiFailure():
return api(_that);case CancelledFailure():
return cancelled(_that);case UnexpectedFailure():
return unexpected(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( NetworkFailure value)?  network,TResult? Function( TimeoutFailure value)?  timeout,TResult? Function( ApiFailure value)?  api,TResult? Function( CancelledFailure value)?  cancelled,TResult? Function( UnexpectedFailure value)?  unexpected,}){
final _that = this;
switch (_that) {
case NetworkFailure() when network != null:
return network(_that);case TimeoutFailure() when timeout != null:
return timeout(_that);case ApiFailure() when api != null:
return api(_that);case CancelledFailure() when cancelled != null:
return cancelled(_that);case UnexpectedFailure() when unexpected != null:
return unexpected(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function( String message)?  network,TResult Function( String message)?  timeout,TResult Function( int statusCode,  String code,  String message)?  api,TResult Function()?  cancelled,TResult Function( String message,  Object? cause)?  unexpected,required TResult orElse(),}) {final _that = this;
switch (_that) {
case NetworkFailure() when network != null:
return network(_that.message);case TimeoutFailure() when timeout != null:
return timeout(_that.message);case ApiFailure() when api != null:
return api(_that.statusCode,_that.code,_that.message);case CancelledFailure() when cancelled != null:
return cancelled();case UnexpectedFailure() when unexpected != null:
return unexpected(_that.message,_that.cause);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function( String message)  network,required TResult Function( String message)  timeout,required TResult Function( int statusCode,  String code,  String message)  api,required TResult Function()  cancelled,required TResult Function( String message,  Object? cause)  unexpected,}) {final _that = this;
switch (_that) {
case NetworkFailure():
return network(_that.message);case TimeoutFailure():
return timeout(_that.message);case ApiFailure():
return api(_that.statusCode,_that.code,_that.message);case CancelledFailure():
return cancelled();case UnexpectedFailure():
return unexpected(_that.message,_that.cause);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function( String message)?  network,TResult? Function( String message)?  timeout,TResult? Function( int statusCode,  String code,  String message)?  api,TResult? Function()?  cancelled,TResult? Function( String message,  Object? cause)?  unexpected,}) {final _that = this;
switch (_that) {
case NetworkFailure() when network != null:
return network(_that.message);case TimeoutFailure() when timeout != null:
return timeout(_that.message);case ApiFailure() when api != null:
return api(_that.statusCode,_that.code,_that.message);case CancelledFailure() when cancelled != null:
return cancelled();case UnexpectedFailure() when unexpected != null:
return unexpected(_that.message,_that.cause);case _:
  return null;

}
}

}

/// @nodoc


class NetworkFailure extends Failure {
  const NetworkFailure({this.message = 'No connection to the server. Check your network and try again.'}): super._();
  

@JsonKey() final  String message;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NetworkFailureCopyWith<NetworkFailure> get copyWith => _$NetworkFailureCopyWithImpl<NetworkFailure>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is NetworkFailure&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,message);

@override
String toString() {
  return 'Failure.network(message: $message)';
}


}

/// @nodoc
abstract mixin class $NetworkFailureCopyWith<$Res> implements $FailureCopyWith<$Res> {
  factory $NetworkFailureCopyWith(NetworkFailure value, $Res Function(NetworkFailure) _then) = _$NetworkFailureCopyWithImpl;
@useResult
$Res call({
 String message
});




}
/// @nodoc
class _$NetworkFailureCopyWithImpl<$Res>
    implements $NetworkFailureCopyWith<$Res> {
  _$NetworkFailureCopyWithImpl(this._self, this._then);

  final NetworkFailure _self;
  final $Res Function(NetworkFailure) _then;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? message = null,}) {
  return _then(NetworkFailure(
message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class TimeoutFailure extends Failure {
  const TimeoutFailure({this.message = 'The server took too long to respond.'}): super._();
  

@JsonKey() final  String message;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TimeoutFailureCopyWith<TimeoutFailure> get copyWith => _$TimeoutFailureCopyWithImpl<TimeoutFailure>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TimeoutFailure&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,message);

@override
String toString() {
  return 'Failure.timeout(message: $message)';
}


}

/// @nodoc
abstract mixin class $TimeoutFailureCopyWith<$Res> implements $FailureCopyWith<$Res> {
  factory $TimeoutFailureCopyWith(TimeoutFailure value, $Res Function(TimeoutFailure) _then) = _$TimeoutFailureCopyWithImpl;
@useResult
$Res call({
 String message
});




}
/// @nodoc
class _$TimeoutFailureCopyWithImpl<$Res>
    implements $TimeoutFailureCopyWith<$Res> {
  _$TimeoutFailureCopyWithImpl(this._self, this._then);

  final TimeoutFailure _self;
  final $Res Function(TimeoutFailure) _then;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? message = null,}) {
  return _then(TimeoutFailure(
message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class ApiFailure extends Failure {
  const ApiFailure({required this.statusCode, required this.code, required this.message}): super._();
  

 final  int statusCode;
 final  String code;
 final  String message;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ApiFailureCopyWith<ApiFailure> get copyWith => _$ApiFailureCopyWithImpl<ApiFailure>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ApiFailure&&(identical(other.statusCode, statusCode) || other.statusCode == statusCode)&&(identical(other.code, code) || other.code == code)&&(identical(other.message, message) || other.message == message));
}


@override
int get hashCode => Object.hash(runtimeType,statusCode,code,message);

@override
String toString() {
  return 'Failure.api(statusCode: $statusCode, code: $code, message: $message)';
}


}

/// @nodoc
abstract mixin class $ApiFailureCopyWith<$Res> implements $FailureCopyWith<$Res> {
  factory $ApiFailureCopyWith(ApiFailure value, $Res Function(ApiFailure) _then) = _$ApiFailureCopyWithImpl;
@useResult
$Res call({
 int statusCode, String code, String message
});




}
/// @nodoc
class _$ApiFailureCopyWithImpl<$Res>
    implements $ApiFailureCopyWith<$Res> {
  _$ApiFailureCopyWithImpl(this._self, this._then);

  final ApiFailure _self;
  final $Res Function(ApiFailure) _then;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? statusCode = null,Object? code = null,Object? message = null,}) {
  return _then(ApiFailure(
statusCode: null == statusCode ? _self.statusCode : statusCode // ignore: cast_nullable_to_non_nullable
as int,code: null == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String,message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class CancelledFailure extends Failure {
  const CancelledFailure(): super._();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CancelledFailure);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'Failure.cancelled()';
}


}




/// @nodoc


class UnexpectedFailure extends Failure {
  const UnexpectedFailure({this.message = 'Something went wrong.', this.cause}): super._();
  

@JsonKey() final  String message;
 final  Object? cause;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UnexpectedFailureCopyWith<UnexpectedFailure> get copyWith => _$UnexpectedFailureCopyWithImpl<UnexpectedFailure>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UnexpectedFailure&&(identical(other.message, message) || other.message == message)&&const DeepCollectionEquality().equals(other.cause, cause));
}


@override
int get hashCode => Object.hash(runtimeType,message,const DeepCollectionEquality().hash(cause));

@override
String toString() {
  return 'Failure.unexpected(message: $message, cause: $cause)';
}


}

/// @nodoc
abstract mixin class $UnexpectedFailureCopyWith<$Res> implements $FailureCopyWith<$Res> {
  factory $UnexpectedFailureCopyWith(UnexpectedFailure value, $Res Function(UnexpectedFailure) _then) = _$UnexpectedFailureCopyWithImpl;
@useResult
$Res call({
 String message, Object? cause
});




}
/// @nodoc
class _$UnexpectedFailureCopyWithImpl<$Res>
    implements $UnexpectedFailureCopyWith<$Res> {
  _$UnexpectedFailureCopyWithImpl(this._self, this._then);

  final UnexpectedFailure _self;
  final $Res Function(UnexpectedFailure) _then;

/// Create a copy of Failure
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? message = null,Object? cause = freezed,}) {
  return _then(UnexpectedFailure(
message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,cause: freezed == cause ? _self.cause : cause ,
  ));
}


}

// dart format on
