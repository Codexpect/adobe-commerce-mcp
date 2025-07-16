import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { Order } from "./types/order";

export async function getOrders(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Order[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/orders?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Order[] }>(endpoint);
    return apiSuccessResponse<Order[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<Order[]>(endpoint, error);
  }
}
