/** Base for errors the API layer is expected to translate into HTTP responses. */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/**
 * Raised when a movement would drive a balance below zero. Spec 22 requires
 * this to be loud, never a silent clamp to zero.
 */
export class InsufficientInventoryError extends DomainError {
  constructor(
    readonly productVariantId: string,
    readonly locationId: string,
    readonly requested: number,
    readonly available: number,
  ) {
    super(
      `Insufficient inventory for variant ${productVariantId} at location ${locationId}: requested ${requested}, available ${available}`,
      "INSUFFICIENT_INVENTORY",
    );
  }
}

/** A movement was submitted with quantity 0, which carries no information. */
export class InvalidMovementError extends DomainError {
  constructor(message: string) {
    super(message, "INVALID_MOVEMENT");
  }
}
