import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { SourceItem } from "./types/source-item";

export async function getSourceItems(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<SourceItem[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/inventory/source-items?${searchCriteria}`;
  try {
    const data = await client.get<{ sourceItems: SourceItem[] }>(endpoint);
    return apiSuccessResponse<SourceItem[]>(endpoint, data.sourceItems ?? []);
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
