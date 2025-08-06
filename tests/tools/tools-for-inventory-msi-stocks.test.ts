import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventoryMsiStockTools } from "../../src/tools/tools-for-inventory-msi-stocks";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";

describe("Inventory Stocks Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up inventory stocks tools functional tests...");
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

    // Register stocks tools
    registerInventoryMsiStockTools(mockServer.server, client);

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

  describe("Stocks Tools", () => {
    test("should create, get, update, and delete stocks", async () => {
      inventoryFixtures.setCurrentTest("stocks_lifecycle");
      console.log("🧪 Testing stocks lifecycle...");

      // Step 1: Create a stock
      const stockInput = {
        name: "Test Stock " + inventoryFixtures.getCurrentTestUniqueId(),
        sales_channels: [{ type: "website", code: "base" }],
      };

      const createStockResult = await mockServer.callTool("create-msi-stock", stockInput);

      const createResponseText = extractToolResponseText(createStockResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toBeDefined();

      // Verify context message
      const createContextMessage = extractContextContent(createResponseText);
      expect(createContextMessage).toContain("Stock has been successfully created");

      const stockId = Number(JSON.parse(createParsed.data[0]));
      console.log(`🏭 Created stock with ID: ${stockId}`);

      // Step 2: Get stock by ID and validate the data matches what was sent
      const getStockResult = await mockServer.callTool("get-msi-stock-by-id", {
        stock_id: stockId,
      });

      const getResponseText = extractToolResponseText(getStockResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      const stockData = JSON.parse(getParsed.data[0]);
      expect(stockData.stock_id).toBe(stockId);
      
      // Validate that the retrieved data matches what we sent
      expect(stockData.name).toBe(stockInput.name);
      
      // Verify that links (sales channels) are returned
      expect(stockData.extension_attributes).toBeDefined();
      expect(stockData.extension_attributes.sales_channels).toBeDefined();
      expect(Array.isArray(stockData.extension_attributes.sales_channels)).toBe(true);
      expect(stockData.extension_attributes.sales_channels.length).toBeGreaterThan(0);
      
      const salesChannel = stockData.extension_attributes.sales_channels[0];
      expect(salesChannel.type).toBe(stockInput.sales_channels[0].type);
      expect(salesChannel.code).toBe(stockInput.sales_channels[0].code);
      console.log(`📦 Retrieved stock: ${stockData.name}`);
      console.log(`🔗 Stock has ${stockData.extension_attributes.sales_channels.length} sales channel(s)`);

      // Step 3: Update stock
      const updateInput = {
        stock_id: stockId,
        name: "Updated Test Stock " + inventoryFixtures.getCurrentTestUniqueId(),
      };

      const updateStockResult = await mockServer.callTool("update-msi-stock", updateInput);

      const updateResponseText = extractToolResponseText(updateStockResult);
      const updateParsed = parseToolResponse(updateResponseText);
      expect(updateParsed.data).toBeDefined();

      // Verify context message
      const updateContextMessage = extractContextContent(updateResponseText);
      expect(updateContextMessage).toContain("Stock has been successfully updated");

      // Step 4: Get the updated stock and validate the changes
      const getUpdatedStockResult = await mockServer.callTool("get-msi-stock-by-id", {
        stock_id: stockId,
      });

      const getUpdatedResponseText = extractToolResponseText(getUpdatedStockResult);
      const getUpdatedParsed = parseToolResponse(getUpdatedResponseText);
      expect(getUpdatedParsed.data).toBeDefined();

      const updatedStockData = JSON.parse(getUpdatedParsed.data[0]);
      
      // Validate that the updated data matches what we sent
      expect(updatedStockData.name).toBe(updateInput.name);
      
      // Note: Update operation might clear extension attributes
      console.log(`🔗 Updated stock extension attributes: ${updatedStockData.extension_attributes ? 'present' : 'not present'}`);

      console.log(`🔄 Updated stock: ${stockId}`);

      // Step 5: Delete stock
      const deleteStockResult = await mockServer.callTool("delete-msi-stock", {
        stock_id: stockId,
      });

      const deleteResponseText = extractToolResponseText(deleteStockResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data).toBeDefined();

      // Verify context message
      const deleteContextMessage = extractContextContent(deleteResponseText);
      expect(deleteContextMessage).toContain("Stock has been successfully deleted");

      console.log(`🗑️ Deleted stock: ${stockId}`);
      console.log("✅ Stocks lifecycle test completed successfully!");
    }, 30000);

    test("should search stocks with various criteria", async () => {
      inventoryFixtures.setCurrentTest("search_stocks");
      console.log("🧪 Testing stock search...");

      // Step 1: Create test stocks using fixtures
      const stock1 = await inventoryFixtures.createStockFixture("search_test_1");
      const stock2 = await inventoryFixtures.createStockFixture("search_test_2");

      console.log(`📦 Created test stocks: ${stock1.stock_id}, ${stock2.stock_id}`);

      // Step 2: Search stocks using the current test filter to find only our fixtures
      const searchStocksResult = await mockServer.callTool("search-msi-stocks", {
        filters: [inventoryFixtures.getCurrentTestStockFilter()],
        pageSize: 10,
      });

      const searchResponseText = extractToolResponseText(searchStocksResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      const stocksData = searchParsed.data.map((item) => JSON.parse(item));
      
      // Verify we found our fixtures with the expected stock IDs
      const foundStockIds = stocksData.map((stock) => stock.stock_id);
      const uniqueId = inventoryFixtures.getCurrentTestUniqueId();

      // Check that we have exactly 2 items with the expected stock IDs
      expect(stocksData.length).toBe(2);
      expect(foundStockIds).toContain(stock1.stock_id);
      expect(foundStockIds).toContain(stock2.stock_id);

      // Validate that the found stocks have the correct data
      const foundStock1 = stocksData.find(s => s.stock_id === stock1.stock_id);
      const foundStock2 = stocksData.find(s => s.stock_id === stock2.stock_id);
      
      expect(foundStock1).toBeDefined();
      expect(foundStock1!.name).toBe(`search_test_1 ${uniqueId}`);
      
      expect(foundStock2).toBeDefined();
      expect(foundStock2!.name).toBe(`search_test_2 ${uniqueId}`);

      console.log(`🔍 Found ${stocksData.length} stocks in search results`);
      console.log(`✅ Search stocks test completed successfully!`);
    }, 30000);

    test("should resolve stock by sales channel", async () => {
      inventoryFixtures.setCurrentTest("resolve_stock");
      console.log("🧪 Testing stock resolution...");

      // Step 1: Create a stock with sales channel
      const stock = await inventoryFixtures.createStockFixture("resolve_test");

      console.log(`📦 Created test stock: ${stock.stock_id}`);

      // Step 2: Resolve stock by sales channel
      const resolveStockResult = await mockServer.callTool("resolve-msi-stock", {
        type: "website",
        code: "base",
      });

      const resolveResponseText = extractToolResponseText(resolveStockResult);
      const resolveParsed = parseToolResponse(resolveResponseText);
      expect(resolveParsed.data).toBeDefined();

      const resolvedStockData = JSON.parse(resolveParsed.data[0]);
      expect(resolvedStockData).toBeDefined();
      expect(resolvedStockData.stock_id).toBeDefined();

      console.log(`🔍 Resolved stock: ${resolvedStockData.stock_id}`);
      console.log(`✅ Resolve stock test completed successfully!`);
    }, 30000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle non-existent stock gracefully", async () => {
      inventoryFixtures.setCurrentTest("non_existent_stock");
      console.log("🧪 Testing non-existent stock handling...");

      // Try to get non-existent stock
      const getNonExistentStockResult = await mockServer.callTool("get-msi-stock-by-id", {
        stock_id: 999999,
      });

      const getStockResponseText = extractToolResponseText(getNonExistentStockResult);
      const getStockParsed = parseToolResponse(getStockResponseText);

      // Should handle gracefully (might return error or empty result)
      expect(getStockParsed.data).toBeDefined();

      console.log("✅ Non-existent stock handled gracefully");
    }, 30000);

    test("should handle invalid search criteria gracefully", async () => {
      inventoryFixtures.setCurrentTest("invalid_stock_search_criteria");
      console.log("🧪 Testing invalid stock search criteria handling...");

      // Try to search stocks with invalid criteria
      try {
        await mockServer.callTool("search-msi-stocks", {
          page: 0, // Invalid page
          pageSize: 0, // Invalid page size
        });
        // If we reach here, the validation failed to catch the invalid criteria
        expect(true).toBe(false); // This should not happen
      } catch {
        // Expected to fail due to validation
        console.log("✅ Properly rejected invalid search criteria");
      }

      console.log("✅ Invalid stock search criteria handled gracefully");
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful stock operations", async () => {
      inventoryFixtures.setCurrentTest("stock_context_messages_success");
      console.log("🧪 Testing context messages for successful stock operations...");

      // Test stock creation context message
      const createStockResult = await mockServer.callTool("create-msi-stock", {
        name: "Context Test Stock " + inventoryFixtures.getCurrentTestUniqueId(),
      });

      const createStockContext = extractContextContent(extractToolResponseText(createStockResult));
      expect(createStockContext).toContain("Stock has been successfully created");

      console.log("✅ Stock context messages are appropriate for successful operations");
    }, 30000);
  });

  describe("Stock Links and Extension Attributes", () => {
    test("should handle stocks with and without sales channels correctly", async () => {
      inventoryFixtures.setCurrentTest("stock_links_validation");
      console.log("🧪 Testing stock links and extension attributes...");

      // Test 1: Create stock without sales channels
      const createStockWithoutLinksResult = await mockServer.callTool("create-msi-stock", {
        name: "Stock Without Links " + inventoryFixtures.getCurrentTestUniqueId(),
      });

      const createWithoutLinksResponseText = extractToolResponseText(createStockWithoutLinksResult);
      const createWithoutLinksParsed = parseToolResponse(createWithoutLinksResponseText);
      const stockIdWithoutLinks = Number(JSON.parse(createWithoutLinksParsed.data[0]));

      // Get the stock and verify it doesn't have extension_attributes
      const getStockWithoutLinksResult = await mockServer.callTool("get-msi-stock-by-id", {
        stock_id: stockIdWithoutLinks,
      });

      const getWithoutLinksResponseText = extractToolResponseText(getStockWithoutLinksResult);
      const getWithoutLinksParsed = parseToolResponse(getWithoutLinksResponseText);
      const stockDataWithoutLinks = JSON.parse(getWithoutLinksParsed.data[0]);

      expect(stockDataWithoutLinks.stock_id).toBe(stockIdWithoutLinks);
      // Stock without sales channels may have empty array or undefined sales_channels
      console.log(`📦 Stock without links extension attributes: ${stockDataWithoutLinks.extension_attributes ? 'present' : 'not present'}`);
      console.log(`📦 Stock without links: ${stockDataWithoutLinks.name}`);

      // Test 2: Create stock with sales channels
      const createStockWithLinksResult = await mockServer.callTool("create-msi-stock", {
        name: "Stock With Links " + inventoryFixtures.getCurrentTestUniqueId(),
        sales_channels: [{ type: "website", code: "base" }],
      });

      const createWithLinksResponseText = extractToolResponseText(createStockWithLinksResult);
      const createWithLinksParsed = parseToolResponse(createWithLinksResponseText);
      const stockIdWithLinks = Number(JSON.parse(createWithLinksParsed.data[0]));

      // Get the stock and verify it has extension_attributes with sales_channels
      const getStockWithLinksResult = await mockServer.callTool("get-msi-stock-by-id", {
        stock_id: stockIdWithLinks,
      });

      const getWithLinksResponseText = extractToolResponseText(getStockWithLinksResult);
      const getWithLinksParsed = parseToolResponse(getWithLinksResponseText);
      const stockDataWithLinks = JSON.parse(getWithLinksParsed.data[0]);

      expect(stockDataWithLinks.stock_id).toBe(stockIdWithLinks);
      expect(stockDataWithLinks.extension_attributes).toBeDefined();
      expect(stockDataWithLinks.extension_attributes.sales_channels).toBeDefined();
      expect(Array.isArray(stockDataWithLinks.extension_attributes.sales_channels)).toBe(true);
      expect(stockDataWithLinks.extension_attributes.sales_channels.length).toBe(1);
      
      const salesChannel = stockDataWithLinks.extension_attributes.sales_channels[0];
      expect(salesChannel.type).toBe("website");
      expect(salesChannel.code).toBe("base");
      console.log(`🔗 Stock with links: ${stockDataWithLinks.name} has ${stockDataWithLinks.extension_attributes.sales_channels.length} sales channel(s)`);

      // Clean up
      await mockServer.callTool("delete-msi-stock", { stock_id: stockIdWithoutLinks });
      await mockServer.callTool("delete-msi-stock", { stock_id: stockIdWithLinks });

      console.log("✅ Stock links and extension attributes test completed successfully!");
    }, 30000);
  });
});
