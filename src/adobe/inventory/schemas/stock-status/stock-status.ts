import { productSkuSchema } from "../../../core/validation-schemas";

/**
 * Schema for getting stock status by product SKU
 *
 * Required fields:
 * - productSku: Product SKU to get stock status for
 */
export const getStockStatusInputSchema = {
  productSku: productSkuSchema,
};
