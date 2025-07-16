import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Customer } from "./types/customer";

export async function getCustomers(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Customer[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/customers/search?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Customer[] }>(endpoint);
    return apiSuccessResponse<Customer[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<Customer[]>(endpoint, error);
  }
}
