import { productSkuSchema, websiteIdSchema } from "../../../core/validation-schemas";

/**
 * Schema for assigning product to website
 *
 * Required fields:
 * - sku: Product SKU to assign
 * - website_id: Website ID to assign product to
 */
export const assignProductToWebsiteInputSchema = {
  sku: productSkuSchema,
  website_id: websiteIdSchema,
};

/**
 * Schema for removing product from website
 *
 * Required fields:
 * - sku: Product SKU to unassign
 * - website_id: Website ID to remove product from
 */
export const removeProductFromWebsiteInputSchema = {
  sku: productSkuSchema,
  website_id: websiteIdSchema,
};
