import { UpdateStockItemInput } from "../schemas";
import { StockItem } from "../types/inventory";

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

