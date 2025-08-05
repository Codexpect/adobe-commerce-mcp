import { z } from "zod";

/**
 * Common validation schemas for inventory management
 */

/**
 * Stock ID schema for multi-source inventory
 */
export const stockIdSchema = z
  .number()
  .int()
  .positive("Stock ID must be a positive integer")
  .describe("Stock ID for multi-source inventory (e.g., 1, 2)");

/**
 * Item ID schema for stock items
 */
export const itemIdSchema = z.number().int().positive("Item ID must be a positive integer").describe("Stock item ID (e.g., 1, 2)");

/**
 * Quantity schema for inventory quantities
 */
export const quantitySchema = z.number().min(0, "Quantity must be non-negative").describe("Product quantity (e.g., 10, 100.5)");

/**
 * Requested quantity schema for salability checks
 */
export const requestedQuantitySchema = z
  .number()
  .positive("Requested quantity must be positive")
  .describe("Requested quantity to check (e.g., 5, 10)");

/**
 * Stock status enum schema
 */
export const stockStatusSchema = z.number().int().min(0).max(1).describe("Stock status: 0=out of stock, 1=in stock");

/**
 * Backorders enum schema
 */
export const backordersSchema = z
  .number()
  .int()
  .min(0)
  .max(2)
  .describe("Backorders: 0=no backorders, 1=allow qty below 0, 2=allow qty below 0 and notify customer");

/**
 * Scope ID schema for store-specific operations
 */
export const scopeIdSchema = z
  .number()
  .int()
  .min(0, "Scope ID must be non-negative")
  .describe("Scope ID for store-specific operations (0 for global scope)");

/**
 * Page size schema with inventory-specific limits
 */
export const inventoryPageSizeSchema = z
  .number()
  .int()
  .min(1, "Page size must be at least 1")
  .max(100, "Page size cannot exceed 100")
  .default(10)
  .describe("Number of items per page (max 100)");

/**
 * Current page schema
 */
export const currentPageSchema = z.number().int().min(1, "Page must be at least 1").default(1).describe("Current page number");
