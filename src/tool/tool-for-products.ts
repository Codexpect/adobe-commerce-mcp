import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getProducts, getProductsAttributes } from "../adobe/products/api-products.js";
import { Product, ProductAttribute } from "../adobe/products/types/product.js";
import { mapFiltersToConditionType } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

export function registerProductsTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchProductAttributesTools(server, client);
  registerSearchProductTools(server, client);
}

function registerSearchProductAttributesTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-products-attributes",
    {
      title: "Search Products Attributes",
      description: "Search for products attributes in Adobe Commerce with flexible search filters.",
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
      const result = await getProductsAttributes(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
         <meta>
          <name>Products Attributes</name>
          <page>${page}</page>
          <pageSize>${pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: ProductAttribute) => JSON.stringify(item)).join("\n")}
        <data>
      `;
      });
    }
  );
}

function registerSearchProductTools(server: McpServer, client: AdobeCommerceClient) {
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

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
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
      });
    }
  );
}
