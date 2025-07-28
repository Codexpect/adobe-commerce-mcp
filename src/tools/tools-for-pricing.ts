import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  deleteCosts,
  deleteSpecialPrices,
  deleteTierPrices,
  getBasePrices,
  getCosts,
  getSpecialPrices,
  getTierPrices,
  replaceTierPrices,
  setBasePrices,
  setCosts,
  setSpecialPrices,
  setTierPrices,
} from "../adobe/products/api-pricing";
import {
  deleteCostsInputSchema,
  deleteSpecialPricesInputSchema,
  deleteTierPricesInputSchema,
  getBasePricesInputSchema,
  getCostsInputSchema,
  getSpecialPricesInputSchema,
  getTierPricesInputSchema,
  replaceTierPricesInputSchema,
  setBasePricesInputSchema,
  setCostsInputSchema,
  setSpecialPricesInputSchema,
  setTierPricesInputSchema,
} from "../adobe/products/schemas";
import { toolTextResponse } from "./tool-response";

export function registerPricingTools(server: McpServer, client: AdobeCommerceClient) {
  registerSetBasePricesTool(server, client);
  registerGetBasePricesTool(server, client);
  registerSetSpecialPricesTool(server, client);
  registerDeleteSpecialPricesTool(server, client);
  registerGetSpecialPricesTool(server, client);
  registerSetTierPricesTool(server, client);
  registerReplaceTierPricesTool(server, client);
  registerDeleteTierPricesTool(server, client);
  registerGetTierPricesTool(server, client);
  registerSetCostsTool(server, client);
  registerDeleteCostsTool(server, client);
  registerGetCostsTool(server, client);
}

function registerSetBasePricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "set-base-prices",
    {
      title: "Set Base Prices",
      description: "Set base prices for multiple products efficiently",
      inputSchema: setBasePricesInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(setBasePricesInputSchema).parse(args);
      const payload = { prices: parsed.prices };
      const result = await setBasePrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data.length === 0
          ? `Base prices for ${parsed.prices.length} product(s) have been successfully updated.`
          : data && data.length > 0
          ? `Base prices updated with ${data.length} result(s). Some operations may have encountered issues.`
          : `Failed to update base prices for the requested products.`;

        return `
        <meta>
          <name>Set Base Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

function registerGetBasePricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-base-prices",
    {
      title: "Get Base Prices",
      description: "Retrieve base prices for multiple products",
      inputSchema: getBasePricesInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getBasePricesInputSchema).parse(args);
      const payload = { skus: parsed.skus };
      const result = await getBasePrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Base Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerSetSpecialPricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "set-special-prices",
    {
      title: "Set Special Prices",
      description: "Set special prices with date ranges for multiple products",
      inputSchema: setSpecialPricesInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(setSpecialPricesInputSchema).parse(args);
      const payload = { prices: parsed.prices };
      const result = await setSpecialPrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data.length === 0
          ? `Special prices for ${parsed.prices.length} product(s) have been successfully updated.`
          : data && data.length > 0
          ? `Special prices updated with ${data.length} result(s). Some operations may have encountered issues.`
          : `Failed to update special prices for the requested products.`;

        return `
        <meta>
          <name>Set Special Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

function registerDeleteSpecialPricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-special-prices",
    {
      title: "Delete Special Prices",
      description: "Delete special prices for multiple products",
      inputSchema: deleteSpecialPricesInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteSpecialPricesInputSchema).parse(args);
      const payload = { prices: parsed.prices };
      const result = await deleteSpecialPrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data.length === 0
          ? `Special prices for ${parsed.prices.length} product(s) have been successfully deleted.`
          : data && data.length > 0
          ? `Special prices deleted with ${data.length} result(s). Some operations may have encountered issues.`
          : `Failed to delete special prices for the requested products.`;

        return `
        <meta>
          <name>Delete Special Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

function registerGetSpecialPricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-special-prices",
    {
      title: "Get Special Prices",
      description: "Retrieve special prices for multiple products",
      inputSchema: getSpecialPricesInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getSpecialPricesInputSchema).parse(args);
      const payload = { skus: parsed.skus };
      const result = await getSpecialPrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Special Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerSetTierPricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "set-tier-prices",
    {
      title: "Set Tier Prices",
      description: "Set tier prices for quantity-based discounts on multiple products",
      inputSchema: setTierPricesInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(setTierPricesInputSchema).parse(args);
      const payload = { prices: parsed.prices };
      const result = await setTierPrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data.length === 0
          ? `Tier prices for ${parsed.prices.length} product(s) have been successfully updated.`
          : data && data.length > 0
          ? `Tier prices updated with ${data.length} result(s). Some operations may have encountered issues.`
          : `Failed to update tier prices for the requested products.`;

        return `
        <meta>
          <name>Set Tier Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

function registerReplaceTierPricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "replace-tier-prices",
    {
      title: "Replace Tier Prices",
      description: "Replace all existing tier prices with new ones for multiple products",
      inputSchema: replaceTierPricesInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(replaceTierPricesInputSchema).parse(args);
      const payload = { prices: parsed.prices };
      const result = await replaceTierPrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data.length === 0
          ? `Tier prices for ${parsed.prices.length} product(s) have been successfully replaced.`
          : data && data.length > 0
          ? `Tier prices replaced with ${data.length} result(s). Some operations may have encountered issues.`
          : `Failed to replace tier prices for the requested products.`;

        return `
        <meta>
          <name>Replace Tier Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

function registerDeleteTierPricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-tier-prices",
    {
      title: "Delete Tier Prices",
      description: "Delete specific tier prices for multiple products",
      inputSchema: deleteTierPricesInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteTierPricesInputSchema).parse(args);
      const payload = { prices: parsed.prices };
      const result = await deleteTierPrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data.length === 0
          ? `Tier prices for ${parsed.prices.length} product(s) have been successfully deleted.`
          : data && data.length > 0
          ? `Tier prices deleted with ${data.length} result(s). Some operations may have encountered issues.`
          : `Failed to delete tier prices for the requested products.`;

        return `
        <meta>
          <name>Delete Tier Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

function registerGetTierPricesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-tier-prices",
    {
      title: "Get Tier Prices",
      description: "Retrieve tier prices for multiple products",
      inputSchema: getTierPricesInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getTierPricesInputSchema).parse(args);
      const payload = { skus: parsed.skus };
      const result = await getTierPrices(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Tier Prices</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerSetCostsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "set-costs",
    {
      title: "Set Costs",
      description: "Set cost values for multiple products",
      inputSchema: setCostsInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(setCostsInputSchema).parse(args);
      const payload = { prices: parsed.prices };
      const result = await setCosts(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data && data.length === 0
          ? `Costs for ${parsed.prices.length} product(s) have been successfully updated.`
          : data && data.length > 0
          ? `Costs updated with ${data.length} result(s). Some operations may have encountered issues.`
          : `Failed to update costs for the requested products.`;

        return `
        <meta>
          <name>Set Costs</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>

        <context>
          ${contextMessage}
        </context>
      `;
      });
    }
  );
}

function registerDeleteCostsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-costs",
    {
      title: "Delete Costs",
      description: "Delete cost values for multiple products",
      inputSchema: deleteCostsInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(deleteCostsInputSchema).parse(args);
      const payload = { skus: parsed.skus };
      const result = await deleteCosts(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const contextMessage = data === true
          ? `Costs for ${parsed.skus.length} product(s) have been successfully deleted.`
          : `Failed to delete costs for the requested products.`;

        return `
        <meta>
          <name>Delete Costs</name>
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

function registerGetCostsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-costs",
    {
      title: "Get Costs",
      description: "Retrieve cost values for multiple products",
      inputSchema: getCostsInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getCostsInputSchema).parse(args);
      const payload = { skus: parsed.skus };
      const result = await getCosts(client, payload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Costs</name>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}
