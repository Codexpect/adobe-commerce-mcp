import { AdobeCommerceClient } from "../adobe-commerce-client.js";
import { buildSearchCriteriaQuery } from "../search-criteria/index.js";
import type { SearchCriteria } from "../search-criteria/types/search-criteria.js";
import type { ApiResponse } from "../types/api-response.js";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response.js";
import type { CmsPage } from "./types/cms-page.js";

export async function getCmsPages(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<CmsPage>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/cmsPage/search?${searchCriteria}`;
  try {
    const data = await client.get<{ items: CmsPage[] }>(endpoint);
    return apiSuccessResponse<CmsPage>(endpoint, data.items ?? []);
  } catch (error) {
    console.error("Error fetching CMS pages:", error);
    return apiErrorResponse<CmsPage>(endpoint, error);
  }
} 