import { attributeCodeSchema } from "../common/validation-schemas";

/**
 * Category Attributes Schemas
 *
 * These schemas define the validation rules for managing category attributes in Adobe Commerce.
 * Category attributes define the properties that can be assigned to categories.
 */

/**
 * Schema for retrieving a specific category attribute by code
 * 
 * Used for: GET /categories/attributes/{attributeCode}
 */
export const getCategoryAttributeByCodeInputSchema = {
  attributeCode: attributeCodeSchema.describe("Attribute code to retrieve (e.g., 'name', 'is_active')."),
};

/**
 * Schema for retrieving options for a specific category attribute
 * 
 * Used for: GET /categories/attributes/{attributeCode}/options
 */
export const getCategoryAttributeOptionsInputSchema = {
  attributeCode: attributeCodeSchema.describe("Attribute code to get options for (e.g., 'is_active')."),
}; 