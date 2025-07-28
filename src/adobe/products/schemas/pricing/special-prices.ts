import { z } from "zod";
import { productSkuSchema, storeIdSchema } from "../../../core/validation-schemas";

/**
 * Schema for setting special prices for products
 *
 * Special prices allow temporary price reductions for products.
 * These prices have start and end dates for when they are active.
 *
 * Required fields:
 * - prices: Array of special price objects with price, store_id, sku, price_from, and price_to
 *
 * Supported product types:
 * - Simple products
 * - Bundle products
 * - Virtual products
 * - Downloadable products
 */
export const setSpecialPricesInputSchema = {
  prices: z
    .array(
      z.object({
        price: z.number().positive("Price must be positive").describe("Special price value (e.g., 24.99)."),
        store_id: storeIdSchema,
        sku: productSkuSchema,
        price_from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Date format must be YYYY-MM-DD HH:MM:SS")
          .describe("Start date for special price in Y-m-d H:i:s format (e.g., '2024-01-01 00:00:00')."),
        price_to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Date format must be YYYY-MM-DD HH:MM:SS")
          .describe("End date for special price in Y-m-d H:i:s format (e.g., '2024-12-31 23:59:59')."),
      })
    )
    .min(1, "At least one price must be provided")
    .describe("Array of special price objects to set."),
} as const;

/**
 * Schema for deleting special prices for products
 *
 * Removes special prices for the specified products.
 *
 * Required fields:
 * - prices: Array of special price objects to delete (must match existing special prices)
 */
export const deleteSpecialPricesInputSchema = {
  prices: z
    .array(
      z.object({
        price: z.number().positive("Price must be positive").describe("Special price value to delete (e.g., 24.99)."),
        store_id: storeIdSchema,
        sku: productSkuSchema,
        price_from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Date format must be YYYY-MM-DD HH:MM:SS")
          .optional()
          .describe("Start date for special price in Y-m-d H:i:s format (e.g., '2024-01-01 00:00:00')."),
        price_to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "Date format must be YYYY-MM-DD HH:MM:SS")
          .optional()
          .describe("End date for special price in Y-m-d H:i:s format (e.g., '2024-12-31 23:59:59')."),
      })
    )
    .min(1, "At least one price must be provided")
    .describe("Array of special price objects to delete."),
} as const;

/**
 * Schema for retrieving special price information
 *
 * Returns special prices for the specified SKUs.
 *
 * Required fields:
 * - skus: Array of product SKUs to retrieve special prices for
 */
export const getSpecialPricesInputSchema = {
  skus: z.array(productSkuSchema).min(1, "At least one SKU must be provided").describe("Array of product SKUs to retrieve special prices for."),
} as const;
