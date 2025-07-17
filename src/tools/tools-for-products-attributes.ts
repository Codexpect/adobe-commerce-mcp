import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import { createProductAttribute, getProductsAttributes } from "../adobe/products/api-products.js";
import { mapCreateProductAttributeInputToApiPayload } from "../adobe/products/mapping/attribute-mapping.js";
import { createProductAttributeInputSchema } from "../adobe/products/schema.js";
import { ProductAttribute } from "../adobe/products/types/product.js";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

export function registerProductAttributesTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchProductAttributesTool(server, client);
  registerCreateProductAttributeTool(server, client);
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
        const { items, endpoint } = resp;
        return `
         <meta>
          <name>Products Attributes</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item: ProductAttribute) => JSON.stringify(item)).join("\n")}
        <data>
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
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>Product Attribute</name>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${items.map((item) => JSON.stringify(item)).join("\n")}
        <data>
      `;
      });
    }
  );
}
