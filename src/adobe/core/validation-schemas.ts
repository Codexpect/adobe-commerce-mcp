import { z } from "zod";

/**
 * Validates attribute codes
 * Ensures codes are non-empty and contain only safe characters
 */
export const attributeCodeSchema = z
  .string()
  .min(1, "Attribute code cannot be empty")
  .regex(/^[a-zA-Z0-9_]+$/, "Attribute code can only contain letters, numbers, and underscores")
  .describe("Unique code for the attribute (e.g., 'color', 'size').");

/**
 * Validates product SKUs
 * Ensures SKUs are non-empty strings
 */
export const productSkuSchema = z
  .string()
  .min(1, "Product SKU cannot be empty")
  .describe("Product SKU (Stock Keeping Unit).");

/**
 * Validates sort directions
 * Ensures only valid sort directions are used
 */
export const sortDirectionSchema = z
  .enum(["ASC", "DESC"])
  .describe("Sort direction: ASC (ascending) or DESC (descending).");

/**
 * Validates store IDs for multi-store configurations
 * Ensures positive numbers to match valid Magento store IDs
 */
export const storeIdSchema = z
  .number()
  .positive("Store ID must be a positive number")
  .describe("Store ID for multi-store configurations."); 