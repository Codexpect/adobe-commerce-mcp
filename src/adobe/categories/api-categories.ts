import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Category, CategoryAttribute, CategoryMoveRequest, CategoryProductLink, CategoryTree } from "./types/category";

export async function getCategories(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Category[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/categories/list?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Category[] }>(endpoint);
    return apiSuccessResponse<Category[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<Category[]>(endpoint, error);
  }
}

export async function getCategoryTree(client: AdobeCommerceClient, rootCategoryId?: number, depth?: number): Promise<ApiResponse<CategoryTree>> {
  const params = new URLSearchParams();
  if (rootCategoryId) params.append("rootCategoryId", rootCategoryId.toString());
  if (depth) params.append("depth", depth.toString());
  let endpoint = "/categories";

  if (params.toString()) {
    endpoint = `/categories?${params.toString()}`;
  }

  try {
    const data = await client.get<CategoryTree>(endpoint);
    return apiSuccessResponse<CategoryTree>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<CategoryTree>(endpoint, error);
  }
}

export async function getCategoryById(client: AdobeCommerceClient, categoryId: number, storeId?: number): Promise<ApiResponse<Category>> {
  const params = new URLSearchParams();
  if (storeId) params.append("storeId", storeId.toString());
  let endpoint = `/categories/${categoryId}`;

  if (params.toString()) {
    endpoint = `/categories/${categoryId}?${params.toString()}`;
  }

  try {
    const data = await client.get<Category>(endpoint);
    return apiSuccessResponse<Category>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Category>(endpoint, error);
  }
}

export async function createCategory(client: AdobeCommerceClient, category: Category): Promise<ApiResponse<Category>> {
  const endpoint = "/categories";
  try {
    const data = (await client.post(endpoint, { category })) as Category;
    return apiSuccessResponse<Category>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Category>(endpoint, error);
  }
}

export async function updateCategory(client: AdobeCommerceClient, categoryId: number, category: Category): Promise<ApiResponse<Category>> {
  const endpoint = `/categories/${categoryId}`;
  try {
    const data = (await client.put(endpoint, { category })) as Category;
    return apiSuccessResponse<Category>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Category>(endpoint, error);
  }
}

export async function deleteCategory(client: AdobeCommerceClient, categoryId: number): Promise<ApiResponse<boolean>> {
  const endpoint = `/categories/${categoryId}`;
  try {
    const data = (await client.delete(endpoint)) as boolean;
    return apiSuccessResponse<boolean>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function moveCategory(client: AdobeCommerceClient, categoryId: number, moveRequest: CategoryMoveRequest): Promise<ApiResponse<boolean>> {
  const endpoint = `/categories/${categoryId}/move`;
  try {
    const data = (await client.put(endpoint, moveRequest as unknown as Record<string, unknown>)) as boolean;
    return apiSuccessResponse<boolean>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function getCategoryAttributes(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<CategoryAttribute[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/categories/attributes?${searchCriteria}`;
  try {
    const data = await client.get<{ items: CategoryAttribute[] }>(endpoint);
    return apiSuccessResponse<CategoryAttribute[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<CategoryAttribute[]>(endpoint, error);
  }
}

export async function getCategoryAttributeByCode(client: AdobeCommerceClient, attributeCode: string): Promise<ApiResponse<CategoryAttribute>> {
  const endpoint = `/categories/attributes/${attributeCode}`;
  try {
    const data = await client.get<CategoryAttribute>(endpoint);
    return apiSuccessResponse<CategoryAttribute>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<CategoryAttribute>(endpoint, error);
  }
}

export async function getCategoryAttributeOptions(
  client: AdobeCommerceClient,
  attributeCode: string
): Promise<ApiResponse<Record<string, unknown>[]>> {
  const endpoint = `/categories/attributes/${attributeCode}/options`;
  try {
    const data = await client.get<Record<string, unknown>[]>(endpoint);
    return apiSuccessResponse<Record<string, unknown>[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Record<string, unknown>[]>(endpoint, error);
  }
}

export async function getCategoryProducts(client: AdobeCommerceClient, categoryId: number): Promise<ApiResponse<CategoryProductLink[]>> {
  const endpoint = `/categories/${categoryId}/products`;
  try {
    const data = await client.get<CategoryProductLink[]>(endpoint);
    return apiSuccessResponse<CategoryProductLink[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<CategoryProductLink[]>(endpoint, error);
  }
}

export async function assignProductToCategory(
  client: AdobeCommerceClient,
  categoryId: number,
  productLink: CategoryProductLink
): Promise<ApiResponse<boolean>> {
  const endpoint = `/categories/${categoryId}/products`;
  try {
    const data = (await client.post(endpoint, { productLink })) as boolean;
    return apiSuccessResponse<boolean>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function updateProductInCategory(
  client: AdobeCommerceClient,
  categoryId: number,
  productLink: CategoryProductLink
): Promise<ApiResponse<boolean>> {
  const endpoint = `/categories/${categoryId}/products`;
  try {
    const data = (await client.put(endpoint, { productLink })) as boolean;
    return apiSuccessResponse<boolean>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function removeProductFromCategory(client: AdobeCommerceClient, categoryId: number, sku: string): Promise<ApiResponse<boolean>> {
  const endpoint = `/categories/${categoryId}/products/${sku}`;
  try {
    const data = (await client.delete(endpoint)) as boolean;
    return apiSuccessResponse<boolean>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}
