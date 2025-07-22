import { z } from "zod";
import { attributeCodeSchema } from "../../../core/validation-schemas";
import { nonEmptyLabelSchema, optionIdSchema, storeLabelsSchema } from "../common/validation-schemas";

/**
 * Schema for retrieving all options for a specific attribute
 */
export const getProductAttributeOptionsInputSchema = {
  attributeCode: attributeCodeSchema,
};

/**
 * Schema for adding a new option to an existing attribute
 *
 * Required fields:
 * - attributeCode: The attribute to add the option to
 * - label: Display text for the option
 *
 * Optional fields:
 * - sortOrder: Determines display order (defaults to 0)
 * - isDefault: Whether this should be the default selection
 * - storeLabels: Store-specific labels for multi-store setups
 */
export const addProductAttributeOptionInputSchema = {
  attributeCode: attributeCodeSchema,
  label: nonEmptyLabelSchema.describe("Display label for the option (e.g., 'Red')."),
  sortOrder: z.number().default(0).describe("Sort order for the option."),
  isDefault: z.boolean().default(false).describe("Whether this option is the default."),
  storeLabels: storeLabelsSchema,
};

/**
 * Schema for updating an existing attribute option
 *
 * Required fields:
 * - attributeCode: The attribute containing the option
 * - optionId: The specific option to update
 *
 * Optional fields:
 * - label: New display text for the option
 * - sortOrder: New display order
 * - isDefault: Whether this should be the default selection
 * - storeLabels: Updated store-specific labels
 */
export const updateProductAttributeOptionInputSchema = {
  attributeCode: attributeCodeSchema,
  optionId: optionIdSchema.describe("The option ID to update."),
  label: nonEmptyLabelSchema.optional().describe("Display label for the option (e.g., 'Red')."),
  sortOrder: z.number().optional().describe("Sort order for the option."),
  isDefault: z.boolean().optional().describe("Whether this option is the default."),
  storeLabels: storeLabelsSchema,
};

/**
 * Schema for deleting an attribute option
 *
 * Required fields:
 * - attributeCode: The attribute containing the option
 * - optionId: The specific option to delete
 */
export const deleteProductAttributeOptionInputSchema = {
  attributeCode: attributeCodeSchema,
  optionId: optionIdSchema.describe("The option ID to delete."),
};
