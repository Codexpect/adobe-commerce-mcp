import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  getProductBySku, 
  deleteProduct 
} from "../adobe/products/api-products";
import { Product } from "../adobe/products/types/product";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { 
  createProductInputSchema,
  updateProductInputSchema,
  getProductBySkuInputSchema,
  deleteProductInputSchema
} from "../adobe/products/schemas";
import { toolTextResponse } from "./tool-response";

// @TODO define fields that can be searched for in the search tools
export function registerProductTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchProductTool(server, client);
  registerCreateProductTool(server, client);
  registerUpdateProductTool(server, client);
  registerGetProductBySkuTool(server, client);
  registerDeleteProductTool(server, client);
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
        <meta>

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
        return `
        <meta>
          <name>Delete Product</name>
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
