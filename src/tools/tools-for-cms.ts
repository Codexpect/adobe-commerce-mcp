import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { getCmsBlocks } from "../adobe/cms/api-cms-blocks";
import { getCmsPages } from "../adobe/cms/api-cms-pages";
import { CmsBlock } from "../adobe/cms/types/cms-block";
import { CmsPage } from "../adobe/cms/types/cms-page";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

export function registerCmsBlockTools(server: McpServer, client: AdobeCommerceClient) {
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
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>CMS Blocks</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item: CmsBlock) => JSON.stringify(item)).join("\n")}
        </data>
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
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>CMS Pages</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item: CmsPage) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}
