import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getProducts } from "./adobe/index.js";

// MCP Server setup
const server = new McpServer({
  name: "adobe-commerce",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Tool: get-products
server.tool(
  "get-products",
  "Get a list of products from Adobe Commerce",
  {
    page: z.number().int().min(1).default(1).describe("Page number (default 1)"),
    pageSize: z.number().int().min(1).max(100).default(20).describe("Number of products per page (default 20, max 100)"),
  },
  async ({ page, pageSize }) => {
    const products = await getProducts(page, pageSize);
    if (!products) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve products from Adobe Commerce.",
          },
        ],
      };
    }
    // Format product list (show SKU, name, price if available)
    const formatted = products.map((item: any) => {
      return `SKU: ${item.sku}\nName: ${item.name || "-"}\nPrice: ${item.price ?? "-"}`;
    });
    const text = `Products (page ${page}, pageSize ${pageSize}):\n\n${formatted.join("\n---\n")}`;
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Adobe Commerce MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
