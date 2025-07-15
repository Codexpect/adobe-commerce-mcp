import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Product, ProductAttribute } from "./types/product";

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

export async function createProductAttribute(client: AdobeCommerceClient, attribute: ProductAttribute): Promise<ApiResponse<ProductAttribute>> {
  const endpoint = "/products/attributes";
  try {
    const data = await client.post(endpoint, { attribute });
    return apiSuccessResponse<ProductAttribute>(endpoint, [data as ProductAttribute]);
  } catch (error) {
    console.error("Error creating product attribute:", error);
    return apiErrorResponse<ProductAttribute>(endpoint, error);
  }
}
