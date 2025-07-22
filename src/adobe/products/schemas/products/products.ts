import { z } from "zod";
import { attributeCodeSchema } from "../../../core/validation-schemas";
import { attributeSetIdSchema } from "../common/validation-schemas";

const productStatusEnum = z.number().int().min(1).max(2).describe("Product status: 1=enabled, 2=disabled");

const productVisibilityEnum = z.number().int().min(1).max(4).describe("Product visibility: 1=not visible, 2=catalog, 3=search, 4=catalog+search");

const productTypeEnum = z.enum(["simple", "configurable"]).describe("Product type: 'simple'=basic product, 'configurable'=product with variants");

export const skuSchema = z
  .string()
  .min(1, "SKU cannot be empty")
  .regex(/^[a-zA-Z0-9_-]+$/, "SKU can only contain letters, numbers, hyphens, and underscores")
  .describe("Stock Keeping Unit - unique identifier for the product (e.g., 'PROD-001', 'product_123').");

/**
 * Schema for creating new products
 *
 * Required fields:
 * - sku: Unique product identifier
 * - name: Product display name
 * - price: Product price (must be positive)
 *
 * Optional fields:
 * - attribute_set_id: Group of attributes for this product (defaults to 4)
 * - status: Product availability (defaults to enabled)
 * - visibility: Where product appears (defaults to catalog+search)
 * - type_id: Product type (defaults to simple)
 * - weight: Product weight for shipping calculations
 * - description: Detailed product description
 * - short_description: Brief product description
 * - meta_title: SEO title
 * - meta_keyword: SEO keywords
 * - meta_description: SEO description
 * - custom_attributes: Additional product properties
 * - extension_attributes: Extended product data
 */
export const createProductInputSchema = {
  sku: skuSchema,
  name: z.string().min(1, "Product name is required").describe("Display name for the product (e.g., 'iPhone 15 Pro')."),
  price: z.number().positive("Price must be positive").describe("Product price in the base currency."),
  attribute_set_id: attributeSetIdSchema.optional().default(4).describe("ID of the attribute set for this product (defaults to 4)."),
  status: productStatusEnum.optional().default(1).describe("Product status: 1=enabled, 2=disabled."),
  visibility: productVisibilityEnum.optional().default(4).describe("Product visibility: 1=not visible, 2=catalog, 3=search, 4=catalog+search."),
  type_id: productTypeEnum.optional().default("simple").describe("Product type: 'simple'=basic product, 'configurable'=product with variants."),
  weight: z.number().nonnegative("Weight cannot be negative").optional().describe("Product weight for shipping calculations."),
  description: z.string().optional().describe("Detailed product description for the product page."),
  short_description: z.string().optional().describe("Brief product description for product listings."),
  meta_title: z.string().optional().describe("SEO title for the product page."),
  meta_keyword: z.string().optional().describe("SEO keywords for the product page."),
  meta_description: z.string().optional().describe("SEO description for the product page."),
  custom_attributes: z
    .array(
      z.object({
        attribute_code: attributeCodeSchema.describe("Code of the custom attribute (e.g., 'color', 'size')."),
        value: z.union([z.string(), z.number(), z.boolean()]).describe("Value for the custom attribute."),
      })
    )
    .optional()
    .describe("Additional product properties defined by custom attributes."),
  extension_attributes: z
    .object({
      website_ids: z
        .array(z.number().positive("Website ID must be positive"))
        .optional()
        .describe("IDs of websites where this product is available."),
      category_links: z
        .array(
          z.object({
            position: z.number().nonnegative("Position cannot be negative").optional().describe("Display position within the category."),
            category_id: z.string().min(1, "Category ID cannot be empty").describe("ID of the category to link this product to."),
          })
        )
        .optional()
        .describe("Categories to associate this product with."),
    })
    .optional()
    .describe("Extended product data including website assignments and category links."),
};

/**
 * Schema for updating existing products
 *
 * Required fields:
 * - sku: Unique product identifier (used to identify the product to update)
 *
 * Optional fields:
 * - name: New product display name
 * - price: New product price
 * - attribute_set_id: New attribute set ID
 * - status: New product status
 * - visibility: New product visibility
 * - type_id: New product type
 * - weight: New product weight
 * - description: New detailed description
 * - short_description: New brief description
 * - meta_title: New SEO title
 * - meta_keyword: New SEO keywords
 * - meta_description: New SEO description
 * - custom_attributes: New custom attributes
 * - extension_attributes: New extended attributes
 */
export const updateProductInputSchema = {
  sku: skuSchema,
  name: z.string().min(1, "Product name is required").optional().describe("New display name for the product (e.g., 'iPhone 15 Pro')."),
  price: z.number().positive("Price must be positive").optional().describe("New product price in the base currency."),
  attribute_set_id: attributeSetIdSchema.optional().describe("New ID of the attribute set for this product."),
  status: productStatusEnum.optional().describe("New product status: 1=enabled, 2=disabled."),
  visibility: productVisibilityEnum.optional().describe("New product visibility: '1'=not visible, '2'=catalog, '3'=search, '4'=catalog+search."),
  type_id: productTypeEnum.optional().describe("New product type: 'simple'=basic product, 'configurable'=product with variants."),
  weight: z.number().nonnegative("Weight cannot be negative").optional().describe("New product weight for shipping calculations."),
  description: z.string().optional().describe("New detailed product description for the product page."),
  short_description: z.string().optional().describe("New brief product description for product listings."),
  meta_title: z.string().optional().describe("New SEO title for the product page."),
  meta_keyword: z.string().optional().describe("New SEO keywords for the product page."),
  meta_description: z.string().optional().describe("New SEO description for the product page."),
  custom_attributes: z
    .array(
      z.object({
        attribute_code: attributeCodeSchema.describe("Code of the custom attribute (e.g., 'color', 'size')."),
        value: z.union([z.string(), z.number(), z.boolean()]).describe("Value for the custom attribute."),
      })
    )
    .optional()
    .describe("New additional product properties defined by custom attributes."),
  extension_attributes: z
    .object({
      website_ids: z
        .array(z.number().positive("Website ID must be positive"))
        .optional()
        .describe("New IDs of websites where this product is available."),
      category_links: z
        .array(
          z.object({
            position: z.number().nonnegative("Position cannot be negative").optional().describe("New display position within the category."),
            category_id: z.string().min(1, "Category ID cannot be empty").describe("ID of the category to link this product to."),
          })
        )
        .optional()
        .describe("New categories to associate this product with."),
    })
    .optional()
    .describe("New extended product data including website assignments and category links."),
};

/**
 * Schema for retrieving a specific product by SKU
 *
 * Required fields:
 * - sku: Unique product identifier to retrieve
 */
export const getProductBySkuInputSchema = {
  sku: skuSchema,
};

/**
 * Schema for deleting a product by SKU
 *
 * Required fields:
 * - sku: Unique product identifier to delete
 */
export const deleteProductInputSchema = {
  sku: skuSchema,
};
