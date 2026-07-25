import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Remembers which store the user last acted on, so the picker is only shown
/// when there is genuinely a choice to make.
abstract interface class SelectedStoreStorage {
  Future<String?> read();
  Future<void> write(String storeId);
  Future<void> clear();
}

class SecureSelectedStoreStorage implements SelectedStoreStorage {
  SecureSelectedStoreStorage({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const String _key = 'lit.session.selectedStoreId';

  final FlutterSecureStorage _storage;

  @override
  Future<String?> read() => _storage.read(key: _key);

  @override
  Future<void> write(String storeId) =>
      _storage.write(key: _key, value: storeId);

  @override
  Future<void> clear() => _storage.delete(key: _key);
}

class InMemorySelectedStoreStorage implements SelectedStoreStorage {
  InMemorySelectedStoreStorage([this._storeId]);

  String? _storeId;

  @override
  Future<String?> read() async => _storeId;

  @override
  Future<void> write(String storeId) async => _storeId = storeId;

  @override
  Future<void> clear() async => _storeId = null;
}

final selectedStoreStorageProvider = Provider<SelectedStoreStorage>(
  (ref) => SecureSelectedStoreStorage(),
);
