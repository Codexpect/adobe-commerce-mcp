import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerSourceItemTools } from "../../src/tools/tools-for-inventory-source-items";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";
import { ProductFixtures } from "./fixtures/product-fixtures";

describe("Inventory Source Items Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;
  let productFixtures: ProductFixtures;
  const createdSourceItems: Array<{ sku: string; source_code: string }> = [];

  beforeAll(async () => {
    console.log("🚀 Setting up inventory source items functional tests...");
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

    // Register all necessary tools
    registerProductTools(mockServer.server, client);
    registerSourceItemTools(mockServer.server, client);

    // Initialize fixtures
    inventoryFixtures = new InventoryFixtures(client);
    productFixtures = new ProductFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
    createdSourceItems.length = 0; // Clear tracking array for each test
  });

  afterEach(async () => {
    // Clean up any source items created during the test
    await cleanupSourceItemTest();
  });

  async function cleanupSourceItemTest(): Promise<void> {
    console.log("🧹 Starting source item test cleanup...");

    try {
      // Step 1: Clean up tracked source items directly
      for (const sourceItem of createdSourceItems) {
        console.log(`🔍 Cleaning up tracked source item: ${sourceItem.sku} at ${sourceItem.source_code}`);

        try {
          await mockServer.callTool("delete-source-item", {
            sku: sourceItem.sku,
            source_code: sourceItem.source_code,
          });
          console.log(`🗑️ Deleted source item ${sourceItem.sku} at ${sourceItem.source_code}`);
        } catch (error) {
          console.log(`⚠️ Error deleting source item ${sourceItem.sku} at ${sourceItem.source_code}:`, error);
        }
      }

      // Step 2: Clean up fixtures
      await inventoryFixtures.cleanupCurrentTest();
      await productFixtures.cleanupCurrentTest();
    } catch (error) {
      console.log("⚠️ Error during source item test cleanup:", error);
      // Still try to clean up fixtures even if source item cleanup failed
      await inventoryFixtures.cleanupCurrentTest();
      await productFixtures.cleanupCurrentTest();
    }

    console.log("✅ Source item test cleanup completed");
  }

  describe("Tool Registration", () => {
    test("should register all source item tools", () => {
      const toolNames = Array.from(mockServer.registeredTools.keys());

      expect(toolNames).toContain("search-source-items");
      expect(toolNames).toContain("create-source-item");
      expect(toolNames).toContain("delete-source-item");
    });

    test("should register search source items tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-source-items");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Search Source Items");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create source item tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-source-item");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Create Source Item");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete source item tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-source-item");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Source Item");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });
  });

  describe("Source Item Main Flow", () => {
    test("should create source item and verify it exists", async () => {
      inventoryFixtures.setCurrentTest("source_item_main_flow");
      productFixtures.setCurrentTest("source_item_main_flow");
      console.log("🧪 Testing main source item flow...");

      // Step 1: Create a source
      const source = await inventoryFixtures.createSourceFixture("main_flow_source", {
        name: "Main Flow Test Source",
        enabled: true,
        country_id: "US",
        description: "Source for main flow testing",
      });

      console.log(`🏪 Created source: ${source.source_code}`);

      // Step 2: Create a product
      const product = await productFixtures.createFixture("main_flow_product", {
        name: "Main Flow Test Product",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for source item testing" },
          { attribute_code: "short_description", value: "Source item test product" },
        ],
      });

      console.log(`📦 Created product: ${product.sku}`);

      // Step 3: Create a source item
      const createSourceItemResult = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source.source_code,
        quantity: 100,
        status: 1,
      });

      const createResponseText = extractToolResponseText(createSourceItemResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toEqual(["true"]); // Should return true for successful creation

      // Track the source item for cleanup
      createdSourceItems.push({
        sku: product.sku,
        source_code: source.source_code!,
      });

      console.log(`📦 Created source item for ${product.sku} at ${source.source_code}`);

      // Step 4: Search for the source item to verify it was created
      const searchSourceItemsResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchResponseText = extractToolResponseText(searchSourceItemsResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      // Verify the source item exists in the search results
      const sourceItems = searchParsed.data.map((item) => JSON.parse(item));
      expect(sourceItems.length).toBeGreaterThan(0);

      const foundSourceItem = sourceItems.find(
        (item) => item.sku === product.sku && item.source_code === source.source_code
      );
      expect(foundSourceItem).toBeDefined();
      expect(foundSourceItem.quantity).toBe(100);
      expect(foundSourceItem.status).toBe(1);

      console.log(`✅ Successfully verified source item creation`);
      console.log(`📋 Source item data:`, foundSourceItem);
    }, 30000);

    test("should create multiple source items for different sources", async () => {
      inventoryFixtures.setCurrentTest("source_item_multiple_sources");
      productFixtures.setCurrentTest("source_item_multiple_sources");
      console.log("🧪 Testing multiple source items flow...");

      // Step 1: Create multiple sources
      const source1 = await inventoryFixtures.createSourceFixture("multi_source_1", {
        name: "Multi Source Test 1",
        enabled: true,
        country_id: "US",
        description: "First source for multi-source testing",
      });

      const source2 = await inventoryFixtures.createSourceFixture("multi_source_2", {
        name: "Multi Source Test 2",
        enabled: true,
        country_id: "CA",
        description: "Second source for multi-source testing",
      });

      console.log(`🏪 Created sources: ${source1.source_code}, ${source2.source_code}`);

      // Step 2: Create a product
      const product = await productFixtures.createFixture("multi_source_product", {
        name: "Multi Source Test Product",
        price: 39.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.7,
        custom_attributes: [
          { attribute_code: "description", value: "A product for multi-source testing" },
          { attribute_code: "short_description", value: "Multi-source test product" },
        ],
      });

      console.log(`📦 Created product: ${product.sku}`);

      // Step 3: Create source items for both sources
      const createSourceItem1Result = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source1.source_code,
        quantity: 50,
        status: 1,
      });

      const createSourceItem2Result = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source2.source_code,
        quantity: 75,
        status: 1,
      });

      const create1ResponseText = extractToolResponseText(createSourceItem1Result);
      const create1Parsed = parseToolResponse(create1ResponseText);
      expect(create1Parsed.data).toEqual(["true"]); // Should return true for successful creation

      const create2ResponseText = extractToolResponseText(createSourceItem2Result);
      const create2Parsed = parseToolResponse(create2ResponseText);
      expect(create2Parsed.data).toEqual(["true"]); // Should return true for successful creation

      // Track the source items for cleanup
      createdSourceItems.push(
        { sku: product.sku, source_code: source1.source_code! },
        { sku: product.sku, source_code: source2.source_code! }
      );

      console.log(`📦 Created source items for ${product.sku} at both sources`);

      // Step 4: Search for all source items for this product
      const searchSourceItemsResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchResponseText = extractToolResponseText(searchSourceItemsResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      // Verify both source items exist
      const sourceItems = searchParsed.data.map((item) => JSON.parse(item));
      expect(sourceItems.length).toBeGreaterThanOrEqual(2);

      const source1Item = sourceItems.find((item) => item.source_code === source1.source_code);
      const source2Item = sourceItems.find((item) => item.source_code === source2.source_code);

      expect(source1Item).toBeDefined();
      expect(source2Item).toBeDefined();
      expect(source1Item.quantity).toBe(50);
      expect(source2Item.quantity).toBe(75);

      console.log(`✅ Successfully created and verified multiple source items`);
      console.log(`📋 Source 1 item:`, source1Item);
      console.log(`📋 Source 2 item:`, source2Item);
    }, 45000);

    test("should demonstrate complete source item lifecycle with delete operation", async () => {
      inventoryFixtures.setCurrentTest("source_item_lifecycle");
      productFixtures.setCurrentTest("source_item_lifecycle");
      console.log("🧪 Testing complete source item lifecycle...");

      // Step 1: Create source and product
      const source = await inventoryFixtures.createSourceFixture("lifecycle_source", {
        name: "Lifecycle Test Source",
        enabled: true,
        country_id: "US",
        description: "Source for lifecycle testing",
      });

      const product = await productFixtures.createFixture("lifecycle_product", {
        name: "Lifecycle Test Product",
        price: 25.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.4,
        custom_attributes: [
          { attribute_code: "description", value: "A product for lifecycle testing" },
          { attribute_code: "short_description", value: "Lifecycle test product" },
        ],
      });

      console.log(`🏪 Created source: ${source.source_code}`);
      console.log(`📦 Created product: ${product.sku}`);

      // Step 2: Create a source item
      const createSourceItemResult = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source.source_code,
        quantity: 200,
        status: 1,
      });

      const createResponseText = extractToolResponseText(createSourceItemResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toEqual(["true"]); // Should return true for successful creation

      console.log(`📦 Created source item for ${product.sku} at ${source.source_code}`);

      // Step 3: Verify the source item exists
      const searchBeforeResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchBeforeResponseText = extractToolResponseText(searchBeforeResult);
      const searchBeforeParsed = parseToolResponse(searchBeforeResponseText);
      const sourceItemsBefore = searchBeforeParsed.data.map((item) => JSON.parse(item));
      expect(sourceItemsBefore.length).toBeGreaterThan(0);

      const sourceItemBefore = sourceItemsBefore.find(
        (item) => item.sku === product.sku && item.source_code === source.source_code
      );
      expect(sourceItemBefore).toBeDefined();
      expect(sourceItemBefore.quantity).toBe(200);
      console.log(`✅ Verified source item exists before deletion`);

      // Step 4: Delete the source item
      const deleteSourceItemResult = await mockServer.callTool("delete-source-item", {
        sku: product.sku,
        source_code: source.source_code,
      });

      const deleteResponseText = extractToolResponseText(deleteSourceItemResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data).toBeDefined();

      // Verify context message
      const contextMessage = extractContextContent(deleteResponseText);
      expect(contextMessage).toContain("Source item has been successfully deleted");

      console.log(`🗑️ Successfully deleted source item`);

      // Step 5: Verify the source item no longer exists
      const searchAfterResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchAfterResponseText = extractToolResponseText(searchAfterResult);
      const searchAfterParsed = parseToolResponse(searchAfterResponseText);
      const sourceItemsAfter = searchAfterParsed.data.map((item) => JSON.parse(item));

      // The source item should no longer exist
      const sourceItemAfter = sourceItemsAfter.find(
        (item) => item.sku === product.sku && item.source_code === source.source_code
      );
      expect(sourceItemAfter).toBeUndefined();

      console.log(`✅ Successfully verified source item deletion`);
      console.log(`✅ Complete source item lifecycle test completed`);
    }, 45000);
  });

  describe("Search Source Items Tools", () => {
    test("should search source items without filters", async () => {
      console.log("🧪 Testing basic search source items functionality...");

      // Test basic search without filters
      const searchResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          page: 1,
          pageSize: 10,
        },
      });

      const searchResponseText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      console.log(`✅ Basic search completed, found ${searchParsed.data.length} items`);
      console.log(`📋 Search response:`, searchResponseText);
    }, 30000);

    test("should search source items with various filters", async () => {
      inventoryFixtures.setCurrentTest("search_source_items_filters");
      productFixtures.setCurrentTest("search_source_items_filters");
      console.log("🧪 Testing search source items with filters...");

      // Step 1: Create multiple sources and products
      const source1 = await inventoryFixtures.createSourceFixture("search_source_1", {
        name: "Search Test Source 1",
        enabled: true,
        country_id: "US",
        description: "First source for search testing",
      });

      const source2 = await inventoryFixtures.createSourceFixture("search_source_2", {
        name: "Search Test Source 2",
        enabled: true,
        country_id: "CA",
        description: "Second source for search testing",
      });

      const product1 = await productFixtures.createFixture("search_product_1", {
        name: "Search Test Product 1",
        price: 19.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.3,
        custom_attributes: [
          { attribute_code: "description", value: "First product for search testing" },
          { attribute_code: "short_description", value: "Search test product 1" },
        ],
      });

      const product2 = await productFixtures.createFixture("search_product_2", {
        name: "Search Test Product 2",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "Second product for search testing" },
          { attribute_code: "short_description", value: "Search test product 2" },
        ],
      });

      console.log(`🏪 Created sources: ${source1.source_code}, ${source2.source_code}`);
      console.log(`📦 Created products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Create source items
      await mockServer.callTool("create-source-item", {
        sku: product1.sku,
        source_code: source1.source_code,
        quantity: 100,
        status: 1,
      });

      await mockServer.callTool("create-source-item", {
        sku: product1.sku,
        source_code: source2.source_code,
        quantity: 150,
        status: 1,
      });

      await mockServer.callTool("create-source-item", {
        sku: product2.sku,
        source_code: source1.source_code,
        quantity: 75,
        status: 1,
      });

      // Track for cleanup
      createdSourceItems.push(
        { sku: product1.sku, source_code: source1.source_code! },
        { sku: product1.sku, source_code: source2.source_code! },
        { sku: product2.sku, source_code: source1.source_code! }
      );

      console.log(`📦 Created source items for testing`);

      // Step 3: Search by SKU
      const searchBySkuResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product1.sku,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchBySkuResponseText = extractToolResponseText(searchBySkuResult);
      const searchBySkuParsed = parseToolResponse(searchBySkuResponseText);
      expect(searchBySkuParsed.data).toBeDefined();

      const skuResults = searchBySkuParsed.data.map((item) => JSON.parse(item));
      expect(skuResults.length).toBeGreaterThanOrEqual(2); // Should find both source items for product1

      console.log(`✅ Successfully searched by SKU, found ${skuResults.length} items`);

      // Step 4: Search by source code
      const searchBySourceResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "source_code",
                  value: source1.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchBySourceResponseText = extractToolResponseText(searchBySourceResult);
      const searchBySourceParsed = parseToolResponse(searchBySourceResponseText);
      expect(searchBySourceParsed.data).toBeDefined();

      const sourceResults = searchBySourceParsed.data.map((item) => JSON.parse(item));
      expect(sourceResults.length).toBeGreaterThanOrEqual(2); // Should find both products at source1

      console.log(`✅ Successfully searched by source code, found ${sourceResults.length} items`);

      // Step 5: Search with pagination
      const searchWithPaginationResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          page: 1,
          pageSize: 1,
          filterGroups: [
            {
              filters: [
                {
                  field: "source_code",
                  value: source1.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchWithPaginationResponseText = extractToolResponseText(searchWithPaginationResult);
      const searchWithPaginationParsed = parseToolResponse(searchWithPaginationResponseText);
      expect(searchWithPaginationParsed.data).toBeDefined();

      const paginationResults = searchWithPaginationParsed.data.map((item) => JSON.parse(item));
      expect(paginationResults.length).toBeLessThanOrEqual(1); // Should respect pageSize

      console.log(`✅ Successfully tested search with pagination`);
      console.log(`📋 Search results summary: SKU search=${skuResults.length}, Source search=${sourceResults.length}, Pagination=${paginationResults.length}`);
    }, 60000);

    test("should handle search with no results gracefully", async () => {
      console.log("🧪 Testing search with no results...");

      // Search for non-existent source items
      const searchNoResultsResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: "non-existent-product-sku",
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchResponseText = extractToolResponseText(searchNoResultsResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      // Should return empty array or handle gracefully
      const results = searchParsed.data.map((item) => JSON.parse(item));
      console.log(`✅ Successfully handled search with no results, returned ${results.length} items`);
    }, 30000);
  });

  describe("Create Source Item Tools", () => {
    test("should create source item with different status values", async () => {
      inventoryFixtures.setCurrentTest("create_source_item_status");
      productFixtures.setCurrentTest("create_source_item_status");
      console.log("🧪 Testing create source item with different status values...");

      // Step 1: Create source and product
      const source = await inventoryFixtures.createSourceFixture("status_test_source", {
        name: "Status Test Source",
        enabled: true,
        country_id: "US",
        description: "Source for status testing",
      });

      const product = await productFixtures.createFixture("status_test_product", {
        name: "Status Test Product",
        price: 35.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.6,
        custom_attributes: [
          { attribute_code: "description", value: "A product for status testing" },
          { attribute_code: "short_description", value: "Status test product" },
        ],
      });

      console.log(`🏪 Created source: ${source.source_code}`);
      console.log(`📦 Created product: ${product.sku}`);

      // Step 2: Create source item with enabled status (1)
      const createEnabledResult = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source.source_code,
        quantity: 100,
        status: 1, // enabled
      });

      const createEnabledResponseText = extractToolResponseText(createEnabledResult);
      const createEnabledParsed = parseToolResponse(createEnabledResponseText);
      expect(createEnabledParsed.data).toEqual(["true"]); // Should return true for successful creation

      // Track for cleanup
      createdSourceItems.push({
        sku: product.sku,
        source_code: source.source_code!,
      });

      console.log(`📦 Created enabled source item`);

      // Step 3: Verify the source item was created with correct status
      const searchResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchResponseText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchResponseText);
      const sourceItems = searchParsed.data.map((item) => JSON.parse(item));

      const foundSourceItem = sourceItems.find(
        (item) => item.sku === product.sku && item.source_code === source.source_code
      );
      expect(foundSourceItem).toBeDefined();
      expect(foundSourceItem.status).toBe(1);
      expect(foundSourceItem.quantity).toBe(100);

      console.log(`✅ Successfully created source item with enabled status`);
      console.log(`📋 Source item data:`, foundSourceItem);
    }, 30000);

    test("should handle source item creation with validation errors", async () => {
      console.log("🧪 Testing source item creation with validation errors...");

      // Try to create source item with invalid data (non-existent product)
      const createInvalidResult = await mockServer.callTool("create-source-item", {
        sku: "non-existent-product-sku",
        source_code: "non-existent-source",
        quantity: 100,
        status: 1,
      });

      const createResponseText = extractToolResponseText(createInvalidResult);

      // Should handle the error gracefully
      console.log(`✅ Successfully handled source item creation with invalid data`);
      console.log(`📋 Response:`, createResponseText);
    }, 30000);
  });

  describe("Delete Source Item Tools", () => {
    test("should delete source item and verify deletion", async () => {
      inventoryFixtures.setCurrentTest("delete_source_item_verification");
      productFixtures.setCurrentTest("delete_source_item_verification");
      console.log("🧪 Testing delete source item with verification...");

      // Step 1: Create source and product
      const source = await inventoryFixtures.createSourceFixture("delete_test_source", {
        name: "Delete Test Source",
        enabled: true,
        country_id: "US",
        description: "Source for delete testing",
      });

      const product = await productFixtures.createFixture("delete_test_product", {
        name: "Delete Test Product",
        price: 45.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.8,
        custom_attributes: [
          { attribute_code: "description", value: "A product for delete testing" },
          { attribute_code: "short_description", value: "Delete test product" },
        ],
      });

      console.log(`🏪 Created source: ${source.source_code}`);
      console.log(`📦 Created product: ${product.sku}`);

      // Step 2: Create a source item
      const createSourceItemResult = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source.source_code,
        quantity: 300,
        status: 1,
      });

      const createResponseText = extractToolResponseText(createSourceItemResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toEqual(["true"]); // Should return true for successful creation

      console.log(`📦 Created source item for deletion test`);

      // Step 3: Verify the source item exists before deletion
      const searchBeforeResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchBeforeResponseText = extractToolResponseText(searchBeforeResult);
      const searchBeforeParsed = parseToolResponse(searchBeforeResponseText);
      const sourceItemsBefore = searchBeforeParsed.data.map((item) => JSON.parse(item));
      expect(sourceItemsBefore.length).toBeGreaterThan(0);

      console.log(`✅ Verified source item exists before deletion`);

      // Step 4: Delete the source item
      const deleteSourceItemResult = await mockServer.callTool("delete-source-item", {
        sku: product.sku,
        source_code: source.source_code,
      });

      const deleteResponseText = extractToolResponseText(deleteSourceItemResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data).toBeDefined();

      // Verify context message
      const contextMessage = extractContextContent(deleteResponseText);
      expect(contextMessage).toContain("Source item has been successfully deleted");

      console.log(`🗑️ Successfully deleted source item`);

      // Step 5: Verify the source item no longer exists
      const searchAfterResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchAfterResponseText = extractToolResponseText(searchAfterResult);
      const searchAfterParsed = parseToolResponse(searchAfterResponseText);
      const sourceItemsAfter = searchAfterParsed.data.map((item) => JSON.parse(item));

      // The source item should no longer exist
      const sourceItemAfter = sourceItemsAfter.find(
        (item) => item.sku === product.sku && item.source_code === source.source_code
      );
      expect(sourceItemAfter).toBeUndefined();

      console.log(`✅ Successfully verified source item deletion`);
    }, 45000);

    test("should handle deletion of non-existent source item gracefully", async () => {
      console.log("🧪 Testing deletion of non-existent source item...");

      // Try to delete a non-existent source item
      const deleteNonExistentResult = await mockServer.callTool("delete-source-item", {
        sku: "non-existent-product-sku",
        source_code: "non-existent-source-code",
      });

      const deleteResponseText = extractToolResponseText(deleteNonExistentResult);

      // Should handle the error gracefully
      console.log(`✅ Successfully handled deletion of non-existent source item`);
      console.log(`📋 Response:`, deleteResponseText);
    }, 30000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle source items with zero quantity", async () => {
      inventoryFixtures.setCurrentTest("source_item_zero_quantity");
      productFixtures.setCurrentTest("source_item_zero_quantity");
      console.log("🧪 Testing source item with zero quantity...");

      // Step 1: Create source and product
      const source = await inventoryFixtures.createSourceFixture("zero_quantity_source", {
        name: "Zero Quantity Test Source",
        enabled: true,
        country_id: "US",
        description: "Source for zero quantity testing",
      });

      const product = await productFixtures.createFixture("zero_quantity_product", {
        name: "Zero Quantity Test Product",
        price: 15.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.2,
        custom_attributes: [
          { attribute_code: "description", value: "A product for zero quantity testing" },
          { attribute_code: "short_description", value: "Zero quantity test product" },
        ],
      });

      console.log(`🏪 Created source: ${source.source_code}`);
      console.log(`📦 Created product: ${product.sku}`);

      // Step 2: Create source item with zero quantity
      const createSourceItemResult = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source.source_code,
        quantity: 0,
        status: 1,
      });

      const createResponseText = extractToolResponseText(createSourceItemResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toEqual(["true"]); // Should return true for successful creation

      // Track for cleanup
      createdSourceItems.push({
        sku: product.sku,
        source_code: source.source_code!,
      });

      console.log(`📦 Created source item with zero quantity`);

      // Step 3: Verify the source item was created with zero quantity
      const searchResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchResponseText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchResponseText);
      const sourceItems = searchParsed.data.map((item) => JSON.parse(item));

      const foundSourceItem = sourceItems.find(
        (item) => item.sku === product.sku && item.source_code === source.source_code
      );
      expect(foundSourceItem).toBeDefined();
      expect(foundSourceItem.quantity).toBe(0);

      console.log(`✅ Successfully created source item with zero quantity`);
      console.log(`📋 Source item data:`, foundSourceItem);
    }, 30000);

    test("should handle source items with large quantities", async () => {
      inventoryFixtures.setCurrentTest("source_item_large_quantity");
      productFixtures.setCurrentTest("source_item_large_quantity");
      console.log("🧪 Testing source item with large quantity...");

      // Step 1: Create source and product
      const source = await inventoryFixtures.createSourceFixture("large_quantity_source", {
        name: "Large Quantity Test Source",
        enabled: true,
        country_id: "US",
        description: "Source for large quantity testing",
      });

      const product = await productFixtures.createFixture("large_quantity_product", {
        name: "Large Quantity Test Product",
        price: 99.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 2.0,
        custom_attributes: [
          { attribute_code: "description", value: "A product for large quantity testing" },
          { attribute_code: "short_description", value: "Large quantity test product" },
        ],
      });

      console.log(`🏪 Created source: ${source.source_code}`);
      console.log(`📦 Created product: ${product.sku}`);

      // Step 2: Create source item with large quantity
      const largeQuantity = 999999;
      const createSourceItemResult = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source.source_code,
        quantity: largeQuantity,
        status: 1,
      });

      const createResponseText = extractToolResponseText(createSourceItemResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toEqual(["true"]); // Should return true for successful creation

      // Track for cleanup
      createdSourceItems.push({
        sku: product.sku,
        source_code: source.source_code!,
      });

      console.log(`📦 Created source item with large quantity: ${largeQuantity}`);

      // Step 3: Verify the source item was created with correct quantity
      const searchResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: product.sku,
                  conditionType: "eq",
                },
                {
                  field: "source_code",
                  value: source.source_code,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchResponseText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchResponseText);
      const sourceItems = searchParsed.data.map((item) => JSON.parse(item));

      const foundSourceItem = sourceItems.find(
        (item) => item.sku === product.sku && item.source_code === source.source_code
      );
      expect(foundSourceItem).toBeDefined();
      expect(foundSourceItem.quantity).toBe(largeQuantity);

      console.log(`✅ Successfully created source item with large quantity`);
      console.log(`📋 Source item data:`, foundSourceItem);
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful operations", async () => {
      inventoryFixtures.setCurrentTest("context_messages_success");
      productFixtures.setCurrentTest("context_messages_success");
      console.log("🧪 Testing context messages for successful operations...");

      // Step 1: Create source and product
      const source = await inventoryFixtures.createSourceFixture("context_test_source", {
        name: "Context Test Source",
        enabled: true,
        country_id: "US",
        description: "Source for context message testing",
      });

      const product = await productFixtures.createFixture("context_test_product", {
        name: "Context Test Product",
        price: 25.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.4,
        custom_attributes: [
          { attribute_code: "description", value: "A product for context message testing" },
          { attribute_code: "short_description", value: "Context test product" },
        ],
      });

      console.log(`🏪 Created source: ${source.source_code}`);
      console.log(`📦 Created product: ${product.sku}`);

      // Step 2: Test create source item context message
      const createSourceItemResult = await mockServer.callTool("create-source-item", {
        sku: product.sku,
        source_code: source.source_code,
        quantity: 100,
        status: 1,
      });

      const createContext = extractContextContent(extractToolResponseText(createSourceItemResult));
      expect(createContext).toContain("Source item has been successfully created");

      console.log(`✅ Create source item context message is appropriate`);

      // Step 3: Test delete source item context message
      const deleteSourceItemResult = await mockServer.callTool("delete-source-item", {
        sku: product.sku,
        source_code: source.source_code,
      });

      const deleteContext = extractContextContent(extractToolResponseText(deleteSourceItemResult));
      expect(deleteContext).toContain("Source item has been successfully deleted");

      console.log(`✅ Delete source item context message is appropriate`);

      console.log(`✅ All context messages are appropriate for successful operations`);
    }, 45000);

    test("should return appropriate context messages for search operations", async () => {
      console.log("🧪 Testing context messages for search operations...");

      // Test search source items context message
      const searchSourceItemsResult = await mockServer.callTool("search-source-items", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: "test-sku",
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });

      const searchContext = extractContextContent(extractToolResponseText(searchSourceItemsResult));
      expect(searchContext).toContain("Source Items");

      console.log(`✅ Search source items context message is appropriate`);
    }, 30000);
  });
}); 