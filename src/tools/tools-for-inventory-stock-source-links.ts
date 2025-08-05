import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  getStockSourceLinks,
  createStockSourceLinks,
  deleteStockSourceLinks,
} from "../adobe/inventory/api-inventory-stock-source-links";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import {
  createStockSourceLinksInputSchema,
  deleteStockSourceLinksInputSchema,
} from "../adobe/inventory/schemas";
import { mapCreateStockSourceLinksInputToApiPayload, mapDeleteStockSourceLinksInputToApiPayload } from "../adobe/inventory/mapping/inventory-mapping";
import { toolTextResponse } from "./tool-response";

/**
 * Register stock-source link management tools
 */
export function registerInventoryStockSourceLinkTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchStockSourceLinksTool(server, client);
  registerCreateStockSourceLinksTool(server, client);
  registerDeleteStockSourceLinksTool(server, client);
}

/**
 * Search stock-source links
 */
function registerSearchStockSourceLinksTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-stock-source-links",
    {
      title: "Search Stock-Source Links",
      description: "Find StockSourceLink list by given SearchCriteria",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getStockSourceLinks(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Stock-Source Links</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map(link => JSON.stringify(link)).join("\n")}
        </data>
      `;
      });
    }
  );
}

/**
 * Create stock-source links
 */
function registerCreateStockSourceLinksTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-stock-source-links",
    {
      title: "Create Stock-Source Links",
      description: "Save StockSourceLink list data",
      inputSchema: createStockSourceLinksInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(createStockSourceLinksInputSchema).parse(args);
      const links = mapCreateStockSourceLinksInputToApiPayload(parsed);
      const result = await createStockSourceLinks(client, links);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data === true
          ? `Stock-source links have been successfully created.`
          : `Failed to create stock-source links.`;
        
        return `
        <meta>
          <name>Create Stock-Source Links</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

/**
 * Delete stock-source links
 */
function registerDeleteStockSourceLinksTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-stock-source-links",
    {
      title: "Delete Stock-Source Links",
      description: "Remove StockSourceLink list",
      inputSchema: deleteStockSourceLinksInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteStockSourceLinksInputSchema).parse(args);
      const links = mapDeleteStockSourceLinksInputToApiPayload(parsed);
      const result = await deleteStockSourceLinks(client, links);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data === true
          ? `Stock-source links have been successfully deleted.`
          : `Failed to delete stock-source links.`;
        
        return `
        <meta>
          <name>Delete Stock-Source Links</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
} 