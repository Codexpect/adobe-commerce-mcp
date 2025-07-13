import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getProducts } from "../adobe/api-products.js";
import { ConditionType, Product } from "../adobe/types/commerce.js";

const conditionTypeValues = Object.values(ConditionType) as [string, ...string[]];

const getProductsInputSchema = {
  page: z.number().int().min(1).default(1).describe("Page number to retrieve. Default 1."),
  pageSize: z.number().int().min(1).max(10).default(10).describe("Number of products to retrieve per page. Max 10."),
  filters: z
    .array(
      z.object({
        field: z.string().describe("Product field to filter by (e.g., 'name', 'sku', 'price', etc.)"),
        value: z
          .union([z.string().describe("Value to search for. For 'like' conditions, the value will be automatically wrapped with % wildcards unless already present."), z.number()])
          .describe("Value to search for"),
        conditionType: z
          .enum(conditionTypeValues)
          .optional()
          .describe("Condition type. Allowed: " + conditionTypeValues.join(", ") + ". Default is 'eq'."),
      })
    )
    .optional()
    .describe("Array of filters to apply to the product search."),
};

export function registerProductTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-products",
    {
      title: "Get Products",
      description:
        "Get a list of products from Adobe Commerce with flexible search filters. For 'like' filters, the value will be automatically wrapped with % wildcards unless already present.",
      inputSchema: getProductsInputSchema,
    },
    async (args: { page: number; pageSize: number; filters?: { field: string; value: string | number; conditionType?: string }[] }) => {
      const { page, pageSize, filters = [] } = args;
      // Convert string conditionType to ConditionType enum if present
      const mappedFilters = filters.map(f => ({
        ...f,
        conditionType: f.conditionType ? ConditionType[f.conditionType.toUpperCase() as keyof typeof ConditionType] : undefined
      }));
      const productsResult = await getProducts(client, { page, pageSize, filters: mappedFilters });

      if (!productsResult) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve products from Adobe Commerce.",
            },
          ],
        };
      }

      const { items, endpoint } = productsResult;
      const formatted = items.map((item: Product) => {
        return `SKU: ${item.sku}\nName: ${item.name || "-"}\nPrice: ${item.price ?? "-"}`;
      });

      const text = `Products (page ${page}, pageSize ${pageSize}):\nEndpoint: ${endpoint}\n\n${formatted.join("\n---\n")}`;

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
