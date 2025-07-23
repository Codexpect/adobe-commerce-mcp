import { z } from "zod";

/**
 * Validates category names
 * Ensures names are non-empty and contain safe characters
 */
export const categoryNameSchema = z
  .string()
  .min(1, "Category name cannot be empty")
  .max(255, "Category name cannot exceed 255 characters")
  .describe("Display name for the category (e.g., 'Electronics', 'Clothing').");

/**
 * Validates category IDs
 * Ensures IDs are positive numbers
 */
export const categoryIdSchema = z.number().positive("Category ID must be a positive number").describe("Unique identifier for the category.");

/**
 * Validates category positions
 * Ensures positions are non-negative numbers
 */
export const categoryPositionSchema = z
  .number()
  .describe("Display position/order of the category.");

/**
 * Validates boolean values
 * Ensures proper boolean type
 */
export const booleanSchema = z.boolean().describe("Boolean value (true/false).");

/**
 * Validates string arrays
 * Ensures arrays contain non-empty strings
 */
export const stringArraySchema = z.array(z.string().min(1, "Array item cannot be empty")).optional().describe("Array of strings.");

/**
 * Validates depth parameters for category trees
 * Ensures depth is a reasonable positive number
 */
export const depthSchema = z
  .number()
  .positive("Depth must be a positive number")
  .max(10, "Depth cannot exceed 10 levels")
  .describe("Depth of the category tree to retrieve (1-10).");
