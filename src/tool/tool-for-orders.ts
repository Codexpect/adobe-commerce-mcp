import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getOrders } from "../adobe/orders/api-orders.js";
import { Order } from "../adobe/orders/types/order.js";
import { mapFiltersToConditionType } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

export function registerOrderTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-orders",
    {
      title: "Search Orders",
      description: "Search for orders in Adobe Commerce with flexible search filters.",
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
      const result = await getOrders(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>Orders</name>
          <page>${page}</page>
          <pageSize>${pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: Order) => JSON.stringify(item)).join("\n")}
        <data>
      `;
      });
    }
  );
} 