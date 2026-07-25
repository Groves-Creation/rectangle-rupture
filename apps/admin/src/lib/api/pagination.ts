/**
 * Page sizes for the list endpoints.
 *
 * These live outside the `"use server"` action modules because such a module
 * may only export async functions — a plain `const` there is a build error.
 *
 * The dashboard does not paginate yet: the walking skeleton seeds 8 products
 * and a handful of orders, so one generous page is enough. When volume grows,
 * both endpoints already accept `limit`/`offset` per the contract.
 */
export const ORDERS_PAGE_SIZE = 100;
export const CATALOG_PAGE_SIZE = 100;
