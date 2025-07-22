import { CreateProductInput, UpdateProductInput } from "../schemas";
import { Product } from "../types/product";

/**
 * Maps the CreateProductInput schema to the API payload format expected by Adobe Commerce.
 * 
 * @param input - The validated input from the createProductInputSchema
 * @returns Product object ready for API submission
 */
export function mapCreateProductInputToApiPayload(input: CreateProductInput): Product {
  const {
    sku,
    name,
    price,
    attribute_set_id,
    status,
    visibility,
    type_id,
    weight,
    description,
    short_description,
    meta_title,
    meta_keyword,
    meta_description,
    custom_attributes,
    extension_attributes,
  } = input;

  const product: Product = {
    sku,
    name,
    price,
    attribute_set_id,
    status,
    visibility,
    type_id,
    weight,
    description,
    short_description,
    meta_title,
    meta_keyword,
    meta_description,
    custom_attributes,
    extension_attributes,
  };

  // Remove undefined values to keep the payload clean
  return Object.fromEntries(
    Object.entries(product).filter(([_, value]) => value !== undefined)
  ) as Product;
}

/**
 * Maps the UpdateProductInput schema to the API payload format for updating products.
 * 
 * @param input - The validated input from the updateProductInputSchema
 * @returns Product object ready for API submission (only includes provided fields)
 */
export function mapUpdateProductInputToApiPayload(input: UpdateProductInput): Partial<Product> {
  const {
    sku,
    name,
    price,
    attribute_set_id,
    status,
    visibility,
    type_id,
    weight,
    description,
    short_description,
    meta_title,
    meta_keyword,
    meta_description,
    custom_attributes,
    extension_attributes,
  } = input;

  const product: Partial<Product> = {};

  // Only include fields that are provided (not undefined)
  if (sku !== undefined) product.sku = sku;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (attribute_set_id !== undefined) product.attribute_set_id = attribute_set_id;
  if (status !== undefined) product.status = status;
  if (visibility !== undefined) product.visibility = visibility;
  if (type_id !== undefined) product.type_id = type_id;
  if (weight !== undefined) product.weight = weight;
  if (description !== undefined) product.description = description;
  if (short_description !== undefined) product.short_description = short_description;
  if (meta_title !== undefined) product.meta_title = meta_title;
  if (meta_keyword !== undefined) product.meta_keyword = meta_keyword;
  if (meta_description !== undefined) product.meta_description = meta_description;
  if (custom_attributes !== undefined) product.custom_attributes = custom_attributes;
  if (extension_attributes !== undefined) product.extension_attributes = extension_attributes;

  return product;
} 