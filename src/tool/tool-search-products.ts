import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getProducts } from "../adobe/products/api-products.js";
import { Product } from "../adobe/products/types/product.js";
import { mapFiltersToConditionType } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";

export function registerProductTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-products",
    {
      title: "Search Products",
      description: "Search for products in Adobe Commerce with flexible search filters.",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: {
      page: number;
      pageSize: number;
      filters?: { field: string; value: string | number; conditionType?: string }[];
      sortOrders?: { field: string; direction: "ASC" | "DESC" }[];
    }) => {
      const { page, pageSize, filters = [], sortOrders = [] } = args;
      const searchCriteria = { page, pageSize, filters: mapFiltersToConditionType(filters), sortOrders };
      const result = await getProducts(client, searchCriteria);

      if (!result) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve products from Adobe Commerce.",
            },
          ],
        };
      }

      const { items, endpoint } = result;

      const text = `
        <meta>
          <name>Products</name>
          <page>${page}</page>
          <pageSize>${pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: Product) => JSON.stringify(item)).join("\n")}
        <data>
      `;

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
