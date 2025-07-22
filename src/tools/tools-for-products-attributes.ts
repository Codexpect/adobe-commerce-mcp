import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { 
  createProductAttribute, 
  getProductsAttributes,
  getProductAttributeByCode,
  updateProductAttribute,
  deleteProductAttribute,
  getProductAttributeOptions,
  addProductAttributeOption,
  updateProductAttributeOption,
  deleteProductAttributeOption
} from "../adobe/products/api-products-attributes";
import { 
  mapCreateProductAttributeInputToApiPayload,
  mapUpdateProductAttributeInputToApiPayload,
  mapAddProductAttributeOptionInputToApiPayload,
  mapUpdateProductAttributeOptionInputToApiPayload
} from "../adobe/products/mapping/attribute-mapping";
import { 
  createProductAttributeInputSchema,
  getProductAttributeByCodeInputSchema,
  updateProductAttributeInputSchema,
  deleteProductAttributeInputSchema,
  getProductAttributeOptionsInputSchema,
  addProductAttributeOptionInputSchema,
  updateProductAttributeOptionInputSchema,
  deleteProductAttributeOptionInputSchema
} from "../adobe/products/schemas";
import { ProductAttribute } from "../adobe/products/types/product";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

// @TODO define fields that can be searched for in the search tools
// @TODO allow to create/update all fields for the attribute
// @TODO allow to define isFilterable
export function registerProductAttributesTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchProductAttributesTool(server, client);
  registerCreateProductAttributeTool(server, client);
  registerGetProductAttributeByCodeTool(server, client);
  registerUpdateProductAttributeTool(server, client);
  registerDeleteProductAttributeTool(server, client);
  registerGetProductAttributeOptionsTool(server, client);
  registerAddProductAttributeOptionTool(server, client);
  registerUpdateProductAttributeOptionTool(server, client);
  registerDeleteProductAttributeOptionTool(server, client);
}

function registerSearchProductAttributesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-products-attributes",
    {
      title: "Search Products Attributes",
      description: "Search for products attributes in Adobe Commerce with flexible search filters.",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getProductsAttributes(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Search Products Attributes</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item: ProductAttribute) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerCreateProductAttributeTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-product-attribute",
    {
      title: "Create Product Attribute",
      description:
        "Create a new product attribute in Adobe Commerce. Supports all attribute types (text, textarea, boolean, date, integer, decimal, select, multiselect, etc.) with flexible options.",
      inputSchema: createProductAttributeInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(createProductAttributeInputSchema).parse(args);
      const attribute = mapCreateProductAttributeInputToApiPayload(parsed);
      const result = await createProductAttribute(client, attribute);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Create Product Attribute</name>
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

function registerGetProductAttributeByCodeTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-product-attribute-by-code",
    {
      title: "Get Product Attribute By Code",
      description: "Get a single product attribute by its attribute code.",
      inputSchema: getProductAttributeByCodeInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z.object(getProductAttributeByCodeInputSchema).parse(args);
      const result = await getProductAttributeByCode(client, parsed.attributeCode);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Get Product Attribute By Code</name>
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

function registerUpdateProductAttributeTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-product-attribute",
    {
      title: "Update Product Attribute",
      description: "Update an existing product attribute by its attribute code.",
      inputSchema: updateProductAttributeInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(updateProductAttributeInputSchema).parse(args);
      const attribute = mapUpdateProductAttributeInputToApiPayload(parsed);
      const result = await updateProductAttribute(client, attribute);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Update Product Attribute</name>
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

function registerDeleteProductAttributeTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-product-attribute",
    {
      title: "Delete Product Attribute",
      description: "Delete a product attribute by its attribute code.",
      inputSchema: deleteProductAttributeInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(deleteProductAttributeInputSchema).parse(args);
      const result = await deleteProductAttribute(client, parsed.attributeCode);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data ? `Product attribute "${parsed.attributeCode}" has been successfully deleted.` : `Failed to delete product attribute "${parsed.attributeCode}".`;
        return `
        <meta>
          <name>Delete Product Attribute</name>
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

function registerGetProductAttributeOptionsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-product-attribute-options",
    {
      title: "Get Product Attribute Options",
      description: "Get all options for a specific product attribute.",
      inputSchema: getProductAttributeOptionsInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z.object(getProductAttributeOptionsInputSchema).parse(args);
      const result = await getProductAttributeOptions(client, parsed.attributeCode);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Get Product Attribute Options</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${Array.isArray(data) ? data.length : 0}</totalItems>
        </meta>

        <data>
          ${Array.isArray(data) ? data.map((item) => JSON.stringify(item)).join("\n") : JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerAddProductAttributeOptionTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "add-product-attribute-option",
    {
      title: "Add Product Attribute Option",
      description: "Add a new option to a product attribute.",
      inputSchema: addProductAttributeOptionInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(addProductAttributeOptionInputSchema).parse(args);
      const option = mapAddProductAttributeOptionInputToApiPayload(parsed);
      const result = await addProductAttributeOption(client, parsed.attributeCode, option);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Add Product Attribute Option</name>
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

function registerUpdateProductAttributeOptionTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-product-attribute-option",
    {
      title: "Update Product Attribute Option",
      description: "Update an existing option of a product attribute.",
      inputSchema: updateProductAttributeOptionInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(updateProductAttributeOptionInputSchema).parse(args);
      const option = mapUpdateProductAttributeOptionInputToApiPayload(parsed);
      const result = await updateProductAttributeOption(client, parsed.attributeCode, parsed.optionId, option as NonNullable<ProductAttribute["options"]>[0]);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Update Product Attribute Option</name>
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

function registerDeleteProductAttributeOptionTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-product-attribute-option",
    {
      title: "Delete Product Attribute Option",
      description: "Delete an option from a product attribute.",
      inputSchema: deleteProductAttributeOptionInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(deleteProductAttributeOptionInputSchema).parse(args);
      const result = await deleteProductAttributeOption(client, parsed.attributeCode, parsed.optionId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data ? `Option "${parsed.optionId}" has been successfully deleted from attribute "${parsed.attributeCode}".` : `Failed to delete option "${parsed.optionId}" from attribute "${parsed.attributeCode}".`;
        return `
        <meta>
          <name>Delete Product Attribute Option</name>
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
