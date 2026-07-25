import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/auth/session_controller.dart';
import '../features/authentication/presentation/login_screen.dart';
import '../features/authentication/presentation/store_picker_screen.dart';
import '../features/cart/presentation/cart_screen.dart';
import '../features/catalog/presentation/catalog_list_screen.dart';
import '../features/catalog/presentation/product_detail_screen.dart';
import '../features/orders/presentation/order_confirmation_screen.dart';
import '../features/orders/presentation/order_detail_screen.dart';
import '../features/orders/presentation/order_list_screen.dart';

/// Every location in the app. Nothing constructs a path string by hand.
abstract final class AppRoute {
  static const String login = '/login';
  static const String stores = '/stores';
  static const String catalog = '/catalog';
  static const String cart = '/cart';
  static const String orders = '/orders';

  static String productDetail(String variantId) => '/catalog/$variantId';
  static String orderDetail(String orderId) => '/orders/$orderId';
  static String orderConfirmation(String orderId) =>
      '/orders/$orderId/confirmation';
}

final routerProvider = Provider<GoRouter>((ref) {
  // GoRouter is not a Riverpod consumer, so session changes are pushed to it
  // through a Listenable rather than by rebuilding the router (which would
  // throw away the navigation stack).
  final refresh = ValueNotifier<int>(0);
  ref.listen(sessionControllerProvider, (_, _) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: AppRoute.catalog,
    refreshListenable: refresh,
    redirect: (context, state) {
      final session = ref.read(sessionControllerProvider).value;
      final location = state.matchedLocation;

      if (session == null || !session.isAuthenticated) {
        return location == AppRoute.login ? null : AppRoute.login;
      }
      // A user with exactly one store never sees the picker: the session
      // controller has already selected it.
      if (session.needsStoreSelection) {
        return location == AppRoute.stores ? null : AppRoute.stores;
      }
      if (location == AppRoute.login) return AppRoute.catalog;
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoute.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoute.stores,
        builder: (context, state) => const StorePickerScreen(),
      ),
      GoRoute(
        path: AppRoute.catalog,
        builder: (context, state) => const CatalogListScreen(),
        routes: [
          GoRoute(
            path: ':variantId',
            builder: (context, state) => ProductDetailScreen(
              variantId: state.pathParameters['variantId']!,
            ),
          ),
        ],
      ),
      GoRoute(
        path: AppRoute.cart,
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: AppRoute.orders,
        builder: (context, state) => const OrderListScreen(),
        routes: [
          GoRoute(
            path: ':orderId',
            builder: (context, state) =>
                OrderDetailScreen(orderId: state.pathParameters['orderId']!),
            routes: [
              GoRoute(
                path: 'confirmation',
                builder: (context, state) => OrderConfirmationScreen(
                  orderId: state.pathParameters['orderId']!,
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
