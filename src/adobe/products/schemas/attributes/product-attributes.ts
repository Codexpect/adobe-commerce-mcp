import { z } from "zod";
import { attributeCodeSchema } from "../../../core/validation-schemas";
import { nonEmptyLabelSchema, storeLabelsSchema } from "../common/validation-schemas";

const attributeTypeEnum = z.enum(["text", "textarea", "boolean", "date", "integer", "decimal", "price", "weight", "singleselect", "multiselect"]);

const attributeScopeEnum = z.enum(["store", "website", "global"]);

const frontendInputEnum = z.enum(["text", "textarea", "boolean", "date", "select", "multiselect", "price"]);

/**
 * Schema for creating new product attributes
 *
 * Required fields:
 * - type: The logical type of attribute (affects storage and display)
 * - attributeCode: Unique identifier for the attribute
 * - defaultFrontendLabel: Display name for the attribute
 * - scope: Where the attribute values are managed
 *
 * Optional fields:
 * - options: For select/multiselect attributes, defines available choices
 */
export const createProductAttributeInputSchema = {
  type: attributeTypeEnum.describe(
    "Logical type of the attribute (e.g., 'text', 'textarea', 'boolean', 'date', 'integer', 'decimal', 'price', 'weight', 'singleselect', 'multiselect')."
  ),
  attributeCode: attributeCodeSchema,
  defaultFrontendLabel: nonEmptyLabelSchema.describe("Default frontend label for the attribute (e.g., 'Color')."),
  scope: attributeScopeEnum.describe("Scope of the attribute: 'store', 'website', or 'global'."),
  options: z
    .array(
      z.object({
        label: nonEmptyLabelSchema.describe("Display label for the option (e.g., 'Red')."),
        sortOrder: z.number().default(0).describe("Sort order for the option."),
        isDefault: z.boolean().default(false).describe("Whether this option is the default."),
        storeLabels: storeLabelsSchema,
      })
    )
    .optional()
    .describe("Options for select/multiselect attributes."),
};

/**
 * Schema for retrieving a product attribute by its code
 */
export const getProductAttributeByCodeInputSchema = {
  attributeCode: attributeCodeSchema,
};

/**
 * Schema for updating existing product attributes
 */
export const updateProductAttributeInputSchema = {
  attributeCode: attributeCodeSchema,
  defaultFrontendLabel: nonEmptyLabelSchema.optional().describe("Default frontend label for the attribute (e.g., 'Color')."),
  frontendInput: frontendInputEnum
    .optional()
    .describe("Frontend input type for the attribute. Note: Adobe Commerce may restrict changes to this field for existing attributes."),
  scope: attributeScopeEnum.optional().describe("Scope of the attribute: 'store', 'website', or 'global'."),
  options: z
    .array(
      z.object({
        label: nonEmptyLabelSchema.describe("Display label for the option (e.g., 'Red')."),
        sortOrder: z.number().default(0).describe("Sort order for the option."),
        isDefault: z.boolean().default(false).describe("Whether this option is the default."),
        storeLabels: storeLabelsSchema,
      })
    )
    .optional()
    .describe("Options for select/multiselect attributes."),
};

/**
 * Schema for deleting product attributes
 */
export const deleteProductAttributeInputSchema = {
  attributeCode: attributeCodeSchema,
};
