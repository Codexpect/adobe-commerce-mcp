// Common validation schemas used across all modules
export * from "./common/validation-schemas";

// Category management operations
export * from "./categories/categories";

// Category attributes operations
export * from "./attributes/category-attributes";

// Category-product relationship operations
export * from "./products/category-products";

// TypeScript type definitions
export * from "./types";

/**
 * Quick Reference Guide:
 *
 * Category Management:
 * - getCategoryTreeInputSchema: Retrieve category tree structure
 * - getCategoryByIdInputSchema: Get specific category by ID
 * - createCategoryInputSchema: Create new categories
 * - updateCategoryInputSchema: Update existing categories
 * - deleteCategoryInputSchema: Delete categories
 * - moveCategoryInputSchema: Move categories in hierarchy
 *
 * Category Attributes:
 * - getCategoryAttributeByCodeInputSchema: Get specific attribute by code
 * - getCategoryAttributeOptionsInputSchema: Get attribute options
 *
 * Category Products:
 * - getCategoryProductsInputSchema: Get products in category
 * - assignProductToCategoryInputSchema: Assign product to category
 * - updateProductInCategoryInputSchema: Update product in category
 * - removeProductFromCategoryInputSchema: Remove product from category
 *
 * Common Validation Schemas:
 * - categoryNameSchema: Validate category names
 * - categoryIdSchema: Validate category IDs
 * - attributeCodeSchema: Validate attribute codes
 * - productSkuSchema: Validate product SKUs
 *
 * Usage Example:
 * ```typescript
 * import { createCategoryInputSchema, categoryNameSchema } from "../schemas";
 *
 * // Validate input
 * const parsed = z.object(createCategoryInputSchema).parse(input);
 * ```
 */
