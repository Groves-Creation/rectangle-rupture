import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/router.dart';
import '../domain/cart_controller.dart';

/// App-bar action showing how many lines are in the cart.
///
/// The count is a number as well as a badge colour, and the semantics label
/// spells it out for screen readers.
class CartButton extends ConsumerWidget {
  const CartButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartLineCountProvider);
    return IconButton(
      tooltip: 'Cart ($count)',
      onPressed: () => context.push(AppRoute.cart),
      icon: Badge(
        isLabelVisible: count > 0,
        label: Text('$count'),
        child: const Icon(Icons.shopping_cart_outlined),
      ),
    );
  }
}
