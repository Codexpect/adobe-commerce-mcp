import { AdobeCommerceClient } from "../adobe-commerce-client.js";
import { buildSearchCriteriaQuery } from "../search-criteria/index.js";
import type { SearchCriteria } from "../search-criteria/types/search-criteria.js";
import type { ApiResponse } from "../types/api-response.js";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response.js";
import type { Product, ProductAttribute } from "./types/product.js";

export async function getProducts(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Product>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/products?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Product[] }>(endpoint);
    return apiSuccessResponse<Product>(endpoint, data.items ?? []);
  } catch (error) {
    console.error("Error fetching products:", error);
    return apiErrorResponse<Product>(endpoint, error);
  }
}

export async function getProductsAttributes(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<ProductAttribute>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/products/attributes?${searchCriteria}`;
  try {
    const data = await client.get<{ items: ProductAttribute[] }>(endpoint);
    return apiSuccessResponse<ProductAttribute>(endpoint, data.items ?? []);
  } catch (error) {
    console.error("Error fetching product attributes:", error);
    return apiErrorResponse<ProductAttribute>(endpoint, error);
  }
}
