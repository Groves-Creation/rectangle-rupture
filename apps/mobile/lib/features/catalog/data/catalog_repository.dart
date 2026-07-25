import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_config.dart';
import '../../../core/api/dio_client.dart';
import '../../../core/errors/error_mapper.dart';
import '../../../core/errors/failure.dart';
import '../../../shared/models/catalog_models.dart';

/// `GET /api/catalog` and `GET /api/catalog/:variantId`.
class CatalogRepository {
  CatalogRepository(this._dio);

  final Dio _dio;

  Future<CatalogPage> fetchCatalog({
    required String storeId,
    String? search,
    String? categoryId,
    int limit = 50,
    int offset = 0,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        ApiPaths.catalog,
        cancelToken: cancelToken,
        queryParameters: <String, dynamic>{
          'storeId': storeId,
          if (search != null && search.isNotEmpty) 'search': search,
          if (categoryId != null && categoryId.isNotEmpty)
            'categoryId': categoryId,
          'limit': limit,
          'offset': offset,
        },
      );
      return CatalogPage.fromJson(_require(response.data));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
  }

  Future<CatalogItem> fetchItem({
    required String variantId,
    required String storeId,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        ApiPaths.catalogItem(variantId),
        cancelToken: cancelToken,
        queryParameters: <String, dynamic>{'storeId': storeId},
      );
      return CatalogItem.fromJson(_require(response.data));
    } on Object catch (error, stackTrace) {
      throw mapError(error, stackTrace);
    }
  }

  static Map<String, dynamic> _require(Map<String, dynamic>? data) {
    if (data == null) {
      throw const Failure.unexpected(message: 'The server returned no data.');
    }
    return data;
  }
}

final catalogRepositoryProvider = Provider<CatalogRepository>(
  (ref) => CatalogRepository(ref.watch(dioProvider)),
);
