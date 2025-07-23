import { CreateProductInput, UpdateProductInput } from "../schemas";
import { Product } from "../types/product";

function buildCustomAttributes(input: {
  description?: string;
  short_description?: string;
  meta_title?: string;
  meta_keyword?: string;
  meta_description?: string;
  custom_attributes?: Array<{ attribute_code: string; value: string | number | boolean }>;
}): Array<{ attribute_code: string; value: string | number | boolean }> | undefined {
  const allCustomAttributes: Array<{ attribute_code: string; value: string | number | boolean }> = [];

  if (input.custom_attributes) {
    allCustomAttributes.push(...input.custom_attributes);
  }

  if (input.description !== undefined) {
    allCustomAttributes.push({ attribute_code: "description", value: input.description });
  }
  if (input.short_description !== undefined) {
    allCustomAttributes.push({ attribute_code: "short_description", value: input.short_description });
  }
  if (input.meta_title !== undefined) {
    allCustomAttributes.push({ attribute_code: "meta_title", value: input.meta_title });
  }
  if (input.meta_keyword !== undefined) {
    allCustomAttributes.push({ attribute_code: "meta_keyword", value: input.meta_keyword });
  }
  if (input.meta_description !== undefined) {
    allCustomAttributes.push({ attribute_code: "meta_description", value: input.meta_description });
  }

  return allCustomAttributes.length > 0 ? allCustomAttributes : undefined;
}

export function mapCreateProductInputToApiPayload(input: CreateProductInput): Product {
  const { sku, name, price, attribute_set_id, status, visibility, type_id, weight, extension_attributes } = input;

  const product: Product = {
    sku,
    name,
    price,
    attribute_set_id,
    status,
    visibility,
    type_id,
    weight,
    extension_attributes,
  };

  const customAttributes = buildCustomAttributes(input);
  if (customAttributes) {
    product.custom_attributes = customAttributes;
  }

  return Object.fromEntries(Object.entries(product).filter(([, value]) => value !== undefined)) as Product;
}

export function mapUpdateProductInputToApiPayload(input: UpdateProductInput): Partial<Product> {
  const { sku, name, price, attribute_set_id, status, visibility, type_id, weight, extension_attributes } = input;

  const product: Partial<Product> = {};

  if (sku !== undefined) product.sku = sku;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (attribute_set_id !== undefined) product.attribute_set_id = attribute_set_id;
  if (status !== undefined) product.status = status;
  if (visibility !== undefined) product.visibility = visibility;
  if (type_id !== undefined) product.type_id = type_id;
  if (weight !== undefined) product.weight = weight;
  if (extension_attributes !== undefined) product.extension_attributes = extension_attributes;

  const customAttributes = buildCustomAttributes(input);
  if (customAttributes) {
    product.custom_attributes = customAttributes;
  }

  return product;
}
