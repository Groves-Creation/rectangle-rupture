/// Fixed-point money.
///
/// The API sends and receives money as **strings with 4 decimal places**
/// (`"12.5000"`). Those strings are what we store and what we put back on the
/// wire — they are never turned into a `double`, because binary floating point
/// cannot represent tenths exactly and totals drift.
///
/// [Money] exists only so the UI can add up and format values. It is a plain
/// integer count of 1/10000ths, so arithmetic is exact.
class Money implements Comparable<Money> {
  const Money.fromScaled(this.scaled);

  /// Decimal places carried on the wire.
  static const int decimals = 4;
  static const int _factor = 10000;

  static const Money zero = Money.fromScaled(0);

  /// Value in 1/10000ths of a currency unit.
  final int scaled;

  /// Parses a contract money string. Throws [FormatException] if [value] is
  /// not a decimal number.
  factory Money.parse(String value) {
    final parsed = Money.tryParse(value);
    if (parsed == null) {
      throw FormatException('Not a money value', value);
    }
    return parsed;
  }

  /// Lenient parse: returns `null` instead of throwing.
  static Money? tryParse(String? value) {
    if (value == null) return null;
    final text = value.trim();
    if (text.isEmpty) return null;

    var negative = false;
    var body = text;
    if (body.startsWith('-')) {
      negative = true;
      body = body.substring(1);
    } else if (body.startsWith('+')) {
      body = body.substring(1);
    }
    if (body.isEmpty) return null;

    final dot = body.indexOf('.');
    final wholePart = dot == -1 ? body : body.substring(0, dot);
    var fractionPart = dot == -1 ? '' : body.substring(dot + 1);
    if (fractionPart.contains('.')) return null;
    if (wholePart.isEmpty && fractionPart.isEmpty) return null;
    if (!_isDigits(wholePart) || !_isDigits(fractionPart)) return null;

    // Round half-up at the 4th decimal if the server ever sends more.
    var roundUp = false;
    if (fractionPart.length > decimals) {
      roundUp = fractionPart.codeUnitAt(decimals) >= 0x35; // '5'
      fractionPart = fractionPart.substring(0, decimals);
    }
    fractionPart = fractionPart.padRight(decimals, '0');

    final whole = wholePart.isEmpty ? 0 : int.tryParse(wholePart);
    final fraction = int.tryParse(fractionPart);
    if (whole == null || fraction == null) return null;

    var scaled = whole * _factor + fraction;
    if (roundUp) scaled += 1;
    return Money.fromScaled(negative ? -scaled : scaled);
  }

  static bool _isDigits(String value) {
    for (var i = 0; i < value.length; i++) {
      final code = value.codeUnitAt(i);
      if (code < 0x30 || code > 0x39) return false;
    }
    return true;
  }

  /// Sums money strings, skipping anything unparseable.
  static Money sumOf(Iterable<String> values) {
    var total = 0;
    for (final value in values) {
      total += (Money.tryParse(value) ?? Money.zero).scaled;
    }
    return Money.fromScaled(total);
  }

  Money operator +(Money other) => Money.fromScaled(scaled + other.scaled);

  Money operator -(Money other) => Money.fromScaled(scaled - other.scaled);

  /// Money times a whole quantity. There is no `Money * Money`.
  Money operator *(int quantity) => Money.fromScaled(scaled * quantity);

  bool operator >=(Money other) => scaled >= other.scaled;
  bool operator <=(Money other) => scaled <= other.scaled;
  bool operator >(Money other) => scaled > other.scaled;
  bool operator <(Money other) => scaled < other.scaled;

  bool get isZero => scaled == 0;
  bool get isNegative => scaled < 0;

  /// The exact 4-decimal representation the API expects.
  String toWire() {
    final sign = scaled < 0 ? '-' : '';
    final abs = scaled.abs();
    final whole = abs ~/ _factor;
    final fraction = (abs % _factor).toString().padLeft(decimals, '0');
    return '$sign$whole.$fraction';
  }

  /// Human display, rounded half-up to [fractionDigits] and grouped in
  /// thousands: `1234.5000` becomes `$1,234.50`.
  String format({String symbol = r'$', int fractionDigits = 2}) {
    assert(fractionDigits >= 0 && fractionDigits <= decimals);
    final sign = scaled < 0 ? '-' : '';
    var abs = scaled.abs();

    final divisor = _pow10(decimals - fractionDigits);
    if (divisor > 1) {
      final remainder = abs % divisor;
      abs = abs ~/ divisor;
      if (remainder * 2 >= divisor) abs += 1;
    }

    final unitFactor = _pow10(fractionDigits);
    final whole = abs ~/ unitFactor;
    final fraction = (abs % unitFactor).toString().padLeft(fractionDigits, '0');
    final grouped = _group(whole.toString());
    return fractionDigits == 0
        ? '$sign$symbol$grouped'
        : '$sign$symbol$grouped.$fraction';
  }

  static int _pow10(int exponent) {
    var result = 1;
    for (var i = 0; i < exponent; i++) {
      result *= 10;
    }
    return result;
  }

  static String _group(String digits) {
    final buffer = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(',');
      buffer.write(digits[i]);
    }
    return buffer.toString();
  }

  @override
  int compareTo(Money other) => scaled.compareTo(other.scaled);

  @override
  bool operator ==(Object other) => other is Money && other.scaled == scaled;

  @override
  int get hashCode => scaled.hashCode;

  @override
  String toString() => 'Money(${toWire()})';
}

/// Formats a raw contract money string for display, falling back to the raw
/// string when it cannot be parsed (never crash a screen over a price).
String formatMoney(String? value, {String symbol = r'$'}) {
  final money = Money.tryParse(value);
  if (money == null) return value ?? '—';
  return money.format(symbol: symbol);
}
