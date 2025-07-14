import { AdobeCommerceClient } from "../adobe-commerce-client.js";
import { buildSearchCriteriaQuery } from "../search-criteria/index.js";
import type { SearchCriteria } from "../search-criteria/types/search-criteria.js";
import type { ApiResponse } from "../types/api-response.js";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response.js";
import type { Category } from "./types/category.js";

export async function getCategories(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Category>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/categories/list?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Category[] }>(endpoint);
    return apiSuccessResponse<Category>(endpoint, data.items ?? []);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return apiErrorResponse<Category>(endpoint, error);
  }
}
