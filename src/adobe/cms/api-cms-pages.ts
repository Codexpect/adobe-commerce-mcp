import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { CmsPage } from "./types/cms-page";

export async function getCmsPages(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<CmsPage[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/cmsPage/search?${searchCriteria}`;
  try {
    const data = await client.get<{ items: CmsPage[] }>(endpoint);
    return apiSuccessResponse<CmsPage[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<CmsPage[]>(endpoint, error);
  }
}
