import { CreateProductInput, UpdateProductInput, AssignProductToWebsiteInput } from "../schemas";
import { Product, ProductWebsiteLink } from "../types/product";

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
    website_ids, 
    category_links, 
    custom_attributes 
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
  };

  if (custom_attributes) {
    product.custom_attributes = custom_attributes;
  }

  const extension_attributes: Product['extension_attributes'] = {};
  if (website_ids) {
    extension_attributes.website_ids = website_ids;
  }
  if (category_links) {
    extension_attributes.category_links = category_links;
  }

  if (Object.keys(extension_attributes).length > 0) {
    product.extension_attributes = extension_attributes;
  }

  return Object.fromEntries(Object.entries(product).filter(([, value]) => value !== undefined)) as Product;
}

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
    website_ids, 
    category_links, 
    custom_attributes 
  } = input;

  const product: Partial<Product> = {};

  if (sku !== undefined) product.sku = sku;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (attribute_set_id !== undefined) product.attribute_set_id = attribute_set_id;
  if (status !== undefined) product.status = status;
  if (visibility !== undefined) product.visibility = visibility;
  if (type_id !== undefined) product.type_id = type_id;
  if (weight !== undefined) product.weight = weight;

  if (custom_attributes) {
    product.custom_attributes = custom_attributes;
  }

  const extension_attributes: Product['extension_attributes'] = {};
  
  if (website_ids) {
    extension_attributes.website_ids = website_ids;
  }
  
  if (category_links) {
    extension_attributes.category_links = category_links;
  }

  if (Object.keys(extension_attributes).length > 0) {
    product.extension_attributes = extension_attributes;
  }

  return product;
}

export function mapAssignProductToWebsiteInputToApiPayload(input: AssignProductToWebsiteInput): ProductWebsiteLink {
  return {
    sku: input.sku,
    website_id: input.website_id,
  };
}
