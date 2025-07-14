import { AdobeCommerceClient } from "../adobe-commerce-client.js";
import { buildSearchCriteriaQuery } from "../search-criteria/index.js";
import type { SearchCriteria } from "../search-criteria/types/search-criteria.js";
import type { ApiResponse } from "../types/api-response.js";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response.js";
import type { Customer } from "./types/customer.js";

export async function getCustomers(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Customer>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/customers/search?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Customer[] }>(endpoint);
    return apiSuccessResponse<Customer>(endpoint, data.items ?? []);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return apiErrorResponse<Customer>(endpoint, error);
  }
} 