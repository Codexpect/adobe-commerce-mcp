import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import { IsProductSalableForRequestedQtyResult, IsProductSalableResult, ProductSalableResult } from "./types/inventory";
import type { SourceItem } from "./types/source-item";

export async function getSourceItems(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<SourceItem[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/inventory/source-items?${searchCriteria}`;
  try {
    const data = await client.get<{ items: SourceItem[] }>(endpoint);
    return apiSuccessResponse<SourceItem[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<SourceItem[]>(endpoint, error);
  }
}

export async function createSourceItem(client: AdobeCommerceClient, sourceItem: SourceItem): Promise<ApiResponse<boolean>> {
  const endpoint = `/inventory/source-items`;
  try {
    await client.post(endpoint, { sourceItems: [sourceItem] });
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function deleteSourceItem(client: AdobeCommerceClient, sku: string, source_code: string): Promise<ApiResponse<boolean>> {
  const endpoint = `/inventory/source-items-delete`;
  try {
    const payload = { sourceItems: [{ sku, source_code }] };
    await client.post(endpoint, payload);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function areProductsSalable(
  client: AdobeCommerceClient,
  skus: string[],
  stockId: number
): Promise<ApiResponse<IsProductSalableResult[]>> {
  const skuParams = skus.map((sku, index) => `skus[${index}]=${encodeURIComponent(sku)}`).join("&");
  const endpoint = `/inventory/are-products-salable?${skuParams}&stockId=${stockId}`;

  try {
    const data = await client.get<IsProductSalableResult[]>(endpoint);
    return apiSuccessResponse<IsProductSalableResult[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<IsProductSalableResult[]>(endpoint, error);
  }
}

export async function areProductsSalableForRequestedQty(
  client: AdobeCommerceClient,
  skuRequests: Array<{ sku: string; qty: number }>,
  stockId: number
): Promise<ApiResponse<IsProductSalableForRequestedQtyResult[]>> {
  const requestParams = skuRequests
    .map((request, index) => `skuRequests[${index}][sku]=${encodeURIComponent(request.sku)}&skuRequests[${index}][qty]=${request.qty}`)
    .join("&");
  const endpoint = `/inventory/are-product-salable-for-requested-qty/?${requestParams}&stockId=${stockId}`;

  try {
    const data = await client.get<IsProductSalableForRequestedQtyResult[]>(endpoint);
    return apiSuccessResponse<IsProductSalableForRequestedQtyResult[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<IsProductSalableForRequestedQtyResult[]>(endpoint, error);
  }
}

export async function isProductSalable(client: AdobeCommerceClient, sku: string, stockId: number): Promise<ApiResponse<boolean>> {
  const endpoint = `/inventory/is-product-salable/${encodeURIComponent(sku)}/${stockId}`;

  try {
    const data = await client.get<boolean>(endpoint);
    return apiSuccessResponse<boolean>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function isProductSalableForRequestedQty(
  client: AdobeCommerceClient,
  sku: string,
  stockId: number,
  requestedQty: number
): Promise<ApiResponse<ProductSalableResult>> {
  const endpoint = `/inventory/is-product-salable-for-requested-qty/${encodeURIComponent(sku)}/${stockId}/${requestedQty}`;

  try {
    const data = await client.get<ProductSalableResult>(endpoint);
    return apiSuccessResponse<ProductSalableResult>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<ProductSalableResult>(endpoint, error);
  }
}

export async function getProductSalableQuantity(client: AdobeCommerceClient, sku: string, stockId: number): Promise<ApiResponse<number>> {
  const endpoint = `/inventory/get-product-salable-quantity/${encodeURIComponent(sku)}/${stockId}`;

  try {
    const data = await client.get<number>(endpoint);
    return apiSuccessResponse<number>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}
