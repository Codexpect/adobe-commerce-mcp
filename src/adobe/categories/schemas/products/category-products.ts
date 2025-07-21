import { z } from "zod";
import {
  categoryIdSchema,
  productSkuSchema,
  categoryPositionSchema,
} from "../common/validation-schemas";

/**
 * Category Products Schemas
 *
 * These schemas define the validation rules for managing product-category relationships in Adobe Commerce.
 * Products can be assigned to multiple categories, and these schemas handle those relationships.
 */

/**
 * Schema for retrieving products assigned to a specific category
 * 
 * Used for: GET /categories/{categoryId}/products
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
 * 
 * Used for: POST /categories/{categoryId}/products
 */
export const assignProductToCategoryInputSchema = {
  categoryId: z.string().min(1, "Category ID cannot be empty").describe("Category ID to assign product to."),
  productLink: z.object({
    sku: productSkuSchema.optional().describe("Product SKU (optional)."),
    position: categoryPositionSchema.optional().describe("Product position in category (optional)."),
  }).describe("Product link data for assignment."),
};

/**
 * Schema for updating a product's assignment in a category
 * 
 * Required fields:
 * - categoryId: ID of the category
 * - productLink: Updated product link data
 * 
 * Used for: PUT /categories/{categoryId}/products
 */
export const updateProductInCategoryInputSchema = {
  categoryId: z.string().min(1, "Category ID cannot be empty").describe("Category ID."),
  productLink: z.object({
    sku: productSkuSchema.optional().describe("Product SKU (optional)."),
    position: categoryPositionSchema.optional().describe("Product position in category (optional)."),
  }).describe("Updated product link data."),
};

/**
 * Schema for removing a product from a category
 * 
 * Required fields:
 * - categoryId: ID of the category
 * - sku: Product SKU to remove
 * 
 * Used for: DELETE /categories/{categoryId}/products/{sku}
 */
export const removeProductFromCategoryInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID."),
  sku: productSkuSchema.describe("Product SKU to remove from the category."),
}; 