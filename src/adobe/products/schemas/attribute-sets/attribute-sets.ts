import { attributeCodeSchema } from "../../../core/validation-schemas";
import { attributeSetIdSchema, nonEmptyLabelSchema, sortOrderSchema } from "../common/validation-schemas";

/**
 * Schema for creating new attribute sets
 *
 * Required fields:
 * - attributeSetName: Display name for the attribute set
 *
 * Optional fields:
 * - sortOrder: Determines display order in admin (defaults based on creation order)
 */
export const createAttributeSetInputSchema = {
  attributeSetName: nonEmptyLabelSchema.describe("Name of the new attribute set."),
  sortOrder: sortOrderSchema.optional().describe("Sort order for the attribute set (optional)."),
};

/**
 * Schema for updating existing attribute sets
 *
 * Required fields:
 * - attributeSetId: The ID of the attribute set to update
 *
 * Optional fields:
 * - attributeSetName: New name for the attribute set
 * - sortOrder: New display order
 */
export const updateAttributeSetInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set to update."),
  attributeSetName: nonEmptyLabelSchema.optional().describe("New name for the attribute set (optional)."),
  sortOrder: sortOrderSchema.optional().describe("New sort order for the attribute set (optional)."),
};

/**
 * Schema for retrieving a specific attribute set by ID
 */
export const getAttributeSetByIdInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set to fetch."),
};

/**
 * Schema for retrieving all attributes belonging to an attribute set
 */
export const getAttributesFromSetInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set to get attributes from."),
};

/**
 * Schema for deleting an attribute set
 *
 * Required fields:
 * - attributeSetId: The ID of the attribute set to delete
 */
export const deleteAttributeSetInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set to delete."),
};

/**
 * Schema for removing an attribute from an attribute set
 *
 * Required fields:
 * - attributeSetId: The attribute set to modify
 * - attributeCode: The attribute to remove
 */
export const deleteAttributeFromSetInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set."),
  attributeCode: attributeCodeSchema.describe("Code of the attribute to remove from the set."),
};
