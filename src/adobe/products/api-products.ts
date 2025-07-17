import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Product } from "./types/product";

export async function getProducts(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Product[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/products?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Product[] }>(endpoint);
    return apiSuccessResponse<Product[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<Product[]>(endpoint, error);
  }
}
