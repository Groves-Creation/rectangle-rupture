/// JSON exactly as `documentation/api/contract.md` describes it.
///
/// Every fixture uses `imageUrl: null` on purpose so widget tests never
/// construct a `CachedNetworkImage` (which would need the path_provider and
/// sqflite plugins that are unavailable in a pure widget test).
library;

const String storeOneId = 'a0000000-0000-4000-8000-000000000001';
const String storeTwoId = 'a0000000-0000-4000-8000-000000000002';
const String variantOneId = 'b0000000-0000-4000-8000-000000000001';
const String cartLineOneId = 'c0000000-0000-4000-8000-000000000001';
const String orderOneId = 'd0000000-0000-4000-8000-000000000001';

Map<String, dynamic> userJson() => <String, dynamic>{
  'id': 'e0000000-0000-4000-8000-000000000001',
  'email': 'manager@lit.test',
  'fullName': 'Dana Reyes',
  'roles': <String>['store_manager'],
};

Map<String, dynamic> storeJson({
  String id = storeOneId,
  String code = 'STR-001',
  String name = 'Downtown',
}) => <String, dynamic>{'id': id, 'code': code, 'name': name, 'type': 'store'};

/// `POST /api/auth/login` and `POST /api/auth/refresh` response.
Map<String, dynamic> loginJson({
  String accessToken = 'access-1',
  String refreshToken = 'refresh-1',
  List<Map<String, dynamic>>? stores,
}) => <String, dynamic>{
  'accessToken': accessToken,
  'refreshToken': refreshToken,
  'expiresIn': 900,
  'user': userJson(),
  'stores': stores ?? <Map<String, dynamic>>[storeJson()],
};

/// `GET /api/auth/me` response.
Map<String, dynamic> meJson({List<Map<String, dynamic>>? stores}) =>
    <String, dynamic>{
      'user': userJson(),
      'stores': stores ?? <Map<String, dynamic>>[storeJson()],
    };

Map<String, dynamic> catalogItemJson({
  String variantId = variantOneId,
  String name = 'Sparkling Water',
  bool detail = false,
}) => <String, dynamic>{
  'variantId': variantId,
  'productId': 'f0000000-0000-4000-8000-000000000001',
  'name': name,
  'variantName': 'Blue Razz',
  'sku': 'SKU-0001',
  'brandName': 'Lit Beverages',
  'categoryName': 'Drinks',
  'imageUrl': null,
  'unitPrice': '3.5000',
  'casePrice': '38.0000',
  'unitsPerCase': 12,
  'minimumOrderQuantity': 1,
  'availableAtWarehouse': 240,
  'isAgeRestricted': false,
  if (detail) ...<String, dynamic>{
    'description': 'Lightly carbonated, 12oz can.',
    'barcodes': <String>['012345678905'],
    'warehouseId': '90000000-0000-4000-8000-000000000001',
  },
};

Map<String, dynamic> catalogPageJson() => <String, dynamic>{
  'items': <Map<String, dynamic>>[
    catalogItemJson(),
    catalogItemJson(
      variantId: 'b0000000-0000-4000-8000-000000000002',
      name: 'Energy Drink',
    ),
  ],
  'total': 2,
  'limit': 50,
  'offset': 0,
};

Map<String, dynamic> cartLineJson({
  String id = cartLineOneId,
  int quantity = 2,
  String lineTotal = '76.0000',
  bool exceedsAvailable = false,
}) => <String, dynamic>{
  'id': id,
  'variantId': variantOneId,
  'name': 'Sparkling Water',
  'variantName': 'Blue Razz',
  'sku': 'SKU-0001',
  'imageUrl': null,
  'unitType': 'case',
  'unitsPerPack': 12,
  'quantity': quantity,
  'unitPrice': '3.5000',
  'packPrice': '38.0000',
  'lineTotal': lineTotal,
  'availableAtWarehouse': 240,
  'exceedsAvailable': exceedsAvailable,
};

Map<String, dynamic> cartJson({
  List<Map<String, dynamic>>? lines,
  String subtotal = '76.0000',
  String orderMinimum = '100.0000',
  bool meetsMinimum = false,
}) => <String, dynamic>{
  'cartId': '10000000-0000-4000-8000-000000000001',
  'storeId': storeOneId,
  'lines': lines ?? <Map<String, dynamic>>[cartLineJson()],
  'subtotal': subtotal,
  'orderMinimum': orderMinimum,
  'meetsMinimum': meetsMinimum,
};

Map<String, dynamic> orderSummaryJson({
  String id = orderOneId,
  String status = 'submitted',
}) => <String, dynamic>{
  'id': id,
  'orderNumber': 'LIT-000001',
  'storeId': storeOneId,
  'storeName': 'Downtown',
  'status': status,
  'orderTotal': '76.0000',
  'lineCount': 1,
  'submittedAt': '2026-07-25T18:00:00.000Z',
  'submittedByName': 'Dana Reyes',
};

Map<String, dynamic> orderPageJson() => <String, dynamic>{
  'items': <Map<String, dynamic>>[orderSummaryJson()],
  'total': 1,
  'limit': 20,
  'offset': 0,
};

Map<String, dynamic> orderDetailJson({
  String id = orderOneId,
  String status = 'inventory_allocated',
  bool fullyAllocated = true,
}) => <String, dynamic>{
  'id': id,
  'orderNumber': 'LIT-000001',
  'storeId': storeOneId,
  'storeName': 'Downtown',
  'warehouseId': '90000000-0000-4000-8000-000000000001',
  'warehouseName': 'Main DC',
  'status': status,
  'orderTotal': '76.0000',
  'notes': null,
  'submittedAt': '2026-07-25T18:00:00.000Z',
  'submittedByName': 'Dana Reyes',
  'approvedAt': '2026-07-25T18:30:00.000Z',
  'approvedByName': 'Sam Ortiz',
  'rejectionReason': null,
  'lines': <Map<String, dynamic>>[
    <String, dynamic>{
      'id': '20000000-0000-4000-8000-000000000001',
      'variantId': variantOneId,
      'sku': 'SKU-0001',
      'name': 'Sparkling Water',
      'unitType': 'case',
      'unitsPerPack': 12,
      'quantityOrdered': 2,
      'quantityAllocated': fullyAllocated ? 24 : 12,
      'unitPrice': '3.5000',
      'lineTotal': '76.0000',
      'fullyAllocated': fullyAllocated,
    },
  ],
  'statusHistory': <Map<String, dynamic>>[
    <String, dynamic>{
      'toStatus': 'submitted',
      'fromStatus': null,
      'changedByName': 'Dana Reyes',
      'notes': null,
      'createdAt': '2026-07-25T18:00:00.000Z',
    },
    <String, dynamic>{
      'toStatus': status,
      'fromStatus': 'submitted',
      'changedByName': 'Sam Ortiz',
      'notes': null,
      'createdAt': '2026-07-25T18:30:00.000Z',
    },
  ],
};

/// `POST /api/orders` wraps the detail shape in `{ "order": … }`.
Map<String, dynamic> orderEnvelopeJson({String status = 'submitted'}) =>
    <String, dynamic>{'order': orderDetailJson(status: status)};
