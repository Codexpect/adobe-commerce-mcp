import { z } from "zod";

export const createProductAttributeInputSchema = {
  type: z
    .enum(["text", "textarea", "boolean", "date", "integer", "decimal", "singleselect", "multiselect"])
    .describe("Logical type of the attribute (e.g., 'text', 'textarea', 'boolean', 'date', 'integer', 'decimal', 'singleselect', 'multiselect')."),
  attributeCode: z.string().describe("Unique code for the attribute (e.g., 'color', 'size')."),
  defaultFrontendLabel: z.string().describe("Default frontend label for the attribute (e.g., 'Color')."),
  scope: z.enum(["store", "website", "global"]).describe("Scope of the attribute: 'store', 'website', or 'global'."),
  options: z
    .array(
      z.object({
        label: z.string().describe("Display label for the option (e.g., 'Red')."),
        sortOrder: z.number().default(0).describe("Sort order for the option."),
        isDefault: z.boolean().default(false).describe("Whether this option is the default."),
      })
    )
    .optional()
    .describe("Options for select/multiselect attributes."),
};

export const createAttributeSetInputSchema = {
  attributeSetName: z.string().describe("Name of the new attribute set."),
  sortOrder: z.number().optional().describe("Sort order for the attribute set (optional)."),
};

export const updateAttributeSetInputSchema = {
  attributeSetId: z.number().describe("ID of the attribute set to update."),
  attributeSetName: z.string().optional().describe("New name for the attribute set (optional)."),
  sortOrder: z.number().optional().describe("New sort order for the attribute set (optional)."),
};

export const getAttributeSetByIdInputSchema = {
  attributeSetId: z.number().describe("ID of the attribute set to fetch."),
};

export const deleteAttributeSetInputSchema = {
  attributeSetId: z.number().describe("ID of the attribute set to delete."),
};

export const deleteAttributeFromSetInputSchema = {
  attributeSetId: z.number().describe("ID of the attribute set."),
  attributeCode: z.string().describe("Code of the attribute to remove from the set."),
};

export type CreateProductAttributeInput = z.infer<ReturnType<typeof z.object<typeof createProductAttributeInputSchema>>>;

export type CreateAttributeSetInput = z.infer<ReturnType<typeof z.object<typeof createAttributeSetInputSchema>>>;

export type UpdateAttributeSetInput = z.infer<ReturnType<typeof z.object<typeof updateAttributeSetInputSchema>>>;
