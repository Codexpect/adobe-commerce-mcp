import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initAdobeCommerceClient } from "./adobe/adobe-commerce-client.js";
import { registerCategoriesTools } from "./tools/tool-for-categories.js";
import { registerCmsBlockTool as registerCmsBlockTools, registerCmsPageTool as registerCmsPageTools } from "./tools/tool-for-cms.js";
import { registerCustomerTool as registerCustomerTools } from "./tools/tool-for-customers.js";
import { registerOrderTool as registerOrderTools } from "./tools/tool-for-orders.js";
import { registerProductAttributesTools } from "./tools/tool-for-products-attributes.js";
import { registerProductTools } from "./tools/tool-for-products.js";

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
  registerCmsPageTools(server, client);
  registerProductAttributesTools(server, client);
  registerProductTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Adobe Commerce MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
