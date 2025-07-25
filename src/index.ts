import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initAdobeCommerceClient } from "./adobe/adobe-commerce-client.js";
import { registerCategoriesTools } from "./tools/tools-for-categories.js";
import { registerCmsBlockTools, registerCmsPageTool } from "./tools/tools-for-cms.js";
import { registerCustomerTools } from "./tools/tools-for-customers.js";
import { registerOrderTools } from "./tools/tools-for-orders.js";
import { registerProductAttributeSetsTools } from "./tools/tools-for-products-attribute-sets.js";
import { registerProductAttributesTools } from "./tools/tools-for-products-attributes.js";
import { registerProductTools } from "./tools/tools-for-products.js";
import { registerConfigurableProductTools } from "./tools/tools-for-configurable-products.js";
import { registerStoreTools } from "./tools/tools-for-stores.js";

const server = new McpServer({
  name: "adobe-commerce",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

async function main() {
  const client = initAdobeCommerceClient();
  registerCategoriesTools(server, client);
  registerOrderTools(server, client);
  registerCustomerTools(server, client);
  registerCmsBlockTools(server, client);
  registerCmsPageTool(server, client);
  registerProductAttributesTools(server, client);
  registerProductAttributeSetsTools(server, client);
  registerProductTools(server, client);
  registerConfigurableProductTools(server, client);
  registerStoreTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Adobe Commerce MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
