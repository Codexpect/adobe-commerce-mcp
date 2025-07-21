import { z } from "zod";
import { attributeCodeSchema, nonEmptyLabelSchema, optionIdSchema, storeLabelsSchema } from "../common/validation-schemas";

/**
 * Product Attribute Options Schemas
 *
 * These schemas manage the individual options/values available for select and multiselect attributes.
 * For example, a "Color" attribute might have options like "Red", "Blue", "Green".
 */

/**
 * Schema for retrieving all options for a specific attribute
 *
 * Used for: GET /products/attributes/{attributeCode}/options
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
 *
 * Note: Deleting an option that is currently used by products may cause data issues.
 * Consider checking for usage before deletion.
 */
export const deleteProductAttributeOptionInputSchema = {
  attributeCode: attributeCodeSchema,
  optionId: optionIdSchema.describe("The option ID to delete."),
};
