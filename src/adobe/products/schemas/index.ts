// Common validation schemas used across all modules
export * from "./common/validation-schemas";

// Product attribute management
export * from "./attributes/attribute-options";
export * from "./attributes/product-attributes";

// Attribute set and group management
export * from "./attribute-sets/attribute-groups";
export * from "./attribute-sets/attribute-sets";

// Product management
export * from "./products/configurable-products";
export * from "./products/products";

// Product website assignment
export * from "./websites/websites";

// TypeScript type definitions
export * from "./types";

/**
 * Quick Reference Guide:
 *
 * Products:
 * - createProductInputSchema: Create new products
 * - updateProductInputSchema: Modify existing products
 * - getProductBySkuInputSchema: Retrieve product by SKU
 * - deleteProductInputSchema: Remove products
 *
 * Configurable Products:
 * - addConfigurableProductOptionInputSchema: Define attributes and options for configurable products
 * - updateConfigurableProductOptionInputSchema: Update existing configurable product options
 * - deleteConfigurableProductOptionInputSchema: Remove configurable product options
 * - linkConfigurableChildInputSchema: Link child products as variants
 * - unlinkConfigurableChildInputSchema: Remove child products from variants
 * - getConfigurableProductChildrenInputSchema: Retrieve all child products for configurable product
 * - getConfigurableProductOptionsAllInputSchema: Retrieve all configurable options for product
 * - getConfigurableProductOptionByIdInputSchema: Retrieve specific configurable option by ID
 *
 * Website Assignment:
 * - assignProductToWebsiteInputSchema: Assign product to website
 * - removeProductFromWebsiteInputSchema: Remove product from website
 *
 * Product Attributes:
 * - createProductAttributeInputSchema: Create new attributes (color, size, etc.)
 * - updateProductAttributeInputSchema: Modify existing attributes
 * - deleteProductAttributeInputSchema: Remove user-defined attributes
 * - getProductAttributeByCodeInputSchema: Retrieve attribute details
 *
 * Attribute Options:
 * - addProductAttributeOptionInputSchema: Add option to select/multiselect
 * - updateProductAttributeOptionInputSchema: Modify existing option
 * - deleteProductAttributeOptionInputSchema: Remove option
 * - getProductAttributeOptionsInputSchema: List all options for attribute
 *
 * Attribute Sets:
 * - createAttributeSetInputSchema: Create new product type templates
 * - updateAttributeSetInputSchema: Modify set properties
 * - deleteAttributeSetInputSchema: Remove unused sets
 * - assignAttributeToSetGroupInputSchema: Organize attributes within sets
 *
 * Attribute Groups:
 * - createAttributeGroupInputSchema: Create logical sections within sets
 * - updateAttributeGroupInputSchema: Modify group properties
 * - deleteAttributeGroupInputSchema: Remove empty groups
 *
 * Common Validation:
 * - attributeCodeSchema: Validates attribute identifiers
 * - nonEmptyLabelSchema: Ensures all labels have content
 * - storeLabelsSchema: Multi-store label configurations
 * - sortOrderSchema: Consistent ordering validation
 */
