import { attributeCodeSchema } from "../../../core/validation-schemas";

/**
 * Schema for retrieving a specific category attribute by code
 * Required fields:
 * - attributeCode: The attribute code to retrieve
 */
export const getCategoryAttributeByCodeInputSchema = {
  attributeCode: attributeCodeSchema.describe("Attribute code to retrieve (e.g., 'name', 'is_active')."),
};

/**
 * Schema for retrieving options for a specific category attribute
 * Required fields:
 * - attributeCode: The attribute code to get options for
 */
export const getCategoryAttributeOptionsInputSchema = {
  attributeCode: attributeCodeSchema.describe("Attribute code to get options for (e.g., 'is_active')."),
};
