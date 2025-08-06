import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  getSourceSelectionAlgorithms,
  runSourceSelectionAlgorithm,
} from "../adobe/inventory/api-inventory-msi-source-selection";
import {
  sourceSelectionAlgorithmInputSchema,
} from "../adobe/inventory/schemas";
import { mapSourceSelectionAlgorithmInputToApiPayload } from "../adobe/inventory/mapping/inventory-mapping";
import { toolTextResponse } from "./tool-response";

/**
 * Register source selection tools
 */
export function registerInventoryMsiSourceSelectionTools(server: McpServer, client: AdobeCommerceClient) {
  registerGetSourceSelectionAlgorithmsTool(server, client);
  registerRunSourceSelectionAlgorithmTool(server, client);
}

/**
 * Get source selection algorithms
 */
function registerGetSourceSelectionAlgorithmsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-msi-source-selection-algorithms",
    {
      title: "Get Source Selection Algorithms (MSI)",
      description: "Get list of available source selection algorithms",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
      },
    },
    async () => {
      const result = await getSourceSelectionAlgorithms(client);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Source Selection Algorithms</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map(algorithm => JSON.stringify(algorithm)).join("\n")}
        </data>
      `;
      });
    }
  );
}

/**
 * Run source selection algorithm
 */
function registerRunSourceSelectionAlgorithmTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "run-msi-source-selection-algorithm",
    {
      title: "Run Source Selection Algorithm (MSI)",
      description: "Get source selection algorithm result",
      inputSchema: sourceSelectionAlgorithmInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(sourceSelectionAlgorithmInputSchema).parse(args);
      const request = mapSourceSelectionAlgorithmInputToApiPayload(parsed);
      const result = await runSourceSelectionAlgorithm(client, request);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Source Selection Algorithm Result</name>
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