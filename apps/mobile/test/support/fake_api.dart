import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';

/// A canned response.
class FakeResponse {
  const FakeResponse(this.statusCode, [this.body]);

  /// The contract error envelope.
  factory FakeResponse.error(int statusCode, String code, [String? message]) =>
      FakeResponse(statusCode, <String, dynamic>{
        'error': <String, dynamic>{'code': code, 'message': message ?? code},
      });

  final int statusCode;
  final Object? body;
}

typedef StubHandler = FakeResponse Function(RequestOptions options);

/// An in-process stand-in for the API.
///
/// The real server does not exist yet, so every test drives Dio through this
/// adapter. No socket is ever opened, and the exact JSON from the contract is
/// what the models are asked to parse.
class FakeApi {
  final Map<String, StubHandler> _handlers = <String, StubHandler>{};

  /// Every request that reached the adapter, in order.
  final List<RequestOptions> requests = <RequestOptions>[];

  static String key(String method, String path) =>
      '${method.toUpperCase()} $path';

  /// Registers a fixed response.
  void on(String method, String path, FakeResponse response) {
    _handlers[key(method, path)] = (_) => response;
  }

  /// Registers a response computed per call (for sequences, counters, …).
  void onRequest(String method, String path, StubHandler handler) {
    _handlers[key(method, path)] = handler;
  }

  /// How many times a route was hit.
  int callsTo(String method, String path) => requests
      .where((r) => key(r.method, r.uri.path) == key(method, path))
      .length;

  HttpClientAdapter get adapter => _StubAdapter(this);

  FakeResponse _resolve(RequestOptions options) {
    requests.add(options);
    final handler = _handlers[key(options.method, options.uri.path)];
    if (handler == null) {
      return FakeResponse.error(
        404,
        'NOT_FOUND',
        'No stub for ${options.method} ${options.uri.path}',
      );
    }
    return handler(options);
  }
}

class _StubAdapter implements HttpClientAdapter {
  _StubAdapter(this._api);

  final FakeApi _api;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    final response = _api._resolve(options);
    final body = response.body;
    return ResponseBody.fromString(
      body == null ? '' : jsonEncode(body),
      response.statusCode,
      headers: <String, List<String>>{
        Headers.contentTypeHeader: <String>[Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}
