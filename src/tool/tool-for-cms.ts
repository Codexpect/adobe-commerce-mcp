import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { getCmsBlocks } from "../adobe/cms/api-cms-blocks.js";
import { getCmsPages } from "../adobe/cms/api-cms-pages.js";
import { CmsBlock } from "../adobe/cms/types/cms-block.js";
import { CmsPage } from "../adobe/cms/types/cms-page.js";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index.js";
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
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getCmsBlocks(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>CMS Blocks</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
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
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getCmsPages(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>CMS Pages</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
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
