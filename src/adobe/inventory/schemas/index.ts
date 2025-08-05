// Common validation schemas
export * from "./common/validation-schemas";

// Stock Items management
export * from "./stock-items/stock-items";

// Stock Status management
export * from "./stock-status/stock-status";

// Salability checks
export * from "./salability/salability";

// TypeScript type definitions
export * from "./types";

/**
 * Quick Reference Guide:
 *
 * Stock Items:
 * - getStockItemInputSchema: Get stock information for a product
 * - updateStockItemInputSchema: Update stock item information
 * - getLowStockItemsInputSchema: Get products with low inventory
 *
 * Stock Status:
 * - getStockStatusInputSchema: Get stock status for a product
 *
 * Salability Checks:
 * - areProductsSalableInputSchema: Check if products are salable
 * - areProductsSalableForRequestedQtyInputSchema: Check salability for quantities
 * - isProductSalableInputSchema: Check if single product is salable
 * - isProductSalableForRequestedQtyInputSchema: Check salability for quantity
 * - getProductSalableQuantityInputSchema: Get salable quantity for product
 */