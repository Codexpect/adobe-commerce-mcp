import { z } from "zod";
import { productSkuSchema, websiteIdSchema } from "../../../core/validation-schemas";

/**
 * Schema for setting tier prices for products
 *
 * Tier prices provide quantity-based discounts for products.
 * Different prices are set for different quantity levels.
 *
 * Required fields:
 * - prices: Array of tier price objects with price, price_type, website_id, sku, customer_group, and quantity
 *
 * Supported product types:
 * - Simple products
 * - Virtual products
 * - Downloadable products
 * - Bundle products
 */
export const setTierPricesInputSchema = {
  prices: z
    .array(
      z.object({
        price: z.number().positive("Price must be positive").describe("Tier price value (e.g., 19.99)."),
        price_type: z.enum(["fixed", "discount"]).describe("Price type: 'fixed' for absolute price or 'discount' for percentage discount."),
        website_id: websiteIdSchema,
        sku: productSkuSchema,
        customer_group: z.string().min(1, "Customer group cannot be empty").describe("Customer group identifier (e.g., 'General', 'Wholesale')."),
        quantity: z.number().int().positive("Quantity must be a positive integer").describe("Minimum quantity for this tier price (e.g., 5)."),
      })
    )
    .min(1, "At least one price must be provided")
    .describe("Array of tier price objects to set."),
} as const;

/**
 * Schema for replacing tier prices for products
 *
 * Removes all existing tier prices and replaces them with new ones.
 *
 * Required fields:
 * - prices: Array of tier price objects to replace existing ones
 */
export const replaceTierPricesInputSchema = {
  prices: z
    .array(
      z.object({
        price: z.number().positive("Price must be positive").describe("Tier price value (e.g., 19.99)."),
        price_type: z.enum(["fixed", "discount"]).describe("Price type: 'fixed' for absolute price or 'discount' for percentage discount."),
        website_id: websiteIdSchema,
        sku: productSkuSchema,
        customer_group: z.string().min(1, "Customer group cannot be empty").describe("Customer group identifier (e.g., 'General', 'Wholesale')."),
        quantity: z.number().int().positive("Quantity must be a positive integer").describe("Minimum quantity for this tier price (e.g., 5)."),
      })
    )
    .min(1, "At least one price must be provided")
    .describe("Array of tier price objects to replace existing ones."),
} as const;

/**
 * Schema for deleting tier prices for products
 *
 * Removes specific tier prices for the specified products.
 *
 * Required fields:
 * - prices: Array of tier price objects to delete (must match existing tier prices)
 */
export const deleteTierPricesInputSchema = {
  prices: z
    .array(
      z.object({
        price: z.number().positive("Price must be positive").describe("Tier price value to delete (e.g., 19.99)."),
        price_type: z.enum(["fixed", "discount"]).describe("Price type: 'fixed' for absolute price or 'discount' for percentage discount."),
        website_id: websiteIdSchema,
        sku: productSkuSchema,
        customer_group: z.string().min(1, "Customer group cannot be empty").describe("Customer group identifier (e.g., 'General', 'Wholesale')."),
        quantity: z.number().int().positive("Quantity must be a positive integer").describe("Minimum quantity for this tier price (e.g., 5)."),
      })
    )
    .min(1, "At least one price must be provided")
    .describe("Array of tier price objects to delete."),
} as const;

/**
 * Schema for retrieving tier price information
 *
 * Returns tier prices for the specified SKUs.
 *
 * Required fields:
 * - skus: Array of product SKUs to retrieve tier prices for
 */
export const getTierPricesInputSchema = {
  skus: z.array(productSkuSchema).min(1, "At least one SKU must be provided").describe("Array of product SKUs to retrieve tier prices for."),
} as const;
