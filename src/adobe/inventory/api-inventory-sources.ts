import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Source, SourceSearchResults } from "./types/inventory";

export async function getSources(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Source[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/inventory/sources?${searchCriteria}`;
  try {
    const data = await client.get<SourceSearchResults>(endpoint);
    return apiSuccessResponse<Source[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<Source[]>(endpoint, error);
  }
}

export async function getSourceByCode(client: AdobeCommerceClient, sourceCode: string): Promise<ApiResponse<Source>> {
  const endpoint = `/inventory/sources/${encodeURIComponent(sourceCode)}`;
  try {
    const data = await client.get<Source>(endpoint);
    return apiSuccessResponse<Source>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Source>(endpoint, error);
  }
}

export async function createSource(client: AdobeCommerceClient, source: Source): Promise<ApiResponse<number>> {
  const endpoint = `/inventory/sources`;
  try {
    await client.post(endpoint, { source });
    return apiSuccessResponse<number>(endpoint, 1);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}

export async function updateSource(client: AdobeCommerceClient, sourceCode: string, source: Source): Promise<ApiResponse<number>> {
  const endpoint = `/inventory/sources/${encodeURIComponent(sourceCode)}`;
  try {
    await client.put(endpoint, { source });
    return apiSuccessResponse<number>(endpoint, 1);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}
