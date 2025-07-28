import { z } from "zod";

/**
 * Validates entity IDs
 * Ensures IDs are positive numbers for all Adobe Commerce entities
 */
export const entityIdSchema = z
  .number()
  .int()
  .positive("Entity ID must be a positive integer")
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
  .min(1, "SKU cannot be empty")
  .regex(/^[a-zA-Z0-9_-]+$/, "SKU can only contain letters, numbers, hyphens, and underscores")
  .describe("Stock Keeping Unit - unique identifier for the product (e.g., 'PROD-001', 'product_123').");

/**
 * Validates sort directions
 * Ensures only valid sort directions are used
 */
export const sortDirectionSchema = z.enum(["ASC", "DESC"]).describe("Sort direction: ASC (ascending) or DESC (descending).");

/**
 * Validates store IDs for multi-store configurations
 * Ensures non-negative numbers to match valid Magento store IDs (0 is valid for default store)
 */
export const storeIdSchema = z.number().int().min(0, "Store ID must be a non-negative integer").describe("Store ID for multi-store configurations (0 for default store).");

/**
 * Validates website IDs
 * Ensures IDs are non-negative integers for website references (0 is valid for default website)
 */
export const websiteIdSchema = z.number().int().min(0, "Website ID must be a non-negative integer").describe("Website ID (0 for default website, e.g., 1)");

/**
 * Validates store group IDs
 * Ensures IDs are non-negative integers for store group references (0 is valid for default store group)
 */
export const storeGroupIdSchema = z.number().int().min(0, "Store Group ID must be a non-negative integer").describe("Store Group ID (0 for default store group, e.g., 1)");

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
