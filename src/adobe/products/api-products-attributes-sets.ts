import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import { DEFAULT_ATTRIBUTE_SET_ID, type AttributeSet } from "./types/product";

export async function createAttributeSet(client: AdobeCommerceClient, attributeSet: AttributeSet): Promise<ApiResponse<AttributeSet>> {
  const endpoint = "/products/attribute-sets";
  try {
    const data = await client.post(endpoint, { attributeSet, skeletonId: DEFAULT_ATTRIBUTE_SET_ID });
    return apiSuccessResponse<AttributeSet>(endpoint, data as AttributeSet);
  } catch (error) {
    return apiErrorResponse<AttributeSet>(endpoint, error);
  }
}

export async function getAttributeSetsList(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<ApiResponse<AttributeSet[]>> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/products/attribute-sets/sets/list?${searchCriteria}`;
  try {
    const data = await client.get<{ items: AttributeSet[] }>(endpoint);
    return apiSuccessResponse<AttributeSet[]>(endpoint, data.items ?? []);
  } catch (error) {
    return apiErrorResponse<AttributeSet[]>(endpoint, error);
  }
}

export async function getAttributeSetById(client: AdobeCommerceClient, attributeSetId: number): Promise<ApiResponse<AttributeSet>> {
  const endpoint = `/products/attribute-sets/${attributeSetId}`;
  try {
    const data = await client.get<AttributeSet>(endpoint);
    return apiSuccessResponse<AttributeSet>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<AttributeSet>(endpoint, error);
  }
}

export async function deleteAttributeSet(client: AdobeCommerceClient, attributeSetId: number): Promise<ApiResponse<boolean>> {
  const endpoint = `/products/attribute-sets/${attributeSetId}`;
  try {
    await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function updateAttributeSet(
  client: AdobeCommerceClient,
  attributeSetId: number,
  attributeSet: AttributeSet
): Promise<ApiResponse<AttributeSet>> {
  const endpoint = `/products/attribute-sets/${attributeSetId}`;
  try {
    const data = await client.put(endpoint, { attributeSet });
    return apiSuccessResponse<AttributeSet>(endpoint, data as AttributeSet);
  } catch (error) {
    return apiErrorResponse<AttributeSet>(endpoint, error);
  }
}

export async function deleteAttributeFromSet(
  client: AdobeCommerceClient,
  attributeSetId: number,
  attributeCode: string
): Promise<ApiResponse<boolean>> {
  const endpoint = `/products/attribute-sets/${attributeSetId}/attributes/${attributeCode}`;
  try {
    await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}
