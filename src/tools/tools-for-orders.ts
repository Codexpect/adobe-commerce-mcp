import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { getOrders } from "../adobe/orders/api-orders";
import { Order } from "../adobe/orders/types/order";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

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
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Orders</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        <meta>

        <data>
          ${data?.map((item: Order) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}
