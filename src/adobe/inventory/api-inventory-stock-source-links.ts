import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { StockSourceLink, StockSourceLinkSearchResults } from "./types/inventory";

/**
 * Get stock-source links
 */
export async function getStockSourceLinks(
  client: AdobeCommerceClient,
  options: SearchCriteria = {}
): Promise<ApiResponse<StockSourceLink[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/inventory/stock-source-links?${searchCriteria}`;
  try {
    const data = await client.get<StockSourceLinkSearchResults>(endpoint);
    return apiSuccessResponse<StockSourceLink[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<StockSourceLink[]>(endpoint, error);
  }
}

/**
 * Create stock-source links
 */
export async function createStockSourceLinks(
  client: AdobeCommerceClient,
  payload: { links: StockSourceLink[] }
): Promise<ApiResponse<boolean>> {
  const endpoint = `/inventory/stock-source-links`;
  try {
    await client.post(endpoint, payload);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

/**
 * Delete stock-source links
 */
export async function deleteStockSourceLinks(
  client: AdobeCommerceClient,
  payload: { links: StockSourceLink[] }
): Promise<ApiResponse<boolean>> {
  const endpoint = `/inventory/stock-source-links-delete`;
  try {
    await client.post(endpoint, payload);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
} 