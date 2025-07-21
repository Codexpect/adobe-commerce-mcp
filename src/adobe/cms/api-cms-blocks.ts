import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { CmsBlock } from "./types/cms-block";

export async function getCmsBlocks(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<CmsBlock[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/cmsBlock/search?${searchCriteria}`;
  try {
    const data = await client.get<{ items: CmsBlock[] }>(endpoint);
    return apiSuccessResponse<CmsBlock[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<CmsBlock[]>(endpoint, error);
  }
}
