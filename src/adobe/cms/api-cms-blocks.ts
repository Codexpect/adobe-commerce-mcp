import { AdobeCommerceClient } from "../adobe-commerce-client.js";
import { buildSearchCriteriaQuery } from "../search-criteria/index.js";
import type { SearchCriteria } from "../search-criteria/types/search-criteria.js";
import type { ApiResponse } from "../types/api-response.js";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response.js";
import type { CmsBlock } from "./types/cms-block.js";

export async function getCmsBlocks(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<CmsBlock>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/cmsBlock/search?${searchCriteria}`;
  try {
    const data = await client.get<{ items: CmsBlock[] }>(endpoint);
    return apiSuccessResponse<CmsBlock>(endpoint, data.items ?? []);
  } catch (error) {
    console.error("Error fetching CMS blocks:", error);
    return apiErrorResponse<CmsBlock>(endpoint, error);
  }
} 