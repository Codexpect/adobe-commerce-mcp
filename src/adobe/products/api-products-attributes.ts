import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { ProductAttribute } from "./types/product";

export async function getProductsAttributes(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<ProductAttribute[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/products/attributes?${searchCriteria}`;
  try {
    const data = await client.get<{ items: ProductAttribute[] }>(endpoint);
    return apiSuccessResponse<ProductAttribute[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<ProductAttribute[]>(endpoint, error);
  }
}

export async function createProductAttribute(client: AdobeCommerceClient, attribute: ProductAttribute): Promise<ApiResponse<ProductAttribute>> {
  const endpoint = "/products/attributes";
  try {
    const data = await client.post(endpoint, { attribute });
    return apiSuccessResponse<ProductAttribute>(endpoint, data as ProductAttribute);
  } catch (error) {
    return apiErrorResponse<ProductAttribute>(endpoint, error);
  }
}

export async function getProductAttributeByCode(client: AdobeCommerceClient, attributeCode: string): Promise<ApiResponse<ProductAttribute>> {
  const endpoint = `/products/attributes/${attributeCode}`;
  try {
    const data = await client.get<ProductAttribute>(endpoint);
    return apiSuccessResponse<ProductAttribute>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<ProductAttribute>(endpoint, error);
  }
}

export async function updateProductAttribute(client: AdobeCommerceClient, attribute: ProductAttribute): Promise<ApiResponse<ProductAttribute>> {
  const endpoint = `/products/attributes/${attribute.attribute_code}`;
  try {
    const data = await client.put(endpoint, { attribute });
    return apiSuccessResponse<ProductAttribute>(endpoint, data as ProductAttribute);
  } catch (error) {
    return apiErrorResponse<ProductAttribute>(endpoint, error);
  }
}

export async function deleteProductAttribute(client: AdobeCommerceClient, attributeCode: string): Promise<ApiResponse<boolean>> {
  const endpoint = `/products/attributes/${attributeCode}`;
  try {
    await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function getProductAttributeOptions(
  client: AdobeCommerceClient,
  attributeCode: string
): Promise<ApiResponse<ProductAttribute["options"]>> {
  const endpoint = `/products/attributes/${attributeCode}/options`;
  try {
    const data = await client.get<ProductAttribute["options"]>(endpoint);
    return apiSuccessResponse<ProductAttribute["options"]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<ProductAttribute["options"]>(endpoint, error);
  }
}

export async function addProductAttributeOption(
  client: AdobeCommerceClient,
  attributeCode: string,
  option: NonNullable<ProductAttribute["options"]>[0]
): Promise<ApiResponse<string>> {
  const endpoint = `/products/attributes/${attributeCode}/options`;
  try {
    const data = await client.post(endpoint, { option });
    return apiSuccessResponse<string>(endpoint, data as string);
  } catch (error) {
    return apiErrorResponse<string>(endpoint, error);
  }
}

export async function updateProductAttributeOption(
  client: AdobeCommerceClient,
  attributeCode: string,
  optionId: number,
  option: NonNullable<ProductAttribute["options"]>[0]
): Promise<ApiResponse<boolean>> {
  const endpoint = `/products/attributes/${attributeCode}/options/${optionId}`;
  try {
    await client.put(endpoint, { option });
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function deleteProductAttributeOption(
  client: AdobeCommerceClient,
  attributeCode: string,
  optionId: number
): Promise<ApiResponse<boolean>> {
  const endpoint = `/products/attributes/${attributeCode}/options/${optionId}`;
  try {
    await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}
