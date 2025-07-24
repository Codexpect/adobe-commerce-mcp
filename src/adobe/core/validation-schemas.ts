import { z } from "zod";

/**
 * Validates entity IDs
 * Ensures IDs are positive numbers for all Adobe Commerce entities
 */
export const entityIdSchema = z
  .number()
  .positive("Entity ID must be a positive number")
  .describe("Unique identifier for Adobe Commerce entities (categories, products, customers, orders, etc.).");

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

/**
 * Validates website IDs
 * Ensures IDs are positive integers for website references
 */
export const websiteIdSchema = z
  .number()
  .int()
  .positive("Website ID must be a positive integer")
  .describe("Website ID (e.g., 1)");

/**
 * Validates store group IDs
 * Ensures IDs are positive integers for store group references
 */
export const storeGroupIdSchema = z
  .number()
  .int()
  .positive("Store Group ID must be a positive integer")
  .describe("Store Group ID (e.g., 1)");

/**
 * Validates store codes
 * Ensures codes contain only lowercase letters, numbers, and underscores
 */
export const storeCodeSchema = z
  .string()
  .min(1, "Store code cannot be empty")
  .regex(/^[a-z0-9_]+$/, "Store code can only contain lowercase letters, numbers, and underscores")
  .describe("Store code (e.g., 'default', 'en_us')");

/**
 * Validates website codes
 * Ensures codes contain only lowercase letters, numbers, and underscores
 */
export const websiteCodeSchema = z
  .string()
  .min(1, "Website code cannot be empty")
  .regex(/^[a-z0-9_]+$/, "Website code can only contain lowercase letters, numbers, and underscores")
  .describe("Website code (e.g., 'base', 'main')");

/**
 * Validates store group codes
 * Ensures codes contain only lowercase letters, numbers, and underscores
 */
export const storeGroupCodeSchema = z
  .string()
  .min(1, "Store group code cannot be empty")
  .regex(/^[a-z0-9_]+$/, "Store group code can only contain lowercase letters, numbers, and underscores")
  .describe("Store group code (e.g., 'main_website_store')"); 