import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/auth/session_controller.dart';
import '../../../core/errors/failure.dart';
import '../../../shared/models/cart_models.dart';
import '../data/cart_repository.dart';

part 'cart_controller.g.dart';

/// The active cart for the selected store.
///
/// Every mutation replaces the state with the cart the server returned, so the
/// client never has to reimplement pricing.
@riverpod
class CartController extends _$CartController {
  @override
  Future<Cart> build() async {
    // Watched, not read: switching store must reload the cart.
    final storeId = ref.watch(selectedStoreIdProvider);
    if (storeId == null) {
      throw const Failure.unexpected(message: 'Choose a store first.');
    }
    return ref.watch(cartRepositoryProvider).fetchCart(storeId);
  }

  Future<void> addLine({
    required String variantId,
    required String unitType,
    required int quantity,
  }) => _mutate(
    (repository, storeId) => repository.addLine(
      storeId: storeId,
      variantId: variantId,
      unitType: unitType,
      quantity: quantity,
    ),
  );

  Future<void> updateQuantity({
    required String lineId,
    required int quantity,
  }) => _mutate(
    (repository, _) =>
        repository.updateLineQuantity(lineId: lineId, quantity: quantity),
  );

  Future<void> removeLine(String lineId) => _mutate(
    (repository, storeId) =>
        repository.removeLine(storeId: storeId, lineId: lineId),
  );

  Future<void> clear() =>
      _mutate((repository, storeId) => repository.clearCart(storeId));

  Future<void> refresh() async {
    final storeId = _requireStoreId();
    state = AsyncData(
      await ref.read(cartRepositoryProvider).fetchCart(storeId),
    );
  }

  /// Runs a mutation and adopts the returned cart. Failures propagate to the
  /// caller (so a screen can show a snack bar) *and* leave the previous cart
  /// on screen rather than blanking it.
  Future<void> _mutate(
    Future<Cart> Function(CartRepository repository, String storeId) action,
  ) async {
    final storeId = _requireStoreId();
    final repository = ref.read(cartRepositoryProvider);
    final cart = await action(repository, storeId);
    state = AsyncData(cart);
  }

  String _requireStoreId() {
    final storeId = ref.read(selectedStoreIdProvider);
    if (storeId == null) {
      throw const Failure.unexpected(message: 'Choose a store first.');
    }
    return storeId;
  }
}

/// Badge count for the app bar. Zero while the cart is loading or errored.
@riverpod
int cartLineCount(Ref ref) =>
    ref.watch(cartControllerProvider).value?.lines.length ?? 0;
