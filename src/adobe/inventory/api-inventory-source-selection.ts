import { AdobeCommerceClient } from "../adobe-commerce-client";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { SourceSelectionAlgorithm, SourceSelectionResult, InventoryRequest } from "./types/inventory";

/**
 * Get source selection algorithms
 */
export async function getSourceSelectionAlgorithms(
  client: AdobeCommerceClient
): Promise<ApiResponse<SourceSelectionAlgorithm[]>> {
  const endpoint = `/inventory/source-selection-algorithm-list`;
  try {
    const data = await client.get<SourceSelectionAlgorithm[]>(endpoint);
    return apiSuccessResponse<SourceSelectionAlgorithm[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<SourceSelectionAlgorithm[]>(endpoint, error);
  }
}

/**
 * Run source selection algorithm
 */
export async function runSourceSelectionAlgorithm(
  client: AdobeCommerceClient,
  request: { inventoryRequest: InventoryRequest; algorithmCode: string }
): Promise<ApiResponse<SourceSelectionResult>> {
  const endpoint = `/inventory/source-selection-algorithm-result`;
  try {
    const data = await client.post(endpoint, request);
    return apiSuccessResponse<SourceSelectionResult>(endpoint, data as SourceSelectionResult);
  } catch (error) {
    return apiErrorResponse<SourceSelectionResult>(endpoint, error);
  }
} 