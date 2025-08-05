import { z } from "zod";
import { entityIdSchema, productSkuSchema } from "../../../core/validation-schemas";
import { quantitySchema } from "../common/validation-schemas";

/**
 * Schema for source selection algorithm request
 *
 * Required fields:
 * - inventory_request: Request object with stock ID and items
 * - algorithm_code: Code of the algorithm to use
 *
 * Inventory request contains:
 * - stock_id: ID of the stock to select from
 * - items: Array of items with SKU and requested quantity
 */
export const sourceSelectionAlgorithmInputSchema = {
  inventory_request: z.object({
    stock_id: entityIdSchema.describe("Unique identifier of the stock to select sources from."),
    items: z.array(z.object({
      sku: productSkuSchema.describe("Product SKU to request."),
      qty: quantitySchema.describe("Requested quantity for the product.")
    })).min(1, "At least one item is required").describe("Array of items with SKU and requested quantities.")
  }).describe("Inventory request containing stock ID and items."),
  algorithm_code: z.string().min(1, "Algorithm code is required").describe("Code of the source selection algorithm to use (e.g., 'priority', 'distance').")
};