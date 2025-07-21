import { z } from "zod";
import {
  attributeCodeSchema,
  attributeSetIdSchema,
  nonEmptyLabelSchema,
  sortOrderSchema,
} from "../common/validation-schemas";

/**
 * Attribute Set Schemas
 * 
 * Attribute sets group related attributes together and determine which attributes
 * are available for products. For example, "Electronics" might include attributes
 * like "Brand", "Model", "Warranty", while "Clothing" might include "Size", "Color", "Material".
 */

/**
 * Schema for creating new attribute sets
 * 
 * Required fields:
 * - attributeSetName: Display name for the attribute set
 * 
 * Optional fields:
 * - sortOrder: Determines display order in admin (defaults based on creation order)
 * 
 * Note: New attribute sets are typically based on the "Default" attribute set skeleton
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
 * 
 * Used for: GET /products/attribute-sets/{attributeSetId}
 */
export const getAttributeSetByIdInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set to fetch."),
};

/**
 * Schema for retrieving all attributes belonging to an attribute set
 * 
 * Used for: GET /products/attribute-sets/{attributeSetId}/attributes
 */
export const getAttributesFromSetInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set to get attributes from."),
};

/**
 * Schema for deleting an attribute set
 * 
 * Required fields:
 * - attributeSetId: The ID of the attribute set to delete
 * 
 * Note: 
 * - Cannot delete the default attribute set (ID: 4)
 * - Cannot delete attribute sets that are currently used by products
 * - All products using this set must be reassigned before deletion
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
 * 
 * Note: Removing required attributes may cause issues with existing products
 */
export const deleteAttributeFromSetInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set."),
  attributeCode: attributeCodeSchema.describe("Code of the attribute to remove from the set."),
}; 