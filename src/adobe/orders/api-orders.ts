import { AdobeCommerceClient } from "../adobe-commerce-client.js";
import { buildSearchCriteriaQuery } from "../search-criteria/index.js";
import type { SearchCriteria } from "../search-criteria/types/search-criteria.js";
import type { ApiResponse } from "../types/api-response.js";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response.js";
import type { Order } from "./types/order.js";

export async function getOrders(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<Order>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/orders?${searchCriteria}`;
  try {
    const data = await client.get<{ items: Order[] }>(endpoint);
    return apiSuccessResponse<Order>(endpoint, data.items ?? []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return apiErrorResponse<Order>(endpoint, error);
  }
} 