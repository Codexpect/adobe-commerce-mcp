import {
  CreateSourceInput,
  CreateStockInput,
  CreateStockSourceLinksInput,
  DeleteStockSourceLinksInput,
  SourceSelectionAlgorithmInput,
  UpdateSourceInput,
  UpdateStockInput,
  UpdateStockItemInput,
} from "../schemas";
import { InventoryRequest, Source, Stock, StockItem, StockSourceLink } from "../types/inventory";

/**
 * Mapping functions for inventory input transformations
 */

/**
 * Maps update stock item input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapUpdateStockItemInputToApiPayload(input: UpdateStockItemInput): StockItem {
  const {
    qty,
    isInStock,
    manageStock,
    minQty,
    minSaleQty,
    maxSaleQty,
    backorders,
    notifyStockQty,
    qtyIncrements,
    enableQtyIncrements,
    useConfigMinQty,
    useConfigMinSaleQty,
    useConfigMaxSaleQty,
    useConfigBackorders,
    useConfigNotifyStockQty,
    useConfigQtyIncrements,
    useConfigEnableQtyInc,
    useConfigManageStock,
    isQtyDecimal,
    showDefaultNotificationMessage,
  } = input;

  const stockItem: StockItem = {};

  // Core stock properties
  if (qty !== undefined) stockItem.qty = qty;
  if (isInStock !== undefined) stockItem.is_in_stock = isInStock;
  if (manageStock !== undefined) stockItem.manage_stock = manageStock;

  // Quantity constraints
  if (minQty !== undefined) stockItem.min_qty = minQty;
  if (minSaleQty !== undefined) stockItem.min_sale_qty = minSaleQty;
  if (maxSaleQty !== undefined) stockItem.max_sale_qty = maxSaleQty;

  // Backorder configuration
  if (backorders !== undefined) stockItem.backorders = backorders;

  // Notification settings
  if (notifyStockQty !== undefined) stockItem.notify_stock_qty = notifyStockQty;
  if (showDefaultNotificationMessage !== undefined) {
    stockItem.show_default_notification_message = showDefaultNotificationMessage;
  }

  // Quantity increment settings
  if (qtyIncrements !== undefined) stockItem.qty_increments = qtyIncrements;
  if (enableQtyIncrements !== undefined) stockItem.enable_qty_increments = enableQtyIncrements;
  if (isQtyDecimal !== undefined) stockItem.is_qty_decimal = isQtyDecimal;

  // Configuration inheritance flags
  if (useConfigMinQty !== undefined) stockItem.use_config_min_qty = useConfigMinQty;
  if (useConfigMinSaleQty !== undefined) stockItem.use_config_min_sale_qty = useConfigMinSaleQty;
  if (useConfigMaxSaleQty !== undefined) stockItem.use_config_max_sale_qty = useConfigMaxSaleQty;
  if (useConfigBackorders !== undefined) stockItem.use_config_backorders = useConfigBackorders;
  if (useConfigNotifyStockQty !== undefined) stockItem.use_config_notify_stock_qty = useConfigNotifyStockQty;
  if (useConfigQtyIncrements !== undefined) stockItem.use_config_qty_increments = useConfigQtyIncrements;
  if (useConfigEnableQtyInc !== undefined) stockItem.use_config_enable_qty_inc = useConfigEnableQtyInc;
  if (useConfigManageStock !== undefined) stockItem.use_config_manage_stock = useConfigManageStock;

  // Filter out undefined values to avoid API issues
  return Object.fromEntries(Object.entries(stockItem).filter(([, value]) => value !== undefined)) as StockItem;
}

/**
 * Maps create stock input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapCreateStockInputToApiPayload(input: CreateStockInput): Stock {
  const { name, sales_channels } = input;

  const stock: Stock = {
    name,
  };

  // Add extension_attributes if sales_channels are provided
  if (sales_channels && sales_channels.length > 0) {
    stock.extension_attributes = {
      sales_channels: sales_channels,
    };
  }

  return Object.fromEntries(Object.entries(stock).filter(([, value]) => value !== undefined)) as Stock;
}

/**
 * Maps update stock input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapUpdateStockInputToApiPayload(input: UpdateStockInput): Partial<Stock> {
  const { name, sales_channels } = input;
  const stock: Partial<Stock> = {};

  // Only include defined fields
  if (name !== undefined) stock.name = name;

  // Add extension_attributes if sales_channels are provided
  if (sales_channels && sales_channels.length > 0) {
    stock.extension_attributes = {
      sales_channels: sales_channels,
    };
  }

  return stock;
}

/**
 * Maps create source input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapCreateSourceInputToApiPayload(input: CreateSourceInput): Source {
  const {
    source_code,
    name,
    enabled,
    email,
    contact_name,
    description,
    latitude,
    longitude,
    country_id,
    region_id,
    region,
    city,
    street,
    postcode,
    phone,
    fax,
    use_default_carrier_config,
    carrier_links,
  } = input;

  const source: Source = {
    source_code,
    name,
    enabled,
    country_id,
  };

  // Handle optional fields
  if (email !== undefined) source.email = email;
  if (contact_name !== undefined) source.contact_name = contact_name;
  if (description !== undefined) source.description = description;
  if (latitude !== undefined) source.latitude = latitude;
  if (longitude !== undefined) source.longitude = longitude;
  if (region_id !== undefined) source.region_id = region_id;
  if (region !== undefined) source.region = region;
  if (city !== undefined) source.city = city;
  if (street !== undefined) source.street = street;
  if (postcode !== undefined) source.postcode = postcode;
  if (phone !== undefined) source.phone = phone;
  if (fax !== undefined) source.fax = fax;
  if (use_default_carrier_config !== undefined) source.use_default_carrier_config = use_default_carrier_config;
  if (carrier_links !== undefined) source.carrier_links = carrier_links;

  return Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined)) as Source;
}

/**
 * Maps update source input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapUpdateSourceInputToApiPayload(input: UpdateSourceInput): Partial<Source> {
  const source: Partial<Source> = {};

  // Only include defined fields
  if (input.name !== undefined) source.name = input.name;
  if (input.enabled !== undefined) source.enabled = input.enabled;
  if (input.email !== undefined) source.email = input.email;
  if (input.contact_name !== undefined) source.contact_name = input.contact_name;
  if (input.description !== undefined) source.description = input.description;
  if (input.latitude !== undefined) source.latitude = input.latitude;
  if (input.longitude !== undefined) source.longitude = input.longitude;
  if (input.country_id !== undefined) source.country_id = input.country_id;
  if (input.region_id !== undefined) source.region_id = input.region_id;
  if (input.region !== undefined) source.region = input.region;
  if (input.city !== undefined) source.city = input.city;
  if (input.street !== undefined) source.street = input.street;
  if (input.postcode !== undefined) source.postcode = input.postcode;
  if (input.phone !== undefined) source.phone = input.phone;
  if (input.fax !== undefined) source.fax = input.fax;
  if (input.use_default_carrier_config !== undefined) source.use_default_carrier_config = input.use_default_carrier_config;
  if (input.carrier_links !== undefined) source.carrier_links = input.carrier_links;

  return source;
}

/**
 * Maps create stock-source links input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapCreateStockSourceLinksInputToApiPayload(input: CreateStockSourceLinksInput): { links: StockSourceLink[] } {
  const { links } = input;

  const stockSourceLinks: StockSourceLink[] = links.map((link) => ({
    stock_id: link.stock_id,
    source_code: link.source_code,
    priority: link.priority,
  }));

  return { links: stockSourceLinks };
}

/**
 * Maps delete stock-source links input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapDeleteStockSourceLinksInputToApiPayload(input: DeleteStockSourceLinksInput): { links: StockSourceLink[] } {
  const { links } = input;

  const stockSourceLinks: StockSourceLink[] = links.map((link) => ({
    stock_id: link.stock_id,
    source_code: link.source_code,
    priority: link.priority,
  }));

  return { links: stockSourceLinks };
}

/**
 * Maps source selection algorithm input to API payload
 * Transforms user-friendly input into Adobe Commerce API format
 */
export function mapSourceSelectionAlgorithmInputToApiPayload(input: SourceSelectionAlgorithmInput): {
  inventoryRequest: InventoryRequest;
  algorithmCode: string;
} {
  const { inventory_request, algorithm_code } = input;

  const inventoryRequest: InventoryRequest = {
    stock_id: inventory_request.stock_id,
    items: inventory_request.items.map((item) => ({
      sku: item.sku,
      qty: item.qty,
    })),
  };

  return {
    inventoryRequest,
    algorithmCode: algorithm_code,
  };
}
