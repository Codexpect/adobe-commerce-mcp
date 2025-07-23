import { z } from "zod";

// Import all schemas to generate types
import {
  getCategoryTreeInputSchema,
  getCategoryByIdInputSchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
  deleteCategoryInputSchema,
  moveCategoryInputSchema,
} from "./categories/categories";

import {
  getCategoryAttributeByCodeInputSchema,
  getCategoryAttributeOptionsInputSchema,
} from "./attributes/category-attributes";

import {
  getCategoryProductsInputSchema,
  assignProductToCategoryInputSchema,
  updateProductInCategoryInputSchema,
  removeProductFromCategoryInputSchema,
} from "./products/category-products";

/**
 * TypeScript type definitions for all category-related schemas
 *
 * These types are automatically inferred from the Zod schemas to ensure
 * consistency between runtime validation and compile-time type checking.
 */

// Category Management Types
export type GetCategoryTreeInput = z.infer<ReturnType<typeof z.object<typeof getCategoryTreeInputSchema>>>;
export type GetCategoryByIdInput = z.infer<ReturnType<typeof z.object<typeof getCategoryByIdInputSchema>>>;
export type CreateCategoryInput = z.infer<ReturnType<typeof z.object<typeof createCategoryInputSchema>>>;
export type UpdateCategoryInput = z.infer<ReturnType<typeof z.object<typeof updateCategoryInputSchema>>>;
export type DeleteCategoryInput = z.infer<ReturnType<typeof z.object<typeof deleteCategoryInputSchema>>>;
export type MoveCategoryInput = z.infer<ReturnType<typeof z.object<typeof moveCategoryInputSchema>>>;

// Category Attributes Types
export type GetCategoryAttributeByCodeInput = z.infer<ReturnType<typeof z.object<typeof getCategoryAttributeByCodeInputSchema>>>;
export type GetCategoryAttributeOptionsInput = z.infer<ReturnType<typeof z.object<typeof getCategoryAttributeOptionsInputSchema>>>;

// Category Products Types
export type GetCategoryProductsInput = z.infer<ReturnType<typeof z.object<typeof getCategoryProductsInputSchema>>>;
export type AssignProductToCategoryInput = z.infer<ReturnType<typeof z.object<typeof assignProductToCategoryInputSchema>>>;
export type UpdateProductInCategoryInput = z.infer<ReturnType<typeof z.object<typeof updateProductInCategoryInputSchema>>>;
export type RemoveProductFromCategoryInput = z.infer<ReturnType<typeof z.object<typeof removeProductFromCategoryInputSchema>>>; 