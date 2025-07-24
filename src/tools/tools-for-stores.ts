import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import { getStoreConfigs, getStoreGroups, getStoreViews, getWebsites } from "../adobe/stores/api-stores";
import { getStoreConfigsInputSchema } from "../adobe/stores/schemas";
import { Store, StoreConfig, StoreGroup, Website } from "../adobe/stores/types/store";
import { toolTextResponse } from "./tool-response";

export function registerStoreTools(server: McpServer, client: AdobeCommerceClient) {
  registerGetStoreConfigsTools(server, client);
  registerGetStoreViewsTools(server, client);
  registerGetStoreGroupsTools(server, client);
  registerGetWebsitesTools(server, client);
}

function registerGetStoreConfigsTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-store-configs",
    {
      title: "Get Store Configurations",
      description: "Retrieve store configurations with optional filtering by store codes",
      inputSchema: getStoreConfigsInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getStoreConfigsInputSchema).parse(args);
      const result = await getStoreConfigs(client, parsed);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Store Configurations</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((config: StoreConfig) => JSON.stringify(config)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerGetStoreViewsTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-store-views",
    {
      title: "Get Store Views",
      description: "Retrieve list of all store views",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
      },
    },
    async () => {
      const result = await getStoreViews(client);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Store Views</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((store: Store) => JSON.stringify(store)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerGetStoreGroupsTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-store-groups",
    {
      title: "Get Store Groups",
      description: "Retrieve list of all store groups",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
      },
    },
    async () => {
      const result = await getStoreGroups(client);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Store Groups</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((group: StoreGroup) => JSON.stringify(group)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerGetWebsitesTools(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-websites",
    {
      title: "Get Websites",
      description: "Retrieve list of all websites",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
      },
    },
    async () => {
      const result = await getWebsites(client);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Websites</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((website: Website) => JSON.stringify(website)).join("\n")}
        </data>
      `;
      });
    }
  );
}
