import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { registerInventorySourceSelectionTools } from "./tools-for-inventory-source-selection";
import { registerInventorySourceTools } from "./tools-for-inventory-sources";
import { registerInventoryStockItemTools } from "./tools-for-inventory-stock-items";
import { registerInventoryStockSourceLinkTools } from "./tools-for-inventory-stock-source-links";
import { registerInventoryStockTools } from "./tools-for-inventory-stocks";

export function registerInventoryTools(server: McpServer, client: AdobeCommerceClient) {
  registerInventoryStockItemTools(server, client);
  registerInventoryStockTools(server, client);
  registerInventorySourceTools(server, client);
  registerInventoryStockSourceLinkTools(server, client);
  registerInventorySourceSelectionTools(server, client);
}
