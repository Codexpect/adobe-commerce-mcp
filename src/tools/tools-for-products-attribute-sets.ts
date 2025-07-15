import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client.js";
import {
  createAttributeSet,
  deleteAttributeFromSet,
  deleteAttributeSet,
  getAttributeSetById,
  getAttributeSetsList,
  updateAttributeSet,
} from "../adobe/products/api-products-attribute-sets.js";
import { mapCreateAttributeSetInputToApiPayload, mapUpdateAttributeSetInputToApiPayload } from "../adobe/products/mapping/attribute-mapping.js";
import {
  createAttributeSetInputSchema,
  deleteAttributeFromSetInputSchema,
  deleteAttributeSetInputSchema,
  getAttributeSetByIdInputSchema,
  updateAttributeSetInputSchema,
} from "../adobe/products/schema.js";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index.js";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema.js";
import { toolTextResponse } from "./tool-response.js";

export function registerProductAttributeSetsTools(server: McpServer, client: AdobeCommerceClient) {
  registerCreateAttributeSetTool(server, client);
  registerSearchAttributeSetsTool(server, client);
  registerGetAttributeSetByIdTool(server, client);
  registerDeleteAttributeSetTool(server, client);
  registerUpdateAttributeSetTool(server, client);
  registerDeleteAttributeFromSetTool(server, client);
}

function registerCreateAttributeSetTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-attribute-set",
    {
      title: "Create Attribute Set",
      description:
        "Create a new attribute set in Adobe Commerce. Only attribute_set_name and sort_order are required; other fields are set automatically.",
      inputSchema: createAttributeSetInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(createAttributeSetInputSchema).parse(args);
      const attributeSet = mapCreateAttributeSetInputToApiPayload(parsed);
      const result = await createAttributeSet(client, attributeSet);

      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
        <meta>
          <name>Attribute Set</name>
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

function registerSearchAttributeSetsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-attribute-sets",
    {
      title: "Search Attribute Sets",
      description: "Search for attribute sets in Adobe Commerce with flexible search filters.",
      inputSchema: searchCriteriaInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getAttributeSetsList(client, searchCriteria);
      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
         <meta>
          <name>Attribute Sets</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
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

function registerGetAttributeSetByIdTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-attribute-set-by-id",
    {
      title: "Get Attribute Set By ID",
      description: "Get details of an attribute set by its ID.",
      inputSchema: getAttributeSetByIdInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      const parsed = z.object(getAttributeSetByIdInputSchema).parse(args);
      const { attributeSetId } = parsed;
      if (!attributeSetId) throw new Error("attribute_set_id is required");

      const result = await getAttributeSetById(client, attributeSetId);
      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
         <meta>
          <name>Attribute Set Details</name>
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

function registerDeleteAttributeSetTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-attribute-set",
    {
      title: "Delete Attribute Set",
      description: "Delete an attribute set by its ID.",
      inputSchema: deleteAttributeSetInputSchema,
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      const parsed = z.object(deleteAttributeSetInputSchema).parse(args);
      const { attributeSetId } = parsed;
      if (!attributeSetId) throw new Error("attribute_set_id is required");

      const result = await deleteAttributeSet(client, attributeSetId);
      return toolTextResponse(result, (resp) => {
        const { endpoint } = resp;
        return `
         <meta>
          <name>Delete Attribute Set</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>Deleted</data>
      `;
      });
    }
  );
}

function registerUpdateAttributeSetTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-attribute-set",
    {
      title: "Update Attribute Set",
      description: "Update an attribute set by its ID. Only provide fields you want to update.",
      inputSchema: updateAttributeSetInputSchema,
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      const parsed = z.object(updateAttributeSetInputSchema).parse(args);
      const attributeSet = mapUpdateAttributeSetInputToApiPayload(parsed);
      if (!attributeSet.attribute_set_id) throw new Error("attribute_set_id is required");

      const result = await updateAttributeSet(client, attributeSet.attribute_set_id, attributeSet);
      return toolTextResponse(result, (resp) => {
        const { items, endpoint } = resp;
        return `
         <meta>
          <name>Update Attribute Set</name>
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

function registerDeleteAttributeFromSetTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-attribute-from-set",
    {
      title: "Delete Attribute From Set",
      description: "Delete an attribute from an attribute set by set ID and attribute code.",
      inputSchema: deleteAttributeFromSetInputSchema,
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      const parsed = z.object(deleteAttributeFromSetInputSchema).parse(args);
      const { attributeSetId, attributeCode } = parsed;
      if (!attributeSetId) throw new Error("attribute_set_id is required");

      const result = await deleteAttributeFromSet(client, attributeSetId, attributeCode);
      return toolTextResponse(result, (resp) => {
        const { endpoint } = resp;
        return `
         <meta>
          <name>Delete Attribute From Set</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>Deleted</data>
      `;
      });
    }
  );
}
