import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  getStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  resolveStock,
} from "../adobe/inventory/api-inventory-stocks";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import {
  createStockInputSchema,
  updateStockInputSchema,
  getStockByIdInputSchema,
  deleteStockInputSchema,
  resolveStockInputSchema,
} from "../adobe/inventory/schemas";
import { mapCreateStockInputToApiPayload, mapUpdateStockInputToApiPayload } from "../adobe/inventory/mapping/inventory-mapping";
import { toolTextResponse } from "./tool-response";

/**
 * Register stock management tools
 */
export function registerInventoryStockTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchStocksTool(server, client);
  registerGetStockByIdTool(server, client);
  registerCreateStockTool(server, client);
  registerUpdateStockTool(server, client);
  registerDeleteStockTool(server, client);
  registerResolveStockTool(server, client);
}

/**
 * Search stocks
 */
function registerSearchStocksTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-stocks",
    {
      title: "Search Stocks",
      description: "Search for stocks with flexible filters and pagination",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getStocks(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Stocks</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map(stock => JSON.stringify(stock)).join("\n")}
        </data>
      `;
      });
    }
  );
}

/**
 * Get stock by ID
 */
function registerGetStockByIdTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-stock-by-id",
    {
      title: "Get Stock by ID",
      description: "Get stock data by given stockId",
      inputSchema: getStockByIdInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getStockByIdInputSchema).parse(args);
      const result = await getStockById(client, parsed.stock_id);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Get Stock by ID</name>
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

/**
 * Create stock
 */
function registerCreateStockTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-stock",
    {
      title: "Create Stock",
      description: "Save Stock data",
      inputSchema: createStockInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(createStockInputSchema).parse(args);
      const stock = mapCreateStockInputToApiPayload(parsed);
      const result = await createStock(client, stock);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data > 0
          ? `Stock has been successfully created with ID ${data}.`
          : `Failed to create stock.`;
        
        return `
        <meta>
          <name>Create Stock</name>
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
 * Update stock
 */
function registerUpdateStockTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-stock",
    {
      title: "Update Stock",
      description: "Save Stock data",
      inputSchema: updateStockInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(updateStockInputSchema).parse(args);
      const stock = mapUpdateStockInputToApiPayload(parsed);
      const result = await updateStock(client, parsed.stock_id, stock);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data > 0
          ? `Stock has been successfully updated with ID ${data}.`
          : `Failed to update stock.`;
        
        return `
        <meta>
          <name>Update Stock</name>
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
 * Delete stock
 */
function registerDeleteStockTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-stock",
    {
      title: "Delete Stock",
      description: "Delete the Stock data by stockId",
      inputSchema: deleteStockInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteStockInputSchema).parse(args);
      const result = await deleteStock(client, parsed.stock_id);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data === true
          ? `Stock has been successfully deleted.`
          : `Failed to delete stock.`;
        
        return `
        <meta>
          <name>Delete Stock</name>
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
 * Resolve stock by sales channel
 */
function registerResolveStockTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "resolve-stock",
    {
      title: "Resolve Stock",
      description: "Resolve Stock by Sales Channel type and code",
      inputSchema: resolveStockInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(resolveStockInputSchema).parse(args);
      const result = await resolveStock(client, parsed.type, parsed.code);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Resolve Stock</name>
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