/**
 * TypeScript interfaces for Adobe Commerce Inventory Source Items
 */

/**
 * Source Item interface representing amount of product on physical storage
 * Entity id getter is missed because entity identifies by compound identifier (sku and source_code)
 */
export interface SourceItem {
  sku?: string;
  source_code?: string;
  quantity?: number;
  status?: number;
  extension_attributes?: SourceItemExtensionAttributes;
}

/**
 * Source Item extension attributes interface
 */
export interface SourceItemExtensionAttributes {
  [key: string]: unknown;
}

 