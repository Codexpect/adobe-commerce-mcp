import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventoryTools } from "../../src/tools/tools-for-inventory";
import { createMockMcpServer, MockMcpServer } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";

describe("Inventory Tools - Integration Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up inventory tools integration tests...");
    console.log(`📍 Testing against: ${process.env.COMMERCE_BASE_URL}`);

    const params = {
      COMMERCE_BASE_URL: process.env.COMMERCE_BASE_URL,
      COMMERCE_CONSUMER_KEY: process.env.COMMERCE_CONSUMER_KEY,
      COMMERCE_CONSUMER_SECRET: process.env.COMMERCE_CONSUMER_SECRET,
      COMMERCE_ACCESS_TOKEN: process.env.COMMERCE_ACCESS_TOKEN,
      COMMERCE_ACCESS_TOKEN_SECRET: process.env.COMMERCE_ACCESS_TOKEN_SECRET,
    } as CommerceParams;

    client = AdobeCommerceClient.create(params);
    mockServer = createMockMcpServer();

    // Register all inventory tools for integration testing
    registerInventoryTools(mockServer.server, client);

    // Initialize fixtures
    inventoryFixtures = new InventoryFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up fixtures
    await inventoryFixtures.cleanupCurrentTest();
  });

  describe("Tool Registration", () => {
    test("should register all inventory tools", () => {
      const toolNames = Array.from(mockServer.registeredTools.keys());

      // Stock tools
      expect(toolNames).toContain("search-stocks");
      expect(toolNames).toContain("get-stock-by-id");
      expect(toolNames).toContain("create-stock");
      expect(toolNames).toContain("update-stock");
      expect(toolNames).toContain("delete-stock");
      expect(toolNames).toContain("resolve-stock");

      // Source tools
      expect(toolNames).toContain("search-sources");
      expect(toolNames).toContain("get-source-by-code");
      expect(toolNames).toContain("create-source");
      expect(toolNames).toContain("update-source");

      // Stock-Source Link tools
      expect(toolNames).toContain("search-stock-source-links");
      expect(toolNames).toContain("create-stock-source-links");
      expect(toolNames).toContain("delete-stock-source-links");

      // Stock Item tools
      expect(toolNames).toContain("get-stock-item");
      expect(toolNames).toContain("update-stock-item");
      expect(toolNames).toContain("get-low-stock-items");
      expect(toolNames).toContain("get-stock-status");
      expect(toolNames).toContain("are-products-salable");
      expect(toolNames).toContain("are-products-salable-for-requested-qty");
      expect(toolNames).toContain("is-product-salable");
      expect(toolNames).toContain("is-product-salable-for-requested-qty");
      expect(toolNames).toContain("get-product-salable-quantity");

      // Source Selection tools
      expect(toolNames).toContain("get-source-selection-algorithms");
      expect(toolNames).toContain("run-source-selection-algorithm");

      console.log(`✅ All ${toolNames.length} inventory tools registered successfully`);
    });

    test("should register search stocks tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-stocks");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Search Stocks");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create stock tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-stock");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Create Stock");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get stock by ID tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-stock-by-id");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Stock by ID");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register update stock tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-stock");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Stock");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete stock tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-stock");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Stock");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register resolve stock tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("resolve-stock");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Resolve Stock");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register search sources tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-sources");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Search Sources");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create source tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-source");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Create Source");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get source by code tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-source-by-code");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Source by Code");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register update source tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-source");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Source");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register search stock-source links tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-stock-source-links");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Search Stock-Source Links");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create stock-source links tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-stock-source-links");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Create Stock-Source Links");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete stock-source links tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-stock-source-links");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Stock-Source Links");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get stock item tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-stock-item");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Stock Item");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register update stock item tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-stock-item");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Stock Item");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get low stock items tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-low-stock-items");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Low Stock Items");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get stock status tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-stock-status");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Stock Status");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register are products salable tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("are-products-salable");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Are Products Salable");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register are products salable for requested qty tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("are-products-salable-for-requested-qty");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Are Products Salable For Requested Quantity");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register is product salable tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("is-product-salable");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Is Product Salable");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register is product salable for requested qty tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("is-product-salable-for-requested-qty");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Is Product Salable For Requested Quantity");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get product salable quantity tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-product-salable-quantity");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Product Salable Quantity");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get source selection algorithms tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-source-selection-algorithms");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Source Selection Algorithms");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register run source selection algorithm tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("run-source-selection-algorithm");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Run Source Selection Algorithm");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });
  });
});
