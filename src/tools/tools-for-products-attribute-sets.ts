import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  assignAttributeToSetGroup,
  createAttributeGroup,
  createAttributeSet,
  deleteAttributeFromSet,
  deleteAttributeSet,
  getAttributeGroupsForSet,
  getAttributesFromSet,
  getAttributeSetById,
  getAttributeSetsList,
  updateAttributeSet,
  deleteAttributeGroup,
  updateAttributeGroup,
} from "../adobe/products/api-products-attributes-sets";
import {
  mapCreateAttributeGroupInputToApiPayload,
  mapCreateAttributeSetInputToApiPayload,
  mapUpdateAttributeGroupInputToApiPayload,
  mapUpdateAttributeSetInputToApiPayload,
} from "../adobe/products/mapping/attribute-mapping";
import {
  assignAttributeToSetGroupInputSchema,
  createAttributeGroupInputSchema,
  createAttributeSetInputSchema,
  deleteAttributeFromSetInputSchema,
  deleteAttributeSetInputSchema,
  getAttributesFromSetInputSchema,
  getAttributeSetByIdInputSchema,
  updateAttributeSetInputSchema,
  deleteAttributeGroupInputSchema,
  updateAttributeGroupInputSchema,
} from "../adobe/products/schemas";
import type { AttributeGroup } from "../adobe/products/types/product";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

export function registerProductAttributeSetsTools(server: McpServer, client: AdobeCommerceClient) {
  registerCreateAttributeSetTool(server, client);
  registerSearchAttributeSetsTool(server, client);
  registerGetAttributeSetByIdTool(server, client);
  registerGetAttributesFromSetTool(server, client);
  registerDeleteAttributeSetTool(server, client);
  registerUpdateAttributeSetTool(server, client);
  registerDeleteAttributeFromSetTool(server, client);
  registerAssignAttributeToSetGroupTool(server, client);
  registerSearchAttributeGroupsTool(server, client);
  registerCreateAttributeGroupTool(server, client);
  registerDeleteAttributeGroupTool(server, client);
  registerUpdateAttributeGroupTool(server, client);
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
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Create Attribute Set</name>
          <endpoint>${endpoint}</endpoint>
        <meta>

        <data>
          ${JSON.stringify(data)}
        </data>
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
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Search Attribute Sets</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        <meta>
        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>
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
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Attribute Set Details</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerGetAttributesFromSetTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-attributes-from-set",
    {
      title: "Get Attributes From Set",
      description: "Get all attributes from an attribute set by its ID.",
      inputSchema: getAttributesFromSetInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      const parsed = z.object(getAttributesFromSetInputSchema).parse(args);
      const { attributeSetId } = parsed;
      if (!attributeSetId) throw new Error("attribute_set_id is required");

      const result = await getAttributesFromSet(client, attributeSetId);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Attributes From Set</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>
          ${JSON.stringify(data)}
        </data>
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
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Delete Attribute Set</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>
          ${data ? "Deleted" : "Failed to delete attribute set"}
        </data>
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
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Update Attribute Set</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>
          ${JSON.stringify(data)}
        </data>
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
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Delete Attribute From Set</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>
          ${data ? "Deleted" : "Failed to delete attribute from set"}
        </data>
      `;
      });
    }
  );
}

function registerAssignAttributeToSetGroupTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "assign-attribute-to-set-group",
    {
      title: "Assign Attribute to Set and Group",
      description: "Assign an attribute to an attribute set and group in Adobe Commerce.",
      inputSchema: assignAttributeToSetGroupInputSchema,
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      const parsed = z.object(assignAttributeToSetGroupInputSchema).parse(args);
      const result = await assignAttributeToSetGroup(client, parsed);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Assign Attribute to Set and Group</name>
          <endpoint>${endpoint}</endpoint>
        <meta>
        <data>
          ${data ? "Assigned" : "Failed to assign attribute to set/group"}
        </data>
      `;
      });
    }
  );
}

function registerSearchAttributeGroupsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-attribute-groups",
    {
      title: "Search Attribute Groups",
      description: "Search for attribute groups in an attribute set in Adobe Commerce.",
      inputSchema: searchCriteriaInputSchema,
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const groups = await getAttributeGroupsForSet(client, searchCriteria);
      return toolTextResponse({ data: groups, endpoint: `/products/attribute-sets/groups/list`, success: true, error: undefined }, (resp) => {
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Search Attribute Groups</name>
          <endpoint>${endpoint}</endpoint>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <totalItems>${data?.length}</totalItems>
         <meta>
         <data>
          ${data?.map((item: AttributeGroup) => JSON.stringify(item)).join("\n")}
         </data>
        `;
      });
    }
  );
}

function registerCreateAttributeGroupTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-attribute-group",
    {
      title: "Create Attribute Group",
      description: "Create a new attribute group in an attribute set in Adobe Commerce.",
      inputSchema: createAttributeGroupInputSchema,
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      const parsed = z.object(createAttributeGroupInputSchema).parse(args);
      const group = mapCreateAttributeGroupInputToApiPayload(parsed);
      const result = await createAttributeGroup(client, group);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Create Attribute Group</name>
          <endpoint>${endpoint}</endpoint>
         <meta>
         <data>
          ${JSON.stringify(data)}
         </data>
        `;
      });
    }
  );
}

function registerDeleteAttributeGroupTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-attribute-group",
    {
      title: "Delete Attribute Group",
      description: "Delete an attribute group by its ID.",
      inputSchema: deleteAttributeGroupInputSchema,
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      const parsed = z.object(deleteAttributeGroupInputSchema).parse(args);
      const { attributeGroupId } = parsed;
      const result = await deleteAttributeGroup(client, attributeGroupId);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Delete Attribute Group</name>
          <endpoint>${endpoint}</endpoint>
         <meta>
         <data>
          ${data ? "Deleted" : "Failed to delete attribute group"}
         </data>
        `;
      });
    }
  );
}

function registerUpdateAttributeGroupTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-attribute-group",
    {
      title: "Update Attribute Group",
      description: "Update an attribute group by its ID in a given attribute set.",
      inputSchema: updateAttributeGroupInputSchema,
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      const parsed = z.object(updateAttributeGroupInputSchema).parse(args);
      const { attributeSetId } = parsed;
      const group = mapUpdateAttributeGroupInputToApiPayload(parsed);
      const result = await updateAttributeGroup(client, attributeSetId, group);
      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
         <meta>
          <name>Update Attribute Group</name>
          <endpoint>${endpoint}</endpoint>
         <meta>
         <data>
          ${JSON.stringify(data)}
         </data>
        `;
      });
    }
  );
}
