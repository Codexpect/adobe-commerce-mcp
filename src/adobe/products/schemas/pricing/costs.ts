import { z } from "zod";
import { productSkuSchema, storeIdSchema } from "../../../core/validation-schemas";

/**
 * Schema for setting cost values for products
 *
 * Cost values represent the actual cost of products to the business.
 * This information is useful for profit calculations and discount planning.
 *
 * Required fields:
 * - prices: Array of cost objects with cost, store_id, and sku
 *
 * Supported product types:
 * - Simple products
 * - Virtual products
 * - Downloadable products
 */
export const setCostsInputSchema = {
  prices: z
    .array(
      z.object({
        cost: z.number().positive("Cost must be positive").describe("Product cost value (e.g., 15.50)."),
        store_id: storeIdSchema,
        sku: productSkuSchema,
      })
    )
    .min(1, "At least one cost must be provided")
    .describe("Array of cost objects to set."),
} as const;

/**
 * Schema for deleting cost values for products
 *
 * Removes cost values for the specified products.
 *
 * Required fields:
 * - skus: Array of product SKUs to delete costs for
 */
export const deleteCostsInputSchema = {
  skus: z.array(productSkuSchema).min(1, "At least one SKU must be provided").describe("Array of product SKUs to delete costs for."),
} as const;

/**
 * Schema for retrieving cost information
 *
 * Returns cost values for the specified SKUs.
 *
 * Required fields:
 * - skus: Array of product SKUs to retrieve costs for
 */
export const getCostsInputSchema = {
  skus: z.array(productSkuSchema).min(1, "At least one SKU must be provided").describe("Array of product SKUs to retrieve costs for."),
} as const;
