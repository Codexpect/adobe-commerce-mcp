import { z } from "zod";
import { entityIdSchema } from "../../../core/validation-schemas";
import { sourceCodeSchema } from "../common/validation-schemas";

/**
 * Schema for creating stock-source links
 *
 * Required fields:
 * - links: Array of stock-source link objects
 *
 * Each link contains:
 * - stock_id: ID of the stock
 * - source_code: Code of the source
 * - priority: Priority order for source selection
 */
export const createStockSourceLinksInputSchema = {
  links: z.array(z.object({
    stock_id: entityIdSchema.describe("Unique identifier of the stock."),
    source_code: sourceCodeSchema,
    priority: z.number().int().min(0, "Priority must be non-negative").describe("Priority order for source selection (lower number = higher priority).")
  })).min(1, "At least one link is required").describe("Array of stock-source link objects to create.")
};

/**
 * Schema for deleting stock-source links
 *
 * Required fields:
 * - links: Array of stock-source link objects to delete
 *
 * Each link contains:
 * - stock_id: ID of the stock
 * - source_code: Code of the source
 * - priority: Priority order (for identification)
 */
export const deleteStockSourceLinksInputSchema = {
  links: z.array(z.object({
    stock_id: entityIdSchema.describe("Unique identifier of the stock."),
    source_code: sourceCodeSchema,
    priority: z.number().int().min(0, "Priority must be non-negative").describe("Priority order for identification.")
  })).min(1, "At least one link is required").describe("Array of stock-source link objects to delete.")
};