// Common validation schemas
export * from "./common/validation-schemas";

// Stock Items management
export * from "./stock-items/stock-items";

// Stock Status management
export * from "./stock-status/stock-status";

// Salability checks
export * from "./salability/salability";

// Stocks management
export * from "./stocks/stocks";

// Sources management
export * from "./sources/sources";

// Stock-Source Links management
export * from "./stock-source-links/stock-source-links";

// Source Selection algorithms
export * from "./source-selection/source-selection";

// Source Items management
export * from "./source-items/source-items";

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
 *
 * Stocks:
 * - createStockInputSchema: Create new stock
 * - updateStockInputSchema: Update existing stock
 * - getStockByIdInputSchema: Get stock by ID
 * - deleteStockInputSchema: Delete stock
 * - resolveStockInputSchema: Resolve stock by sales channel
 *
 * Sources:
 * - createSourceInputSchema: Create new inventory source
 * - updateSourceInputSchema: Update existing source
 * - getSourceByCodeInputSchema: Get source by code
 *
 * Stock-Source Links:
 * - createStockSourceLinksInputSchema: Create stock-source links
 * - deleteStockSourceLinksInputSchema: Delete stock-source links
 *
 * Source Selection:
 * - sourceSelectionAlgorithmInputSchema: Run source selection algorithm
 *
 * Source Items:
 * - createSourceItemInputSchema: Create new source items
 * - deleteSourceItemInputSchema: Remove source items
 */