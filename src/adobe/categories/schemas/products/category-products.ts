import { z } from "zod";
import { productSkuSchema } from "../../../core/validation-schemas";
import { categoryIdSchema, categoryPositionSchema } from "../common/validation-schemas";

/**
 * Schema for retrieving products assigned to a specific category
 *
 * Required fields:
 * - categoryId: Category ID to get products for
 */
export const getCategoryProductsInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID to get products for."),
};

/**
 * Schema for assigning a product to a category
 *
 * Required fields:
 * - categoryId: ID of the category to assign product to
 * - productLink: Product link data including SKU and position
 */
export const assignProductToCategoryInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID to assign product to."),
  productLink: z
    .object({
      sku: productSkuSchema.describe("Product SKU (required)."),
      position: categoryPositionSchema.optional().describe("Product position in category (optional)."),
    })
    .describe("Product link data for assignment."),
};

/**
 * Schema for updating a product's assignment in a category
 *
 * Required fields:
 * - categoryId: ID of the category
 * - productLink: Updated product link data
 */
export const updateProductInCategoryInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID."),
  productLink: z
    .object({
      sku: productSkuSchema.describe("Product SKU (required)."),
      position: categoryPositionSchema.optional().describe("Product position in category (optional)."),
    })
    .describe("Updated product link data."),
};

/**
 * Schema for removing a product from a category
 *
 * Required fields:
 * - categoryId: ID of the category
 * - sku: Product SKU to remove
 */
export const removeProductFromCategoryInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID."),
  sku: productSkuSchema.describe("Product SKU to remove from the category."),
};
