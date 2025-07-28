import { AdobeCommerceClient } from "../adobe-commerce-client";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type { BasePrice, Cost, PriceUpdateResult, SpecialPrice, TierPrice } from "./types/pricing";

export async function setBasePrices(client: AdobeCommerceClient, payload: { prices: BasePrice[] }): Promise<ApiResponse<PriceUpdateResult[]>> {
  const endpoint = "/products/base-prices";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<PriceUpdateResult[]>(endpoint, data as PriceUpdateResult[]);
  } catch (error) {
    return apiErrorResponse<PriceUpdateResult[]>(endpoint, error);
  }
}

export async function getBasePrices(client: AdobeCommerceClient, payload: { skus: string[] }): Promise<ApiResponse<BasePrice[]>> {
  const endpoint = "/products/base-prices-information";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<BasePrice[]>(endpoint, data as BasePrice[]);
  } catch (error) {
    return apiErrorResponse<BasePrice[]>(endpoint, error);
  }
}

export async function setSpecialPrices(client: AdobeCommerceClient, payload: { prices: SpecialPrice[] }): Promise<ApiResponse<PriceUpdateResult[]>> {
  const endpoint = "/products/special-price";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<PriceUpdateResult[]>(endpoint, data as PriceUpdateResult[]);
  } catch (error) {
    return apiErrorResponse<PriceUpdateResult[]>(endpoint, error);
  }
}

export async function deleteSpecialPrices(
  client: AdobeCommerceClient,
  payload: { prices: SpecialPrice[] }
): Promise<ApiResponse<PriceUpdateResult[]>> {
  const endpoint = "/products/special-price-delete";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<PriceUpdateResult[]>(endpoint, data as PriceUpdateResult[]);
  } catch (error) {
    return apiErrorResponse<PriceUpdateResult[]>(endpoint, error);
  }
}

export async function getSpecialPrices(client: AdobeCommerceClient, payload: { skus: string[] }): Promise<ApiResponse<SpecialPrice[]>> {
  const endpoint = "/products/special-price-information";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<SpecialPrice[]>(endpoint, data as SpecialPrice[]);
  } catch (error) {
    return apiErrorResponse<SpecialPrice[]>(endpoint, error);
  }
}

export async function setTierPrices(client: AdobeCommerceClient, payload: { prices: TierPrice[] }): Promise<ApiResponse<PriceUpdateResult[]>> {
  const endpoint = "/products/tier-prices";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<PriceUpdateResult[]>(endpoint, data as PriceUpdateResult[]);
  } catch (error) {
    return apiErrorResponse<PriceUpdateResult[]>(endpoint, error);
  }
}

export async function replaceTierPrices(client: AdobeCommerceClient, payload: { prices: TierPrice[] }): Promise<ApiResponse<PriceUpdateResult[]>> {
  const endpoint = "/products/tier-prices";
  try {
    const data = await client.put(endpoint, payload);
    return apiSuccessResponse<PriceUpdateResult[]>(endpoint, data as PriceUpdateResult[]);
  } catch (error) {
    return apiErrorResponse<PriceUpdateResult[]>(endpoint, error);
  }
}

export async function deleteTierPrices(client: AdobeCommerceClient, payload: { prices: TierPrice[] }): Promise<ApiResponse<PriceUpdateResult[]>> {
  const endpoint = "/products/tier-prices-delete";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<PriceUpdateResult[]>(endpoint, data as PriceUpdateResult[]);
  } catch (error) {
    return apiErrorResponse<PriceUpdateResult[]>(endpoint, error);
  }
}

export async function getTierPrices(client: AdobeCommerceClient, payload: { skus: string[] }): Promise<ApiResponse<TierPrice[]>> {
  const endpoint = "/products/tier-prices-information";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<TierPrice[]>(endpoint, data as TierPrice[]);
  } catch (error) {
    return apiErrorResponse<TierPrice[]>(endpoint, error);
  }
}

export async function setCosts(client: AdobeCommerceClient, payload: { prices: Cost[] }): Promise<ApiResponse<PriceUpdateResult[]>> {
  const endpoint = "/products/cost";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<PriceUpdateResult[]>(endpoint, data as PriceUpdateResult[]);
  } catch (error) {
    return apiErrorResponse<PriceUpdateResult[]>(endpoint, error);
  }
}

export async function deleteCosts(client: AdobeCommerceClient, payload: { skus: string[] }): Promise<ApiResponse<boolean>> {
  const endpoint = "/products/cost-delete";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<boolean>(endpoint, data as boolean);
  } catch (error) {
    return apiErrorResponse<boolean>(endpoint, error);
  }
}

export async function getCosts(client: AdobeCommerceClient, payload: { skus: string[] }): Promise<ApiResponse<Cost[]>> {
  const endpoint = "/products/cost-information";
  try {
    const data = await client.post(endpoint, payload);
    return apiSuccessResponse<Cost[]>(endpoint, data as Cost[]);
  } catch (error) {
    return apiErrorResponse<Cost[]>(endpoint, error);
  }
}
