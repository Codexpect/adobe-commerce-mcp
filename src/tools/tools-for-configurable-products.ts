import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  addConfigurableProductOption,
  deleteConfigurableProductOption,
  getConfigurableProductChildren,
  getConfigurableProductOptionById,
  getConfigurableProductOptionsAll,
  linkConfigurableChild,
  unlinkConfigurableChild,
  updateConfigurableProductOption,
} from "../adobe/products/api-configurable-products";
import {
  mapAddConfigurableProductOptionInputToApiPayload,
  mapUpdateConfigurableProductOptionInputToApiPayload,
} from "../adobe/products/mapping/configurable-product-mapping";
import {
  addConfigurableProductOptionInputSchema,
  deleteConfigurableProductOptionInputSchema,
  getConfigurableProductChildrenInputSchema,
  getConfigurableProductOptionByIdInputSchema,
  getConfigurableProductOptionsAllInputSchema,
  linkConfigurableChildInputSchema,
  unlinkConfigurableChildInputSchema,
  updateConfigurableProductOptionInputSchema,
} from "../adobe/products/schemas";
import { ConfigurableProductOption } from "../adobe/products/types/product";
import { toolTextResponse } from "./tool-response";

export function registerConfigurableProductTools(server: McpServer, client: AdobeCommerceClient) {
  registerAddConfigurableProductOptionTool(server, client);
  registerLinkConfigurableChildTool(server, client);
  registerUnlinkConfigurableChildTool(server, client);
  registerGetConfigurableProductChildrenTool(server, client);
  registerGetConfigurableProductOptionsAllTool(server, client);
  registerGetConfigurableProductOptionByIdTool(server, client);
  registerUpdateConfigurableProductOptionTool(server, client);
  registerDeleteConfigurableProductOptionTool(server, client);
}

function registerAddConfigurableProductOptionTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "add-configurable-product-option",
    {
      title: "Add Configurable Product Option",
      description:
        "Define which attribute and options are used in this configurable product. Creates the framework for product variants (e.g., T-shirt with color and size options).",
      inputSchema: addConfigurableProductOptionInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(addConfigurableProductOptionInputSchema).parse(args);
      const payload = mapAddConfigurableProductOptionInputToApiPayload(parsed);
      const result = await addConfigurableProductOption(client, parsed.sku, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data
          ? `Product option with attribute ID ${parsed.attributeId} has been successfully added to configurable product with SKU ${parsed.sku}. Configurable product option id is ${data}`
          : `Failed to add product option with attribute ID ${parsed.attributeId} to configurable product with SKU ${parsed.sku}.`;

        return `
        <meta>
          <name>Add Configurable Product Option</name>
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

function registerLinkConfigurableChildTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "link-configurable-child",
    {
      title: "Link Configurable Child",
      description: "Link a child product to a configurable product by SKU. The child product becomes a variant of the parent.",
      inputSchema: linkConfigurableChildInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(linkConfigurableChildInputSchema).parse(args);
      const result = await linkConfigurableChild(client, parsed.sku, parsed.childSku);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data
          ? `Product with SKU ${parsed.childSku} has been successfully linked to configurable product with SKU ${parsed.sku}.`
          : `Failed to link product with SKU ${parsed.childSku} to configurable product with SKU ${parsed.sku}.`;

        return `
        <meta>
          <name>Link Configurable Child</name>
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

function registerUnlinkConfigurableChildTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "unlink-configurable-child",
    {
      title: "Unlink Configurable Child",
      description: "Unlink a child product from a configurable product by SKU. The child product remains but is no longer a variant.",
      inputSchema: unlinkConfigurableChildInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(unlinkConfigurableChildInputSchema).parse(args);
      const result = await unlinkConfigurableChild(client, parsed.sku, parsed.childSku);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data
          ? `Product with SKU ${parsed.childSku} has been successfully unlinked from configurable product with SKU ${parsed.sku}.`
          : `Failed to unlink product with SKU ${parsed.childSku} from configurable product with SKU ${parsed.sku}.`;

        return `
        <meta>
          <name>Unlink Configurable Child</name>
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

function registerGetConfigurableProductChildrenTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-configurable-product-children",
    {
      title: "Get Configurable Product Children",
      description: "Retrieve all child products for a configurable product by SKU.",
      inputSchema: getConfigurableProductChildrenInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args: unknown) => {
      const parsed = z.object(getConfigurableProductChildrenInputSchema).parse(args);
      const result = await getConfigurableProductChildren(client, parsed.sku);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const skus = data ? data.map((p) => p.sku).join(", ") : "";
        return `
        <meta>
          <name>Get Configurable Product Children</name>
          <endpoint>${endpoint}</endpoint>
        </meta>
        <data>
          Child SKUs: ${skus}
        </data>
        `;
      });
    }
  );
}

function registerGetConfigurableProductOptionsAllTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-configurable-product-options-all",
    {
      title: "Get Configurable Product Options (All)",
      description: "Retrieve all configurable options for a configurable product by SKU.",
      inputSchema: getConfigurableProductOptionsAllInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args: unknown) => {
      const parsed = z.object(getConfigurableProductOptionsAllInputSchema).parse(args);
      const result = await getConfigurableProductOptionsAll(client, parsed.sku);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Get Configurable Product Options All</name>
          <endpoint>${endpoint}</endpoint>
        </meta>
        <data>
          ${data?.map((item: ConfigurableProductOption) => JSON.stringify(item)).join("\n")}
        </data>
        `;
      });
    }
  );
}

function registerGetConfigurableProductOptionByIdTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-configurable-product-option-by-id",
    {
      title: "Get Configurable Product Option By ID",
      description: "Retrieve a specific configurable option for a configurable product by SKU and option ID.",
      inputSchema: getConfigurableProductOptionByIdInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args: unknown) => {
      const parsed = z.object(getConfigurableProductOptionByIdInputSchema).parse(args);
      const result = await getConfigurableProductOptionById(client, parsed.sku, parsed.id);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Get Configurable Product Option By ID</name>
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

function registerDeleteConfigurableProductOptionTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-configurable-product-option",
    {
      title: "Delete Configurable Product Option",
      description: "Remove a configurable option from a configurable product by SKU and option ID.",
      inputSchema: deleteConfigurableProductOptionInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteConfigurableProductOptionInputSchema).parse(args);
      const result = await deleteConfigurableProductOption(client, parsed.sku, parsed.id);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data
          ? `Configurable option with ID ${parsed.id} has been successfully deleted from configurable product with SKU ${parsed.sku}.`
          : `Failed to delete configurable option with ID ${parsed.id} from configurable product with SKU ${parsed.sku}.`;

        return `
        <meta>
          <name>Delete Configurable Product Option</name>
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

function registerUpdateConfigurableProductOptionTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-configurable-product-option",
    {
      title: "Update Configurable Product Option",
      description: "Update an existing configurable option for a configurable product by SKU and option ID.",
      inputSchema: updateConfigurableProductOptionInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(updateConfigurableProductOptionInputSchema).parse(args);
      const option = mapUpdateConfigurableProductOptionInputToApiPayload(parsed);
      const result = await updateConfigurableProductOption(client, parsed.sku, parsed.id, option);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data
          ? `Configurable option with ID ${parsed.id} has been successfully updated for configurable product with SKU ${parsed.sku}.`
          : `Failed to update configurable option with ID ${parsed.id} for configurable product with SKU ${parsed.sku}.`;

        return `
        <meta>
          <name>Update Configurable Product Option</name>
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
