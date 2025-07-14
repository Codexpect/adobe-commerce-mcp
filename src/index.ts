import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initAdobeCommerceClient } from "./adobe/adobe-commerce-client.js";
import { registerProductsTools } from "./tool/tool-for-products.js";

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
  registerProductsTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Adobe Commerce MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
