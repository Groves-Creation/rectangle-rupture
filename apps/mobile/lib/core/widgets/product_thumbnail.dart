import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

/// Product image with a stable footprint.
///
/// `imageUrl` is nullable in the contract, and a missing or broken image must
/// never shift the layout — the placeholder occupies exactly the same box.
class ProductThumbnail extends StatelessWidget {
  const ProductThumbnail({super.key, required this.imageUrl, this.size = 64});

  final String? imageUrl;
  final double size;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final radius = BorderRadius.circular(10);
    final url = imageUrl;

    return ClipRRect(
      borderRadius: radius,
      child: SizedBox(
        width: size,
        height: size,
        child: url == null || url.isEmpty
            ? _Placeholder(scheme: scheme, size: size)
            : CachedNetworkImage(
                imageUrl: url,
                fit: BoxFit.cover,
                placeholder: (context, _) =>
                    _Placeholder(scheme: scheme, size: size),
                errorWidget: (context, _, _) =>
                    _Placeholder(scheme: scheme, size: size),
              ),
      ),
    );
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder({required this.scheme, required this.size});

  final ColorScheme scheme;
  final double size;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: scheme.surfaceContainerHighest,
      child: Icon(
        Icons.inventory_2_outlined,
        size: size * 0.45,
        color: scheme.onSurfaceVariant,
      ),
    );
  }
}
