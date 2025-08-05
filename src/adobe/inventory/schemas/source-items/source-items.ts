import { productSkuSchema } from "../../../core/validation-schemas";
import { quantitySchema, sourceCodeSchema, sourceStatusSchema } from "../common/validation-schemas";

/**
 * Schema for creating new source items
 *
 * Required fields:
 * - sku: Product SKU identifier
 * - source_code: Source code identifier
 * - quantity: Available quantity at this source
 *
 * Optional fields:
 * - status: Source item status (1=enabled, 2=disabled)
 */
export const createSourceItemInputSchema = {
  sku: productSkuSchema,
  source_code: sourceCodeSchema.describe("Source code identifier (e.g., 'default', 'warehouse_1')."),
  quantity: quantitySchema.describe("Available quantity at this source (e.g., 100)."),
  status: sourceStatusSchema.optional().describe("Source item status: 1=enabled, 2=disabled."),
};

/**
 * Schema for deleting source items
 *
 * Required fields:
 * - sku: Product SKU identifier
 * - source_code: Source code identifier
 */
export const deleteSourceItemInputSchema = {
  sku: productSkuSchema,
  source_code: sourceCodeSchema.describe("Source code identifier (e.g., 'default', 'warehouse_1')."),
};
