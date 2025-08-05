/**
 * TypeScript interfaces for Adobe Commerce Inventory Management
 */

/**
 * Stock Item interface representing product inventory information
 */
export interface StockItem {
  item_id?: number;
  product_id?: number;
  stock_id?: number;
  qty?: number;
  is_in_stock?: boolean;
  is_qty_decimal?: boolean;
  show_default_notification_message?: boolean;
  use_config_min_qty?: boolean;
  min_qty?: number;
  use_config_min_sale_qty?: boolean;
  min_sale_qty?: number;
  use_config_max_sale_qty?: boolean;
  max_sale_qty?: number;
  use_config_backorders?: boolean;
  backorders?: number;
  use_config_notify_stock_qty?: boolean;
  notify_stock_qty?: number;
  use_config_qty_increments?: boolean;
  qty_increments?: number;
  use_config_enable_qty_inc?: boolean;
  enable_qty_increments?: boolean;
  use_config_manage_stock?: boolean;
  manage_stock?: boolean;
  low_stock_date?: string;
  is_decimal_divided?: boolean;
  stock_status_changed_auto?: number;
  extension_attributes?: StockItemExtensionAttributes;
}

/**
 * Stock Item extension attributes
 */
export interface StockItemExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Stock Status interface
 */
export interface StockStatus {
  product_id?: number;
  stock_id?: number;
  qty?: number;
  stock_status?: number;
  stock_item?: StockItem;
}

/**
 * Stock Item Collection interface for low stock queries
 */
export interface StockItemCollection {
  items?: StockItem[];
  search_criteria?: unknown;
  total_count?: number;
}

/**
 * Product Salable Result interface
 */
export interface ProductSalableResult {
  sku?: string;
  is_salable?: boolean;
  errors?: ProductSalabilityError[];
  extension_attributes?: ProductSalableResultExtensionAttributes;
}

/**
 * Product Salability Error interface
 */
export interface ProductSalabilityError {
  code?: string;
  message?: string;
  extension_attributes?: ProductSalabilityErrorExtensionAttributes;
}

/**
 * Product Salable Result extension attributes
 */
export interface ProductSalableResultExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Product Salability Error extension attributes
 */
export interface ProductSalabilityErrorExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Is Product Salable Result interface
 */
export interface IsProductSalableResult {
  sku?: string;
  stock_id?: number;
  is_salable?: boolean;
  extension_attributes?: IsProductSalableResultExtensionAttributes;
}

/**
 * Is Product Salable Result extension attributes
 */
export interface IsProductSalableResultExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Is Product Salable For Requested Qty Result interface
 */
export interface IsProductSalableForRequestedQtyResult {
  sku?: string;
  is_salable?: boolean;
  errors?: ProductSalabilityError[];
  extension_attributes?: IsProductSalableForRequestedQtyResultExtensionAttributes;
}

/**
 * Is Product Salable For Requested Qty Result extension attributes
 */
export interface IsProductSalableForRequestedQtyResultExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Product Salable Quantity Result interface
 */
export interface ProductSalableQuantityResult {
  sku?: string;
  stock_id?: number;
  salable_quantity?: number;
}
