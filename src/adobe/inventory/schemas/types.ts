import { z } from "zod";
import {
  areProductsSalableForRequestedQtyInputSchema,
  areProductsSalableInputSchema,
  getProductSalableQuantityInputSchema,
  isProductSalableForRequestedQtyInputSchema,
  isProductSalableInputSchema,
} from "./salability/salability";
import { createSourceItemInputSchema, deleteSourceItemInputSchema } from "./source-items/source-items";
import { sourceSelectionAlgorithmInputSchema } from "./source-selection/source-selection";
import { createSourceInputSchema, getSourceByCodeInputSchema, updateSourceInputSchema } from "./sources/sources";
import { getLowStockItemsInputSchema, getStockItemInputSchema, updateStockItemInputSchema } from "./stock-items/stock-items";
import { createStockSourceLinksInputSchema, deleteStockSourceLinksInputSchema } from "./stock-source-links/stock-source-links";
import { getStockStatusInputSchema } from "./stock-status/stock-status";
import {
  createStockInputSchema,
  deleteStockInputSchema,
  getStockByIdInputSchema,
  resolveStockInputSchema,
  updateStockInputSchema,
} from "./stocks/stocks";

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

// Stocks
export type CreateStockInput = z.infer<ReturnType<typeof z.object<typeof createStockInputSchema>>>;
export type UpdateStockInput = z.infer<ReturnType<typeof z.object<typeof updateStockInputSchema>>>;
export type GetStockByIdInput = z.infer<ReturnType<typeof z.object<typeof getStockByIdInputSchema>>>;
export type DeleteStockInput = z.infer<ReturnType<typeof z.object<typeof deleteStockInputSchema>>>;
export type ResolveStockInput = z.infer<ReturnType<typeof z.object<typeof resolveStockInputSchema>>>;

// Sources
export type CreateSourceInput = z.infer<ReturnType<typeof z.object<typeof createSourceInputSchema>>>;
export type UpdateSourceInput = z.infer<ReturnType<typeof z.object<typeof updateSourceInputSchema>>>;
export type GetSourceByCodeInput = z.infer<ReturnType<typeof z.object<typeof getSourceByCodeInputSchema>>>;

// Stock-Source Links
export type CreateStockSourceLinksInput = z.infer<ReturnType<typeof z.object<typeof createStockSourceLinksInputSchema>>>;
export type DeleteStockSourceLinksInput = z.infer<ReturnType<typeof z.object<typeof deleteStockSourceLinksInputSchema>>>;

// Source Selection
export type SourceSelectionAlgorithmInput = z.infer<ReturnType<typeof z.object<typeof sourceSelectionAlgorithmInputSchema>>>;

// Source Items
export type CreateSourceItemInput = z.infer<ReturnType<typeof z.object<typeof createSourceItemInputSchema>>>;

export type DeleteSourceItemInput = z.infer<ReturnType<typeof z.object<typeof deleteSourceItemInputSchema>>>;
