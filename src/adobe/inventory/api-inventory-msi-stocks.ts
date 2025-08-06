import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Stock, StockSearchResults } from "./types/inventory";

export async function getStocks(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Stock[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/inventory/stocks?${searchCriteria}`;
  try {
    const data = await client.get<StockSearchResults>(endpoint);
    return apiSuccessResponse<Stock[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<Stock[]>(endpoint, error);
  }
}

export async function getStockById(client: AdobeCommerceClient, stockId: number): Promise<ApiResponse<Stock>> {
  const endpoint = `/inventory/stocks/${stockId}`;
  try {
    const data = await client.get<Stock>(endpoint);
    return apiSuccessResponse<Stock>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Stock>(endpoint, error);
  }
}

export async function createStock(client: AdobeCommerceClient, stock: Stock): Promise<ApiResponse<number>> {
  const endpoint = `/inventory/stocks`;
  try {
    const data = await client.post(endpoint, { stock });
    return apiSuccessResponse<number>(endpoint, data as number);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}

export async function updateStock(client: AdobeCommerceClient, stockId: number, stock: Stock): Promise<ApiResponse<number>> {
  const endpoint = `/inventory/stocks/${stockId}`;
  try {
    const data = await client.put(endpoint, { stock });
    return apiSuccessResponse<number>(endpoint, data as number);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}

export async function deleteStock(client: AdobeCommerceClient, stockId: number): Promise<ApiResponse<boolean>> {
  const endpoint = `/inventory/stocks/${stockId}`;
  try {
    await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function resolveStock(client: AdobeCommerceClient, type: string, code: string): Promise<ApiResponse<Stock>> {
  const endpoint = `/inventory/stock-resolver/${encodeURIComponent(type)}/${encodeURIComponent(code)}`;
  try {
    const data = await client.get<Stock>(endpoint);
    return apiSuccessResponse<Stock>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Stock>(endpoint, error);
  }
}
