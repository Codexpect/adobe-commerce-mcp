import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Source, SourceSearchResults } from "./types/inventory";

/**
 * Get all sources
 */
export async function getSources(
  client: AdobeCommerceClient,
  options: SearchCriteria = {}
): Promise<ApiResponse<Source[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/inventory/sources?${searchCriteria}`;
  try {
    const data = await client.get<SourceSearchResults>(endpoint);
    return apiSuccessResponse<Source[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<Source[]>(endpoint, error);
  }
}

/**
 * Get source by code
 */
export async function getSourceByCode(
  client: AdobeCommerceClient,
  sourceCode: string
): Promise<ApiResponse<Source>> {
  const endpoint = `/inventory/sources/${encodeURIComponent(sourceCode)}`;
  try {
    const data = await client.get<Source>(endpoint);
    return apiSuccessResponse<Source>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Source>(endpoint, error);
  }
}

/**
 * Create new source
 */
export async function createSource(
  client: AdobeCommerceClient,
  source: Source
): Promise<ApiResponse<Source>> {
  const endpoint = `/inventory/sources`;
  try {
    const data = await client.post(endpoint, { source });
    return apiSuccessResponse<Source>(endpoint, data as Source);
  } catch (error) {
    return apiErrorResponse<Source>(endpoint, error);
  }
}

/**
 * Update source
 */
export async function updateSource(
  client: AdobeCommerceClient,
  sourceCode: string,
  source: Source
): Promise<ApiResponse<Source>> {
  const endpoint = `/inventory/sources/${encodeURIComponent(sourceCode)}`;
  try {
    const data = await client.put(endpoint, { source });
    return apiSuccessResponse<Source>(endpoint, data as Source);
  } catch (error) {
    return apiErrorResponse<Source>(endpoint, error);
  }
} 