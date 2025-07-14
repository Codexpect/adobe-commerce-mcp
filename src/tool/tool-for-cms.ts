import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getCmsBlocks } from "../adobe/cms/api-cms-blocks.js";
import { getCmsPages } from "../adobe/cms/api-cms-pages.js";
import { CmsBlock } from "../adobe/cms/types/cms-block.js";
import { CmsPage } from "../adobe/cms/types/cms-page.js";
import { mapFiltersToConditionType } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

export function registerCmsBlockTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-cms-blocks",
    {
      title: "Search CMS Blocks",
      description: "Search for CMS blocks in Adobe Commerce with flexible search filters.",
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
      const result = await getCmsBlocks(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>CMS Blocks</name>
          <page>${page}</page>
          <pageSize>${pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: CmsBlock) => JSON.stringify(item)).join("\n")}
        <data>
      `;
      });
    }
  );
}

export function registerCmsPageTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-cms-pages",
    {
      title: "Search CMS Pages",
      description: "Search for CMS pages in Adobe Commerce with flexible search filters.",
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
      const result = await getCmsPages(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>CMS Pages</name>
          <page>${page}</page>
          <pageSize>${pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: CmsPage) => JSON.stringify(item)).join("\n")}
        <data>
      `;
      });
    }
  );
} 