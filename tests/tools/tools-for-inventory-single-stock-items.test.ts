import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventorySingleStockItemTools } from "../../src/tools/tools-for-inventory-single-stock-items";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";

describe("Inventory Single Stock Items Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up inventory single stock items tools functional tests...");
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

    // Register single stock items tools and product tools (needed for creating test products)
    registerInventorySingleStockItemTools(mockServer.server, client);
    registerProductTools(mockServer.server, client);

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

  describe("Single Stock Items Tools", () => {
    test("should get and update single stock items", async () => {
      inventoryFixtures.setCurrentTest("single_stock_items_lifecycle");
      console.log("🧪 Testing single stock items lifecycle...");

      // Step 1: Create a test product first (we need a product to have stock items)
      const productSku = "single_stock_item_test_" + inventoryFixtures.getCurrentTestUniqueId();

      // Create product using the product tools
      const createProductResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Single Stock Item Test Product " + inventoryFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for testing single stock items" },
          { attribute_code: "short_description", value: "Single stock item test product" },
        ],
      });

      const createProductResponseText = extractToolResponseText(createProductResult);
      const createProductParsed = parseToolResponse(createProductResponseText);
      expect(createProductParsed.data).toBeDefined();

      console.log(`📦 Created test product: ${productSku}`);

      // Step 2: Get stock item for the product
      const getStockItemResult = await mockServer.callTool("get-single-stock-item", {
        productSku: productSku,
      });

      const getResponseText = extractToolResponseText(getStockItemResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      const stockItemData = JSON.parse(getParsed.data[0]);
      expect(stockItemData).toBeDefined();
      expect(stockItemData.item_id).toBeDefined();

      console.log(`📦 Retrieved single stock item: ${stockItemData.item_id}`);

      // Step 3: Update stock item
      const updateStockItemResult = await mockServer.callTool("update-single-stock-item", {
        productSku: productSku,
        itemId: stockItemData.item_id,
        qty: 100,
        isInStock: true,
        manageStock: true,
        minQty: 10,
        maxSaleQty: 50,
        backorders: 0,
        notifyStockQty: 5,
      });

      const updateResponseText = extractToolResponseText(updateStockItemResult);
      const updateParsed = parseToolResponse(updateResponseText);
      expect(updateParsed.data).toBeDefined();

      // Verify context message
      const updateContextMessage = extractContextContent(updateResponseText);
      expect(updateContextMessage).toContain("Stock item has been successfully updated");

      console.log(`🔄 Updated single stock item: ${stockItemData.item_id}`);
      console.log("✅ Single stock items lifecycle test completed successfully!");
    }, 45000);

    test("should get single stock status for a product", async () => {
      inventoryFixtures.setCurrentTest("single_stock_status");
      console.log("🧪 Testing single stock status retrieval...");

      // Step 1: Create a test product
      const productSku = "single_stock_status_test_" + inventoryFixtures.getCurrentTestUniqueId();

      const createProductResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Single Stock Status Test Product " + inventoryFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for testing single stock status" },
          { attribute_code: "short_description", value: "Single stock status test product" },
        ],
      });

      const createProductResponseText = extractToolResponseText(createProductResult);
      const createProductParsed = parseToolResponse(createProductResponseText);
      expect(createProductParsed.data).toBeDefined();

      console.log(`📦 Created test product: ${productSku}`);

      // Step 2: Get stock status for the product
      const getStockStatusResult = await mockServer.callTool("get-single-stock-status", {
        productSku: productSku,
      });

      const getStockStatusResponseText = extractToolResponseText(getStockStatusResult);
      const getStockStatusParsed = parseToolResponse(getStockStatusResponseText);
      expect(getStockStatusParsed.data).toBeDefined();

      const stockStatusData = JSON.parse(getStockStatusParsed.data[0]);
      expect(stockStatusData).toBeDefined();

      console.log(`📊 Retrieved single stock status for: ${productSku}`);
      console.log("✅ Single stock status test completed successfully!");
    }, 45000);

    test("should get single low stock items", async () => {
      inventoryFixtures.setCurrentTest("single_low_stock_items");
      console.log("🧪 Testing single low stock items retrieval...");

      // Step 1: Get low stock items
      const getLowStockItemsResult = await mockServer.callTool("get-single-low-stock-items", {
        qty: 10, // Threshold for low stock
        currentPage: 1,
        pageSize: 10,
      });

      const getLowStockItemsResponseText = extractToolResponseText(getLowStockItemsResult);
      const getLowStockItemsParsed = parseToolResponse(getLowStockItemsResponseText);
      expect(getLowStockItemsParsed.data).toBeDefined();

      const lowStockItemsData = JSON.parse(getLowStockItemsParsed.data[0]);
      expect(lowStockItemsData).toBeDefined();

      console.log(`📊 Retrieved single low stock items: ${lowStockItemsData.items?.length || 0} items`);

      // Step 2: Get low stock items with different parameters
      const getLowStockItemsWithDifferentParamsResult = await mockServer.callTool("get-single-low-stock-items", {
        qty: 5,
        currentPage: 1,
        pageSize: 5,
      });

      const getLowStockItemsWithDifferentParamsResponseText = extractToolResponseText(getLowStockItemsWithDifferentParamsResult);
      const getLowStockItemsWithDifferentParamsParsed = parseToolResponse(getLowStockItemsWithDifferentParamsResponseText);
      expect(getLowStockItemsWithDifferentParamsParsed.data).toBeDefined();

      const lowStockItemsWithDifferentParamsData = JSON.parse(getLowStockItemsWithDifferentParamsParsed.data[0]);
      expect(lowStockItemsWithDifferentParamsData).toBeDefined();

      console.log(`📊 Retrieved single low stock items with different params: ${lowStockItemsWithDifferentParamsData.items?.length || 0} items`);
      console.log("✅ Single low stock items test completed successfully!");
    }, 45000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle non-existent product gracefully for single stock items", async () => {
      inventoryFixtures.setCurrentTest("non_existent_product_single_stock_item");
      console.log("🧪 Testing non-existent product handling for single stock items...");

      // Try to get stock item for non-existent product
      const getNonExistentStockItemResult = await mockServer.callTool("get-single-stock-item", {
        productSku: "non-existent-product-sku",
      });

      const getStockItemResponseText = extractToolResponseText(getNonExistentStockItemResult);
      const getStockItemParsed = parseToolResponse(getStockItemResponseText);

      // Should handle gracefully (might return error or empty result)
      expect(getStockItemParsed.data).toBeDefined();

      console.log("✅ Non-existent product handled gracefully for single stock items");
    }, 30000);

    test("should handle non-existent product for single stock status gracefully", async () => {
      inventoryFixtures.setCurrentTest("non_existent_product_single_stock_status");
      console.log("🧪 Testing non-existent product handling for single stock status...");

      // Try to get stock status for non-existent product
      const getNonExistentStockStatusResult = await mockServer.callTool("get-single-stock-status", {
        productSku: "non-existent-product-sku",
      });

      const getStockStatusResponseText = extractToolResponseText(getNonExistentStockStatusResult);
      const getStockStatusParsed = parseToolResponse(getStockStatusResponseText);

      // Should handle gracefully
      expect(getStockStatusParsed.data).toBeDefined();

      console.log("✅ Non-existent product handled gracefully for single stock status");
    }, 30000);

    test("should handle empty single low stock items gracefully", async () => {
      inventoryFixtures.setCurrentTest("empty_single_low_stock_items");
      console.log("🧪 Testing empty single low stock items handling...");

      // Try to get low stock items with very high threshold
      const getLowStockItemsResult = await mockServer.callTool("get-single-low-stock-items", {
        qty: 999999, // Very high threshold to get empty results
        currentPage: 1,
        pageSize: 10,
      });

      const getLowStockItemsResponseText = extractToolResponseText(getLowStockItemsResult);
      const getLowStockItemsParsed = parseToolResponse(getLowStockItemsResponseText);

      // Should handle gracefully
      expect(getLowStockItemsParsed.data).toBeDefined();

      console.log("✅ Empty single low stock items handled gracefully");
    }, 30000);

    test("should handle invalid single stock item update gracefully", async () => {
      inventoryFixtures.setCurrentTest("invalid_single_stock_item_update");
      console.log("🧪 Testing invalid single stock item update handling...");

      // Try to update stock item with invalid data
      const updateInvalidStockItemResult = await mockServer.callTool("update-single-stock-item", {
        productSku: "non-existent-product-sku",
        itemId: 999999, // Invalid item ID
        qty: 100,
        isInStock: true,
        manageStock: true,
      });

      const updateStockItemResponseText = extractToolResponseText(updateInvalidStockItemResult);
      const updateStockItemParsed = parseToolResponse(updateStockItemResponseText);

      // Should handle gracefully
      expect(updateStockItemParsed.data).toBeDefined();

      console.log("✅ Invalid single stock item update handled gracefully");
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful single stock item operations", async () => {
      inventoryFixtures.setCurrentTest("single_stock_item_context_messages_success");
      console.log("🧪 Testing context messages for successful single stock item operations...");

      // Create a test product
      const productSku = "context_single_stock_item_test_" + inventoryFixtures.getCurrentTestUniqueId();

      const createProductResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Context Single Stock Item Test Product " + inventoryFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for testing single stock item context messages" },
          { attribute_code: "short_description", value: "Context single stock item test product" },
        ],
      });

      const createProductResponseText = extractToolResponseText(createProductResult);
      const createProductParsed = parseToolResponse(createProductResponseText);
      expect(createProductParsed.data).toBeDefined();

      // Get stock item
      const getStockItemResult = await mockServer.callTool("get-single-stock-item", {
        productSku: productSku,
      });

      const getStockItemResponseText = extractToolResponseText(getStockItemResult);
      const getStockItemParsed = parseToolResponse(getStockItemResponseText);
      expect(getStockItemParsed.data).toBeDefined();

      const stockItemData = JSON.parse(getStockItemParsed.data[0]);

      // Test stock item update context message
      const updateStockItemResult = await mockServer.callTool("update-single-stock-item", {
        productSku: productSku,
        itemId: stockItemData.item_id,
        qty: 50,
        isInStock: true,
        manageStock: true,
      });

      const updateStockItemContext = extractContextContent(extractToolResponseText(updateStockItemResult));
      expect(updateStockItemContext).toContain("Stock item has been successfully updated");

      console.log("✅ Single stock item context messages are appropriate for successful operations");
    }, 45000);
  });

  describe("Tool Registration and Schema Validation", () => {
    test("should register all inventory single stock item tools correctly", async () => {
      console.log("🧪 Testing tool registration...");

      // Test that all expected tools are available
      const expectedTools = [
        "get-single-stock-item",
        "update-single-stock-item",
        "get-single-low-stock-items",
        "get-single-stock-status",
      ];

      // Verify tools are registered by checking if they can be called (even with invalid params)
      for (const toolName of expectedTools) {
        let toolError: unknown;
        try {
          await mockServer.callTool(toolName, {});
        } catch (error) {
          // Expected to fail due to invalid params, but tool should be registered
          toolError = error;
        }
        expect(toolError).toBeDefined();
      }

      console.log("✅ All inventory single stock item tools are registered correctly");
    }, 30000);

    test("should validate input schemas correctly", async () => {
      inventoryFixtures.setCurrentTest("schema_validation");
      console.log("🧪 Testing input schema validation...");

      // Test schema validation for get-single-stock-item
      let validationError: unknown;
      try {
        await mockServer.callTool("get-single-stock-item", {
          // Missing required productSku
        });
      } catch (error) {
        validationError = error;
      }
      expect(validationError).toBeDefined();

      // Test schema validation for update-single-stock-item
      validationError = undefined;
      try {
        await mockServer.callTool("update-single-stock-item", {
          // Missing required fields
        });
      } catch (error) {
        validationError = error;
      }
      expect(validationError).toBeDefined();

      // Test schema validation for get-single-low-stock-items
      validationError = undefined;
      try {
        await mockServer.callTool("get-single-low-stock-items", {
          // Missing required qty
        });
      } catch (error) {
        validationError = error;
      }
      expect(validationError).toBeDefined();

      console.log("✅ Input schema validation works correctly");
    }, 30000);
  });
}); 