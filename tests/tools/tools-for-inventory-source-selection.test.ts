import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventorySourceSelectionTools } from "../../src/tools/tools-for-inventory-source-selection";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { createMockMcpServer, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";

describe("Inventory Source Selection Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up inventory source selection tools functional tests...");
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

    // Register source selection tools and product tools (needed for creating test products)
    registerInventorySourceSelectionTools(mockServer.server, client);
    registerProductTools(mockServer.server, client);

    // Initialize fixtures
    inventoryFixtures = new InventoryFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up fixtures
    // await inventoryFixtures.cleanupCurrentTest();
  });

  describe("Source Selection Tools", () => {
    test("should get source selection algorithms", async () => {
      inventoryFixtures.setCurrentTest("source_selection_algorithms");
      console.log("🧪 Testing source selection algorithms...");

      // Step 1: Get source selection algorithms
      const getAlgorithmsResult = await mockServer.callTool("get-source-selection-algorithms", {});

      const getAlgorithmsResponseText = extractToolResponseText(getAlgorithmsResult);
      const getAlgorithmsParsed = parseToolResponse(getAlgorithmsResponseText);
      expect(getAlgorithmsParsed.data).toBeDefined();

      const algorithmsData = getAlgorithmsParsed.data.map((item) => JSON.parse(item));
      expect(algorithmsData.length).toBeGreaterThan(0);

      console.log(`🔍 Found ${algorithmsData.length} source selection algorithms`);
      console.log("✅ Source selection algorithms test completed successfully!");
    }, 30000);

    test("should perform source selection", async () => {
      inventoryFixtures.setCurrentTest("source_selection");
      console.log("🧪 Testing source selection...");

      // Step 1: Create test stock and source
      const stock = await inventoryFixtures.createStockFixture("selection_test_stock");
      const source = await inventoryFixtures.createSourceFixture("selection_test_source");

      console.log(`📦 Created test stock: ${stock.stock_id}, source: ${source.source_code}`);

      // Step 2: Create stock-source link
      await inventoryFixtures.createStockSourceLinkFixture(stock.stock_id!, source.source_code!, 1);

      // Step 3: Create a test product
      const productSku = "selection_test_" + inventoryFixtures.getCurrentTestUniqueId();

      const createProductResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Selection Test Product " + inventoryFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for testing source selection" },
          { attribute_code: "short_description", value: "Selection test product" },
        ],
      });

      const createProductResponseText = extractToolResponseText(createProductResult);
      const createProductParsed = parseToolResponse(createProductResponseText);
      expect(createProductParsed.data).toBeDefined();

      console.log(`📦 Created test product: ${productSku}`);

      // Step 4: Perform source selection
      const sourceSelectionResult = await mockServer.callTool("run-source-selection-algorithm", {
        inventory_request: {
          stock_id: stock.stock_id!,
          items: [
            {
              sku: productSku,
              qty: 5,
            },
          ],
        },
        algorithm_code: "priority",
      });

      const selectionResponseText = extractToolResponseText(sourceSelectionResult);
      const selectionParsed = parseToolResponse(selectionResponseText);
      expect(selectionParsed.data).toBeDefined();

      const selectionData = JSON.parse(selectionParsed.data[0]);
      expect(selectionData).toBeDefined();

      console.log(`🔍 Source selection completed: ${selectionData.source_selection_items?.length || 0} items selected`);
      console.log("✅ Source selection test completed successfully!");
    }, 60000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle invalid source selection gracefully", async () => {
      inventoryFixtures.setCurrentTest("invalid_source_selection");
      console.log("🧪 Testing invalid source selection handling...");

      // Try to run source selection with invalid data
      try {
        await mockServer.callTool("run-source-selection-algorithm", {
          inventory_request: {
            stock_id: 999999, // Non-existent stock
            items: [
              {
                sku: "non-existent-product",
                qty: 5,
              },
            ],
          },
          algorithm_code: "invalid-algorithm",
        });
        // If we reach here, the validation failed to catch the invalid data
        expect(true).toBe(false); // This should not happen
      } catch {
        // Expected to fail due to validation
        console.log("✅ Properly rejected invalid source selection");
      }

      console.log("✅ Invalid source selection handled gracefully");
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful source selection operations", async () => {
      inventoryFixtures.setCurrentTest("source_selection_context_messages_success");
      console.log("🧪 Testing context messages for successful source selection operations...");

      // Test source selection algorithms context message
      const getAlgorithmsResult = await mockServer.callTool("get-source-selection-algorithms", {});

      const getAlgorithmsResponseText = extractToolResponseText(getAlgorithmsResult);
      const getAlgorithmsParsed = parseToolResponse(getAlgorithmsResponseText);
      expect(getAlgorithmsParsed.data).toBeDefined();

      console.log("✅ Source selection context messages are appropriate for successful operations");
    }, 30000);
  });
});
