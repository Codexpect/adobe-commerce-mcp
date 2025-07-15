import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getProducts } from "../adobe/products/api-products.js";
import { Product } from "../adobe/products/types/product.js";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

export function registerProductTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchProductTool(server, client);
}

function registerSearchProductTool(server: McpServer, client: AdobeCommerceClient) {
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
    async (args: unknown) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getProducts(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>Products</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: Product) => JSON.stringify(item)).join("\n")}
        <data>
      `;
      });
    }
  );
}
