import { z } from "zod";
import {
  getStockItemInputSchema,
  updateStockItemInputSchema,
  getLowStockItemsInputSchema,
} from "./stock-items/stock-items";
import { getStockStatusInputSchema } from "./stock-status/stock-status";
import {
  areProductsSalableInputSchema,
  areProductsSalableForRequestedQtyInputSchema,
  isProductSalableInputSchema,
  isProductSalableForRequestedQtyInputSchema,
  getProductSalableQuantityInputSchema,
} from "./salability/salability";

/**
 * TypeScript type definitions for all inventory schemas
 *
 * These types are automatically inferred from the Zod schemas to ensure
 * consistency between runtime validation and compile-time type checking.
 */

// Stock Items
export type GetStockItemInput = z.infer<ReturnType<typeof z.object<typeof getStockItemInputSchema>>>;
export type UpdateStockItemInput = z.infer<ReturnType<typeof z.object<typeof updateStockItemInputSchema>>>;
export type GetLowStockItemsInput = z.infer<ReturnType<typeof z.object<typeof getLowStockItemsInputSchema>>>;

// Stock Status
export type GetStockStatusInput = z.infer<ReturnType<typeof z.object<typeof getStockStatusInputSchema>>>;

// Salability
export type AreProductsSalableInput = z.infer<ReturnType<typeof z.object<typeof areProductsSalableInputSchema>>>;
export type AreProductsSalableForRequestedQtyInput = z.infer<ReturnType<typeof z.object<typeof areProductsSalableForRequestedQtyInputSchema>>>;
export type IsProductSalableInput = z.infer<ReturnType<typeof z.object<typeof isProductSalableInputSchema>>>;
export type IsProductSalableForRequestedQtyInput = z.infer<ReturnType<typeof z.object<typeof isProductSalableForRequestedQtyInputSchema>>>;
export type GetProductSalableQuantityInput = z.infer<ReturnType<typeof z.object<typeof getProductSalableQuantityInputSchema>>>;