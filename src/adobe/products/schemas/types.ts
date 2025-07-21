import { z } from "zod";

// Import all schemas to generate types
import {
  createProductAttributeInputSchema,
  deleteProductAttributeInputSchema,
  getProductAttributeByCodeInputSchema,
  updateProductAttributeInputSchema,
} from "./attributes/product-attributes";

import {
  addProductAttributeOptionInputSchema,
  deleteProductAttributeOptionInputSchema,
  getProductAttributeOptionsInputSchema,
  updateProductAttributeOptionInputSchema,
} from "./attributes/attribute-options";

import {
  createAttributeSetInputSchema,
  deleteAttributeFromSetInputSchema,
  deleteAttributeSetInputSchema,
  getAttributeSetByIdInputSchema,
  getAttributesFromSetInputSchema,
  updateAttributeSetInputSchema,
} from "./attribute-sets/attribute-sets";

import {
  assignAttributeToSetGroupInputSchema,
  createAttributeGroupInputSchema,
  deleteAttributeGroupInputSchema,
  updateAttributeGroupInputSchema,
} from "./attribute-sets/attribute-groups";

/**
 * TypeScript type definitions for all product attribute-related schemas
 *
 * These types are automatically inferred from the Zod schemas to ensure
 * consistency between runtime validation and compile-time type checking.
 */

// Product Attribute Types
export type CreateProductAttributeInput = z.infer<ReturnType<typeof z.object<typeof createProductAttributeInputSchema>>>;
export type GetProductAttributeByCodeInput = z.infer<ReturnType<typeof z.object<typeof getProductAttributeByCodeInputSchema>>>;
export type UpdateProductAttributeInput = z.infer<ReturnType<typeof z.object<typeof updateProductAttributeInputSchema>>>;
export type DeleteProductAttributeInput = z.infer<ReturnType<typeof z.object<typeof deleteProductAttributeInputSchema>>>;

// Product Attribute Option Types
export type GetProductAttributeOptionsInput = z.infer<ReturnType<typeof z.object<typeof getProductAttributeOptionsInputSchema>>>;
export type AddProductAttributeOptionInput = z.infer<ReturnType<typeof z.object<typeof addProductAttributeOptionInputSchema>>>;
export type UpdateProductAttributeOptionInput = z.infer<ReturnType<typeof z.object<typeof updateProductAttributeOptionInputSchema>>>;
export type DeleteProductAttributeOptionInput = z.infer<ReturnType<typeof z.object<typeof deleteProductAttributeOptionInputSchema>>>;

// Attribute Set Types
export type CreateAttributeSetInput = z.infer<ReturnType<typeof z.object<typeof createAttributeSetInputSchema>>>;
export type UpdateAttributeSetInput = z.infer<ReturnType<typeof z.object<typeof updateAttributeSetInputSchema>>>;
export type GetAttributeSetByIdInput = z.infer<ReturnType<typeof z.object<typeof getAttributeSetByIdInputSchema>>>;
export type GetAttributesFromSetInput = z.infer<ReturnType<typeof z.object<typeof getAttributesFromSetInputSchema>>>;
export type DeleteAttributeSetInput = z.infer<ReturnType<typeof z.object<typeof deleteAttributeSetInputSchema>>>;
export type DeleteAttributeFromSetInput = z.infer<ReturnType<typeof z.object<typeof deleteAttributeFromSetInputSchema>>>;

// Attribute Group Types
export type CreateAttributeGroupInput = z.infer<ReturnType<typeof z.object<typeof createAttributeGroupInputSchema>>>;
export type UpdateAttributeGroupInput = z.infer<ReturnType<typeof z.object<typeof updateAttributeGroupInputSchema>>>;
export type DeleteAttributeGroupInput = z.infer<ReturnType<typeof z.object<typeof deleteAttributeGroupInputSchema>>>;
export type AssignAttributeToSetGroupInput = z.infer<ReturnType<typeof z.object<typeof assignAttributeToSetGroupInputSchema>>>;
