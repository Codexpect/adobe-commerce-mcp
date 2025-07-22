import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import { mapCreateProductInputToApiPayload, mapUpdateProductInputToApiPayload } from "./mapping/product-mapping";
import { CreateProductInput, DeleteProductInput, GetProductBySkuInput, UpdateProductInput } from "./schemas";
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

export async function createProduct(client: AdobeCommerceClient, input: CreateProductInput): Promise<ApiResponse<Product>> {
  const endpoint = `/products`;
  try {
    const productPayload = mapCreateProductInputToApiPayload(input);
    const data = await client.post(endpoint, { product: productPayload });
    return apiSuccessResponse<Product>(endpoint, data as Product);
  } catch (error) {
    return apiErrorResponse<Product>(endpoint, error);
  }
}

export async function updateProduct(client: AdobeCommerceClient, input: UpdateProductInput): Promise<ApiResponse<Product>> {
  const endpoint = `/products/${input.sku}`;
  try {
    const productPayload = mapUpdateProductInputToApiPayload(input);
    const data = await client.put(endpoint, { product: productPayload });
    return apiSuccessResponse<Product>(endpoint, data as Product);
  } catch (error) {
    return apiErrorResponse<Product>(endpoint, error);
  }
}

export async function getProductBySku(client: AdobeCommerceClient, input: GetProductBySkuInput): Promise<ApiResponse<Product>> {
  const endpoint = `/products/${input.sku}`;
  try {
    const data = await client.get<Product>(endpoint);
    return apiSuccessResponse<Product>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Product>(endpoint, error);
  }
}

export async function deleteProduct(client: AdobeCommerceClient, input: DeleteProductInput): Promise<ApiResponse<boolean>> {
  const endpoint = `/products/${input.sku}`;
  try {
    await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}
