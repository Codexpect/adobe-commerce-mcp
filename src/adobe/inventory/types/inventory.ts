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

/**
 * Stock interface representing product aggregation among physical storages
 */
export interface Stock {
  stock_id?: number;
  name?: string;
  extension_attributes?: StockExtensionAttributes;
}

/**
 * Stock extension attributes
 */
export interface StockExtensionAttributes {
  sales_channels?: SalesChannel[];
  [key: string]: unknown;
}

/**
 * Sales Channel interface
 */
export interface SalesChannel {
  type?: string;
  code?: string;
  extension_attributes?: SalesChannelExtensionAttributes;
}

/**
 * Sales Channel extension attributes
 */
export interface SalesChannelExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Stock search results interface
 */
export interface StockSearchResults {
  items?: Stock[];
  search_criteria?: unknown;
  total_count?: number;
}

/**
 * Source interface representing physical storage location
 */
export interface Source {
  source_code?: string;
  name?: string;
  email?: string;
  contact_name?: string;
  enabled?: boolean;
  description?: string;
  latitude?: number;
  longitude?: number;
  country_id?: string;
  region_id?: number;
  region?: string;
  city?: string;
  street?: string;
  postcode?: string;
  phone?: string;
  fax?: string;
  use_default_carrier_config?: boolean;
  carrier_links?: SourceCarrierLink[];
  extension_attributes?: SourceExtensionAttributes;
}

/**
 * Source carrier link interface
 */
export interface SourceCarrierLink {
  carrier_code?: string;
  position?: number;
  extension_attributes?: SourceCarrierLinkExtensionAttributes;
}

/**
 * Source carrier link extension attributes
 */
export interface SourceCarrierLinkExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Source extension attributes
 */
export interface SourceExtensionAttributes {
  is_pickup_location_active?: boolean;
  frontend_name?: string;
  frontend_description?: string;
  [key: string]: unknown;
}

/**
 * Source search results interface
 */
export interface SourceSearchResults {
  items?: Source[];
  search_criteria?: unknown;
  total_count?: number;
}

/**
 * Stock-Source Link interface
 */
export interface StockSourceLink {
  stock_id?: number;
  source_code?: string;
  priority?: number;
  extension_attributes?: StockSourceLinkExtensionAttributes;
}

/**
 * Stock-Source Link extension attributes
 */
export interface StockSourceLinkExtensionAttributes {
  source_name?: string;
  [key: string]: unknown;
}

/**
 * Stock-Source Link search results interface
 */
export interface StockSourceLinkSearchResults {
  items?: StockSourceLink[];
  search_criteria?: unknown;
  total_count?: number;
}

/**
 * Source Selection Algorithm interface
 */
export interface SourceSelectionAlgorithm {
  code?: string;
  title?: string;
  description?: string;
  extension_attributes?: SourceSelectionAlgorithmExtensionAttributes;
}

/**
 * Source Selection Algorithm extension attributes
 */
export interface SourceSelectionAlgorithmExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Inventory Request interface for source selection
 */
export interface InventoryRequest {
  stock_id?: number;
  items?: ItemRequest[];
  extension_attributes?: InventoryRequestExtensionAttributes;
}

/**
 * Item Request interface for source selection
 */
export interface ItemRequest {
  sku?: string;
  qty?: number;
  extension_attributes?: ItemRequestExtensionAttributes;
}

/**
 * Inventory Request extension attributes
 */
export interface InventoryRequestExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Item Request extension attributes
 */
export interface ItemRequestExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Source Selection Result interface
 */
export interface SourceSelectionResult {
  source_selection_items?: SourceSelectionItem[];
  shippable?: boolean;
  extension_attributes?: SourceSelectionResultExtensionAttributes;
}

/**
 * Source Selection Item interface
 */
export interface SourceSelectionItem {
  source_code?: string;
  sku?: string;
  qty_to_deduct?: number;
  qty_available?: number;
  extension_attributes?: SourceSelectionItemExtensionAttributes;
}

/**
 * Source Selection Result extension attributes
 */
export interface SourceSelectionResultExtensionAttributes {
  [key: string]: unknown;
}

/**
 * Source Selection Item extension attributes
 */
export interface SourceSelectionItemExtensionAttributes {
  [key: string]: unknown;
}
