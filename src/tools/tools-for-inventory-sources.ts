import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { createSource, getSourceByCode, getSources, updateSource } from "../adobe/inventory/api-inventory-sources";
import { mapCreateSourceInputToApiPayload, mapUpdateSourceInputToApiPayload } from "../adobe/inventory/mapping/inventory-mapping";
import { createSourceInputSchema, getSourceByCodeInputSchema, updateSourceInputSchema } from "../adobe/inventory/schemas";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

export function registerInventorySourceTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchSourcesTool(server, client);
  registerGetSourceByCodeTool(server, client);
  registerCreateSourceTool(server, client);
  registerUpdateSourceTool(server, client);
}

function registerSearchSourcesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-sources",
    {
      title: "Search Sources",
      description: "Find Sources by SearchCriteria",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getSources(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Sources</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((source) => JSON.stringify(source)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerGetSourceByCodeTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-source-by-code",
    {
      title: "Get Source by Code",
      description: "Get Source data by given code",
      inputSchema: getSourceByCodeInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getSourceByCodeInputSchema).parse(args);
      const result = await getSourceByCode(client, parsed.source_code);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Get Source by Code</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerCreateSourceTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-source",
    {
      title: "Create Source",
      description: "Save Source data",
      inputSchema: createSourceInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(createSourceInputSchema).parse(args);
      const source = mapCreateSourceInputToApiPayload(parsed);
      const result = await createSource(client, source);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data > 0 ? `Source has been successfully created.` : `Failed to create source.`;

        return `
        <meta>
          <name>Create Source</name>
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

function registerUpdateSourceTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-source",
    {
      title: "Update Source",
      description: "Save Source data",
      inputSchema: updateSourceInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(updateSourceInputSchema).parse(args);
      const source = mapUpdateSourceInputToApiPayload(parsed);
      const result = await updateSource(client, parsed.source_code, source);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data > 0 ? `Source has been successfully updated.` : `Failed to update source.`;

        return `
        <meta>
          <name>Update Source</name>
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
