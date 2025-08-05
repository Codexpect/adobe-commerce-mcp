import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  areProductsSalable,
  areProductsSalableForRequestedQty,
  getLowStockItems,
  getProductSalableQuantity,
  getStockItem,
  getStockStatus,
  isProductSalable,
  isProductSalableForRequestedQty,
  updateStockItem,
} from "../adobe/inventory/api-inventory-stock-items";
import { mapUpdateStockItemInputToApiPayload } from "../adobe/inventory/mapping/inventory-mapping";
import {
  areProductsSalableForRequestedQtyInputSchema,
  areProductsSalableInputSchema,
  getLowStockItemsInputSchema,
  getProductSalableQuantityInputSchema,
  getStockItemInputSchema,
  getStockStatusInputSchema,
  isProductSalableForRequestedQtyInputSchema,
  isProductSalableInputSchema,
  updateStockItemInputSchema,
} from "../adobe/inventory/schemas";
import { toolTextResponse } from "./tool-response";

/**
 * Register stock item management tools
 */
export function registerInventoryStockItemTools(server: McpServer, client: AdobeCommerceClient) {
  registerGetStockItemTool(server, client);
  registerUpdateStockItemTool(server, client);
  registerGetLowStockItemsTool(server, client);
  registerGetStockStatusTool(server, client);
  registerAreProductsSalableTool(server, client);
  registerAreProductsSalableForRequestedQtyTool(server, client);
  registerIsProductSalableTool(server, client);
  registerIsProductSalableForRequestedQtyTool(server, client);
  registerGetProductSalableQuantityTool(server, client);
}

/**
 * Get stock item information for a specific product
 */
function registerGetStockItemTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-stock-item",
    {
      title: "Get Stock Item",
      description: "Get stock information for a specific product by SKU",
      inputSchema: getStockItemInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getStockItemInputSchema).parse(args);
      const result = await getStockItem(client, parsed.productSku, parsed.scopeId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Stock Item</name>
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
 * Update stock item information for a product
 */
function registerUpdateStockItemTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-stock-item",
    {
      title: "Update Stock Item",
      description: "Update stock item information (quantity, status, etc.) for a product",
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
        const contextMessage = data && data > 0
          ? `Stock item has been successfully updated with ID ${data}.`
          : `Failed to update stock item.`;
        
        return `
        <meta>
          <name>Update Stock Item</name>
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
 * Get products with low inventory quantity
 */
function registerGetLowStockItemsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-low-stock-items",
    {
      title: "Get Low Stock Items",
      description: "Get products with low inventory quantity below specified threshold",
      inputSchema: getLowStockItemsInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getLowStockItemsInputSchema).parse(args);
      const result = await getLowStockItems(client, parsed.scopeId, parsed.qty, parsed.currentPage, parsed.pageSize);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Low Stock Items</name>
          <endpoint>${endpoint}</endpoint>
          <scopeId>${parsed.scopeId}</scopeId>
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
 * Get stock status for a specific product
 */
function registerGetStockStatusTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-stock-status",
    {
      title: "Get Stock Status",
      description: "Get stock status information for a specific product by SKU",
      inputSchema: getStockStatusInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getStockStatusInputSchema).parse(args);
      const result = await getStockStatus(client, parsed.productSku, parsed.scopeId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Stock Status</name>
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
 * Check if products are salable for given SKUs and stock
 */
function registerAreProductsSalableTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "are-products-salable",
    {
      title: "Are Products Salable",
      description: "Check if multiple products are salable for given SKUs and stock ID",
      inputSchema: areProductsSalableInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(areProductsSalableInputSchema).parse(args);
      const result = await areProductsSalable(client, parsed.skus, parsed.stockId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Products Salable Check</name>
          <endpoint>${endpoint}</endpoint>
          <stockId>${parsed.stockId}</stockId>
          <skusCount>${parsed.skus.length}</skusCount>
        </meta>

        <data>
          ${Array.isArray(data) ? data.map((item) => JSON.stringify(item)).join("\n") : JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

/**
 * Check if products are salable for requested quantities
 */
function registerAreProductsSalableForRequestedQtyTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "are-products-salable-for-requested-qty",
    {
      title: "Are Products Salable For Requested Quantity",
      description: "Check if products are salable for specific requested quantities",
      inputSchema: areProductsSalableForRequestedQtyInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(areProductsSalableForRequestedQtyInputSchema).parse(args);
      const result = await areProductsSalableForRequestedQty(client, parsed.skuRequests, parsed.stockId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Products Salable For Quantity Check</name>
          <endpoint>${endpoint}</endpoint>
          <stockId>${parsed.stockId}</stockId>
          <requestsCount>${parsed.skuRequests.length}</requestsCount>
        </meta>

        <data>
          ${Array.isArray(data) ? data.map((item) => JSON.stringify(item)).join("\n") : JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

/**
 * Check if a specific product is salable
 */
function registerIsProductSalableTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "is-product-salable",
    {
      title: "Is Product Salable",
      description: "Check if a specific product is salable for a given stock",
      inputSchema: isProductSalableInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(isProductSalableInputSchema).parse(args);
      const result = await isProductSalable(client, parsed.sku, parsed.stockId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Product Salable Check</name>
          <endpoint>${endpoint}</endpoint>
          <sku>${parsed.sku}</sku>
          <stockId>${parsed.stockId}</stockId>
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
 * Check if a product is salable for a specific quantity
 */
function registerIsProductSalableForRequestedQtyTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "is-product-salable-for-requested-qty",
    {
      title: "Is Product Salable For Requested Quantity",
      description: "Check if a product is salable for a specific requested quantity",
      inputSchema: isProductSalableForRequestedQtyInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(isProductSalableForRequestedQtyInputSchema).parse(args);
      const result = await isProductSalableForRequestedQty(client, parsed.sku, parsed.stockId, parsed.requestedQty);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Product Salable For Quantity Check</name>
          <endpoint>${endpoint}</endpoint>
          <sku>${parsed.sku}</sku>
          <stockId>${parsed.stockId}</stockId>
          <requestedQty>${parsed.requestedQty}</requestedQty>
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
 * Get salable quantity for a product
 */
function registerGetProductSalableQuantityTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-product-salable-quantity",
    {
      title: "Get Product Salable Quantity",
      description: "Get the salable quantity for a specific product and stock",
      inputSchema: getProductSalableQuantityInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getProductSalableQuantityInputSchema).parse(args);
      const result = await getProductSalableQuantity(client, parsed.sku, parsed.stockId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data !== undefined && data >= 0
          ? `The salable quantity for product ${parsed.sku} in stock ${parsed.stockId} is ${data}.`
          : `Failed to retrieve salable quantity for product ${parsed.sku}.`;
        
        return `
        <meta>
          <name>Product Salable Quantity</name>
          <endpoint>${endpoint}</endpoint>
          <sku>${parsed.sku}</sku>
          <stockId>${parsed.stockId}</stockId>
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