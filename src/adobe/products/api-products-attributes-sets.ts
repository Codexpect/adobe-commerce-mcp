import { AdobeCommerceClient } from "../adobe-commerce-client";
import { buildSearchCriteriaQuery } from "../search-criteria/index";
import type { SearchCriteria } from "../search-criteria/types/search-criteria";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import { DEFAULT_ATTRIBUTE_SET_ID, type AttributeGroup, type AttributeSet } from "./types/product";
import type { ProductAttribute } from "./types/product";

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

export async function getAttributesFromSet(
  client: AdobeCommerceClient,
  attributeSetId: number
): Promise<ApiResponse<ProductAttribute[]>> {
  const endpoint = `/products/attribute-sets/${attributeSetId}/attributes`;
  try {
    const data = await client.get<ProductAttribute[]>(endpoint);
    return apiSuccessResponse<ProductAttribute[]>(endpoint, Array.isArray(data) ? data : []);
  } catch (error) {
    return apiErrorResponse<ProductAttribute[]>(endpoint, error);
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

export async function assignAttributeToSetGroup(
  client: AdobeCommerceClient,
  params: { attributeSetId: number; attributeGroupId: number; attributeCode: string; sortOrder?: number }
): Promise<ApiResponse<boolean>> {
  const endpoint = "/products/attribute-sets/attributes";
  try {
    params.sortOrder = params.sortOrder ?? 0;
    
    await client.post(endpoint, params);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function getAttributeGroupsForSet(client: AdobeCommerceClient, criteria: SearchCriteria): Promise<AttributeGroup[]> {
  const searchCriteria = buildSearchCriteriaQuery(criteria);
  const endpoint = `/products/attribute-sets/groups/list?${searchCriteria}`;
  try {
    const data = await client.get<{ items: AttributeGroup[] }>(endpoint);
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch {
    return [];
  }
}

export async function createAttributeGroup(client: AdobeCommerceClient, group: AttributeGroup): Promise<ApiResponse<AttributeGroup>> {
  const endpoint = "/products/attribute-sets/groups";
  try {
    const data = await client.post(endpoint, { group });
    return apiSuccessResponse<AttributeGroup>(endpoint, data as AttributeGroup);
  } catch (error) {
    return apiErrorResponse<AttributeGroup>(endpoint, error);
  }
}

export async function deleteAttributeGroup(client: AdobeCommerceClient, attributeGroupId: number): Promise<ApiResponse<boolean>> {
  const endpoint = `/products/attribute-sets/groups/${attributeGroupId}`;
  try {
    await client.delete(endpoint);
    return apiSuccessResponse<boolean>(endpoint, true);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function updateAttributeGroup(
  client: AdobeCommerceClient,
  attributeSetId: number,
  group: AttributeGroup
): Promise<ApiResponse<AttributeGroup>> {
  const endpoint = `/products/attribute-sets/${attributeSetId}/groups`;
  try {
    const data = await client.put(endpoint, { group });
    return apiSuccessResponse<AttributeGroup>(endpoint, data as AttributeGroup);
  } catch (error) {
    return apiErrorResponse<AttributeGroup>(endpoint, error);
  }
}
