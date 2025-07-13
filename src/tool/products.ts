import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getProducts } from "../adobe/products.js";
import { Product } from "../types/commerce.js";

const getProductsInputSchema = {
  page: z.number().int().min(1).default(1).describe("Page number to retrieve. Default 1."),
  pageSize: z.number().int().min(1).max(10).default(10).describe("Number of products to retrieve per page. Max 10."),
};

export function registerProductTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-products",
    {
      title: "Get Products",
      description: "Get a list of products from Adobe Commerce",
      inputSchema: getProductsInputSchema,
    },
    async (args: { page: number; pageSize: number }) => {
      const { page, pageSize } = args;
      const products = await getProducts(client, page, pageSize);

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

      const formatted = products.map((item: Product) => {
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
}
