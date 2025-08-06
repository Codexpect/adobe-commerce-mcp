import { z } from "zod";
import { productSkuSchema } from "../../../core/validation-schemas";
import { quantitySchema, requestedQuantitySchema, stockIdSchema } from "../common/validation-schemas";

/**
 * SKU request schema for salability checks with quantities
 */
const skuRequestSchema = z
  .object({
    sku: productSkuSchema,
    qty: quantitySchema,
  })
  .describe("SKU and quantity pair for salability check");

/**
 * Schema for checking if products are salable
 *
 * Required fields:
 * - skus: Array of product SKUs to check
 * - stockId: Stock ID to check against
 */
export const areProductsSalableInputSchema = {
  skus: z.array(productSkuSchema).min(1, "At least one SKU is required").describe("Array of product SKUs to check"),
  stockId: stockIdSchema,
};

/**
 * Schema for checking if products are salable for requested quantities
 *
 * Required fields:
 * - skuRequests: Array of SKU and quantity pairs
 * - stockId: Stock ID to check against
 */
export const areProductsSalableForRequestedQtyInputSchema = {
  skuRequests: z.array(skuRequestSchema).min(1, "At least one SKU request is required").describe("Array of SKU and quantity pairs"),
  stockId: stockIdSchema,
};

/**
 * Schema for checking if a single product is salable
 *
 * Required fields:
 * - sku: Product SKU to check
 * - stockId: Stock ID to check against
 */
export const isProductSalableInputSchema = {
  sku: productSkuSchema,
  stockId: stockIdSchema,
};

/**
 * Schema for checking if a single product is salable for requested quantity
 *
 * Required fields:
 * - sku: Product SKU to check
 * - stockId: Stock ID to check against
 * - requestedQty: Requested quantity to check
 */
export const isProductSalableForRequestedQtyInputSchema = {
  sku: productSkuSchema,
  stockId: stockIdSchema,
  requestedQty: requestedQuantitySchema,
};

/**
 * Schema for getting product salable quantity
 *
 * Required fields:
 * - sku: Product SKU
 * - stockId: Stock ID to check against
 */
export const getProductSalableQuantityInputSchema = {
  sku: productSkuSchema,
  stockId: stockIdSchema,
};
