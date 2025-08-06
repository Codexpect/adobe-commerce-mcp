import { AdobeCommerceClient } from "../adobe-commerce-client";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { StockItem, StockItemCollection, StockStatus } from "./types/inventory";

export async function getStockItem(client: AdobeCommerceClient, productSku: string): Promise<ApiResponse<StockItem>> {
  const endpoint = `/stockItems/${encodeURIComponent(productSku)}`;

  try {
    const data = await client.get<StockItem>(endpoint);
    return apiSuccessResponse<StockItem>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StockItem>(endpoint, error);
  }
}

export async function updateStockItem(
  client: AdobeCommerceClient,
  productSku: string,
  itemId: number,
  stockItem: StockItem
): Promise<ApiResponse<number>> {
  const endpoint = `/products/${encodeURIComponent(productSku)}/stockItems/${itemId}`;

  try {
    const data = await client.put(endpoint, { stockItem });
    return apiSuccessResponse<number>(endpoint, data as number);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}

export async function getLowStockItems(
  client: AdobeCommerceClient,
  qty: number,
  currentPage?: number,
  pageSize?: number
): Promise<ApiResponse<StockItemCollection>> {
  const params = new URLSearchParams();

  params.append("qty", qty.toString());
  params.append("scopeId", "0"); // Default scope ID

  if (currentPage !== undefined) {
    params.append("currentPage", currentPage.toString());
  }
  if (pageSize !== undefined) {
    params.append("pageSize", pageSize.toString());
  }

  const endpoint = `/stockItems/lowStock/?${params.toString()}`;

  try {
    const data = await client.get<StockItemCollection>(endpoint);
    return apiSuccessResponse<StockItemCollection>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StockItemCollection>(endpoint, error);
  }
}

export async function getStockStatus(client: AdobeCommerceClient, productSku: string): Promise<ApiResponse<StockStatus>> {
  const endpoint = `/stockStatuses/${encodeURIComponent(productSku)}`;

  try {
    const data = await client.get<StockStatus>(endpoint);
    return apiSuccessResponse<StockStatus>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StockStatus>(endpoint, error);
  }
}
