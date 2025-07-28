import { z } from "zod";
import { entityIdSchema, productSkuSchema } from "../../../core/validation-schemas";
import { optionIdSchema } from "../common/validation-schemas";

/**
 * Simplified schema for adding configurable product options
 *
 * Defines which attribute and option are used in a configurable product.
 * This creates the framework for product variants (e.g., T-shirt with color and size options).
 *
 * Required fields:
 * - sku: The SKU of the configurable product
 * - attributeId: The ID of the attribute to use for configuration
 * - optionIds: The option IDs to use for this configuration
 * - label: Human-readable label for the attribute
 * - position: Display position/order of this option
 * - isUseDefault: Whether to use default values
 */
export const addConfigurableProductOptionInputSchema = {
  sku: productSkuSchema,
  attributeId: entityIdSchema.describe("The ID of the attribute to use for configuration."),
  optionIds: z.array(optionIdSchema).min(1, "At least one option ID is required").describe("The option IDs to use for this configuration."),
  label: z
    .string()
    .optional()
    .describe(
      "Human-readable label for the attribute (e.g., 'Color', 'Size', 'Material'). " +
        "This is displayed to customers in the product configuration interface."
    ),
  position: z
    .number()
    .int()
    .optional()
    .default(0)
    .describe(
      "Display position/order of this option relative to other configurable options. " + "Lower numbers appear first (e.g., 1=first, 2=second)."
    ),
  isUseDefault: z
    .boolean()
    .optional()
    .describe("Whether to use default values for this configuration option. " + "When true, the system will use predefined default values."),
};

/**
 * Schema for linking a child product to a configurable product
 *
 * Links a simple product (variant) to its parent configurable product.
 * The child product must have the configurable attributes defined in the parent.
 *
 * Required fields:
 * - sku: The SKU of the parent configurable product
 * - childSku: The SKU of the child product to link
 */
export const linkConfigurableChildInputSchema = {
  sku: productSkuSchema,
  childSku: productSkuSchema.describe("The SKU of the child product to link."),
};

/**
 * Schema for unlinking a child product from a configurable product
 *
 * Removes the association between a child product and its parent configurable product.
 * The child product remains in the system but is no longer a variant of the parent.
 *
 * Required fields:
 * - sku: The SKU of the parent configurable product
 * - childSku: The SKU of the child product to unlink
 */
export const unlinkConfigurableChildInputSchema = {
  sku: productSkuSchema,
  childSku: productSkuSchema,
};

/**
 * Schema for retrieving all child products for a configurable product
 *
 * Gets all simple products that are linked as variants to a configurable product.
 * These are the actual purchasable products that customers can select.
 *
 * Required fields:
 * - sku: The SKU of the parent configurable product
 */
export const getConfigurableProductChildrenInputSchema = {
  sku: productSkuSchema,
};

/**
 * Schema for retrieving all configurable options for a configurable product
 *
 * Gets all the configurable attributes and their options that define the product variants.
 * These are the attributes like color, size, material that customers can choose from.
 *
 * Required fields:
 * - sku: The SKU of the configurable product
 */
export const getConfigurableProductOptionsAllInputSchema = {
  sku: productSkuSchema,
};

/**
 * Schema for retrieving a specific configurable option by ID
 *
 * Gets details of a specific configurable attribute and its options for a configurable product.
 * This is useful for getting information about a particular attribute like color or size.
 *
 * Required fields:
 * - sku: The SKU of the configurable product
 * - id: The ID of the specific configurable option to retrieve
 */
export const getConfigurableProductOptionByIdInputSchema = {
  sku: productSkuSchema,
  id: entityIdSchema,
};

/**
 * Schema for updating an existing configurable product option
 *
 * Updates the configuration of an existing attribute and its options for a configurable product.
 * This allows modifying the available variants without recreating the entire configuration.
 *
 * Required fields:
 * - sku: The SKU of the configurable product
 * - id: The ID of the configurable option to update
 * - attributeId: The ID of the attribute to use for configuration
 * - optionIds: The option IDs to use for this configuration
 *
 * Optional fields:
 * - label: Human-readable label for the attribute
 * - position: Display position/order of this option
 * - isUseDefault: Whether to use default values
 */
export const updateConfigurableProductOptionInputSchema = {
  sku: productSkuSchema,
  id: entityIdSchema,
  attributeId: entityIdSchema.describe("The ID of the attribute to use for configuration."),
  optionIds: z.array(optionIdSchema).min(1, "At least one option ID is required").describe("The option IDs to use for this configuration."),
  label: z
    .string()
    .optional()
    .describe(
      "Human-readable label for the attribute (e.g., 'Color', 'Size', 'Material'). " +
        "This is displayed to customers in the product configuration interface."
    ),
  position: z
    .number()
    .int()
    .optional()
    .default(0)
    .describe(
      "Display position/order of this option relative to other configurable options. " + "Lower numbers appear first (e.g., 1=first, 2=second)."
    ),
  isUseDefault: z
    .boolean()
    .optional()
    .describe("Whether to use default values for this configuration option. " + "When true, the system will use predefined default values."),
};

/**
 * Schema for deleting a configurable product option
 *
 * Removes a configurable attribute and its options from a configurable product.
 * This will remove the ability for customers to select that attribute when purchasing.
 *
 * Required fields:
 * - sku: The SKU of the configurable product
 * - id: The ID of the configurable option to delete
 */
export const deleteConfigurableProductOptionInputSchema = {
  sku: productSkuSchema,
  id: entityIdSchema,
};
