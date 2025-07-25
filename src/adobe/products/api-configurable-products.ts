import { AdobeCommerceClient } from "../adobe-commerce-client";
import { apiErrorResponse, ApiResponse, apiSuccessResponse } from "../types/api-response";
import { ConfigurableProductOption, Product } from "./types/product";

export async function addConfigurableProductOption(
  client: AdobeCommerceClient,
  sku: string,
  option: ConfigurableProductOption
): Promise<ApiResponse<number>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/options`;
  try {
    const data = await client.post(endpoint, { option });
    return apiSuccessResponse<number>(endpoint, data as number);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}

export async function linkConfigurableChild(client: AdobeCommerceClient, sku: string, childSku: string): Promise<ApiResponse<boolean>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/child`;
  try {
    const data = await client.post(endpoint, { childSku });
    return apiSuccessResponse<boolean>(endpoint, data as boolean);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function unlinkConfigurableChild(client: AdobeCommerceClient, sku: string, childSku: string): Promise<ApiResponse<boolean>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/children/${encodeURIComponent(childSku)}`;
  try {
    const data = await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, data as boolean);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function getConfigurableProductChildren(client: AdobeCommerceClient, sku: string): Promise<ApiResponse<Product[]>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/children`;
  try {
    const data = await client.get(endpoint);
    return apiSuccessResponse<Product[]>(endpoint, data as Product[]);
  } catch (error) {
    return apiErrorResponse<Product[]>(endpoint, error);
  }
}

export async function getConfigurableProductOptionsAll(client: AdobeCommerceClient, sku: string): Promise<ApiResponse<ConfigurableProductOption[]>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/options/all`;
  try {
    const data = await client.get(endpoint);
    return apiSuccessResponse<ConfigurableProductOption[]>(endpoint, data as ConfigurableProductOption[]);
  } catch (error) {
    return apiErrorResponse<ConfigurableProductOption[]>(endpoint, error);
  }
}

export async function getConfigurableProductOptionById(
  client: AdobeCommerceClient,
  sku: string,
  id: number
): Promise<ApiResponse<ConfigurableProductOption>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/options/${id}`;
  try {
    const data = await client.get(endpoint);
    return apiSuccessResponse<ConfigurableProductOption>(endpoint, data as ConfigurableProductOption);
  } catch (error) {
    return apiErrorResponse<ConfigurableProductOption>(endpoint, error);
  }
}

export async function updateConfigurableProductOption(
  client: AdobeCommerceClient,
  sku: string,
  id: number,
  option: ConfigurableProductOption
): Promise<ApiResponse<number>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/options/${id}`;
  try {
    const data = await client.put(endpoint, { option });
    return apiSuccessResponse<number>(endpoint, data as number);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}

export async function deleteConfigurableProductOption(client: AdobeCommerceClient, sku: string, id: number): Promise<ApiResponse<boolean>> {
  const endpoint = `/configurable-products/${encodeURIComponent(sku)}/options/${id}`;
  try {
    const data = await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, data as boolean);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}
