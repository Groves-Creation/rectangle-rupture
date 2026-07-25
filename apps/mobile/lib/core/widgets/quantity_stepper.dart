import 'package:flutter/material.dart';

/// Big −/+ stepper with a prominent numeral.
///
/// Sized for gloves and a moving warehouse: both buttons are 56dp, well over
/// the 48dp minimum touch target, and the quantity is rendered in a large bold
/// tabular numeral so it is readable at arm's length.
class QuantityStepper extends StatelessWidget {
  const QuantityStepper({
    super.key,
    required this.value,
    required this.onChanged,
    this.min = 0,
    this.max = 9999,
    this.step = 1,
    this.enabled = true,
    this.semanticLabel = 'Quantity',
  });

  final int value;
  final ValueChanged<int> onChanged;
  final int min;
  final int max;
  final int step;
  final bool enabled;
  final String semanticLabel;

  static const double buttonSize = 56;

  bool get _canDecrease => enabled && value - step >= min;
  bool get _canIncrease => enabled && value + step <= max;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Semantics(
      label: semanticLabel,
      value: '$value',
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: scheme.outlineVariant),
          borderRadius: BorderRadius.circular(12),
          color: scheme.surfaceContainerLowest,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _StepButton(
              icon: Icons.remove,
              tooltip: 'Decrease',
              onPressed: _canDecrease ? () => onChanged(value - step) : null,
            ),
            ConstrainedBox(
              constraints: const BoxConstraints(minWidth: 64),
              child: Center(
                child: Text(
                  '$value',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                    fontFeatures: const [FontFeature.tabularFigures()],
                    color: enabled ? scheme.onSurface : scheme.onSurfaceVariant,
                  ),
                ),
              ),
            ),
            _StepButton(
              icon: Icons.add,
              tooltip: 'Increase',
              onPressed: _canIncrease ? () => onChanged(value + step) : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: QuantityStepper.buttonSize,
      height: QuantityStepper.buttonSize,
      child: IconButton(
        icon: Icon(icon, size: 26),
        tooltip: tooltip,
        onPressed: onPressed,
      ),
    );
  }
}
