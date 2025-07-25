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

import { createProductInputSchema, deleteProductInputSchema, getProductBySkuInputSchema, updateProductInputSchema } from "./products/products";

import {
  addConfigurableProductOptionInputSchema,
  deleteConfigurableProductOptionInputSchema,
  getConfigurableProductChildrenInputSchema,
  getConfigurableProductOptionByIdInputSchema,
  getConfigurableProductOptionsAllInputSchema,
  linkConfigurableChildInputSchema,
  unlinkConfigurableChildInputSchema,
  updateConfigurableProductOptionInputSchema,
} from "./products/configurable-products";
import { assignProductToWebsiteInputSchema, removeProductFromWebsiteInputSchema } from "./websites/websites";

/**
 * TypeScript type definitions for all product attribute-related schemas
 *
 * These types are automatically inferred from the Zod schemas to ensure
 * consistency between runtime validation and compile-time type checking.
 */

// Product Types
export type CreateProductInput = z.infer<ReturnType<typeof z.object<typeof createProductInputSchema>>>;
export type UpdateProductInput = z.infer<ReturnType<typeof z.object<typeof updateProductInputSchema>>>;
export type GetProductBySkuInput = z.infer<ReturnType<typeof z.object<typeof getProductBySkuInputSchema>>>;
export type DeleteProductInput = z.infer<ReturnType<typeof z.object<typeof deleteProductInputSchema>>>;

// Product Website Assignment Types
export type AssignProductToWebsiteInput = z.infer<ReturnType<typeof z.object<typeof assignProductToWebsiteInputSchema>>>;
export type RemoveProductFromWebsiteInput = z.infer<ReturnType<typeof z.object<typeof removeProductFromWebsiteInputSchema>>>;

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

// Configurable Product Types
export type AddConfigurableProductOptionInput = z.infer<ReturnType<typeof z.object<typeof addConfigurableProductOptionInputSchema>>>;
export type UpdateConfigurableProductOptionInput = z.infer<ReturnType<typeof z.object<typeof updateConfigurableProductOptionInputSchema>>>;
export type DeleteConfigurableProductOptionInput = z.infer<ReturnType<typeof z.object<typeof deleteConfigurableProductOptionInputSchema>>>;
export type LinkConfigurableChildInput = z.infer<ReturnType<typeof z.object<typeof linkConfigurableChildInputSchema>>>;
export type UnlinkConfigurableChildInput = z.infer<ReturnType<typeof z.object<typeof unlinkConfigurableChildInputSchema>>>;
export type GetConfigurableProductChildrenInput = z.infer<ReturnType<typeof z.object<typeof getConfigurableProductChildrenInputSchema>>>;
export type GetConfigurableProductOptionsAllInput = z.infer<ReturnType<typeof z.object<typeof getConfigurableProductOptionsAllInputSchema>>>;
export type GetConfigurableProductOptionByIdInput = z.infer<ReturnType<typeof z.object<typeof getConfigurableProductOptionByIdInputSchema>>>;
