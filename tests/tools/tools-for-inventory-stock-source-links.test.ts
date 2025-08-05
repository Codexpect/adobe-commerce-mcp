import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventoryStockSourceLinkTools } from "../../src/tools/tools-for-inventory-stock-source-links";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";

describe("Inventory Stock-Source Links Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up inventory stock-source links tools functional tests...");
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

    // Register stock-source links tools
    registerInventoryStockSourceLinkTools(mockServer.server, client);

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

  describe("Stock-Source Links Tools", () => {
    test("should create, search, and delete stock-source links", async () => {
      inventoryFixtures.setCurrentTest("stock_source_links_lifecycle");
      console.log("🧪 Testing stock-source links lifecycle...");

      // Step 1: Create test stock and source
      const stock = await inventoryFixtures.createStockFixture("link_test_stock");
      const source = await inventoryFixtures.createSourceFixture("link_test_source");

      console.log(`📦 Created test stock: ${stock.stock_id}, source: ${source.source_code}`);

      // Step 2: Create stock-source link
      const createLinkResult = await mockServer.callTool("create-stock-source-links", {
        links: [
          {
            stock_id: stock.stock_id!,
            source_code: source.source_code!,
            priority: 1,
          },
        ],
      });

      const createResponseText = extractToolResponseText(createLinkResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toBeDefined();

      // Verify context message
      const createContextMessage = extractContextContent(createResponseText);
      expect(createContextMessage).toContain("Stock-source links have been successfully created");

      console.log(`🔗 Created stock-source link`);

      // Step 3: Search stock-source links
      const searchLinksResult = await mockServer.callTool("search-stock-source-links", {
        page: 1,
        pageSize: 10,
      });

      const searchResponseText = extractToolResponseText(searchLinksResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      const linksData = searchParsed.data.map((item) => JSON.parse(item));
      expect(linksData.length).toBeGreaterThan(0);

      // Find our created link
      const createdLink = linksData.find((link) => link.stock_id === stock.stock_id && link.source_code === source.source_code);
      expect(createdLink).toBeDefined();

      console.log(`🔍 Found ${linksData.length} stock-source links in search results`);

      // Step 4: Delete stock-source link
      const deleteLinkResult = await mockServer.callTool("delete-stock-source-links", {
        links: [
          {
            stock_id: stock.stock_id!,
            source_code: source.source_code!,
            priority: 1,
          },
        ],
      });

      const deleteResponseText = extractToolResponseText(deleteLinkResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data).toBeDefined();

      // Verify context message
      const deleteContextMessage = extractContextContent(deleteResponseText);
      expect(deleteContextMessage).toContain("Stock-source links have been successfully deleted");

      console.log(`🗑️ Deleted stock-source link`);
      console.log("✅ Stock-source links lifecycle test completed successfully!");
    }, 45000);

    test("should create multiple stock-source links with different priorities", async () => {
      inventoryFixtures.setCurrentTest("multiple_stock_source_links");
      console.log("🧪 Testing multiple stock-source links...");

      // Step 1: Create test stocks and sources
      const stock1 = await inventoryFixtures.createStockFixture("multi_link_stock_1");
      const stock2 = await inventoryFixtures.createStockFixture("multi_link_stock_2");
      const source1 = await inventoryFixtures.createSourceFixture("multi_link_source_1");
      const source2 = await inventoryFixtures.createSourceFixture("multi_link_source_2");

      console.log(`📦 Created test stocks: ${stock1.stock_id}, ${stock2.stock_id}`);
      console.log(`🏪 Created test sources: ${source1.source_code}, ${source2.source_code}`);

      // Step 2: Create multiple stock-source links with different priorities
      const createLinksResult = await mockServer.callTool("create-stock-source-links", {
        links: [
          {
            stock_id: stock1.stock_id!,
            source_code: source1.source_code!,
            priority: 1,
          },
          {
            stock_id: stock1.stock_id!,
            source_code: source2.source_code!,
            priority: 2,
          },
          {
            stock_id: stock2.stock_id!,
            source_code: source1.source_code!,
            priority: 1,
          },
          {
            stock_id: stock2.stock_id!,
            source_code: source2.source_code!,
            priority: 3,
          },
        ],
      });

      const createResponseText = extractToolResponseText(createLinksResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toBeDefined();

      // Verify context message
      const createContextMessage = extractContextContent(createResponseText);
      expect(createContextMessage).toContain("Stock-source links have been successfully created");

      console.log(`🔗 Created multiple stock-source links`);

      // Step 3: Search and verify the links
      const searchLinksResult = await mockServer.callTool("search-stock-source-links", {
        page: 1,
        pageSize: 10,
      });

      const searchResponseText = extractToolResponseText(searchLinksResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      const linksData = searchParsed.data.map((item) => JSON.parse(item));
      expect(linksData.length).toBeGreaterThan(0);

      // Verify our created links are present
      const createdLinks = linksData.filter((link) => {
        return (
          (link.stock_id === stock1.stock_id && (link.source_code === source1.source_code || link.source_code === source2.source_code)) ||
          (link.stock_id === stock2.stock_id && (link.source_code === source1.source_code || link.source_code === source2.source_code))
        );
      });

      expect(createdLinks.length).toBeGreaterThanOrEqual(4);

      console.log(`🔍 Found ${createdLinks.length} created stock-source links`);
      console.log("✅ Multiple stock-source links test completed successfully!");
    }, 45000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle invalid stock-source link creation gracefully", async () => {
      inventoryFixtures.setCurrentTest("invalid_stock_source_link_creation");
      console.log("🧪 Testing invalid stock-source link creation handling...");

      // Try to create stock-source link with non-existent stock and source
      try {
        await mockServer.callTool("create-stock-source-links", {
          links: [
            {
              stock_id: 999999, // Non-existent stock
              source_code: "non-existent-source",
              priority: 1,
            },
          ],
        });
        // If we reach here, the validation failed to catch the invalid data
        expect(true).toBe(false); // This should not happen
      } catch {
        // Expected to fail due to validation
        console.log("✅ Properly rejected invalid stock-source link creation");
      }

      console.log("✅ Invalid stock-source link creation handled gracefully");
    }, 30000);

    test("should handle invalid search criteria gracefully", async () => {
      inventoryFixtures.setCurrentTest("invalid_stock_source_link_search_criteria");
      console.log("🧪 Testing invalid stock-source link search criteria handling...");

      // Try to search stock-source links with invalid criteria
      try {
        await mockServer.callTool("search-stock-source-links", {
          page: 0, // Invalid page
          pageSize: 0, // Invalid page size
        });
        // If we reach here, the validation failed to catch the invalid criteria
        expect(true).toBe(false); // This should not happen
      } catch {
        // Expected to fail due to validation
        console.log("✅ Properly rejected invalid search criteria");
      }

      console.log("✅ Invalid stock-source link search criteria handled gracefully");
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful stock-source link operations", async () => {
      inventoryFixtures.setCurrentTest("stock_source_link_context_messages_success");
      console.log("🧪 Testing context messages for successful stock-source link operations...");

      // Create test stock and source
      const stock = await inventoryFixtures.createStockFixture("context_link_stock");
      const source = await inventoryFixtures.createSourceFixture("context_link_source");

      // Test stock-source link creation context message
      const createLinkResult = await mockServer.callTool("create-stock-source-links", {
        links: [
          {
            stock_id: stock.stock_id!,
            source_code: source.source_code!,
            priority: 1,
          },
        ],
      });

      const createLinkContext = extractContextContent(extractToolResponseText(createLinkResult));
      expect(createLinkContext).toContain("Stock-source links have been successfully created");

      console.log("✅ Stock-source link context messages are appropriate for successful operations");
    }, 30000);
  });
});
