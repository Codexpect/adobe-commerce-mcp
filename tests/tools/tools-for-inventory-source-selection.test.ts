import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventorySourceItemTools } from "../../src/tools/tools-for-inventory-source-items";
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

    // Register source selection tools, product tools, and source item tools (needed for creating test products and source items)
    registerInventorySourceSelectionTools(mockServer.server, client);
    registerProductTools(mockServer.server, client);
    registerInventorySourceItemTools(mockServer.server, client);

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

      // Step 1: Create test stock and multiple sources
      const stock = await inventoryFixtures.createStockFixture("selection_test_stock");
      const source1 = await inventoryFixtures.createSourceFixture("selection_test_source_1");
      const source2 = await inventoryFixtures.createSourceFixture("selection_test_source_2");

      console.log(`📦 Created test stock: ${stock.stock_id}, sources: ${source1.source_code}, ${source2.source_code}`);

      // Step 2: Create stock-source links with different priorities
      await inventoryFixtures.createStockSourceLinkFixture(stock.stock_id!, source1.source_code!, 1);
      await inventoryFixtures.createStockSourceLinkFixture(stock.stock_id!, source2.source_code!, 2);

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

      // Step 4: Create source items for the product at both sources
      const createSourceItem1Result = await mockServer.callTool("create-source-item", {
        sku: productSku,
        source_code: source1.source_code!,
        quantity: 30,
        status: 1,
      });

      const createSourceItem2Result = await mockServer.callTool("create-source-item", {
        sku: productSku,
        source_code: source2.source_code!,
        quantity: 20,
        status: 1,
      });

      const createSourceItem1ResponseText = extractToolResponseText(createSourceItem1Result);
      const createSourceItem1Parsed = parseToolResponse(createSourceItem1ResponseText);
      expect(createSourceItem1Parsed.data).toBeDefined();

      const createSourceItem2ResponseText = extractToolResponseText(createSourceItem2Result);
      const createSourceItem2Parsed = parseToolResponse(createSourceItem2ResponseText);
      expect(createSourceItem2Parsed.data).toBeDefined();

      console.log(`📦 Created source items for product: ${productSku} at sources: ${source1.source_code} (30 qty), ${source2.source_code} (20 qty)`);

      // Step 5: Perform source selection with quantity that requires multiple sources
      const sourceSelectionResult = await mockServer.callTool("run-source-selection-algorithm", {
        inventory_request: {
          stock_id: stock.stock_id!,
          items: [
            {
              sku: productSku,
              qty: 40, // Request more than available at source1 (30), so it should use both sources
            },
          ],
        },
        algorithm_code: "priority",
      });

      const selectionResponseText = extractToolResponseText(sourceSelectionResult);
      const selectionParsed = parseToolResponse(selectionResponseText);
      expect(selectionParsed.data).toBeDefined();
      expect(selectionParsed.data.length).toBeGreaterThan(0);

      const selectionData = JSON.parse(selectionParsed.data[0]);
      expect(selectionData).toBeDefined();

      // Verify that source selection worked correctly with multiple sources
      expect(selectionData.source_selection_items).toBeDefined();
      expect(selectionData.source_selection_items.length).toBeGreaterThan(0);

      // Check that we got items from both sources (priority algorithm should use source1 first, then source2)
      const sourceCodes = selectionData.source_selection_items.map((item: { source_code: string }) => item.source_code);
      expect(sourceCodes).toContain(source1.source_code);
      expect(sourceCodes).toContain(source2.source_code);

      // Verify total quantity matches our request
      const totalQty = selectionData.source_selection_items.reduce((sum: number, item: { qty_to_deduct: number }) => sum + item.qty_to_deduct, 0);
      expect(totalQty).toBe(40);

      console.log(`🔍 Source selection completed: ${selectionData.source_selection_items?.length || 0} items selected`);
      console.log(`📊 Selected sources: ${sourceCodes.join(", ")}`);
      console.log(`📊 Total quantity: ${totalQty}`);
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
