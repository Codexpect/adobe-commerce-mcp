import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getOrders } from "../adobe/orders/api-orders.js";
import { Order } from "../adobe/orders/types/order.js";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

export function registerOrderTools(server: McpServer, client: AdobeCommerceClient) {
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
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getOrders(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>Orders</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
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
