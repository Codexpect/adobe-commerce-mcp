import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { registerInventoryMsiSourceItemTools } from "./tools-for-inventory-msi-source-items";
import { registerInventoryMsiSourceSelectionTools } from "./tools-for-inventory-msi-source-selection";
import { registerInventoryMsiSourceTools } from "./tools-for-inventory-msi-sources";
import { registerInventoryMsiStockSourceLinkTools } from "./tools-for-inventory-msi-stock-source-links";
import { registerInventoryMsiStockTools } from "./tools-for-inventory-msi-stocks";
import { registerInventorySingleStockItemTools } from "./tools-for-inventory-single-stock-items";

export function registerInventoryTools(server: McpServer, client: AdobeCommerceClient) {
  registerInventorySingleStockItemTools(server, client);
  registerInventoryMsiStockTools(server, client);
  registerInventoryMsiSourceTools(server, client);
  registerInventoryMsiSourceItemTools(server, client);
  registerInventoryMsiStockSourceLinkTools(server, client);
  registerInventoryMsiSourceSelectionTools(server, client);
}
