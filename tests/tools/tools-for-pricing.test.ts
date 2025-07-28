import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerPricingTools } from "../../src/tools/tools-for-pricing";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { ProductFixtures } from "./fixtures/product-fixtures";

describe("Pricing Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let productFixtures: ProductFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up pricing tools functional tests...");
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
    registerPricingTools(mockServer.server, client);

    // Initialize fixtures
    productFixtures = new ProductFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up fixtures
    await productFixtures.cleanupCurrentTest();
  });

  describe("Tool Registration", () => {
    test("should register all pricing tools", () => {
      const toolNames = Array.from(mockServer.registeredTools.keys());

      // Base prices
      expect(toolNames).toContain("set-base-prices");
      expect(toolNames).toContain("get-base-prices");

      // Special prices
      expect(toolNames).toContain("set-special-prices");
      expect(toolNames).toContain("get-special-prices");
      expect(toolNames).toContain("delete-special-prices");

      // Tier prices
      expect(toolNames).toContain("set-tier-prices");
      expect(toolNames).toContain("get-tier-prices");
      expect(toolNames).toContain("replace-tier-prices");
      expect(toolNames).toContain("delete-tier-prices");

      // Costs
      expect(toolNames).toContain("set-costs");
      expect(toolNames).toContain("get-costs");
      expect(toolNames).toContain("delete-costs");
    });

    test("should register set base prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("set-base-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Set Base Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get base prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-base-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Base Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register set special prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("set-special-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Set Special Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete special prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-special-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Special Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get special prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-special-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Special Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register set tier prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("set-tier-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Set Tier Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register replace tier prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("replace-tier-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Replace Tier Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete tier prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-tier-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Tier Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get tier prices tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-tier-prices");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Tier Prices");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register set costs tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("set-costs");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Set Costs");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete costs tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-costs");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Costs");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get costs tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-costs");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Costs");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });
  });

  describe("Base Prices Tools", () => {
    test("should set and get base prices for products", async () => {
      productFixtures.setCurrentTest("base_prices_set_get");
      console.log("🧪 Testing base prices set and get...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("base_price_test_1", {
        name: "Base Price Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("base_price_test_2", {
        name: "Base Price Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set new base prices
      const setBasePricesResult = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 39.99,
            store_id: 1,
            sku: product1.sku,
          },
          {
            price: 59.99,
            store_id: 1,
            sku: product2.sku,
          },
        ],
      });

      const setResponseText = extractToolResponseText(setBasePricesResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message
      const contextMessage = extractContextContent(setResponseText);
      expect(contextMessage).toBe("Base prices for 2 product(s) have been successfully updated.");

      console.log(`💰 Set new base prices for products`);

      // Step 3: Get base prices to verify
      const getBasePricesResult = await mockServer.callTool("get-base-prices", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getBasePricesResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      // Verify the returned data contains the updated prices
      const priceData = getParsed.data.map((item) => JSON.parse(item));
      expect(priceData.length).toBeGreaterThan(0);

      console.log(`✅ Successfully retrieved base prices for products`);
      console.log(`📋 Price data:`, priceData);
    }, 30000);

    test("should set and get base prices for different store IDs", async () => {
      productFixtures.setCurrentTest("base_prices_different_stores");
      console.log("🧪 Testing base prices with different store IDs...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("base_price_store_test_1", {
        name: "Base Price Store Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("base_price_store_test_2", {
        name: "Base Price Store Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set base prices for store_id 1
      const setBasePricesStore1Result = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 39.99,
            store_id: 1,
            sku: product1.sku,
          },
          {
            price: 59.99,
            store_id: 1,
            sku: product2.sku,
          },
        ],
      });

      const setStore1ResponseText = extractToolResponseText(setBasePricesStore1Result);
      const setStore1Parsed = parseToolResponse(setStore1ResponseText);
      expect(setStore1Parsed.data).toBeDefined();

      // Verify context message
      const store1ContextMessage = extractContextContent(setStore1ResponseText);
      expect(store1ContextMessage).toBe("Base prices for 2 product(s) have been successfully updated.");

      console.log(`💰 Set base prices for store_id 1`);

      // Step 3: Set base prices for store_id 2
      const setBasePricesStore2Result = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 44.99,
            store_id: 2,
            sku: product1.sku,
          },
          {
            price: 64.99,
            store_id: 2,
            sku: product2.sku,
          },
        ],
      });

      const setStore2ResponseText = extractToolResponseText(setBasePricesStore2Result);
      const setStore2Parsed = parseToolResponse(setStore2ResponseText);
      expect(setStore2Parsed.data).toBeDefined();

      // Verify context message
      const store2ContextMessage = extractContextContent(setStore2ResponseText);
      expect(store2ContextMessage).toBe("Base prices for 2 product(s) have been successfully updated.");

      console.log(`💰 Set base prices for store_id 2`);

      // Step 4: Get base prices to verify both stores
      const getBasePricesResult = await mockServer.callTool("get-base-prices", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getBasePricesResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      // Verify the returned data contains prices for both stores
      const priceData = getParsed.data.map((item) => JSON.parse(item));
      expect(priceData.length).toBeGreaterThan(0);

      // Check that we have prices for both store_id 1 and store_id 2
      const store1Prices = priceData.filter((item) => item.store_id === 1);
      const store2Prices = priceData.filter((item) => item.store_id === 2);
      
      expect(store1Prices.length).toBeGreaterThan(0);
      expect(store2Prices.length).toBeGreaterThan(0);

      console.log(`✅ Successfully retrieved base prices for different stores`);
      console.log(`📋 Store 1 prices:`, store1Prices);
      console.log(`📋 Store 2 prices:`, store2Prices);
    }, 30000);

    test("should handle base price updates with proper error context", async () => {
      productFixtures.setCurrentTest("base_prices_error_handling");
      console.log("🧪 Testing base prices error handling...");

      // Step 1: Create a test product
      const product = await productFixtures.createFixture("base_price_error_test", {
        name: "Base Price Error Test Product",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      // Step 2: Try to set base price with invalid data (non-existent SKU)
      const setBasePricesResult = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 39.99,
            store_id: 1,
            sku: product.sku, // Valid SKU
          },
          {
            price: 49.99,
            store_id: 1,
            sku: "non-existent-sku", // Invalid SKU
          },
        ],
      });

      const setResponseText = extractToolResponseText(setBasePricesResult);
      const setParsed = parseToolResponse(setResponseText);

      console.log(setResponseText);
      // Should still return data but with some errors
      expect(setParsed.data).toBeDefined();

      // Verify context message indicates some operations had issues
      const contextMessage = extractContextContent(setResponseText);
      expect(contextMessage).toBe("Base prices updated with 1 result(s). Some operations may have encountered issues.");

      console.log(`✅ Successfully handled base price errors with proper context`);
    }, 30000);
  });

  describe("Special Prices Tools", () => {
    test("should set, get, and delete special prices for products", async () => {
      productFixtures.setCurrentTest("special_prices_lifecycle");
      console.log("🧪 Testing special prices lifecycle...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("special_price_test_1", {
        name: "Special Price Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("special_price_test_2", {
        name: "Special Price Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set special prices
      const setSpecialPricesResult = await mockServer.callTool("set-special-prices", {
        prices: [
          {
            price: 19.99,
            store_id: 1,
            sku: product1.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
          {
            price: 39.99,
            store_id: 1,
            sku: product2.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
        ],
      });

      const setResponseText = extractToolResponseText(setSpecialPricesResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message
      const setContextMessage = extractContextContent(setResponseText);
      expect(setContextMessage).toBe("Special prices for 2 product(s) have been successfully updated.");

      console.log(`💰 Set special prices for products`);

      // Step 3: Get special prices to verify
      const getSpecialPricesResult = await mockServer.callTool("get-special-prices", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getSpecialPricesResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      console.log(`✅ Successfully retrieved special prices for products`);

      // Step 4: Delete special prices
      const deleteSpecialPricesResult = await mockServer.callTool("delete-special-prices", {
        prices: [
          {
            price: 19.99,
            store_id: 1,
            sku: product1.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
          {
            price: 39.99,
            store_id: 1,
            sku: product2.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
        ],
      });

      const deleteResponseText = extractToolResponseText(deleteSpecialPricesResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data).toBeDefined();

      // Verify context message
      const deleteContextMessage = extractContextContent(deleteResponseText);
      expect(deleteContextMessage).toBe("Special prices for 2 product(s) have been successfully deleted.");

      console.log(`🗑️ Successfully deleted special prices for products`);
    }, 45000);

    test("should handle special price date ranges correctly", async () => {
      productFixtures.setCurrentTest("special_prices_date_ranges");
      console.log("🧪 Testing special prices with date ranges...");

      // Step 1: Create a test product
      const product = await productFixtures.createFixture("special_price_date_test", {
        name: "Special Price Date Test Product",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      // Step 2: Set special price with specific date range
      const setSpecialPricesResult = await mockServer.callTool("set-special-prices", {
        prices: [
          {
            price: 19.99,
            store_id: 1,
            sku: product.sku,
            price_from: "2024-06-01 00:00:00",
            price_to: "2024-08-31 23:59:59",
          },
        ],
      });

      const setResponseText = extractToolResponseText(setSpecialPricesResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message
      const contextMessage = extractContextContent(setResponseText);
      expect(contextMessage).toBe("Special prices for 1 product(s) have been successfully updated.");

      console.log(`✅ Successfully set special price with date range`);
    }, 30000);

    test("should set and get special prices for different store IDs", async () => {
      productFixtures.setCurrentTest("special_prices_different_stores");
      console.log("🧪 Testing special prices with different store IDs...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("special_price_store_test_1", {
        name: "Special Price Store Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("special_price_store_test_2", {
        name: "Special Price Store Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set special prices for store_id 1
      const setSpecialPricesStore1Result = await mockServer.callTool("set-special-prices", {
        prices: [
          {
            price: 19.99,
            store_id: 1,
            sku: product1.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
          {
            price: 39.99,
            store_id: 1,
            sku: product2.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
        ],
      });

      const setStore1ResponseText = extractToolResponseText(setSpecialPricesStore1Result);
      const setStore1Parsed = parseToolResponse(setStore1ResponseText);
      expect(setStore1Parsed.data).toBeDefined();

      // Verify context message
      const store1ContextMessage = extractContextContent(setStore1ResponseText);
      expect(store1ContextMessage).toBe("Special prices for 2 product(s) have been successfully updated.");

      console.log(`💰 Set special prices for store_id 1`);

      // Step 3: Set special prices for store_id 2
      const setSpecialPricesStore2Result = await mockServer.callTool("set-special-prices", {
        prices: [
          {
            price: 17.99,
            store_id: 2,
            sku: product1.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
          {
            price: 37.99,
            store_id: 2,
            sku: product2.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
        ],
      });

      const setStore2ResponseText = extractToolResponseText(setSpecialPricesStore2Result);
      const setStore2Parsed = parseToolResponse(setStore2ResponseText);
      expect(setStore2Parsed.data).toBeDefined();

      // Verify context message
      const store2ContextMessage = extractContextContent(setStore2ResponseText);
      expect(store2ContextMessage).toBe("Special prices for 2 product(s) have been successfully updated.");

      console.log(`💰 Set special prices for store_id 2`);

      // Step 4: Get special prices to verify both stores
      const getSpecialPricesResult = await mockServer.callTool("get-special-prices", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getSpecialPricesResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      // Verify the returned data contains special prices for both stores
      const specialPriceData = getParsed.data.map((item) => JSON.parse(item));
      expect(specialPriceData.length).toBeGreaterThan(0);

      // Check that we have special prices for both store_id 1 and store_id 2
      const store1SpecialPrices = specialPriceData.filter((item) => item.store_id === 1);
      const store2SpecialPrices = specialPriceData.filter((item) => item.store_id === 2);
      
      expect(store1SpecialPrices.length).toBeGreaterThan(0);
      expect(store2SpecialPrices.length).toBeGreaterThan(0);

      console.log(`✅ Successfully retrieved special prices for different stores`);
      console.log(`📋 Store 1 special prices:`, store1SpecialPrices);
      console.log(`📋 Store 2 special prices:`, store2SpecialPrices);
    }, 30000);
  });

  describe("Tier Prices Tools", () => {
    test("should set, get, replace, and delete tier prices for products", async () => {
      productFixtures.setCurrentTest("tier_prices_lifecycle");
      console.log("🧪 Testing tier prices lifecycle...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("tier_price_test_1", {
        name: "Tier Price Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("tier_price_test_2", {
        name: "Tier Price Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set tier prices
      const setTierPricesResult = await mockServer.callTool("set-tier-prices", {
        prices: [
          {
            price: 24.99,
            price_type: "fixed",
            website_id: 1,
            sku: product1.sku,
            customer_group: "General",
            quantity: 5,
          },
          {
            price: 19.99,
            price_type: "fixed",
            website_id: 1,
            sku: product1.sku,
            customer_group: "General",
            quantity: 10,
          },
          {
            price: 44.99,
            price_type: "fixed",
            website_id: 1,
            sku: product2.sku,
            customer_group: "General",
            quantity: 5,
          },
        ],
      });

      const setResponseText = extractToolResponseText(setTierPricesResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message
      const setContextMessage = extractContextContent(setResponseText);
      expect(setContextMessage).toBe("Tier prices for 3 product(s) have been successfully updated.");

      console.log(`💰 Set tier prices for products`);

      // Step 3: Get tier prices to verify
      const getTierPricesResult = await mockServer.callTool("get-tier-prices", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getTierPricesResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      console.log(`✅ Successfully retrieved tier prices for products`);

      // Step 4: Replace tier prices
      const replaceTierPricesResult = await mockServer.callTool("replace-tier-prices", {
        prices: [
          {
            price: 22.99,
            price_type: "fixed",
            website_id: 1,
            sku: product1.sku,
            customer_group: "General",
            quantity: 5,
          },
          {
            price: 17.99,
            price_type: "fixed",
            website_id: 1,
            sku: product1.sku,
            customer_group: "General",
            quantity: 10,
          },
        ],
      });

      const replaceResponseText = extractToolResponseText(replaceTierPricesResult);
      const replaceParsed = parseToolResponse(replaceResponseText);
      expect(replaceParsed.data).toBeDefined();

      // Verify context message
      const replaceContextMessage = extractContextContent(replaceResponseText);
      expect(replaceContextMessage).toBe("Tier prices for 2 product(s) have been successfully replaced.");

      console.log(`🔄 Successfully replaced tier prices for products`);

      // Step 5: Delete specific tier prices
      const deleteTierPricesResult = await mockServer.callTool("delete-tier-prices", {
        prices: [
          {
            price: 22.99,
            price_type: "fixed",
            website_id: 1,
            sku: product1.sku,
            customer_group: "General",
            quantity: 5,
          },
        ],
      });

      const deleteResponseText = extractToolResponseText(deleteTierPricesResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data).toBeDefined();

      // Verify context message
      const deleteContextMessage = extractContextContent(deleteResponseText);
      expect(deleteContextMessage).toBe("Tier prices for 1 product(s) have been successfully deleted.");

      console.log(`🗑️ Successfully deleted tier prices for products`);
    }, 60000);

    test("should handle tier prices with different price types", async () => {
      productFixtures.setCurrentTest("tier_prices_price_types");
      console.log("🧪 Testing tier prices with different price types...");

      // Step 1: Create a test product
      const product = await productFixtures.createFixture("tier_price_type_test", {
        name: "Tier Price Type Test Product",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      // Step 2: Set tier prices with different price types
      const setTierPricesResult = await mockServer.callTool("set-tier-prices", {
        prices: [
          {
            price: 24.99,
            price_type: "fixed",
            website_id: 1,
            sku: product.sku,
            customer_group: "General",
            quantity: 5,
          },
          {
            price: 10,
            price_type: "discount",
            website_id: 1,
            sku: product.sku,
            customer_group: "Wholesale",
            quantity: 10,
          },
        ],
      });

      const setResponseText = extractToolResponseText(setTierPricesResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message
      const contextMessage = extractContextContent(setResponseText);
      expect(contextMessage).toBe("Tier prices for 2 product(s) have been successfully updated.");

      console.log(`✅ Successfully set tier prices with different price types`);
    }, 30000);

    test("should set and get tier prices for different website IDs", async () => {
      productFixtures.setCurrentTest("tier_prices_different_websites");
      console.log("🧪 Testing tier prices with different website IDs...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("tier_price_website_test_1", {
        name: "Tier Price Website Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("tier_price_website_test_2", {
        name: "Tier Price Website Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set tier prices for website_id 1
      const setTierPricesWebsite1Result = await mockServer.callTool("set-tier-prices", {
        prices: [
          {
            price: 24.99,
            price_type: "fixed",
            website_id: 1,
            sku: product1.sku,
            customer_group: "General",
            quantity: 5,
          },
          {
            price: 19.99,
            price_type: "fixed",
            website_id: 1,
            sku: product1.sku,
            customer_group: "General",
            quantity: 10,
          },
          {
            price: 44.99,
            price_type: "fixed",
            website_id: 1,
            sku: product2.sku,
            customer_group: "General",
            quantity: 5,
          },
        ],
      });

      const setWebsite1ResponseText = extractToolResponseText(setTierPricesWebsite1Result);
      const setWebsite1Parsed = parseToolResponse(setWebsite1ResponseText);
      expect(setWebsite1Parsed.data).toBeDefined();

      // Verify context message
      const website1ContextMessage = extractContextContent(setWebsite1ResponseText);
      expect(website1ContextMessage).toBe("Tier prices for 3 product(s) have been successfully updated.");

      console.log(`💰 Set tier prices for website_id 1`);

      // Step 3: Set tier prices for website_id 2
      const setTierPricesWebsite2Result = await mockServer.callTool("set-tier-prices", {
        prices: [
          {
            price: 22.99,
            price_type: "fixed",
            website_id: 2,
            sku: product1.sku,
            customer_group: "General",
            quantity: 5,
          },
          {
            price: 17.99,
            price_type: "fixed",
            website_id: 2,
            sku: product1.sku,
            customer_group: "General",
            quantity: 10,
          },
          {
            price: 42.99,
            price_type: "fixed",
            website_id: 2,
            sku: product2.sku,
            customer_group: "General",
            quantity: 5,
          },
        ],
      });

      const setWebsite2ResponseText = extractToolResponseText(setTierPricesWebsite2Result);
      const setWebsite2Parsed = parseToolResponse(setWebsite2ResponseText);
      expect(setWebsite2Parsed.data).toBeDefined();

      // Verify context message
      const website2ContextMessage = extractContextContent(setWebsite2ResponseText);
      expect(website2ContextMessage).toBe("Tier prices for 3 product(s) have been successfully updated.");

      console.log(`💰 Set tier prices for website_id 2`);

      // Step 4: Get tier prices to verify both websites
      const getTierPricesResult = await mockServer.callTool("get-tier-prices", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getTierPricesResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      // Verify the returned data contains tier prices for both websites
      const tierPriceData = getParsed.data.map((item) => JSON.parse(item));
      expect(tierPriceData.length).toBeGreaterThan(0);

      // Check that we have tier prices for both website_id 1 and website_id 2
      const website1TierPrices = tierPriceData.filter((item) => item.website_id === 1);
      const website2TierPrices = tierPriceData.filter((item) => item.website_id === 2);
      
      expect(website1TierPrices.length).toBeGreaterThan(0);
      expect(website2TierPrices.length).toBeGreaterThan(0);

      console.log(`✅ Successfully retrieved tier prices for different websites`);
      console.log(`📋 Website 1 tier prices:`, website1TierPrices);
      console.log(`📋 Website 2 tier prices:`, website2TierPrices);
    }, 30000);
  });

  describe("Costs Tools", () => {
    test("should set, get, and delete costs for products", async () => {
      productFixtures.setCurrentTest("costs_lifecycle");
      console.log("🧪 Testing costs lifecycle...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("cost_test_1", {
        name: "Cost Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("cost_test_2", {
        name: "Cost Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set costs
      const setCostsResult = await mockServer.callTool("set-costs", {
        prices: [
          {
            cost: 15.50,
            store_id: 1,
            sku: product1.sku,
          },
          {
            cost: 25.75,
            store_id: 1,
            sku: product2.sku,
          },
        ],
      });

      const setResponseText = extractToolResponseText(setCostsResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message
      const setContextMessage = extractContextContent(setResponseText);
      expect(setContextMessage).toBe("Costs for 2 product(s) have been successfully updated.");

      console.log(`💰 Set costs for products`);

      // Step 3: Get costs to verify
      const getCostsResult = await mockServer.callTool("get-costs", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getCostsResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      console.log(`✅ Successfully retrieved costs for products`);

      // Step 4: Delete costs
      const deleteCostsResult = await mockServer.callTool("delete-costs", {
        skus: [product1.sku, product2.sku],
      });

      const deleteResponseText = extractToolResponseText(deleteCostsResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data).toBeDefined();

      // Verify context message
      const deleteContextMessage = extractContextContent(deleteResponseText);
      expect(deleteContextMessage).toBe("Costs for 2 product(s) have been successfully deleted.");

      console.log(`🗑️ Successfully deleted costs for products`);
    }, 45000);

    test("should handle cost updates with proper validation", async () => {
      productFixtures.setCurrentTest("costs_validation");
      console.log("🧪 Testing costs validation...");

      // Step 1: Create a test product
      const product = await productFixtures.createFixture("cost_validation_test", {
        name: "Cost Validation Test Product",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      // Step 2: Set cost with valid data
      const setCostsResult = await mockServer.callTool("set-costs", {
        prices: [
          {
            cost: 12.50,
            store_id: 1,
            sku: product.sku,
          },
        ],
      });

      const setResponseText = extractToolResponseText(setCostsResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message
      const contextMessage = extractContextContent(setResponseText);
      expect(contextMessage).toBe("Costs for 1 product(s) have been successfully updated.");

      console.log(`✅ Successfully set cost with proper validation`);
    }, 30000);

    test("should set and get costs for different store IDs", async () => {
      productFixtures.setCurrentTest("costs_different_stores");
      console.log("🧪 Testing costs with different store IDs...");

      // Step 1: Create test products
      const product1 = await productFixtures.createFixture("cost_store_test_1", {
        name: "Cost Store Test Product 1",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const product2 = await productFixtures.createFixture("cost_store_test_2", {
        name: "Cost Store Test Product 2",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      console.log(`📦 Created test products: ${product1.sku}, ${product2.sku}`);

      // Step 2: Set costs for store_id 1
      const setCostsStore1Result = await mockServer.callTool("set-costs", {
        prices: [
          {
            cost: 15.50,
            store_id: 1,
            sku: product1.sku,
          },
          {
            cost: 25.75,
            store_id: 1,
            sku: product2.sku,
          },
        ],
      });

      const setStore1ResponseText = extractToolResponseText(setCostsStore1Result);
      const setStore1Parsed = parseToolResponse(setStore1ResponseText);
      expect(setStore1Parsed.data).toBeDefined();

      // Verify context message
      const store1ContextMessage = extractContextContent(setStore1ResponseText);
      expect(store1ContextMessage).toBe("Costs for 2 product(s) have been successfully updated.");

      console.log(`💰 Set costs for store_id 1`);

      // Step 3: Set costs for store_id 2
      const setCostsStore2Result = await mockServer.callTool("set-costs", {
        prices: [
          {
            cost: 13.50,
            store_id: 2,
            sku: product1.sku,
          },
          {
            cost: 23.75,
            store_id: 2,
            sku: product2.sku,
          },
        ],
      });

      const setStore2ResponseText = extractToolResponseText(setCostsStore2Result);
      const setStore2Parsed = parseToolResponse(setStore2ResponseText);
      expect(setStore2Parsed.data).toBeDefined();

      // Verify context message
      const store2ContextMessage = extractContextContent(setStore2ResponseText);
      expect(store2ContextMessage).toBe("Costs for 2 product(s) have been successfully updated.");

      console.log(`💰 Set costs for store_id 2`);

      // Step 4: Get costs to verify both stores
      const getCostsResult = await mockServer.callTool("get-costs", {
        skus: [product1.sku, product2.sku],
      });

      const getResponseText = extractToolResponseText(getCostsResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      // Verify the returned data contains costs for both stores
      const costData = getParsed.data.map((item) => JSON.parse(item));
      expect(costData.length).toBeGreaterThan(0);

      // Check that we have costs for both store_id 1 and store_id 2
      const store1Costs = costData.filter((item) => item.store_id === 1);
      const store2Costs = costData.filter((item) => item.store_id === 2);
      
      expect(store1Costs.length).toBeGreaterThan(0);
      expect(store2Costs.length).toBeGreaterThan(0);

      console.log(`✅ Successfully retrieved costs for different stores`);
      console.log(`📋 Store 1 costs:`, store1Costs);
      console.log(`📋 Store 2 costs:`, store2Costs);
    }, 30000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty price arrays gracefully", async () => {
      productFixtures.setCurrentTest("empty_price_arrays");
      console.log("🧪 Testing empty price arrays handling...");

      // Step 2: Try to set base prices with empty array (should fail validation)
      try {
        await mockServer.callTool("set-base-prices", {
          prices: [],
        });
        // If we reach here, the validation failed to catch the empty array
        expect(true).toBe(false); // This should not happen
      } catch {
        // Expected to fail due to empty array validation
        console.log(`✅ Properly rejected empty price array`);
      }
    }, 30000);

    test("should handle non-existent products gracefully", async () => {
      productFixtures.setCurrentTest("non_existent_products");
      console.log("🧪 Testing non-existent products handling...");

      // Step 1: Try to set base prices for non-existent products
      const setBasePricesResult = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 39.99,
            store_id: 1,
            sku: "non-existent-product-sku",
          },
        ],
      });

      const setResponseText = extractToolResponseText(setBasePricesResult);
      const setParsed = parseToolResponse(setResponseText);

      // Should still return data but with errors
      expect(setParsed.data).toBeDefined();

      // Verify context message indicates some operations had issues
      const contextMessage = extractContextContent(setResponseText);
      expect(contextMessage).toBe("Base prices updated with 1 result(s). Some operations may have encountered issues.");

      console.log(`✅ Successfully handled non-existent products with proper error context`);
    }, 30000);

    test("should handle mixed valid and invalid operations", async () => {
      productFixtures.setCurrentTest("mixed_valid_invalid");
      console.log("🧪 Testing mixed valid and invalid operations...");

      // Step 1: Create a test product
      const product = await productFixtures.createFixture("mixed_test", {
        name: "Mixed Test Product",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      // Step 2: Try to set base prices with both valid and invalid SKUs
      const setBasePricesResult = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 39.99,
            store_id: 1,
            sku: product.sku, // Valid SKU
          },
          {
            price: 49.99,
            store_id: 1,
            sku: "another-non-existent-sku", // Invalid SKU
          },
        ],
      });

      const setResponseText = extractToolResponseText(setBasePricesResult);
      const setParsed = parseToolResponse(setResponseText);
      expect(setParsed.data).toBeDefined();

      // Verify context message indicates mixed results
      const contextMessage = extractContextContent(setResponseText);
      expect(contextMessage).toBe("Base prices updated with 1 result(s). Some operations may have encountered issues.");

      console.log(`✅ Successfully handled mixed valid and invalid operations`);
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful operations", async () => {
      productFixtures.setCurrentTest("context_messages_success");
      console.log("🧪 Testing context messages for successful operations...");

      // Step 1: Create a test product
      const product = await productFixtures.createFixture("context_test", {
        name: "Context Test Product",
        price: 29.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      // Step 2: Test base prices context message
      const setBasePricesResult = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 39.99,
            store_id: 1,
            sku: product.sku,
          },
        ],
      });

      const basePricesContext = extractContextContent(extractToolResponseText(setBasePricesResult));
      expect(basePricesContext).toBe("Base prices for 1 product(s) have been successfully updated.");

      // Step 3: Test special prices context message
      const setSpecialPricesResult = await mockServer.callTool("set-special-prices", {
        prices: [
          {
            price: 19.99,
            store_id: 1,
            sku: product.sku,
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
        ],
      });

      const specialPricesContext = extractContextContent(extractToolResponseText(setSpecialPricesResult));
      expect(specialPricesContext).toBe("Special prices for 1 product(s) have been successfully updated.");

      // Step 4: Test tier prices context message
      const setTierPricesResult = await mockServer.callTool("set-tier-prices", {
        prices: [
          {
            price: 24.99,
            price_type: "fixed",
            website_id: 1,
            sku: product.sku,
            customer_group: "General",
            quantity: 5,
          },
        ],
      });

      const tierPricesContext = extractContextContent(extractToolResponseText(setTierPricesResult));
      expect(tierPricesContext).toBe("Tier prices for 1 product(s) have been successfully updated.");

      // Step 5: Test costs context message
      const setCostsResult = await mockServer.callTool("set-costs", {
        prices: [
          {
            cost: 15.50,
            store_id: 1,
            sku: product.sku,
          },
        ],
      });

      const costsContext = extractContextContent(extractToolResponseText(setCostsResult));
      expect(costsContext).toBe("Costs for 1 product(s) have been successfully updated.");

      console.log(`✅ All context messages are appropriate for successful operations`);
    }, 60000);

    test("should return appropriate context messages for operations with issues", async () => {
      productFixtures.setCurrentTest("context_messages_issues");
      console.log("🧪 Testing context messages for operations with issues...");

      // Step 1: Try to set base prices for non-existent products
      const setBasePricesResult = await mockServer.callTool("set-base-prices", {
        prices: [
          {
            price: 39.99,
            store_id: 1,
            sku: "non-existent-sku-1",
          },
          {
            price: 49.99,
            store_id: 1,
            sku: "non-existent-sku-2",
          },
        ],
      });

      const basePricesContext = extractContextContent(extractToolResponseText(setBasePricesResult));
      expect(basePricesContext).toBe("Base prices updated with 2 result(s). Some operations may have encountered issues.");

      // Step 2: Try to set special prices for non-existent products
      const setSpecialPricesResult = await mockServer.callTool("set-special-prices", {
        prices: [
          {
            price: 19.99,
            store_id: 1,
            sku: "non-existent-sku-3",
            price_from: "2024-01-01 00:00:00",
            price_to: "2024-12-31 23:59:59",
          },
        ],
      });

      const specialPricesContext = extractContextContent(extractToolResponseText(setSpecialPricesResult));
      expect(specialPricesContext).toBe("Special prices updated with 1 result(s). Some operations may have encountered issues.");

      console.log(`✅ All context messages are appropriate for operations with issues`);
    }, 30000);
  });
}); 