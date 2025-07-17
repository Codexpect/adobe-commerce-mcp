import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { getCategories } from "../adobe/categories/api-categories";
import { Category } from "../adobe/categories/types/category";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

export function registerCategoriesTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchCategoryTool(server, client);
}

function registerSearchCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-categories",
    {
      title: "Search Categories",
      description: "Search for categories in Adobe Commerce with flexible search filters.",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getCategories(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Categories</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        <meta>

        <data>
          ${data?.map((item: Category) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}
