import { z } from "zod";
import { productSkuSchema } from "../../../core/validation-schemas";
import {
  itemIdSchema,
  quantitySchema,
  backordersSchema,
  scopeIdSchema,
  inventoryPageSizeSchema,
  currentPageSchema,
} from "../common/validation-schemas";

/**
 * Schema for getting stock item by product SKU
 *
 * Required fields:
 * - productSku: Product SKU to get stock information for
 *
 * Optional fields:
 * - scopeId: Store scope ID (defaults to global scope)
 */
export const getStockItemInputSchema = {
  productSku: productSkuSchema,
  scopeId: scopeIdSchema.optional(),
};

/**
 * Schema for updating stock item information
 *
 * Required fields:
 * - productSku: Product SKU to update
 * - itemId: Stock item ID to update
 *
 * Optional fields (at least one should be provided):
 * - qty: Product quantity
 * - isInStock: Whether product is in stock
 * - manageStock: Whether to manage stock for this product
 * - minQty: Minimum quantity allowed
 * - minSaleQty: Minimum sale quantity
 * - maxSaleQty: Maximum sale quantity
 * - backorders: Backorder configuration
 * - notifyStockQty: Notify when stock reaches this quantity
 * - qtyIncrements: Quantity increments for purchase
 * - enableQtyIncrements: Whether to enable quantity increments
 * - useConfigMinQty: Use configuration for minimum quantity
 * - useConfigMinSaleQty: Use configuration for minimum sale quantity
 * - useConfigMaxSaleQty: Use configuration for maximum sale quantity
 * - useConfigBackorders: Use configuration for backorders
 * - useConfigNotifyStockQty: Use configuration for stock notification
 * - useConfigQtyIncrements: Use configuration for quantity increments
 * - useConfigEnableQtyInc: Use configuration for enabling quantity increments
 * - useConfigManageStock: Use configuration for stock management
 * - isQtyDecimal: Whether quantity can be decimal
 * - showDefaultNotificationMessage: Show default notification message
 */
export const updateStockItemInputSchema = {
  productSku: productSkuSchema,
  itemId: itemIdSchema,
  qty: quantitySchema.optional(),
  isInStock: z.boolean().optional().describe("Whether the product is in stock"),
  manageStock: z.boolean().optional().describe("Whether to manage stock for this product"),
  minQty: quantitySchema.optional().describe("Minimum quantity allowed in stock"),
  minSaleQty: quantitySchema.optional().describe("Minimum quantity for sale"),
  maxSaleQty: quantitySchema.optional().describe("Maximum quantity for sale"),
  backorders: backordersSchema.optional(),
  notifyStockQty: quantitySchema.optional().describe("Notify when stock reaches this quantity"),
  qtyIncrements: quantitySchema.optional().describe("Quantity increments for purchase"),
  enableQtyIncrements: z.boolean().optional().describe("Whether to enable quantity increments"),
  useConfigMinQty: z.boolean().optional().describe("Use configuration for minimum quantity"),
  useConfigMinSaleQty: z.boolean().optional().describe("Use configuration for minimum sale quantity"),
  useConfigMaxSaleQty: z.boolean().optional().describe("Use configuration for maximum sale quantity"),
  useConfigBackorders: z.boolean().optional().describe("Use configuration for backorders"),
  useConfigNotifyStockQty: z.boolean().optional().describe("Use configuration for stock notification"),
  useConfigQtyIncrements: z.boolean().optional().describe("Use configuration for quantity increments"),
  useConfigEnableQtyInc: z.boolean().optional().describe("Use configuration for enabling quantity increments"),
  useConfigManageStock: z.boolean().optional().describe("Use configuration for stock management"),
  isQtyDecimal: z.boolean().optional().describe("Whether quantity can be decimal"),
  showDefaultNotificationMessage: z.boolean().optional().describe("Show default notification message"),
};

/**
 * Schema for getting low stock items
 *
 * Required fields:
 * - scopeId: Store scope ID
 * - qty: Quantity threshold for low stock
 *
 * Optional fields:
 * - currentPage: Current page number
 * - pageSize: Number of items per page
 */
export const getLowStockItemsInputSchema = {
  scopeId: scopeIdSchema,
  qty: quantitySchema,
  currentPage: currentPageSchema.optional(),
  pageSize: inventoryPageSizeSchema.optional(),
};