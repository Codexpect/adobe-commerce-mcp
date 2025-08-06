import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { getLowStockItems, getStockItem, getStockStatus, updateStockItem } from "../adobe/inventory/api-inventory-single-stock-items";
import { mapUpdateStockItemInputToApiPayload } from "../adobe/inventory/mapping/inventory-mapping";
import {
  getLowStockItemsInputSchema,
  getStockItemInputSchema,
  getStockStatusInputSchema,
  updateStockItemInputSchema,
} from "../adobe/inventory/schemas";
import { toolTextResponse } from "./tool-response";

/**
 * Register single stock item management tools (old system)
 */
export function registerInventorySingleStockItemTools(server: McpServer, client: AdobeCommerceClient) {
  registerGetStockItemTool(server, client);
  registerUpdateStockItemTool(server, client);
  registerGetLowStockItemsTool(server, client);
  registerGetStockStatusTool(server, client);
}

/**
 * Get stock item information for a specific product (single stock system)
 */
function registerGetStockItemTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-single-stock-item",
    {
      title: "Get Single Stock Item",
      description: "Get stock information for a specific product by SKU (single stock system)",
      inputSchema: getStockItemInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getStockItemInputSchema).parse(args);
      const result = await getStockItem(client, parsed.productSku);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Single Stock Item</name>
          <endpoint>${endpoint}</endpoint>
          <productSku>${parsed.productSku}</productSku>
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
 * Update stock item information for a product (single stock system)
 */
function registerUpdateStockItemTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-single-stock-item",
    {
      title: "Update Single Stock Item",
      description: "Update stock item information (quantity, status, etc.) for a product (single stock system)",
      inputSchema: updateStockItemInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(updateStockItemInputSchema).parse(args);
      const stockItem = mapUpdateStockItemInputToApiPayload(parsed);
      const result = await updateStockItem(client, parsed.productSku, parsed.itemId, stockItem);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data > 0 ? `Stock item has been successfully updated with ID ${data}.` : `Failed to update stock item.`;

        return `
        <meta>
          <name>Update Single Stock Item</name>
          <endpoint>${endpoint}</endpoint>
          <productSku>${parsed.productSku}</productSku>
          <itemId>${parsed.itemId}</itemId>
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
 * Get products with low inventory quantity (single stock system)
 */
function registerGetLowStockItemsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-single-low-stock-items",
    {
      title: "Get Single Low Stock Items",
      description: "Get products with low inventory quantity below specified threshold (single stock system)",
      inputSchema: getLowStockItemsInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getLowStockItemsInputSchema).parse(args);
      const result = await getLowStockItems(client, parsed.qty, parsed.currentPage, parsed.pageSize);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Single Low Stock Items</name>
          <endpoint>${endpoint}</endpoint>
          <qtyThreshold>${parsed.qty}</qtyThreshold>
          <page>${parsed.currentPage || 1}</page>
          <pageSize>${parsed.pageSize || 10}</pageSize>
          <totalItems>${data?.total_count || data?.items?.length || 0}</totalItems>
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
 * Get stock status for a specific product (single stock system)
 */
function registerGetStockStatusTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-single-stock-status",
    {
      title: "Get Single Stock Status",
      description: "Get stock status information for a specific product by SKU (single stock system)",
      inputSchema: getStockStatusInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getStockStatusInputSchema).parse(args);
      const result = await getStockStatus(client, parsed.productSku);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Single Stock Status</name>
          <endpoint>${endpoint}</endpoint>
          <productSku>${parsed.productSku}</productSku>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}
