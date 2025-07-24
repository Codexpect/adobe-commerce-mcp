import { z } from "zod";
import { storeCodeSchema } from "../../../core/validation-schemas";

/**
 * Schema for retrieving store configurations
 * 
 * Optional fields:
 * - store_codes: Array of store codes to filter by (if not provided, all stores are returned)
 */
export const getStoreConfigsInputSchema = {
  store_codes: z.array(storeCodeSchema).optional().describe("Array of store codes to filter by"),
} as const;
