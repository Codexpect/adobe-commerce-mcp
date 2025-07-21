import {
  CreateCategoryInput,
  UpdateCategoryInput,
  MoveCategoryInput,
  AssignProductToCategoryInput,
  UpdateProductInCategoryInput,
} from "../schemas";
import { Category, CategoryProductLink, CategoryMoveRequest } from "../types/category";

/**
 * Category Mapping Functions
 *
 * These functions transform validated input from tool schemas into the specific
 * payload format required by the Adobe Commerce API. This separation ensures
 * that tools focus on validation and user interaction, while mappers handle
 * the technical details of API communication.
 */

/**
 * Maps validated create category input to Adobe Commerce API payload
 * 
 * @param input - Validated input from createCategoryInputSchema
 * @returns Category payload for API request
 */
export function mapCreateCategoryInputToApiPayload(input: CreateCategoryInput): Category {
  const { category } = input;
  
  return {
    name: category.name,
    ...(category.parent_id !== undefined && { parent_id: category.parent_id }),
    ...(category.is_active !== undefined && { is_active: category.is_active }),
    ...(category.position !== undefined && { position: category.position }),
    ...(category.include_in_menu !== undefined && { include_in_menu: category.include_in_menu }),
    ...(category.available_sort_by && { available_sort_by: category.available_sort_by }),
  };
}

/**
 * Maps validated update category input to Adobe Commerce API payload
 * 
 * @param input - Validated input from updateCategoryInputSchema
 * @returns Category payload for API request
 */
export function mapUpdateCategoryInputToApiPayload(input: UpdateCategoryInput): Category {
  const { category } = input;
  
  const payload: Category = {};
  
  if (category.name !== undefined) {
    payload.name = category.name;
  }
  
  if (category.parent_id !== undefined) {
    payload.parent_id = category.parent_id;
  }
  
  if (category.is_active !== undefined) {
    payload.is_active = category.is_active;
  }
  
  if (category.position !== undefined) {
    payload.position = category.position;
  }
  
  if (category.include_in_menu !== undefined) {
    payload.include_in_menu = category.include_in_menu;
  }
  
  if (category.available_sort_by !== undefined) {
    payload.available_sort_by = category.available_sort_by;
  }
  
  return payload;
}

/**
 * Maps validated move category input to Adobe Commerce API payload
 * 
 * @param input - Validated input from moveCategoryInputSchema
 * @returns CategoryMoveRequest payload for API request
 */
export function mapMoveCategoryInputToApiPayload(input: MoveCategoryInput): CategoryMoveRequest {
  const { parentId, afterId } = input;
  
  const payload: CategoryMoveRequest = {
    parentId: parentId,
  };
  
  if (afterId !== undefined) {
    payload.afterId = afterId;
  }
  
  return payload;
}

/**
 * Maps validated assign product to category input to Adobe Commerce API payload
 * 
 * @param input - Validated input from assignProductToCategoryInputSchema
 * @returns CategoryProductLink payload for API request
 */
export function mapAssignProductToCategoryInputToApiPayload(input: AssignProductToCategoryInput): CategoryProductLink {
  const { productLink } = input;
  
  return {
    ...(productLink.sku && { sku: productLink.sku }),
    ...(productLink.position !== undefined && { position: productLink.position }),
    category_id: productLink.category_id,
  };
}

/**
 * Maps validated update product in category input to Adobe Commerce API payload
 * 
 * @param input - Validated input from updateProductInCategoryInputSchema
 * @returns CategoryProductLink payload for API request
 */
export function mapUpdateProductInCategoryInputToApiPayload(input: UpdateProductInCategoryInput): CategoryProductLink {
  const { productLink } = input;
  
  const payload: CategoryProductLink = {
    category_id: productLink.category_id,
  };
  
  if (productLink.sku !== undefined) {
    payload.sku = productLink.sku;
  }
  
  if (productLink.position !== undefined) {
    payload.position = productLink.position;
  }
  
  return payload;
} 