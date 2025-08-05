import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { createSourceItem, deleteSourceItem, getSourceItems } from "../adobe/inventory/api-inventory-source-items";
import { mapCreateSourceItemInputToApiPayload } from "../adobe/inventory/mapping/source-item-mapping";
import { createSourceItemInputSchema, deleteSourceItemInputSchema } from "../adobe/inventory/schemas";
import { SourceItem } from "../adobe/inventory/types/source-item";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

export function registerSourceItemTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchSourceItemsTool(server, client);
  registerCreateSourceItemTool(server, client);
  registerDeleteSourceItemTool(server, client);
}

function registerSearchSourceItemsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-source-items",
    {
      title: "Search Source Items",
      description: "Search for source items with flexible filters and pagination",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getSourceItems(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Source Items</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item: SourceItem) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerCreateSourceItemTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-source-item",
    {
      title: "Create Source Item",
      description: "Create a new source item with product SKU, source code, and quantity",
      inputSchema: createSourceItemInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(createSourceItemInputSchema).parse(args);
      const sourceItem = mapCreateSourceItemInputToApiPayload(parsed);
      const result = await createSourceItem(client, sourceItem);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data ? `Source item has been successfully created.` : `Failed to create source item.`;

        return `
        <meta>
          <name>Create Source Item</name>
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

function registerDeleteSourceItemTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-source-item",
    {
      title: "Delete Source Item",
      description: "Delete a source item by SKU and source code",
      inputSchema: deleteSourceItemInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteSourceItemInputSchema).parse(args);
      const result = await deleteSourceItem(client, parsed.sku, parsed.source_code);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data ? `Source item has been successfully deleted.` : `Failed to delete source item.`;

        return `
        <meta>
          <name>Delete Source Item</name>
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
