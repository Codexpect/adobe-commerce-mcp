import { z } from "zod";
import { productSkuSchema, storeIdSchema } from "../../../core/validation-schemas";

/**
 * Schema for setting base prices for products
 *
 * Base prices are the standard prices of products before any discounts or special pricing.
 * This endpoint allows setting base prices for multiple products efficiently.
 *
 * Required fields:
 * - prices: Array of base price objects with price, store_id, and sku
 *
 * Supported product types:
 * - Simple products
 * - Virtual products
 * - Downloadable products
 * - Bundle products (fixed price type only)
 */
export const setBasePricesInputSchema = {
  prices: z
    .array(
      z.object({
        price: z.number().positive("Price must be positive").describe("Base price value (e.g., 29.99)."),
        store_id: storeIdSchema,
        sku: productSkuSchema,
      })
    )
    .min(1, "At least one price must be provided")
    .describe("Array of base price objects to set."),
} as const;

/**
 * Schema for retrieving base price information
 *
 * Returns base prices for the specified SKUs.
 *
 * Required fields:
 * - skus: Array of product SKUs to retrieve prices for
 */
export const getBasePricesInputSchema = {
  skus: z.array(productSkuSchema).min(1, "At least one SKU must be provided").describe("Array of product SKUs to retrieve base prices for."),
} as const;
