import { z } from "zod";
import { storeIdSchema } from "../../../core/validation-schemas";
import {
  booleanSchema,
  categoryIdSchema,
  categoryNameSchema,
  categoryPositionSchema,
  depthSchema,
  stringArraySchema,
} from "../common/validation-schemas";

/**
 * Schema for retrieving the category tree
 *
 * Optional fields:
 * - rootCategoryId: Root category ID to start the tree from
 * - depth: Depth of the tree to retrieve (1-10)
 */
export const getCategoryTreeInputSchema = {
  rootCategoryId: categoryIdSchema.optional().describe("Root category ID to start the tree from (optional)."),
  depth: depthSchema.optional().describe("Depth of the tree to retrieve (1-10, optional)."),
};

/**
 * Schema for retrieving a specific category by ID
 *
 * Required fields:
 * - categoryId: Category ID to retrieve
 *
 * Optional fields:
 * - storeId: Store ID for multi-store configurations
 */
export const getCategoryByIdInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID to retrieve."),
  storeId: storeIdSchema.optional().describe("Store ID for multi-store configurations (optional)."),
};

/**
 * Schema for creating a new category
 *
 * Required fields:
 * - name: Display name for the category
 *
 * Optional fields:
 * - parent_id: Parent category ID (defaults to root category)
 * - is_active: Whether category is active (defaults to true)
 * - position: Display position (defaults based on creation order)
 * - include_in_menu: Include in navigation menu (defaults to true)
 * - available_sort_by: Available sort options for products in this category
 */
export const createCategoryInputSchema = {
  category: z
    .object({
      name: categoryNameSchema.describe("Display name for the category (e.g., 'Electronics')."),
      parent_id: categoryIdSchema.optional().describe("Parent category ID (optional, defaults to root)."),
      is_active: booleanSchema.optional().describe("Whether category is active (optional, defaults to true)."),
      position: categoryPositionSchema.optional().describe("Display position/order (optional)."),
      include_in_menu: booleanSchema.optional().describe("Include in navigation menu (optional, defaults to true)."),
      available_sort_by: stringArraySchema.describe("Available sort options for products in this category (optional)."),
    })
    .describe("Category data for creation."),
};

/**
 * Schema for updating an existing category
 *
 * Required fields:
 * - categoryId: ID of the category to update
 *
 * Optional fields:
 * - All category fields can be updated
 */
export const updateCategoryInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID to update."),
  category: z
    .object({
      name: categoryNameSchema.optional().describe("Display name for the category (optional)."),
      parent_id: categoryIdSchema.optional().describe("Parent category ID (optional)."),
      is_active: booleanSchema.optional().describe("Whether category is active (optional)."),
      position: categoryPositionSchema.optional().describe("Display position/order (optional)."),
      include_in_menu: booleanSchema.optional().describe("Include in navigation menu (optional)."),
      available_sort_by: stringArraySchema.describe("Available sort options for products in this category (optional)."),
    })
    .describe("Category data to update."),
};

/**
 * Schema for deleting a category
 *
 * Required fields:
 * - categoryId: Category ID to delete
 */
export const deleteCategoryInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID to delete."),
};

/**
 * Schema for moving a category to a new parent
 *
 * Required fields:
 * - categoryId: ID of the category to move
 * - parentId: New parent category ID
 *
 * Optional fields:
 * - afterId: Category ID to position after
 */
export const moveCategoryInputSchema = {
  categoryId: categoryIdSchema.describe("Category ID to move."),
  parentId: categoryIdSchema.describe("New parent category ID."),
  afterId: categoryIdSchema.optional().describe("Category ID to position after (optional)."),
};
