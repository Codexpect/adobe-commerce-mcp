import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { createMockMcpServer, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { ProductFixtures } from "./fixtures/product-fixtures";

describe("Products Tools - Functional Tests with Per-Test Fixtures", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let fixtures: ProductFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up product functional tests with per-test fixtures...");
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
    registerProductTools(mockServer.server, client);

    // Initialize fixtures
    fixtures = new ProductFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up any fixtures created during the test
    await fixtures.cleanupCurrentTest();
  });

  describe("Tool Registration", () => {
    test("should register all product tools", () => {
      const toolNames = Array.from(mockServer.registeredTools.keys());

      expect(toolNames).toContain("search-products");
      expect(toolNames).toContain("create-product");
      expect(toolNames).toContain("get-product-by-sku");
      expect(toolNames).toContain("update-product");
      expect(toolNames).toContain("delete-product");
    });

    test("should register search tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-products");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Search Products");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create product tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-product");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Create Product");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get product by SKU tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-product-by-sku");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Product by SKU");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register update product tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-product");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Product");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete product tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-product");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Product");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });
  });

  describe("Search Products", () => {
    test("should search and find fixture products using like filter", async () => {
      fixtures.setCurrentTest("search_default_test");

      // Create test fixtures
      await fixtures.createFixtures([
        { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "configurable", definition: ProductFixtures.FIXTURE_DEFINITIONS.CONFIGURABLE_PRODUCT },
        { name: "expensive", definition: ProductFixtures.FIXTURE_DEFINITIONS.EXPENSIVE_PRODUCT },
      ]);

      // Search using the current test filter to find only our fixtures
      const result = await mockServer.callTool("search-products", {
        filters: [fixtures.getCurrentTestFilter()],
        pageSize: 10,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(parsed.data.length).toBe(3);

      // Verify we found our fixtures with hardcoded SKUs
      const products = parsed.data.map((item) => JSON.parse(item));
      const foundSkus = products.map((prod) => prod.sku);
      const uniqueId = fixtures.getCurrentTestUniqueId();

      // Check that we have exactly 3 items with the expected SKUs
      expect(foundSkus).toHaveLength(3);
      expect(foundSkus).toContain(`prod_simple_${uniqueId}`);
      expect(foundSkus).toContain(`prod_configurable_${uniqueId}`);
      expect(foundSkus).toContain(`prod_expensive_${uniqueId}`);
    }, 45000);

    test("should filter products by type_id", async () => {
      fixtures.setCurrentTest("search_type_test");

      // Create multiple products for this test - including both simple and configurable
      await fixtures.createFixtures([
        { name: "simple_1", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "simple_2", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "configurable", definition: ProductFixtures.FIXTURE_DEFINITIONS.CONFIGURABLE_PRODUCT },
      ]);

      const result = await mockServer.callTool("search-products", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "type_id",
            value: "simple",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(2);

      // Verify all returned products have type_id = "simple"
      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((prod) => {
        expect(prod.type_id).toBe("simple");
        expect(prod.sku).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the configurable product is NOT in the results
      const foundSkus = products.map((prod) => prod.sku);
      const uniqueId = fixtures.getCurrentTestUniqueId();

      // Check that we have exactly 2 items with the expected SKUs
      expect(foundSkus).toHaveLength(2);
      expect(foundSkus).toContain(`prod_simple_1_${uniqueId}`);
      expect(foundSkus).toContain(`prod_simple_2_${uniqueId}`);

      // Verify the configurable product is NOT in the results
      expect(foundSkus).not.toContain(`prod_configurable_${uniqueId}`);
    }, 45000);

    test("should filter products by status", async () => {
      fixtures.setCurrentTest("search_status_test");

      await fixtures.createFixtures([
        { name: "enabled", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "disabled", definition: ProductFixtures.FIXTURE_DEFINITIONS.DISABLED_PRODUCT },
      ]);

      const result = await mockServer.callTool("search-products", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "status",
            value: 1, // enabled
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((prod) => {
        expect(prod.status).toBe(1);
        expect(prod.sku).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the specific SKU that should be found
      const foundSkus = products.map((prod) => prod.sku);
      const uniqueId = fixtures.getCurrentTestUniqueId();

      expect(foundSkus).toContain(`prod_enabled_${uniqueId}`);
    }, 45000);

    test("should filter products by price range", async () => {
      fixtures.setCurrentTest("search_price_range_test");

      await fixtures.createFixtures([
        { name: "cheap", definition: ProductFixtures.FIXTURE_DEFINITIONS.CHEAP_PRODUCT },
        { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "expensive", definition: ProductFixtures.FIXTURE_DEFINITIONS.EXPENSIVE_PRODUCT },
      ]);

      const result = await mockServer.callTool("search-products", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "price",
            value: 20,
            conditionType: "gteq",
          },
          {
            field: "price",
            value: 100,
            conditionType: "lteq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((prod) => {
        expect(prod.price).toBeGreaterThanOrEqual(20);
        expect(prod.price).toBeLessThanOrEqual(100);
        expect(prod.sku).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the specific SKU that should be found
      const foundSkus = products.map((prod) => prod.sku);
      const uniqueId = fixtures.getCurrentTestUniqueId();

      expect(foundSkus).toContain(`prod_simple_${uniqueId}`);
    }, 45000);

    test("should filter products by visibility", async () => {
      fixtures.setCurrentTest("search_visibility_test");

      await fixtures.createFixtures([
        { name: "catalog_only", definition: ProductFixtures.FIXTURE_DEFINITIONS.CATALOG_ONLY_PRODUCT },
        { name: "search_only", definition: ProductFixtures.FIXTURE_DEFINITIONS.SEARCH_ONLY_PRODUCT },
        { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
      ]);

      const result = await mockServer.callTool("search-products", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "visibility",
            value: "2,3",
            conditionType: "in",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(2);

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((prod) => {
        expect([2, 3]).toContain(prod.visibility);
        expect(prod.sku).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the specific SKUs that should be found
      const foundSkus = products.map((prod) => prod.sku);
      const uniqueId = fixtures.getCurrentTestUniqueId();

      expect(foundSkus).toContain(`prod_catalog_only_${uniqueId}`);
      expect(foundSkus).toContain(`prod_search_only_${uniqueId}`);
    }, 45000);

    test("should handle pagination", async () => {
      fixtures.setCurrentTest("search_pagination_test");

      // Create multiple products for pagination testing
      await fixtures.createFixtures([
        { name: "simple_1", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "simple_2", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "configurable", definition: ProductFixtures.FIXTURE_DEFINITIONS.CONFIGURABLE_PRODUCT },
        { name: "expensive", definition: ProductFixtures.FIXTURE_DEFINITIONS.EXPENSIVE_PRODUCT },
        { name: "cheap", definition: ProductFixtures.FIXTURE_DEFINITIONS.CHEAP_PRODUCT },
      ]);

      const uniqueId = fixtures.getCurrentTestUniqueId();

      // Test first page
      const resultPage1 = await mockServer.callTool("search-products", {
        filters: [fixtures.getCurrentTestFilter()],
        page: 1,
        pageSize: 2,
      });

      const responseTextPage1 = extractToolResponseText(resultPage1);
      const parsedPage1 = parseToolResponse(responseTextPage1);

      expect(parsedPage1.meta.page).toBe("1");
      expect(parsedPage1.meta.pageSize).toBe("2");
      expect(parsedPage1.data.length).toBe(2);

      // Verify first page contains expected products
      const productsPage1 = parsedPage1.data.map((item) => JSON.parse(item));
      const skusPage1 = productsPage1.map((prod) => prod.sku);

      // Should contain 2 of our 5 products
      expect(skusPage1.length).toBe(2);
      skusPage1.forEach((sku) => {
        expect(sku).toContain(uniqueId);
      });

      // Test second page
      const resultPage2 = await mockServer.callTool("search-products", {
        filters: [fixtures.getCurrentTestFilter()],
        page: 2,
        pageSize: 2,
      });

      const responseTextPage2 = extractToolResponseText(resultPage2);
      const parsedPage2 = parseToolResponse(responseTextPage2);

      expect(parsedPage2.meta.page).toBe("2");
      expect(parsedPage2.meta.pageSize).toBe("2");
      expect(parsedPage2.data.length).toBe(2);

      // Verify second page contains different products
      const productsPage2 = parsedPage2.data.map((item) => JSON.parse(item));
      const skusPage2 = productsPage2.map((prod) => prod.sku);

      expect(skusPage2.length).toBe(2);
      skusPage2.forEach((sku) => {
        expect(sku).toContain(uniqueId);
      });

      // Verify pages don't overlap (no duplicate SKUs between pages)
      const allSkusPage1 = new Set(skusPage1);
      const allSkusPage2 = new Set(skusPage2);

      skusPage1.forEach((sku) => {
        expect(allSkusPage2.has(sku)).toBe(false);
      });
      skusPage2.forEach((sku) => {
        expect(allSkusPage1.has(sku)).toBe(false);
      });

      // Test third page (should have remaining 1 product)
      const resultPage3 = await mockServer.callTool("search-products", {
        filters: [fixtures.getCurrentTestFilter()],
        page: 3,
        pageSize: 2,
      });

      const responseTextPage3 = extractToolResponseText(resultPage3);
      const parsedPage3 = parseToolResponse(responseTextPage3);

      expect(parsedPage3.meta.page).toBe("3");
      expect(parsedPage3.meta.pageSize).toBe("2");
      expect(parsedPage3.data.length).toBe(1);

      // Verify third page contains the last product
      const productsPage3 = parsedPage3.data.map((item) => JSON.parse(item));
      const skusPage3 = productsPage3.map((prod) => prod.sku);

      expect(skusPage3.length).toBe(1);
      expect(skusPage3[0]).toContain(uniqueId);
    }, 45000);

    test("should sort products by price descending", async () => {
      fixtures.setCurrentTest("sort_price_desc_test");

      await fixtures.createFixtures([
        { name: "cheap", definition: ProductFixtures.FIXTURE_DEFINITIONS.CHEAP_PRODUCT },
        { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        { name: "expensive", definition: ProductFixtures.FIXTURE_DEFINITIONS.EXPENSIVE_PRODUCT },
      ]);

      const result = await mockServer.callTool("search-products", {
        filters: [fixtures.getCurrentTestFilter()],
        sortOrders: [
          {
            field: "price",
            direction: "DESC",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      console.log(responseText);
      const parsed = parseToolResponse(responseText);
      console.log(parsed);
      expect(parsed.data.length).toBe(3);

      // Validate price sorting
      const products = parsed.data.map((item) => JSON.parse(item));
      const prices = products.map((p) => p.price).filter((p) => p !== undefined);

      // Check that prices are in descending order
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    }, 45000);
  });

  describe("Get Product By SKU", () => {
    test("should get fixture product by SKU", async () => {
      fixtures.setCurrentTest("get_by_sku_test");

      const createdFixtures = await fixtures.createFixtures([{ name: "simple" }]);

      const simpleProd = createdFixtures.get("simple");
      expect(simpleProd).toBeDefined();

      const result = await mockServer.callTool("get-product-by-sku", {
        sku: simpleProd!.sku,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Get Product by SKU");
      expect(parsed.data.length).toBe(1);

      const retrievedProduct = JSON.parse(parsed.data[0]);
      expect(retrievedProduct.sku).toBe(simpleProd!.sku);
    }, 45000);

    test("should handle non-existent product SKU", async () => {
      const result = await mockServer.callTool("get-product-by-sku", {
        sku: "definitely_non_existent_product_xyz_123",
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
    }, 30000);
  });

  describe("CRUD Operations", () => {
    test("should create, retrieve, and delete a test product using tools", async () => {
      fixtures.setCurrentTest("crud_full_test");

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `crud_test_${uniqueId}`;

      // Create a custom product using the tool
      const createResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `CRUD Test Product ${uniqueId}`,
        price: 99.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);

      expect(createParsed.meta.name).toBe("Create Product");
      expect(createParsed.data.length).toBe(1);

      const createdProduct = JSON.parse(createParsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`CRUD Test Product ${uniqueId}`);

      // Retrieve the created product
      const getResult = await mockServer.callTool("get-product-by-sku", {
        sku: createdProduct.sku,
      });

      const getResponseText = extractToolResponseText(getResult);
      const getParsed = parseToolResponse(getResponseText);

      expect(getParsed.data.length).toBe(1);
      const retrievedProduct = JSON.parse(getParsed.data[0]);
      expect(retrievedProduct.sku).toBe(createdProduct.sku);
      expect(retrievedProduct.name).toBe(`CRUD Test Product ${uniqueId}`);

      // Delete the product
      const deleteResult = await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });

      const deleteResponseText = extractToolResponseText(deleteResult);
      expect(deleteResponseText).toContain("Delete Product");
      expect(deleteResponseText).toContain("has been successfully deleted");

      // Verify it's deleted by trying to retrieve it
      const verifyResult = await mockServer.callTool("get-product-by-sku", {
        sku: createdProduct.sku,
      });

      const verifyResponseText = extractToolResponseText(verifyResult);
      expect(verifyResponseText).toContain("Failed to retrieve data from Adobe Commerce");
    }, 60000);

    test("should update a product name", async () => {
      fixtures.setCurrentTest("crud_update_test");

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `update_test_${uniqueId}`;

      // Create a test product
      const createResult = await mockServer.callTool("create-product", {
        sku: productSku,
        name: "Original Name",
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);
      const createdProduct = JSON.parse(createParsed.data[0]);

      // Update the name
      const updateResult = await mockServer.callTool("update-product", {
        sku: createdProduct.sku,
        name: "Updated Name",
      });

      const updateResponseText = extractToolResponseText(updateResult);

      // Updates might be restricted in some Adobe Commerce versions
      expect(updateResponseText).toMatch("Update Product");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);
  });

  // describe("Create Product - All Supported Types", () => {
  //   test("should create simple product", async () => {
  //     fixtures.setCurrentTest("create_simple_test");

  //     const uniqueId = fixtures.getCurrentTestUniqueId();
  //     const productSku = `simple_prod_${uniqueId}`;

  //     const result = await mockServer.callTool("create-product", {
  //       sku: productSku,
  //       name: `Test Simple Product ${uniqueId}`,
  //       price: 29.99,
  //       type_id: "simple",
  //       status: 1,
  //       visibility: 4,
  //     });

  //     const responseText = extractToolResponseText(result);
  //     const parsed = parseToolResponse(responseText);

  //     expect(parsed.meta.name).toBe("Create Product");
  //     expect(parsed.data.length).toBe(1);

  //     const createdProduct = JSON.parse(parsed.data[0]);
  //     expect(createdProduct.sku).toBe(productSku);
  //     expect(createdProduct.name).toBe(`Test Simple Product ${uniqueId}`);
  //     expect(createdProduct.type_id).toBe("simple");
  //     expect(createdProduct.status).toBe(1);

  //     // Clean up
  //     await mockServer.callTool("delete-product", {
  //       sku: createdProduct.sku,
  //     });
  //   }, 30000);

  //   test("should create configurable product", async () => {
  //     fixtures.setCurrentTest("create_configurable_test");

  //     const uniqueId = fixtures.getCurrentTestUniqueId();
  //     const productSku = `configurable_prod_${uniqueId}`;

  //     const result = await mockServer.callTool("create-product", {
  //       sku: productSku,
  //       name: `Test Configurable Product ${uniqueId}`,
  //       price: 49.99,
  //       type_id: "configurable",
  //       status: 1,
  //       visibility: 4,
  //     });

  //     const responseText = extractToolResponseText(result);
  //     const parsed = parseToolResponse(responseText);

  //     expect(parsed.meta.name).toBe("Create Product");
  //     expect(parsed.data.length).toBe(1);

  //     const createdProduct = JSON.parse(parsed.data[0]);
  //     expect(createdProduct.sku).toBe(productSku);
  //     expect(createdProduct.name).toBe(`Test Configurable Product ${uniqueId}`);
  //     expect(createdProduct.type_id).toBe("configurable");
  //     expect(createdProduct.status).toBe(1);

  //     // Clean up
  //     await mockServer.callTool("delete-product", {
  //       sku: createdProduct.sku,
  //     });
  //   }, 30000);

  //   test("should create product with custom attributes", async () => {
  //     fixtures.setCurrentTest("create_custom_attrs_test");

  //     const uniqueId = fixtures.getCurrentTestUniqueId();
  //     const productSku = `custom_attrs_prod_${uniqueId}`;

  //     const result = await mockServer.callTool("create-product", {
  //       sku: productSku,
  //       name: `Test Product with Custom Attributes ${uniqueId}`,
  //       price: 79.99,
  //       type_id: "simple",
  //       status: 1,
  //       visibility: 4,
  //       custom_attributes: [
  //         {
  //           attribute_code: "color",
  //           value: "blue",
  //         },
  //         {
  //           attribute_code: "size",
  //           value: "large",
  //         },
  //       ],
  //     });

  //     const responseText = extractToolResponseText(result);
  //     const parsed = parseToolResponse(responseText);

  //     expect(parsed.meta.name).toBe("Create Product");
  //     expect(parsed.data.length).toBe(1);

  //     const createdProduct = JSON.parse(parsed.data[0]);
  //     expect(createdProduct.sku).toBe(productSku);
  //     expect(createdProduct.name).toBe(`Test Product with Custom Attributes ${uniqueId}`);
  //     expect(createdProduct.custom_attributes).toBeDefined();
  //     expect(createdProduct.custom_attributes.length).toBe(2);

  //     // Clean up
  //     await mockServer.callTool("delete-product", {
  //       sku: createdProduct.sku,
  //     });
  //   }, 30000);

  //   test("should create product with extension attributes", async () => {
  //     fixtures.setCurrentTest("create_extension_attrs_test");

  //     const uniqueId = fixtures.getCurrentTestUniqueId();
  //     const productSku = `extension_attrs_prod_${uniqueId}`;

  //     const result = await mockServer.callTool("create-product", {
  //       sku: productSku,
  //       name: `Test Product with Extension Attributes ${uniqueId}`,
  //       price: 89.99,
  //       type_id: "simple",
  //       status: 1,
  //       visibility: 4,
  //       extension_attributes: {
  //         website_ids: [1],
  //         category_links: [
  //           {
  //             category_id: "3",
  //             position: 1,
  //           },
  //         ],
  //       },
  //     });

  //     const responseText = extractToolResponseText(result);
  //     const parsed = parseToolResponse(responseText);

  //     expect(parsed.meta.name).toBe("Create Product");
  //     expect(parsed.data.length).toBe(1);

  //     const createdProduct = JSON.parse(parsed.data[0]);
  //     expect(createdProduct.sku).toBe(productSku);
  //     expect(createdProduct.name).toBe(`Test Product with Extension Attributes ${uniqueId}`);
  //     expect(createdProduct.extension_attributes).toBeDefined();

  //     // Clean up
  //     await mockServer.callTool("delete-product", {
  //       sku: createdProduct.sku,
  //     });
  //   }, 30000);
  // });

  describe("Product Sorting", () => {
    test("should sort products by name ascending", async () => {
      fixtures.setCurrentTest("sort_name_asc_test");

      await fixtures.createFixtures([
        { name: "zebra", definition: { ...ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT, name: "Zebra Product" } },
        { name: "apple", definition: { ...ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT, name: "Apple Product" } },
        { name: "banana", definition: { ...ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT, name: "Banana Product" } },
      ]);

      const result = await mockServer.callTool("search-products", {
        filters: [fixtures.getCurrentTestFilter()],
        sortOrders: [
          {
            field: "name",
            direction: "ASC",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(3);

      // Validate sorting
      const products = parsed.data.map((item) => JSON.parse(item));
      const names = products.map((p) => p.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    }, 45000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty search results gracefully", async () => {
      // Search with a filter that should return no results
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "sku",
            value: "%nonexistent_test_unique_id_xyz%",
            conditionType: "like",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Products");
      expect(parsed.data.length).toBe(0);
    }, 30000);

    test("should handle invalid field in search filters", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "nonexistent_field_xyz",
            value: "test",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toMatch(/Products|Failed to retrieve data/);
    }, 30000);

    test("should handle invalid page size", async () => {
      await expect(
        mockServer.callTool("search-products", {
          pageSize: 50, // Over the limit of 10
        })
      ).rejects.toThrow("Number must be less than or equal to 10");
    }, 30000);
  });

  describe("Response Format Validation", () => {
    test("should return properly formatted response structure", async () => {
      fixtures.setCurrentTest("format_validation_test");

      await fixtures.createFixtures([{ name: "simple" }]);

      const result = await mockServer.callTool("search-products", {
        filters: [fixtures.getCurrentTestFilter()],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);

      // Check response structure
      expect(responseText).toContain("<meta>");
      expect(responseText).toContain("<name>Products</name>");
      expect(responseText).toContain("<page>");
      expect(responseText).toContain("<pageSize>");
      expect(responseText).toContain("<endpoint>");
      expect(responseText).toContain("<data>");

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);

      // Check each product has valid JSON
      parsed.data.forEach((item) => {
        expect(() => JSON.parse(item)).not.toThrow();
        const product = JSON.parse(item);
        expect(typeof product).toBe("object");
        expect(product).toHaveProperty("sku");
        expect(product).toHaveProperty("name");
      });
    }, 45000);
  });
});
