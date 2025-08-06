import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  areProductsSalable,
  areProductsSalableForRequestedQty,
  createSourceItem,
  deleteSourceItem,
  getProductSalableQuantity,
  getSourceItems,
  isProductSalable,
  isProductSalableForRequestedQty,
} from "../adobe/inventory/api-inventory-msi-source-items";
import { mapCreateSourceItemInputToApiPayload } from "../adobe/inventory/mapping/source-item-mapping";
import {
  areProductsSalableForRequestedQtyInputSchema,
  areProductsSalableInputSchema,
  createSourceItemInputSchema,
  deleteSourceItemInputSchema,
  getProductSalableQuantityInputSchema,
  isProductSalableForRequestedQtyInputSchema,
  isProductSalableInputSchema,
} from "../adobe/inventory/schemas";
import { SourceItem } from "../adobe/inventory/types/source-item";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

export function registerInventoryMsiSourceItemTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchSourceItemsTool(server, client);
  registerCreateSourceItemTool(server, client);
  registerDeleteSourceItemTool(server, client);
  registerAreProductsSalableTool(server, client);
  registerAreProductsSalableForRequestedQtyTool(server, client);
  registerIsProductSalableTool(server, client);
  registerIsProductSalableForRequestedQtyTool(server, client);
  registerGetProductSalableQuantityTool(server, client);
}

function registerSearchSourceItemsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-msi-source-items",
    {
      title: "Search Source Items (MSI)",
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
    "create-msi-source-item",
    {
      title: "Create Source Item (MSI)",
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
    "delete-msi-source-item",
    {
      title: "Delete Source Item (MSI)",
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

/**
 * Check if products are salable for given SKUs and stock (MSI)
 */
function registerAreProductsSalableTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "are-products-salable-msi",
    {
      title: "Are Products Salable (MSI)",
      description: "Check if multiple products are salable for given SKUs and stock ID (requires source items)",
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
          <name>Products Salable Check (MSI)</name>
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
 * Check if products are salable for requested quantities (MSI)
 */
function registerAreProductsSalableForRequestedQtyTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "are-products-salable-for-requested-qty-msi",
    {
      title: "Are Products Salable For Requested Quantity (MSI)",
      description: "Check if products are salable for specific requested quantities (requires source items)",
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
          <name>Products Salable For Quantity Check (MSI)</name>
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
 * Check if a specific product is salable (MSI)
 */
function registerIsProductSalableTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "is-product-salable-msi",
    {
      title: "Is Product Salable (MSI)",
      description: "Check if a specific product is salable for a given stock (requires source items)",
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
        const contextMessage =
          typeof data === "boolean"
            ? `Product ${parsed.sku} is ${data ? "salable" : "not salable"} in stock ${parsed.stockId}.`
            : `Failed to check salability for product ${parsed.sku} in stock ${parsed.stockId}.`;

        return `
        <meta>
          <name>Product Salable Check (MSI)</name>
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

/**
 * Check if a product is salable for a specific quantity (MSI)
 */
function registerIsProductSalableForRequestedQtyTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "is-product-salable-for-requested-qty-msi",
    {
      title: "Is Product Salable For Requested Quantity (MSI)",
      description: "Check if a product is salable for a specific requested quantity (requires source items)",
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
          <name>Product Salable For Quantity Check (MSI)</name>
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
 * Get salable quantity for a product (MSI)
 */
function registerGetProductSalableQuantityTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-product-salable-quantity-msi",
    {
      title: "Get Product Salable Quantity (MSI)",
      description: "Get the salable quantity for a specific product and stock (requires source items)",
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
        const contextMessage =
          data !== undefined && data >= 0
            ? `The salable quantity for product ${parsed.sku} in stock ${parsed.stockId} is ${data}.`
            : `Failed to retrieve salable quantity for product ${parsed.sku}.`;

        return `
        <meta>
          <name>Product Salable Quantity (MSI)</name>
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
