import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventoryStockItemTools } from "../../src/tools/tools-for-inventory-stock-items";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";

describe("Inventory Stock Items Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up inventory stock items tools functional tests...");
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

    // Register stock items tools and product tools (needed for creating test products)
    registerInventoryStockItemTools(mockServer.server, client);
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



  describe("Stock Items Tools", () => {
    test("should get and update stock items", async () => {
      inventoryFixtures.setCurrentTest("stock_items_lifecycle");
      console.log("🧪 Testing stock items lifecycle...");

      // Step 1: Create a test product first (we need a product to have stock items)
      const productSku = "stock_item_test_" + inventoryFixtures.getCurrentTestUniqueId();
      
      // Create product using the product tools
      const createProductResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Stock Item Test Product " + inventoryFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for testing stock items" },
          { attribute_code: "short_description", value: "Stock item test product" },
        ],
      });

      const createProductResponseText = extractToolResponseText(createProductResult);
      const createProductParsed = parseToolResponse(createProductResponseText);
      expect(createProductParsed.data).toBeDefined();

      console.log(`📦 Created test product: ${productSku}`);

      // Step 2: Get stock item for the product
      const getStockItemResult = await mockServer.callTool("get-stock-item", {
        productSku: productSku,
      });

      const getResponseText = extractToolResponseText(getStockItemResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      const stockItemData = JSON.parse(getParsed.data[0]);
      expect(stockItemData).toBeDefined();
      expect(stockItemData.item_id).toBeDefined();

      console.log(`📦 Retrieved stock item: ${stockItemData.item_id}`);

      // Step 3: Update stock item
      const updateStockItemResult = await mockServer.callTool("update-stock-item", {
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

      console.log(`🔄 Updated stock item: ${stockItemData.item_id}`);
      console.log("✅ Stock items lifecycle test completed successfully!");
    }, 45000);

    test("should check product salability", async () => {
      inventoryFixtures.setCurrentTest("product_salability");
      console.log("🧪 Testing product salability...");

      // Step 1: Create a test product
      const productSku = "salability_test_" + inventoryFixtures.getCurrentTestUniqueId();
      
      const createProductResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Salability Test Product " + inventoryFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for testing salability" },
          { attribute_code: "short_description", value: "Salability test product" },
        ],
      });

      const createProductResponseText = extractToolResponseText(createProductResult);
      const createProductParsed = parseToolResponse(createProductResponseText);
      expect(createProductParsed.data).toBeDefined();

      console.log(`📦 Created test product: ${productSku}`);

      // Step 2: Check if product is salable
      const isSalableResult = await mockServer.callTool("is-product-salable", {
        sku: productSku,
        stockId: 1, // Default stock
      });

      const isSalableResponseText = extractToolResponseText(isSalableResult);
      const isSalableParsed = parseToolResponse(isSalableResponseText);
      expect(isSalableParsed.data).toBeDefined();

      const salabilityData = JSON.parse(isSalableParsed.data[0]);
      expect(salabilityData).toBeDefined();
      expect(salabilityData.sku).toBe(productSku);

      console.log(`🔍 Product salability check: ${salabilityData.is_salable}`);

      // Step 3: Check if product is salable for requested quantity
      const isSalableForQtyResult = await mockServer.callTool("is-product-salable-for-requested-qty", {
        sku: productSku,
        stockId: 1,
        requestedQty: 5,
      });

      const isSalableForQtyResponseText = extractToolResponseText(isSalableForQtyResult);
      const isSalableForQtyParsed = parseToolResponse(isSalableForQtyResponseText);
      expect(isSalableForQtyParsed.data).toBeDefined();

      const salabilityForQtyData = JSON.parse(isSalableForQtyParsed.data[0]);
      expect(salabilityForQtyData).toBeDefined();
      expect(salabilityForQtyData.sku).toBe(productSku);

      console.log(`🔍 Product salability for quantity check: ${salabilityForQtyData.is_salable}`);

      // Step 4: Get product salable quantity
      const getSalableQtyResult = await mockServer.callTool("get-product-salable-quantity", {
        sku: productSku,
        stockId: 1,
      });

      const getSalableQtyResponseText = extractToolResponseText(getSalableQtyResult);
      const getSalableQtyParsed = parseToolResponse(getSalableQtyResponseText);
      expect(getSalableQtyParsed.data).toBeDefined();

      const salableQtyData = JSON.parse(getSalableQtyParsed.data[0]);
      expect(salableQtyData).toBeDefined();
      expect(salableQtyData.sku).toBe(productSku);

      console.log(`📊 Product salable quantity: ${salableQtyData.salable_quantity}`);
      console.log("✅ Product salability test completed successfully!");
    }, 45000);

    test("should check multiple products salability", async () => {
      inventoryFixtures.setCurrentTest("multiple_products_salability");
      console.log("🧪 Testing multiple products salability...");

      // Step 1: Create multiple test products
      const productSkus = [];
      for (let i = 1; i <= 3; i++) {
        const productSku = `multi_salability_test_${i}_${inventoryFixtures.getCurrentTestUniqueId()}`;
        
        const createProductResult = await mockServer.callTool("create-product", {
          sku: productSku,
          name: `Multi Salability Test Product ${i} ${inventoryFixtures.getCurrentTestUniqueId()}`,
          price: 29.99 + i,
          type_id: "simple",
          status: 1,
          visibility: 4,
          weight: 0.5,
          custom_attributes: [
            { attribute_code: "description", value: `A product ${i} for testing multiple salability` },
            { attribute_code: "short_description", value: `Multi salability test product ${i}` },
          ],
        });

        const createProductResponseText = extractToolResponseText(createProductResult);
        const createProductParsed = parseToolResponse(createProductResponseText);
        expect(createProductParsed.data).toBeDefined();

        productSkus.push(productSku);
        console.log(`📦 Created test product ${i}: ${productSku}`);
      }

      // Step 2: Check if multiple products are salable
      const areProductsSalableResult = await mockServer.callTool("are-products-salable", {
        skus: productSkus,
        stockId: 1,
      });

      const areSalableResponseText = extractToolResponseText(areProductsSalableResult);
      const areSalableParsed = parseToolResponse(areSalableResponseText);
      expect(areSalableParsed.data).toBeDefined();

      const areSalableData = areSalableParsed.data.map((item) => JSON.parse(item));
      expect(areSalableData.length).toBeGreaterThan(0);

      console.log(`🔍 Multiple products salability check: ${areSalableData.length} results`);

      // Step 3: Check if multiple products are salable for requested quantities
      const skuRequests = productSkus.map((sku, index) => ({
        sku: sku,
        qty: 5 + index,
      }));

      const areProductsSalableForQtyResult = await mockServer.callTool("are-products-salable-for-requested-qty", {
        skuRequests: skuRequests,
        stockId: 1,
      });

      const areSalableForQtyResponseText = extractToolResponseText(areProductsSalableForQtyResult);
      const areSalableForQtyParsed = parseToolResponse(areSalableForQtyResponseText);
      expect(areSalableForQtyParsed.data).toBeDefined();

      const areSalableForQtyData = areSalableForQtyParsed.data.map((item) => JSON.parse(item));
      expect(areSalableForQtyData.length).toBeGreaterThan(0);

      console.log(`🔍 Multiple products salability for quantity check: ${areSalableForQtyData.length} results`);
      console.log("✅ Multiple products salability test completed successfully!");
    }, 60000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle non-existent product gracefully", async () => {
      inventoryFixtures.setCurrentTest("non_existent_product_stock_item");
      console.log("🧪 Testing non-existent product handling for stock items...");

      // Try to get stock item for non-existent product
      const getNonExistentStockItemResult = await mockServer.callTool("get-stock-item", {
        productSku: "non-existent-product-sku",
      });

      const getStockItemResponseText = extractToolResponseText(getNonExistentStockItemResult);
      const getStockItemParsed = parseToolResponse(getStockItemResponseText);

      // Should handle gracefully (might return error or empty result)
      expect(getStockItemParsed.data).toBeDefined();

      console.log("✅ Non-existent product handled gracefully for stock items");
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful stock item operations", async () => {
      inventoryFixtures.setCurrentTest("stock_item_context_messages_success");
      console.log("🧪 Testing context messages for successful stock item operations...");

      // Create a test product
      const productSku = "context_stock_item_test_" + inventoryFixtures.getCurrentTestUniqueId();
      
      const createProductResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Context Stock Item Test Product " + inventoryFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product for testing stock item context messages" },
          { attribute_code: "short_description", value: "Context stock item test product" },
        ],
      });

      const createProductResponseText = extractToolResponseText(createProductResult);
      const createProductParsed = parseToolResponse(createProductResponseText);
      expect(createProductParsed.data).toBeDefined();

      // Get stock item
      const getStockItemResult = await mockServer.callTool("get-stock-item", {
        productSku: productSku,
      });

      const getStockItemResponseText = extractToolResponseText(getStockItemResult);
      const getStockItemParsed = parseToolResponse(getStockItemResponseText);
      expect(getStockItemParsed.data).toBeDefined();

      const stockItemData = JSON.parse(getStockItemParsed.data[0]);

      // Test stock item update context message
      const updateStockItemResult = await mockServer.callTool("update-stock-item", {
        productSku: productSku,
        itemId: stockItemData.item_id,
        qty: 50,
        isInStock: true,
        manageStock: true,
      });

      const updateStockItemContext = extractContextContent(extractToolResponseText(updateStockItemResult));
      expect(updateStockItemContext).toContain("Stock item has been successfully updated");

      console.log("✅ Stock item context messages are appropriate for successful operations");
    }, 45000);
  });
}); 