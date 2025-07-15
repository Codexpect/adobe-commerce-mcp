import { z } from "zod";

export const createProductAttributeInputSchema = {
  type: z.enum([
    "text", "textarea", "boolean", "date", "integer", "decimal", "singleselect", "multiselect"
  ]).describe("Logical type of the attribute (e.g., 'text', 'textarea', 'boolean', 'date', 'integer', 'decimal', 'singleselect', 'multiselect')."),
  attribute_code: z.string().describe("Unique code for the attribute (e.g., 'color', 'size')."),
  default_frontend_label: z.string().describe("Default frontend label for the attribute (e.g., 'Color')."),
  scope: z.enum(["store", "website", "global"]).describe("Scope of the attribute: 'store', 'website', or 'global'."),
  options: z.array(
    z.object({
      label: z.string().describe("Display label for the option (e.g., 'Red')."),
      sort_order: z.number().default(0).describe("Sort order for the option."),
      is_default: z.boolean().default(false).describe("Whether this option is the default."),
    })
  ).optional().describe("Options for select/multiselect attributes."),
};

export type CreateProductAttributeInput = z.infer<ReturnType<typeof z.object<typeof createProductAttributeInputSchema>>>;
