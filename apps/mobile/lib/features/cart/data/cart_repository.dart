import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_config.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/errors/error_mapper.dart';
import '../../../core/errors/failure.dart';
import '../../../shared/models/cart_models.dart';

/// `/api/cart` and `/api/cart/lines`.
///
/// Every mutating endpoint answers with the whole cart, so the repository
/// always returns a fresh [Cart] and callers never patch state locally.
/// `DELETE` returns `204` with no body, so those two methods re-read the cart.
class CartRepository {
  CartRepository(this._dio);

  final Dio _dio;

  Future<Cart> fetchCart(String storeId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        ApiPaths.cart,
        queryParameters: <String, dynamic>{'storeId': storeId},
      );
      return Cart.fromJson(_require(response.data));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
  }

  Future<Cart> addLine({
    required String storeId,
    required String variantId,
    required String unitType,
    required int quantity,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        ApiPaths.cartLines,
        data: AddCartLineRequest(
          storeId: storeId,
          variantId: variantId,
          unitType: unitType,
          quantity: quantity,
        ).toJson(),
      );
      return Cart.fromJson(_require(response.data));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
  }

  Future<Cart> updateLineQuantity({
    required String lineId,
    required int quantity,
  }) async {
    try {
      final response = await _dio.patch<Map<String, dynamic>>(
        ApiPaths.cartLine(lineId),
        data: <String, dynamic>{'quantity': quantity},
      );
      return Cart.fromJson(_require(response.data));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
  }

  Future<Cart> removeLine({
    required String storeId,
    required String lineId,
  }) async {
    try {
      await _dio.delete<void>(ApiPaths.cartLine(lineId));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
    return fetchCart(storeId);
  }

  Future<Cart> clearCart(String storeId) async {
    try {
      await _dio.delete<void>(
        ApiPaths.cart,
        queryParameters: <String, dynamic>{'storeId': storeId},
      );
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
    return fetchCart(storeId);
  }

  static Map<String, dynamic> _require(Map<String, dynamic>? data) {
    if (data == null) {
      throw const Failure.unexpected(message: 'The server returned no data.');
    }
    return data;
  }
}

final cartRepositoryProvider = Provider<CartRepository>(
  (ref) => CartRepository(ref.watch(dioProvider)),
);
