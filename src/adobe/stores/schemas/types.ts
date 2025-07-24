import { z } from "zod";
import { getStoreConfigsInputSchema } from "./stores/stores";

/**
 * TypeScript type definitions for all store schemas
 *
 * These types are automatically inferred from the Zod schemas to ensure
 * consistency between runtime validation and compile-time type checking.
 */

export type GetStoreConfigsInput = z.infer<ReturnType<typeof z.object<typeof getStoreConfigsInputSchema>>>;
