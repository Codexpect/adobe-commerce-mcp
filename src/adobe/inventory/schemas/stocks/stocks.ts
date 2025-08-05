import { z } from "zod";
import { entityIdSchema } from "../../../core/validation-schemas";
import { salesChannelSchema, salesChannelTypeSchema, salesChannelCodeSchema } from "../common/validation-schemas";

/**
 * Schema for stock entity representing product aggregation among physical storages
 *
 * Required fields:
 * - name: Human-readable name for the stock
 *
 * Optional fields:
 * - stock_id: Auto-generated unique identifier (for updates)
 * - sales_channels: Array of sales channels associated with this stock
 */
export const createStockInputSchema = {
  name: z.string().min(1, "Stock name is required").describe("Human-readable name for the stock (e.g., 'Main Stock', 'EU Warehouse Stock')."),
  sales_channels: z.array(salesChannelSchema).optional().describe("Sales channels associated with this stock.")
};

/**
 * Schema for updating existing stocks
 *
 * Required fields:
 * - stock_id: Unique identifier of the stock to update
 *
 * Optional fields:
 * - name: Updated stock name
 * - sales_channels: Updated sales channels associated with this stock
 */
export const updateStockInputSchema = {
  stock_id: entityIdSchema.describe("Unique identifier of the stock to update."),
  name: z.string().min(1, "Stock name cannot be empty").optional().describe("Updated human-readable name for the stock."),
  sales_channels: z.array(salesChannelSchema).optional().describe("Updated sales channels associated with this stock.")
};

/**
 * Schema for getting stock by ID
 *
 * Required fields:
 * - stock_id: Unique identifier of the stock to retrieve
 */
export const getStockByIdInputSchema = {
  stock_id: entityIdSchema.describe("Unique identifier of the stock to retrieve.")
};

/**
 * Schema for deleting stock
 *
 * Required fields:
 * - stock_id: Unique identifier of the stock to delete
 */
export const deleteStockInputSchema = {
  stock_id: entityIdSchema.describe("Unique identifier of the stock to delete.")
};

/**
 * Schema for resolving stock by sales channel
 *
 * Required fields:
 * - type: Sales channel type (e.g., 'website')
 * - code: Sales channel code (e.g., 'base')
 */
export const resolveStockInputSchema = {
  type: salesChannelTypeSchema,
  code: salesChannelCodeSchema,
};