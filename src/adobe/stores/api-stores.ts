import { AdobeCommerceClient } from "../adobe-commerce-client";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import { GetStoreConfigsInput } from "./schemas";
import type { Store, StoreConfig, StoreGroup, Website } from "./types/store";

export async function getStoreConfigs(client: AdobeCommerceClient, input: GetStoreConfigsInput = {}): Promise<ApiResponse<StoreConfig[]>> {
  let endpoint = "/store/storeConfigs";

  // Add store codes filter if provided
  if (input.store_codes && input.store_codes.length > 0) {
    const queryParams = input.store_codes
      .map(code => `storeCodes[]=${encodeURIComponent(code)}`)
      .join("&");
    endpoint += `?${queryParams}`;
  }

  try {
    const data = await client.get<StoreConfig[]>(endpoint);
    return apiSuccessResponse<StoreConfig[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StoreConfig[]>(endpoint, error);
  }
}

export async function getStoreViews(client: AdobeCommerceClient): Promise<ApiResponse<Store[]>> {
  const endpoint = "/store/storeViews";
  try {
    const data = await client.get<Store[]>(endpoint);
    return apiSuccessResponse<Store[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Store[]>(endpoint, error);
  }
}

export async function getStoreGroups(client: AdobeCommerceClient): Promise<ApiResponse<StoreGroup[]>> {
  const endpoint = "/store/storeGroups";
  try {
    const data = await client.get<StoreGroup[]>(endpoint);
    return apiSuccessResponse<StoreGroup[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StoreGroup[]>(endpoint, error);
  }
}

export async function getWebsites(client: AdobeCommerceClient): Promise<ApiResponse<Website[]>> {
  const endpoint = "/store/websites";
  try {
    const data = await client.get<Website[]>(endpoint);
    return apiSuccessResponse<Website[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<Website[]>(endpoint, error);
  }
}
