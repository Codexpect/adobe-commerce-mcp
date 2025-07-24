import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  assignProductToWebsite,
  createProduct,
  deleteProduct,
  getProductBySku,
  getProducts,
  removeProductFromWebsite,
  updateProduct,
} from "../adobe/products/api-products";
import {
  assignProductToWebsiteInputSchema,
  createProductInputSchema,
  deleteProductInputSchema,
  getProductBySkuInputSchema,
  removeProductFromWebsiteInputSchema,
  updateProductInputSchema,
} from "../adobe/products/schemas";
import { Product } from "../adobe/products/types/product";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

// @TODO define fields that can be searched for in the search tools
// @TODO create different types of products
// Allow to create custom attributes
export function registerProductTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchProductTool(server, client);
  registerCreateProductTool(server, client);
  registerUpdateProductTool(server, client);
  registerGetProductBySkuTool(server, client);
  registerDeleteProductTool(server, client);
  registerAssignProductToWebsiteTool(server, client);
  registerRemoveProductFromWebsiteTool(server, client);
}

function registerSearchProductTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-products",
    {
      title: "Search Products",
      description: "Search for products in Adobe Commerce with flexible search filters.",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getProducts(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Products</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item: Product) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerCreateProductTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-product",
    {
      title: "Create Product",
      description: "Create a new product in Adobe Commerce with the specified attributes.",
      inputSchema: createProductInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(createProductInputSchema).parse(args);
      const result = await createProduct(client, parsed);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Create Product</name>
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

function registerUpdateProductTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-product",
    {
      title: "Update Product",
      description: "Update an existing product in Adobe Commerce with new attributes.",
      inputSchema: updateProductInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(updateProductInputSchema).parse(args);
      const result = await updateProduct(client, parsed);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Update Product</name>
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

function registerGetProductBySkuTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-product-by-sku",
    {
      title: "Get Product by SKU",
      description: "Retrieve a specific product from Adobe Commerce by its SKU.",
      inputSchema: getProductBySkuInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getProductBySkuInputSchema).parse(args);
      const result = await getProductBySku(client, parsed);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Get Product by SKU</name>
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

function registerDeleteProductTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-product",
    {
      title: "Delete Product",
      description: "Delete a product from Adobe Commerce by its SKU.",
      inputSchema: deleteProductInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteProductInputSchema).parse(args);
      const result = await deleteProduct(client, parsed);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data
          ? `Product with SKU ${parsed.sku} has been successfully deleted.`
          : `Failed to delete product with SKU ${parsed.sku}.`;
        return `
        <meta>
          <name>Delete Product</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${successMessage}
        </data>
      `;
      });
    }
  );
}

function registerAssignProductToWebsiteTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "assign-product-to-website",
    {
      title: "Assign Product to Website",
      description: "Assign a product to a website by SKU and website ID",
      inputSchema: assignProductToWebsiteInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(assignProductToWebsiteInputSchema).parse(args);
      const result = await assignProductToWebsite(client, parsed);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Assign Product to Website</name>
          <endpoint>${endpoint}</endpoint>
          <sku>${parsed.sku}</sku>
          <websiteId>${parsed.website_id}</websiteId>
        </meta>

        <data>
          ${JSON.stringify({ success: data, sku: parsed.sku, website_id: parsed.website_id })}
        </data>
      `;
      });
    }
  );
}

function registerRemoveProductFromWebsiteTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "remove-product-from-website",
    {
      title: "Remove Product from Website",
      description: "Remove a product from a website by SKU and website ID",
      inputSchema: removeProductFromWebsiteInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(removeProductFromWebsiteInputSchema).parse(args);
      const result = await removeProductFromWebsite(client, parsed);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Remove Product from Website</name>
          <endpoint>${endpoint}</endpoint>
          <sku>${parsed.sku}</sku>
          <websiteId>${parsed.website_id}</websiteId>
        </meta>

        <data>
          ${JSON.stringify({ success: data, sku: parsed.sku, website_id: parsed.website_id })}
        </data>
      `;
      });
    }
  );
}
