import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getCategories } from "../adobe/categories/api-categories.js";
import { Category } from "../adobe/categories/types/category.js";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

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
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>Categories</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: Category) => JSON.stringify(item)).join("\n")}
        <data>
      `;
      });
    }
  );
}
