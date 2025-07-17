import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Category } from "./types/category";

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
