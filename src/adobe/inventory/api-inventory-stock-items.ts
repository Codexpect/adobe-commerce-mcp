import { AdobeCommerceClient } from "../adobe-commerce-client";
import type { ApiResponse } from "../types/api-response";
import { apiErrorResponse, apiSuccessResponse } from "../types/api-response";
import type {
  IsProductSalableForRequestedQtyResult,
  IsProductSalableResult,
  ProductSalableResult,
  StockItem,
  StockItemCollection,
  StockStatus,
} from "./types/inventory";

/**
 * Get stock item information for a specific product
 */
export async function getStockItem(client: AdobeCommerceClient, productSku: string, scopeId?: number): Promise<ApiResponse<StockItem>> {
  const params = new URLSearchParams();
  if (scopeId !== undefined) {
    params.append("scopeId", scopeId.toString());
  }

  const endpoint = `/stockItems/${encodeURIComponent(productSku)}${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const data = await client.get<StockItem>(endpoint);
    return apiSuccessResponse<StockItem>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StockItem>(endpoint, error);
  }
}

/**
 * Update stock item information for a product
 */
export async function updateStockItem(
  client: AdobeCommerceClient,
  productSku: string,
  itemId: number,
  stockItem: StockItem
): Promise<ApiResponse<number>> {
  const endpoint = `/products/${encodeURIComponent(productSku)}/stockItems/${itemId}`;

  try {
    const data = await client.put(endpoint, { stockItem });
    return apiSuccessResponse<number>(endpoint, data as number);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
}

/**
 * Get products with low inventory quantity
 */
export async function getLowStockItems(
  client: AdobeCommerceClient,
  scopeId: number,
  qty: number,
  currentPage?: number,
  pageSize?: number
): Promise<ApiResponse<StockItemCollection>> {
  const params = new URLSearchParams();

  params.append("scopeId", scopeId.toString());
  params.append("qty", qty.toString());

  if (currentPage !== undefined) {
    params.append("currentPage", currentPage.toString());
  }
  if (pageSize !== undefined) {
    params.append("pageSize", pageSize.toString());
  }

  const endpoint = `/stockItems/lowStock/?${params.toString()}`;

  try {
    const data = await client.get<StockItemCollection>(endpoint);
    return apiSuccessResponse<StockItemCollection>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StockItemCollection>(endpoint, error);
  }
}

/**
 * Get stock status for a specific product
 */
export async function getStockStatus(client: AdobeCommerceClient, productSku: string, scopeId?: number): Promise<ApiResponse<StockStatus>> {
  const params = new URLSearchParams();
  if (scopeId !== undefined) {
    params.append("scopeId", scopeId.toString());
  }

  const endpoint = `/stockStatuses/${encodeURIComponent(productSku)}${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const data = await client.get<StockStatus>(endpoint);
    return apiSuccessResponse<StockStatus>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<StockStatus>(endpoint, error);
  }
}

/**
 * Check if products are salable for given SKUs and stock
 */
export async function areProductsSalable(
  client: AdobeCommerceClient,
  skus: string[],
  stockId: number
): Promise<ApiResponse<IsProductSalableResult[]>> {
  const params = new URLSearchParams();

  skus.forEach((sku, index) => {
    params.append(`skus[${index}]`, sku);
  });
  params.append("stockId", stockId.toString());

  const endpoint = `/inventory/are-products-salable?${params.toString()}`;

  try {
    const data = await client.get<IsProductSalableResult[]>(endpoint);
    return apiSuccessResponse<IsProductSalableResult[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<IsProductSalableResult[]>(endpoint, error);
  }
}

/**
 * Check if products are salable for requested quantities
 */
export async function areProductsSalableForRequestedQty(
  client: AdobeCommerceClient,
  skuRequests: Array<{ sku: string; qty: number }>,
  stockId: number
): Promise<ApiResponse<IsProductSalableForRequestedQtyResult[]>> {
  const params = new URLSearchParams();

  skuRequests.forEach((request, index) => {
    params.append(`skuRequests[${index}][sku]`, request.sku);
    params.append(`skuRequests[${index}][qty]`, request.qty.toString());
  });
  params.append("stockId", stockId.toString());

  const endpoint = `/inventory/are-product-salable-for-requested-qty/?${params.toString()}`;

  try {
    const data = await client.get<IsProductSalableForRequestedQtyResult[]>(endpoint);
    return apiSuccessResponse<IsProductSalableForRequestedQtyResult[]>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<IsProductSalableForRequestedQtyResult[]>(endpoint, error);
  }
}

/**
 * Check if a specific product is salable
 */
export async function isProductSalable(client: AdobeCommerceClient, sku: string, stockId: number): Promise<ApiResponse<IsProductSalableResult>> {
  const endpoint = `/inventory/is-product-salable/${encodeURIComponent(sku)}/${stockId}`;

  try {
    const data = await client.get<IsProductSalableResult>(endpoint);
    return apiSuccessResponse<IsProductSalableResult>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<IsProductSalableResult>(endpoint, error);
  }
}

/**
 * Check if a product is salable for a specific quantity
 */
export async function isProductSalableForRequestedQty(
  client: AdobeCommerceClient,
  sku: string,
  stockId: number,
  requestedQty: number
): Promise<ApiResponse<ProductSalableResult>> {
  const endpoint = `/inventory/is-product-salable-for-requested-qty/${encodeURIComponent(sku)}/${stockId}/${requestedQty}`;

  try {
    const data = await client.get<ProductSalableResult>(endpoint);
    return apiSuccessResponse<ProductSalableResult>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<ProductSalableResult>(endpoint, error);
  }
}

/**
 * Get salable quantity for a product
 */
export async function getProductSalableQuantity(client: AdobeCommerceClient, sku: string, stockId: number): Promise<ApiResponse<number>> {
  const endpoint = `/inventory/get-product-salable-quantity/${encodeURIComponent(sku)}/${stockId}`;

  try {
    const data = await client.get<number>(endpoint);
    return apiSuccessResponse<number>(endpoint, data);
  } catch (error) {
    return apiErrorResponse<number>(endpoint, error);
  }
} 