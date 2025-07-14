import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initAdobeCommerceClient } from "./adobe/adobe-commerce-client.js";
import { registerCategoriesTools } from "./tool/tool-for-categories.js";
import { registerOrderTool } from "./tool/tool-for-orders.js";
import { registerCustomerTool } from "./tool/tool-for-customers.js";
import { registerCmsBlockTool, registerCmsPageTool } from "./tool/tool-for-cms.js";

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
  registerOrderTool(server, client);
  registerCustomerTool(server, client);
  registerCmsBlockTool(server, client);
  registerCmsPageTool(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Adobe Commerce MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
