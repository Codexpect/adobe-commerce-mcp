import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { ProductAttribute } from "./types/product";

export async function getProductsAttributes(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<ProductAttribute>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/products/attributes?${searchCriteria}`;
  try {
    const data = await client.get<{ items: ProductAttribute[] }>(endpoint);
    return apiSuccessResponse<ProductAttribute>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<ProductAttribute>(endpoint, error);
  }
}

export async function createProductAttribute(client: AdobeCommerceClient, attribute: ProductAttribute): Promise<ApiResponse<ProductAttribute>> {
  const endpoint = "/products/attributes";
  try {
    const data = await client.post(endpoint, { attribute });
    return apiSuccessResponse<ProductAttribute>(endpoint, [data as ProductAttribute]);
  } catch (error) {
    return apiErrorResponse<ProductAttribute>(endpoint, error);
  }
}
