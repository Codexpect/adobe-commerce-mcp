import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { registerInventorySingleStockItemTools } from "./tools-for-inventory-single-stock-items";
import { registerInventorySourceItemTools } from "./tools-for-inventory-source-items";
import { registerInventorySourceSelectionTools } from "./tools-for-inventory-source-selection";
import { registerInventorySourceTools } from "./tools-for-inventory-sources";
import { registerInventoryStockSourceLinkTools } from "./tools-for-inventory-stock-source-links";
import { registerInventoryStockTools } from "./tools-for-inventory-stocks";

export function registerInventoryTools(server: McpServer, client: AdobeCommerceClient) {
  registerInventorySingleStockItemTools(server, client);
  registerInventoryStockTools(server, client);
  registerInventorySourceTools(server, client);
  registerInventorySourceItemTools(server, client);
  registerInventoryStockSourceLinkTools(server, client);
  registerInventorySourceSelectionTools(server, client);
}
