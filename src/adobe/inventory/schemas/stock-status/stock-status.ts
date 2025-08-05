import { productSkuSchema } from "../../../core/validation-schemas";
import { scopeIdSchema } from "../common/validation-schemas";

/**
 * Schema for getting stock status by product SKU
 *
 * Required fields:
 * - productSku: Product SKU to get stock status for
 *
 * Optional fields:
 * - scopeId: Store scope ID (defaults to global scope)
 */
export const getStockStatusInputSchema = {
  productSku: productSkuSchema,
  scopeId: scopeIdSchema.optional(),
};
