import { z } from "zod";
import { entityIdSchema, storeIdSchema } from "../../../core/validation-schemas";

/**
 * Validates option IDs for attribute options
 * Ensures IDs are non-empty strings
 */
export const optionIdSchema = z.string().min(1, "Option ID cannot be empty").describe("The option ID.");

/**
 * Validates labels and names throughout the system
 * Prevents empty strings that could cause display issues
 */
export const nonEmptyLabelSchema = z.string().min(1, "Label cannot be empty").describe("Display label.");

/**
 * Validates attribute set IDs
 * Ensures positive numbers to match valid Magento attribute set IDs
 */
export const attributeSetIdSchema = entityIdSchema.describe("ID of the attribute set.");

/**
 * Validates attribute group IDs
 * Ensures positive numbers to match valid Magento attribute group IDs
 */
export const attributeGroupIdSchema = entityIdSchema.describe("ID of the attribute group.");

/**
 * Validates sort order values
 * Allows zero and positive numbers for proper ordering
 */
export const sortOrderSchema = z.number().nonnegative("Sort order cannot be negative").describe("Sort order for positioning.");

/**
 * Store-specific labels schema for multi-store configurations
 * Used in attribute options and other store-specific content
 */
export const storeLabelsSchema = z
  .array(
    z.object({
      storeId: storeIdSchema.describe("Store ID for the label."),
      label: nonEmptyLabelSchema.describe("Store-specific label."),
    })
  )
  .optional()
  .describe("Store-specific labels.");
