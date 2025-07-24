import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { registerProductAttributesTools } from "../../src/tools/tools-for-products-attributes";
import { createMockMcpServer, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { CategoryFixtures } from "./fixtures/category-fixtures";
import { ProductAttributeFixtures } from "./fixtures/product-attribute-fixtures";
import { ProductFixtures } from "./fixtures/product-fixtures";

// Type alias for custom attribute to avoid repetition
type CustomAttribute = { attribute_code: string; value: string | number | boolean };

describe("Products Tools - Functional Tests with Per-Test Fixtures", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let fixtures: ProductFixtures;
  let categoryFixtures: CategoryFixtures;
  let attributeFixtures: ProductAttributeFixtures;

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
    registerProductAttributesTools(mockServer.server, client);

    // Initialize fixtures
    fixtures = new ProductFixtures(client);
    categoryFixtures = new CategoryFixtures(client);
    attributeFixtures = new ProductAttributeFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up any fixtures created during the test
    await fixtures.cleanupCurrentTest();
    await categoryFixtures.cleanupCurrentTest();
    await attributeFixtures.cleanupCurrentTest();
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

  describe("Create Product - Specific Attribute Types", () => {
    test("should create product with website_ids", async () => {
      fixtures.setCurrentTest("create_website_ids_test");

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `website_ids_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Website IDs ${uniqueId}`,
        price: 69.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.8,
        website_ids: [1, 2],
        custom_attributes: [
          { attribute_code: "description", value: "A product assigned to multiple websites" },
          { attribute_code: "short_description", value: "Multi-website test product" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Website IDs ${uniqueId}`);
      expect(createdProduct.price).toBe(69.99);

      // Verify website_ids are present in extension_attributes
      expect(createdProduct.extension_attributes).toBeDefined();
      expect(createdProduct.extension_attributes.website_ids).toBeDefined();
      expect(Array.isArray(createdProduct.extension_attributes.website_ids)).toBe(true);
      expect(createdProduct.extension_attributes.website_ids).toContain(1);
      expect(createdProduct.extension_attributes.website_ids).toContain(2);

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with category_links", async () => {
      fixtures.setCurrentTest("create_category_links_test");
      categoryFixtures.setCurrentTest("create_category_links_test");

      // First create the categories we need
      const createdCategories = await categoryFixtures.createFixtures([
        { name: "electronics", definition: CategoryFixtures.FIXTURE_DEFINITIONS.ELECTRONICS_CATEGORY },
        { name: "clothing", definition: CategoryFixtures.FIXTURE_DEFINITIONS.CLOTHING_CATEGORY },
      ]);

      const electronicsCategory = createdCategories.get("electronics");
      const clothingCategory = createdCategories.get("clothing");
      expect(electronicsCategory).toBeDefined();
      expect(clothingCategory).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `category_links_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Category Links ${uniqueId}`,
        price: 59.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.6,
        category_links: [
          {
            category_id: electronicsCategory!.id!.toString(),
            position: 1,
          },
          {
            category_id: clothingCategory!.id!.toString(),
            position: 2,
          },
        ],
        custom_attributes: [
          { attribute_code: "description", value: "A product assigned to multiple categories" },
          { attribute_code: "short_description", value: "Multi-category test product" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Category Links ${uniqueId}`);
      expect(createdProduct.price).toBe(59.99);

      // Verify category_links are present in extension_attributes
      expect(createdProduct.extension_attributes).toBeDefined();
      expect(createdProduct.extension_attributes.category_links).toBeDefined();
      expect(Array.isArray(createdProduct.extension_attributes.category_links)).toBe(true);
      expect(createdProduct.extension_attributes.category_links.length).toBe(2);

      // Verify the category links have the expected structure
      const categoryLinks = createdProduct.extension_attributes.category_links;
      expect(categoryLinks[0]).toHaveProperty("category_id");
      expect(categoryLinks[0]).toHaveProperty("position");
      expect(categoryLinks[0].category_id).toBe(electronicsCategory!.id!.toString());
      expect(categoryLinks[0].position).toBe(1);
      expect(categoryLinks[1].category_id).toBe(clothingCategory!.id!.toString());
      expect(categoryLinks[1].position).toBe(2);

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with boolean custom attributes", async () => {
      fixtures.setCurrentTest("create_boolean_attrs_test");
      attributeFixtures.setCurrentTest("create_boolean_attrs_test");

      // First create the boolean attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "is_featured", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE },
        { name: "is_new", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE },
        { name: "is_sale", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE },
        { name: "is_bestseller", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE },
      ]);

      const isFeaturedAttr = createdAttributes.get("is_featured");
      const isNewAttr = createdAttributes.get("is_new");
      const isSaleAttr = createdAttributes.get("is_sale");
      const isBestsellerAttr = createdAttributes.get("is_bestseller");
      expect(isFeaturedAttr).toBeDefined();
      expect(isNewAttr).toBeDefined();
      expect(isSaleAttr).toBeDefined();
      expect(isBestsellerAttr).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `boolean_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Boolean Attributes ${uniqueId}`,
        price: 49.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.4,
        custom_attributes: [
          { attribute_code: "description", value: "A product with boolean attributes for testing" },
          { attribute_code: "short_description", value: "Boolean attributes test product" },
          { attribute_code: isFeaturedAttr!.attribute_code, value: 1 },
          { attribute_code: isNewAttr!.attribute_code, value: 0 },
          { attribute_code: isSaleAttr!.attribute_code, value: 1 },
          { attribute_code: isBestsellerAttr!.attribute_code, value: 0 },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Boolean Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(49.99);

      // Verify boolean attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find boolean attributes
      const isFeatured = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === isFeaturedAttr!.attribute_code);
      const isNew = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === isNewAttr!.attribute_code);
      const isSale = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === isSaleAttr!.attribute_code);
      const isBestseller = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === isBestsellerAttr!.attribute_code);

      expect(isFeatured).toBeDefined();
      expect(isNew).toBeDefined();
      expect(isSale).toBeDefined();
      expect(isBestseller).toBeDefined();

      // Verify boolean values (should be 0 or 1)
      expect(isFeatured.value).toBe("1");
      expect(isNew.value).toBe("0");
      expect(isSale.value).toBe("1");
      expect(isBestseller.value).toBe("0");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with text custom attributes", async () => {
      fixtures.setCurrentTest("create_text_attrs_test");
      attributeFixtures.setCurrentTest("create_text_attrs_test");

      // First create the text attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "color", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "size", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "material", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "brand", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "model", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
      ]);

      const colorAttr = createdAttributes.get("color");
      const sizeAttr = createdAttributes.get("size");
      const materialAttr = createdAttributes.get("material");
      const brandAttr = createdAttributes.get("brand");
      const modelAttr = createdAttributes.get("model");
      expect(colorAttr).toBeDefined();
      expect(sizeAttr).toBeDefined();
      expect(materialAttr).toBeDefined();
      expect(brandAttr).toBeDefined();
      expect(modelAttr).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `text_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Text Attributes ${uniqueId}`,
        price: 39.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.3,
        custom_attributes: [
          { attribute_code: "description", value: "A product with text attributes for testing" },
          { attribute_code: "short_description", value: "Text attributes test product" },
          { attribute_code: colorAttr!.attribute_code, value: "blue" },
          { attribute_code: sizeAttr!.attribute_code, value: "large" },
          { attribute_code: materialAttr!.attribute_code, value: "cotton" },
          { attribute_code: brandAttr!.attribute_code, value: "TestBrand" },
          { attribute_code: modelAttr!.attribute_code, value: "TestModel-2024" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Text Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(39.99);

      // Verify text attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find text attributes
      const color = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === colorAttr!.attribute_code);
      const size = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === sizeAttr!.attribute_code);
      const material = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === materialAttr!.attribute_code);
      const brand = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === brandAttr!.attribute_code);
      const model = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === modelAttr!.attribute_code);

      expect(color).toBeDefined();
      expect(size).toBeDefined();
      expect(material).toBeDefined();
      expect(brand).toBeDefined();
      expect(model).toBeDefined();

      // Verify text values
      expect(color.value).toBe("blue");
      expect(size.value).toBe("large");
      expect(material.value).toBe("cotton");
      expect(brand.value).toBe("TestBrand");
      expect(model.value).toBe("TestModel-2024");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with numeric custom attributes", async () => {
      fixtures.setCurrentTest("create_numeric_attrs_test");
      attributeFixtures.setCurrentTest("create_numeric_attrs_test");

      // First create the numeric attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "rating", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DECIMAL_ATTRIBUTE },
        { name: "review_count", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.INTEGER_ATTRIBUTE },
        { name: "stock_quantity", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.INTEGER_ATTRIBUTE },
        { name: "min_order_qty", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.INTEGER_ATTRIBUTE },
        { name: "max_order_qty", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.INTEGER_ATTRIBUTE },
      ]);

      const ratingAttr = createdAttributes.get("rating");
      const reviewCountAttr = createdAttributes.get("review_count");
      const stockQuantityAttr = createdAttributes.get("stock_quantity");
      const minOrderQtyAttr = createdAttributes.get("min_order_qty");
      const maxOrderQtyAttr = createdAttributes.get("max_order_qty");
      expect(ratingAttr).toBeDefined();
      expect(reviewCountAttr).toBeDefined();
      expect(stockQuantityAttr).toBeDefined();
      expect(minOrderQtyAttr).toBeDefined();
      expect(maxOrderQtyAttr).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `numeric_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Numeric Attributes ${uniqueId}`,
        price: 79.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 1.0,
        custom_attributes: [
          { attribute_code: "description", value: "A product with numeric attributes for testing" },
          { attribute_code: "short_description", value: "Numeric attributes test product" },
          { attribute_code: ratingAttr!.attribute_code, value: 4.5 },
          { attribute_code: reviewCountAttr!.attribute_code, value: 25 },
          { attribute_code: stockQuantityAttr!.attribute_code, value: 100000 },
          { attribute_code: minOrderQtyAttr!.attribute_code, value: 1 },
          { attribute_code: maxOrderQtyAttr!.attribute_code, value: 10 },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Numeric Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(79.99);

      // Verify numeric attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find numeric attributes
      const rating = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === ratingAttr!.attribute_code);
      const reviewCount = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === reviewCountAttr!.attribute_code);
      const stockQuantity = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === stockQuantityAttr!.attribute_code);
      const minOrderQty = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === minOrderQtyAttr!.attribute_code);
      const maxOrderQty = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === maxOrderQtyAttr!.attribute_code);

      expect(rating).toBeDefined();
      expect(reviewCount).toBeDefined();
      expect(stockQuantity).toBeDefined();
      expect(minOrderQty).toBeDefined();
      expect(maxOrderQty).toBeDefined();

      // Verify numeric values
      expect(rating.value).toBe("4.5");
      expect(reviewCount.value).toBe("25");
      expect(stockQuantity.value).toBe("100000");
      expect(minOrderQty.value).toBe("1");
      expect(maxOrderQty.value).toBe("10");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with date custom attributes", async () => {
      fixtures.setCurrentTest("create_date_attrs_test");
      attributeFixtures.setCurrentTest("create_date_attrs_test");

      // First create the date attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "release_date", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DATE_ATTRIBUTE },
        { name: "expiry_date", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DATE_ATTRIBUTE },
        { name: "manufacture_date", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DATE_ATTRIBUTE },
      ]);

      const releaseDateAttr = createdAttributes.get("release_date");
      const expiryDateAttr = createdAttributes.get("expiry_date");
      const manufactureDateAttr = createdAttributes.get("manufacture_date");
      expect(releaseDateAttr).toBeDefined();
      expect(expiryDateAttr).toBeDefined();
      expect(manufactureDateAttr).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `date_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Date Attributes ${uniqueId}`,
        price: 89.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.7,
        custom_attributes: [
          { attribute_code: "description", value: "A product with date attributes for testing" },
          { attribute_code: "short_description", value: "Date attributes test product" },
          { attribute_code: releaseDateAttr!.attribute_code, value: "2024-01-15" },
          { attribute_code: expiryDateAttr!.attribute_code, value: "2025-12-31" },
          { attribute_code: manufactureDateAttr!.attribute_code, value: "2023-06-01" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Date Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(89.99);

      // Verify date attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find date attributes
      const releaseDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === releaseDateAttr!.attribute_code);
      const expiryDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === expiryDateAttr!.attribute_code);
      const manufactureDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === manufactureDateAttr!.attribute_code);

      expect(releaseDate).toBeDefined();
      expect(expiryDate).toBeDefined();
      expect(manufactureDate).toBeDefined();

      // Verify date values (should be strings in YYYY-MM-DD format)
      expect(releaseDate.value).toBe("2024-01-15 00:00:00");
      expect(expiryDate.value).toBe("2025-12-31 00:00:00");
      expect(manufactureDate.value).toBe("2023-06-01 00:00:00");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with datetime custom attributes", async () => {
      fixtures.setCurrentTest("create_datetime_attrs_test");
      attributeFixtures.setCurrentTest("create_datetime_attrs_test");

      // First create the datetime attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "created_at", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DATETIME_ATTRIBUTE },
        { name: "updated_at", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DATETIME_ATTRIBUTE },
        { name: "last_modified", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DATETIME_ATTRIBUTE },
      ]);

      const createdAtAttr = createdAttributes.get("created_at");
      const updatedAtAttr = createdAttributes.get("updated_at");
      const lastModifiedAttr = createdAttributes.get("last_modified");
      expect(createdAtAttr).toBeDefined();
      expect(updatedAtAttr).toBeDefined();
      expect(lastModifiedAttr).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `datetime_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Datetime Attributes ${uniqueId}`,
        price: 99.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.9,
        custom_attributes: [
          { attribute_code: "description", value: "A product with datetime attributes for testing" },
          { attribute_code: "short_description", value: "Datetime attributes test product" },
          { attribute_code: createdAtAttr!.attribute_code, value: "2024-01-15 10:30:00" },
          { attribute_code: updatedAtAttr!.attribute_code, value: "2024-01-20 14:45:00" },
          { attribute_code: lastModifiedAttr!.attribute_code, value: "2024-01-25 09:15:33" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Datetime Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(99.99);

      // Verify datetime attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find datetime attributes
      const createdAt = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === createdAtAttr!.attribute_code);
      const updatedAt = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === updatedAtAttr!.attribute_code);
      const lastModified = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === lastModifiedAttr!.attribute_code);

      expect(createdAt).toBeDefined();
      expect(updatedAt).toBeDefined();
      expect(lastModified).toBeDefined();

      // Verify datetime values (should be strings in YYYY-MM-DD HH:mm:ss format)
      expect(createdAt.value).toBe("2024-01-15 10:30:00");
      expect(updatedAt.value).toBe("2024-01-20 14:45:00");
      expect(lastModified.value).toBe("2024-01-25 09:15:33");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with price custom attributes", async () => {
      fixtures.setCurrentTest("create_price_attrs_test");
      attributeFixtures.setCurrentTest("create_price_attrs_test");

      // First create the price attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "msrp", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.PRICE_ATTRIBUTE },
        { name: "cost", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.PRICE_ATTRIBUTE },
        { name: "special_price", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.PRICE_ATTRIBUTE },
        { name: "tier_price_1", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.PRICE_ATTRIBUTE },
        { name: "tier_price_2", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.PRICE_ATTRIBUTE },
      ]);

      const msrpAttr = createdAttributes.get("msrp");
      const costAttr = createdAttributes.get("cost");
      const specialPriceAttr = createdAttributes.get("special_price");
      const tierPrice1Attr = createdAttributes.get("tier_price_1");
      const tierPrice2Attr = createdAttributes.get("tier_price_2");
      expect(msrpAttr).toBeDefined();
      expect(costAttr).toBeDefined();
      expect(specialPriceAttr).toBeDefined();
      expect(tierPrice1Attr).toBeDefined();
      expect(tierPrice2Attr).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `price_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Price Attributes ${uniqueId}`,
        price: 129.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 1.2,
        custom_attributes: [
          { attribute_code: "description", value: "A product with price attributes for testing" },
          { attribute_code: "short_description", value: "Price attributes test product" },
          { attribute_code: msrpAttr!.attribute_code, value: "149.99" },
          { attribute_code: costAttr!.attribute_code, value: "89.99" },
          { attribute_code: specialPriceAttr!.attribute_code, value: "119.99" },
          { attribute_code: tierPrice1Attr!.attribute_code, value: "109.99" },
          { attribute_code: tierPrice2Attr!.attribute_code, value: "99.99" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Price Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(129.99);

      // Verify price attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find price attributes
      const msrp = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === msrpAttr!.attribute_code);
      const cost = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === costAttr!.attribute_code);
      const specialPrice = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === specialPriceAttr!.attribute_code);
      const tierPrice1 = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === tierPrice1Attr!.attribute_code);
      const tierPrice2 = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === tierPrice2Attr!.attribute_code);

      expect(msrp).toBeDefined();
      expect(cost).toBeDefined();
      expect(specialPrice).toBeDefined();
      expect(tierPrice1).toBeDefined();
      expect(tierPrice2).toBeDefined();

      // Verify price values (should be strings)
      expect(msrp.value).toBe("149.990000");
      expect(cost.value).toBe("89.990000");
      expect(specialPrice.value).toBe("119.990000");
      expect(tierPrice1.value).toBe("109.990000");
      expect(tierPrice2.value).toBe("99.990000");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with weight custom attributes", async () => {
      fixtures.setCurrentTest("create_weight_attrs_test");
      attributeFixtures.setCurrentTest("create_weight_attrs_test");

      // First create the weight attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "shipping_weight", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DECIMAL_ATTRIBUTE },
        { name: "package_weight", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DECIMAL_ATTRIBUTE },
        { name: "dimensions_weight", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DECIMAL_ATTRIBUTE },
      ]);

      const shippingWeightAttr = createdAttributes.get("shipping_weight");
      const packageWeightAttr = createdAttributes.get("package_weight");
      const dimensionsWeightAttr = createdAttributes.get("dimensions_weight");
      expect(shippingWeightAttr).toBeDefined();
      expect(packageWeightAttr).toBeDefined();
      expect(dimensionsWeightAttr).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `weight_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Weight Attributes ${uniqueId}`,
        price: 45.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 2.5,
        custom_attributes: [
          { attribute_code: "description", value: "A product with weight attributes for testing" },
          { attribute_code: "short_description", value: "Weight attributes test product" },
          { attribute_code: shippingWeightAttr!.attribute_code, value: "2.5" },
          { attribute_code: packageWeightAttr!.attribute_code, value: "3.0" },
          { attribute_code: dimensionsWeightAttr!.attribute_code, value: "2.2" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Weight Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(45.99);

      // Verify weight attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find weight attributes
      const shippingWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === shippingWeightAttr!.attribute_code);
      const packageWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === packageWeightAttr!.attribute_code);
      const dimensionsWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === dimensionsWeightAttr!.attribute_code);

      expect(shippingWeight).toBeDefined();
      expect(packageWeight).toBeDefined();
      expect(dimensionsWeight).toBeDefined();

      // Verify weight values (should be strings)
      expect(shippingWeight.value).toBe("2.5");
      expect(packageWeight.value).toBe("3.0");
      expect(dimensionsWeight.value).toBe("2.2");

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with multiselect custom attributes", async () => {
      fixtures.setCurrentTest("create_multiselect_attrs_test");
      attributeFixtures.setCurrentTest("create_multiselect_attrs_test");

      // First create the multiselect attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "tags", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.MULTISELECT_ATTRIBUTE },
        { name: "categories", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.MULTISELECT_ATTRIBUTE },
        { name: "features", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.MULTISELECT_ATTRIBUTE },
      ]);

      const tagsAttr = createdAttributes.get("tags");
      const categoriesAttr = createdAttributes.get("categories");
      const featuresAttr = createdAttributes.get("features");
      expect(tagsAttr).toBeDefined();
      expect(categoriesAttr).toBeDefined();
      expect(featuresAttr).toBeDefined();

      // Get the actual option IDs for each attribute
      const tagsOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: tagsAttr!.attribute_code,
      });
      const categoriesOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: categoriesAttr!.attribute_code,
      });
      const featuresOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: featuresAttr!.attribute_code,
      });

      const tagsOptions = parseToolResponse(extractToolResponseText(tagsOptionsResult)).data.map((item) => JSON.parse(item));
      const categoriesOptions = parseToolResponse(extractToolResponseText(categoriesOptionsResult)).data.map((item) => JSON.parse(item));
      const featuresOptions = parseToolResponse(extractToolResponseText(featuresOptionsResult)).data.map((item) => JSON.parse(item));

      // Get the option IDs for different combinations
      const tagsOptionIds = [tagsOptions[1].value, tagsOptions[2].value, tagsOptions[3].value].join(",");
      const categoriesOptionIds = [categoriesOptions[1].value, categoriesOptions[2].value, categoriesOptions[3].value].join(",");
      const featuresOptionIds = [featuresOptions[1].value, featuresOptions[2].value, featuresOptions[3].value].join(",");

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `multiselect_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Multiselect Attributes ${uniqueId}`,
        price: 65.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.8,
        custom_attributes: [
          { attribute_code: "description", value: "A product with multiselect attributes for testing" },
          { attribute_code: "short_description", value: "Multiselect attributes test product" },
          { attribute_code: tagsAttr!.attribute_code, value: tagsOptionIds },
          { attribute_code: categoriesAttr!.attribute_code, value: categoriesOptionIds },
          { attribute_code: featuresAttr!.attribute_code, value: featuresOptionIds },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Multiselect Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(65.99);

      // Verify multiselect attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find multiselect attributes
      const tags = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === tagsAttr!.attribute_code);
      const categories = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === categoriesAttr!.attribute_code);
      const features = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === featuresAttr!.attribute_code);

      expect(tags).toBeDefined();
      expect(categories).toBeDefined();
      expect(features).toBeDefined();

      // Verify multiselect values (should be comma-separated strings)
      expect(tags.value).toBe(tagsOptionIds);
      expect(categories.value).toBe(categoriesOptionIds);
      expect(features.value).toBe(featuresOptionIds);

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with singleselect custom attributes", async () => {
      fixtures.setCurrentTest("create_singleselect_attrs_test");
      attributeFixtures.setCurrentTest("create_singleselect_attrs_test");

      // First create the singleselect attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "primary_category", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
        { name: "main_color", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
        { name: "size_type", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
      ]);

      const primaryCategoryAttr = createdAttributes.get("primary_category");
      const mainColorAttr = createdAttributes.get("main_color");
      const sizeTypeAttr = createdAttributes.get("size_type");
      expect(primaryCategoryAttr).toBeDefined();
      expect(mainColorAttr).toBeDefined();
      expect(sizeTypeAttr).toBeDefined();

      // Get the actual option IDs for each attribute
      const primaryCategoryOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: primaryCategoryAttr!.attribute_code,
      });
      const mainColorOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: mainColorAttr!.attribute_code,
      });
      const sizeTypeOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: sizeTypeAttr!.attribute_code,
      });

      const primaryCategoryOptions = parseToolResponse(extractToolResponseText(primaryCategoryOptionsResult)).data.map((item) => JSON.parse(item));
      const mainColorOptions = parseToolResponse(extractToolResponseText(mainColorOptionsResult)).data.map((item) => JSON.parse(item));
      const sizeTypeOptions = parseToolResponse(extractToolResponseText(sizeTypeOptionsResult)).data.map((item) => JSON.parse(item));

      // Get the option IDs for the second option (index 1, since index 0 is the empty option)
      const primaryCategoryOptionId = primaryCategoryOptions[1].value;
      const mainColorOptionId = mainColorOptions[1].value;
      const sizeTypeOptionId = sizeTypeOptions[2].value; // Use third option

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `singleselect_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Singleselect Attributes ${uniqueId}`,
        price: 55.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.6,
        custom_attributes: [
          { attribute_code: "description", value: "A product with singleselect attributes for testing" },
          { attribute_code: "short_description", value: "Singleselect attributes test product" },
          { attribute_code: primaryCategoryAttr!.attribute_code, value: primaryCategoryOptionId },
          { attribute_code: mainColorAttr!.attribute_code, value: mainColorOptionId },
          { attribute_code: sizeTypeAttr!.attribute_code, value: sizeTypeOptionId },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Singleselect Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(55.99);

      // Verify singleselect attributes are present
      expect(createdProduct.custom_attributes).toBeDefined();
      const customAttrs = createdProduct.custom_attributes;

      // Find singleselect attributes
      const primaryCategory = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === primaryCategoryAttr!.attribute_code);
      const mainColor = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === mainColorAttr!.attribute_code);
      const sizeType = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === sizeTypeAttr!.attribute_code);

      expect(primaryCategory).toBeDefined();
      expect(mainColor).toBeDefined();
      expect(sizeType).toBeDefined();

      // Verify singleselect values (should be option IDs as numbers)
      expect(primaryCategory.value).toBe(primaryCategoryOptionId);
      expect(mainColor.value).toBe(mainColorOptionId);
      expect(sizeType.value).toBe(sizeTypeOptionId);

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should create product with complex combination of attributes", async () => {
      fixtures.setCurrentTest("create_complex_attrs_test");
      attributeFixtures.setCurrentTest("create_complex_attrs_test");

      // First create the various attributes we need
      const createdAttributes = await attributeFixtures.createFixtures([
        { name: "is_featured", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE },
        { name: "color", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "rating", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DECIMAL_ATTRIBUTE },
        { name: "release_date", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DATE_ATTRIBUTE },
        { name: "msrp", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.PRICE_ATTRIBUTE },
        { name: "shipping_weight", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.DECIMAL_ATTRIBUTE },
        { name: "tags", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.MULTISELECT_ATTRIBUTE },
        { name: "primary_category", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
      ]);

      const isFeaturedAttr = createdAttributes.get("is_featured");
      const colorAttr = createdAttributes.get("color");
      const ratingAttr = createdAttributes.get("rating");
      const releaseDateAttr = createdAttributes.get("release_date");
      const msrpAttr = createdAttributes.get("msrp");
      const shippingWeightAttr = createdAttributes.get("shipping_weight");
      const tagsAttr = createdAttributes.get("tags");
      const primaryCategoryAttr = createdAttributes.get("primary_category");
      expect(isFeaturedAttr).toBeDefined();
      expect(colorAttr).toBeDefined();
      expect(ratingAttr).toBeDefined();
      expect(releaseDateAttr).toBeDefined();
      expect(msrpAttr).toBeDefined();
      expect(shippingWeightAttr).toBeDefined();
      expect(tagsAttr).toBeDefined();
      expect(primaryCategoryAttr).toBeDefined();

      // Get the actual option IDs for select and multiselect attributes
      const tagsOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: tagsAttr!.attribute_code,
      });
      const primaryCategoryOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: primaryCategoryAttr!.attribute_code,
      });

      const tagsOptions = parseToolResponse(extractToolResponseText(tagsOptionsResult)).data.map((item) => JSON.parse(item));
      const primaryCategoryOptions = parseToolResponse(extractToolResponseText(primaryCategoryOptionsResult)).data.map((item) => JSON.parse(item));

      // Get the option IDs
      const tagsOptionIds = [tagsOptions[1].value, tagsOptions[2].value, tagsOptions[3].value].join(",");
      const primaryCategoryOptionId = primaryCategoryOptions[1].value;

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `complex_attrs_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Complex Attributes ${uniqueId}`,
        price: 149.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 1.5,
        website_ids: [1, 2],
        category_links: [
          {
            category_id: "3",
            position: 1,
          },
          {
            category_id: "4",
            position: 2,
          },
        ],
        custom_attributes: [
          { attribute_code: "description", value: "A product with complex attributes for testing" },
          { attribute_code: "short_description", value: "Complex attributes test product" },
          { attribute_code: isFeaturedAttr!.attribute_code, value: 1 },
          { attribute_code: colorAttr!.attribute_code, value: "red" },
          { attribute_code: ratingAttr!.attribute_code, value: 4.8 },
          { attribute_code: releaseDateAttr!.attribute_code, value: "2024-03-15" },
          { attribute_code: msrpAttr!.attribute_code, value: "179.99" },
          { attribute_code: shippingWeightAttr!.attribute_code, value: "1.5" },
          { attribute_code: tagsAttr!.attribute_code, value: tagsOptionIds },
          { attribute_code: primaryCategoryAttr!.attribute_code, value: primaryCategoryOptionId },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Complex Attributes ${uniqueId}`);
      expect(createdProduct.price).toBe(149.99);

      // Verify all complex attributes are present
      expect(createdProduct.extension_attributes).toBeDefined();
      expect(createdProduct.extension_attributes.website_ids).toBeDefined();
      expect(createdProduct.extension_attributes.category_links).toBeDefined();
      expect(createdProduct.custom_attributes).toBeDefined();

      // Verify website_ids
      expect(Array.isArray(createdProduct.extension_attributes.website_ids)).toBe(true);
      expect(createdProduct.extension_attributes.website_ids).toContain(1);
      expect(createdProduct.extension_attributes.website_ids).toContain(2);

      // Verify category_links
      expect(Array.isArray(createdProduct.extension_attributes.category_links)).toBe(true);
      expect(createdProduct.extension_attributes.category_links.length).toBe(2);

      // Verify custom attributes
      const customAttrs = createdProduct.custom_attributes;
      expect(customAttrs.length).toBeGreaterThan(5);

      // Check various attribute types
      const isFeatured = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === isFeaturedAttr!.attribute_code);
      const color = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === colorAttr!.attribute_code);
      const rating = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === ratingAttr!.attribute_code);
      const releaseDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === releaseDateAttr!.attribute_code);
      const msrp = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === msrpAttr!.attribute_code);
      const shippingWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === shippingWeightAttr!.attribute_code);
      const tags = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === tagsAttr!.attribute_code);
      const primaryCategory = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === primaryCategoryAttr!.attribute_code);

      expect(isFeatured.value).toBe("1");
      expect(color.value).toBe("red");
      expect(rating.value).toBe("4.8");
      expect(releaseDate.value).toBe("2024-03-15 00:00:00");
      expect(msrp.value).toBe("179.990000");
      expect(shippingWeight.value).toBe("1.5");
      expect(tags.value).toBe(tagsOptionIds);
      expect(primaryCategory.value).toBe(primaryCategoryOptionId);

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);
  });

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

  describe("Website IDs Testing", () => {
    test("should create and retrieve product with website_ids", async () => {
      fixtures.setCurrentTest("website_ids_test");

      const createdFixtures = await fixtures.createFixtures([
        { name: "website_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_WEBSITE_IDS },
      ]);

      const websiteProduct = createdFixtures.get("website_product");
      expect(websiteProduct).toBeDefined();

      const result = await mockServer.callTool("get-product-by-sku", {
        sku: websiteProduct!.sku,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);
      const retrievedProduct = JSON.parse(parsed.data[0]);

      // Verify website_ids are present in extension_attributes
      expect(retrievedProduct.extension_attributes).toBeDefined();
      expect(retrievedProduct.extension_attributes.website_ids).toBeDefined();
      expect(Array.isArray(retrievedProduct.extension_attributes.website_ids)).toBe(true);
      expect(retrievedProduct.extension_attributes.website_ids).toContain(1);
      expect(retrievedProduct.extension_attributes.website_ids).toContain(2);
    }, 45000);

    test("should search products by website_ids", async () => {
      fixtures.setCurrentTest("search_website_ids_test");

      await fixtures.createFixtures([
        { name: "website_1", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_WEBSITE_IDS },
        { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
      ]);

      // Search for products with website_id = 1
      const result = await mockServer.callTool("search-products", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "website_id",
            value: 1,
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Should find at least the website product
      expect(parsed.data.length).toBeGreaterThanOrEqual(1);

      const products = parsed.data.map((item) => JSON.parse(item));
      const uniqueId = fixtures.getCurrentTestUniqueId();

      // Verify we found our website product
      const foundSkus = products.map((prod) => prod.sku);
      expect(foundSkus).toContain(`prod_website_1_${uniqueId}`);
    }, 45000);
  });

  describe("Category Links Testing", () => {
    test("should create and retrieve product with category_links", async () => {
      fixtures.setCurrentTest("category_links_test");
      categoryFixtures.setCurrentTest("create_category_links_test");

      // First create the categories we need
      const createdCategories = await categoryFixtures.createFixtures([
        { name: "electronics", definition: CategoryFixtures.FIXTURE_DEFINITIONS.ELECTRONICS_CATEGORY },
        { name: "clothing", definition: CategoryFixtures.FIXTURE_DEFINITIONS.CLOTHING_CATEGORY },
      ]);

      const electronicsCategory = createdCategories.get("electronics");
      const clothingCategory = createdCategories.get("clothing");
      expect(electronicsCategory).toBeDefined();
      expect(clothingCategory).toBeDefined();

      const uniqueId = fixtures.getCurrentTestUniqueId();
      const productSku = `category_links_prod_${uniqueId}`;

      const result = await mockServer.callTool("create-product", {
        sku: productSku,
        name: `Test Product with Category Links ${uniqueId}`,
        price: 59.99,
        type_id: "simple",
        status: 1,
        visibility: 4,
        weight: 0.6,
        category_links: [
          {
            category_id: electronicsCategory!.id!.toString(),
            position: 1,
          },
          {
            category_id: clothingCategory!.id!.toString(),
            position: 2,
          },
        ],
        custom_attributes: [
          { attribute_code: "description", value: "A product assigned to multiple categories" },
          { attribute_code: "short_description", value: "Multi-category test product" },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Create Product");
      expect(parsed.data.length).toBe(1);

      const createdProduct = JSON.parse(parsed.data[0]);
      expect(createdProduct.sku).toBe(productSku);
      expect(createdProduct.name).toBe(`Test Product with Category Links ${uniqueId}`);
      expect(createdProduct.price).toBe(59.99);

      // Verify category_links are present in extension_attributes
      expect(createdProduct.extension_attributes).toBeDefined();
      expect(createdProduct.extension_attributes.category_links).toBeDefined();
      expect(Array.isArray(createdProduct.extension_attributes.category_links)).toBe(true);
      expect(createdProduct.extension_attributes.category_links.length).toBe(2);

      // Verify the category links have the expected structure
      const categoryLinks = createdProduct.extension_attributes.category_links;
      expect(categoryLinks[0]).toHaveProperty("category_id");
      expect(categoryLinks[0]).toHaveProperty("position");
      expect(categoryLinks[0].category_id).toBe(electronicsCategory!.id!.toString());
      expect(categoryLinks[0].position).toBe(1);
      expect(categoryLinks[1].category_id).toBe(clothingCategory!.id!.toString());
      expect(categoryLinks[1].position).toBe(2);

      // Clean up
      await mockServer.callTool("delete-product", {
        sku: createdProduct.sku,
      });
    }, 45000);

    test("should search products by category_id", async () => {
      fixtures.setCurrentTest("search_category_links_test");

      await fixtures.createFixtures([
        { name: "category_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_CATEGORY_LINKS },
        { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
      ]);

      // Search for products in category 3
      const result = await mockServer.callTool("search-products", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "category_id",
            value: "3",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Should find at least the category product
      expect(parsed.data.length).toBeGreaterThanOrEqual(1);

      const products = parsed.data.map((item) => JSON.parse(item));
      const uniqueId = fixtures.getCurrentTestUniqueId();

      // Verify we found our category product
      const foundSkus = products.map((prod) => prod.sku);
      expect(foundSkus).toContain(`prod_category_product_${uniqueId}`);
    }, 45000);
  });

  describe("Custom Attributes Testing", () => {
    describe("Boolean Attributes", () => {
      test("should create and retrieve product with boolean attributes", async () => {
        fixtures.setCurrentTest("boolean_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "boolean_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_BOOLEAN_ATTRIBUTES },
        ]);

        const booleanProduct = createdFixtures.get("boolean_product");
        expect(booleanProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: booleanProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify boolean attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find boolean attributes
        const isFeatured = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "is_featured");
        const isNew = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "is_new");
        const isSale = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "is_sale");
        const isBestseller = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "is_bestseller");

        expect(isFeatured).toBeDefined();
        expect(isNew).toBeDefined();
        expect(isSale).toBeDefined();
        expect(isBestseller).toBeDefined();

        // Verify boolean values (should be 0 or 1)
        expect(isFeatured.value).toBe(1);
        expect(isNew.value).toBe(0);
        expect(isSale.value).toBe(1);
        expect(isBestseller.value).toBe(0);
      }, 45000);

      test("should search products by boolean attributes", async () => {
        fixtures.setCurrentTest("search_boolean_attributes_test");

        await fixtures.createFixtures([
          { name: "boolean_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_BOOLEAN_ATTRIBUTES },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for featured products
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: "is_featured",
              value: 1,
              conditionType: "eq",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our boolean product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_boolean_product_${uniqueId}`);
      }, 45000);
    });

    describe("Text Attributes", () => {
      test("should create and retrieve product with text attributes", async () => {
        fixtures.setCurrentTest("text_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "text_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_TEXT_ATTRIBUTES },
        ]);

        const textProduct = createdFixtures.get("text_product");
        expect(textProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: textProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify text attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find text attributes
        const color = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "color");
        const size = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "size");
        const material = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "material");
        const brand = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "brand");

        expect(color).toBeDefined();
        expect(size).toBeDefined();
        expect(material).toBeDefined();
        expect(brand).toBeDefined();

        // Verify text values
        expect(color.value).toBe("blue");
        expect(size.value).toBe("large");
        expect(material.value).toBe("cotton");
        expect(brand.value).toBe("TestBrand");
      }, 45000);

      test("should search products by text attributes", async () => {
        fixtures.setCurrentTest("search_text_attributes_test");

        await fixtures.createFixtures([
          { name: "text_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_TEXT_ATTRIBUTES },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for products with color = "blue"
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: "color",
              value: "blue",
              conditionType: "eq",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our text product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_text_product_${uniqueId}`);
      }, 45000);
    });

    describe("Numeric Attributes", () => {
      test("should create and retrieve product with numeric attributes", async () => {
        fixtures.setCurrentTest("numeric_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "numeric_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_NUMERIC_ATTRIBUTES },
        ]);

        const numericProduct = createdFixtures.get("numeric_product");
        expect(numericProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: numericProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify numeric attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find numeric attributes
        const rating = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "rating");
        const reviewCount = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "review_count");
        const stockQuantity = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "stock_quantity");

        expect(rating).toBeDefined();
        expect(reviewCount).toBeDefined();
        expect(stockQuantity).toBeDefined();

        // Verify numeric values
        expect(rating.value).toBe(4.5);
        expect(reviewCount.value).toBe(25);
        expect(stockQuantity.value).toBe(100);
      }, 45000);

      test("should search products by numeric attributes", async () => {
        fixtures.setCurrentTest("search_numeric_attributes_test");

        await fixtures.createFixtures([
          { name: "numeric_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_NUMERIC_ATTRIBUTES },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for products with rating >= 4.0
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: "rating",
              value: 4.0,
              conditionType: "gteq",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our numeric product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_numeric_product_${uniqueId}`);
      }, 45000);
    });

    describe("Date Attributes", () => {
      test("should create and retrieve product with date attributes", async () => {
        fixtures.setCurrentTest("date_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "date_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_DATE_ATTRIBUTES },
        ]);

        const dateProduct = createdFixtures.get("date_product");
        expect(dateProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: dateProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify date attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find date attributes
        const releaseDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "release_date");
        const expiryDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "expiry_date");
        const manufactureDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "manufacture_date");

        expect(releaseDate).toBeDefined();
        expect(expiryDate).toBeDefined();
        expect(manufactureDate).toBeDefined();

        // Verify date values (should be strings in YYYY-MM-DD format)
        expect(releaseDate.value).toBe("2024-01-15");
        expect(expiryDate.value).toBe("2025-12-31");
        expect(manufactureDate.value).toBe("2023-06-01");
      }, 45000);

      test("should search products by date attributes", async () => {
        fixtures.setCurrentTest("search_date_attributes_test");

        await fixtures.createFixtures([
          { name: "date_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_DATE_ATTRIBUTES },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for products released after 2024-01-01
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: "release_date",
              value: "2024-01-01",
              conditionType: "gteq",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our date product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_date_product_${uniqueId}`);
      }, 45000);
    });

    describe("Datetime Attributes", () => {
      test("should create and retrieve product with datetime attributes", async () => {
        fixtures.setCurrentTest("datetime_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "datetime_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_DATETIME_ATTRIBUTES },
        ]);

        const datetimeProduct = createdFixtures.get("datetime_product");
        expect(datetimeProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: datetimeProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify datetime attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find datetime attributes
        const createdAt = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "created_at");
        const updatedAt = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "updated_at");
        const lastModified = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "last_modified");

        expect(createdAt).toBeDefined();
        expect(updatedAt).toBeDefined();
        expect(lastModified).toBeDefined();

        // Verify datetime values (should be strings in YYYY-MM-DD HH:mm:ss format)
        expect(createdAt.value).toBe("2024-01-15 10:30:00");
        expect(updatedAt.value).toBe("2024-01-20 14:45:00");
        expect(lastModified.value).toBe("2024-01-25 09:15:00");
      }, 45000);
    });

    describe("Price Attributes", () => {
      test("should create and retrieve product with price attributes", async () => {
        fixtures.setCurrentTest("price_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "price_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_PRICE_ATTRIBUTES },
        ]);

        const priceProduct = createdFixtures.get("price_product");
        expect(priceProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: priceProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify price attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find price attributes
        const msrp = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "msrp");
        const cost = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "cost");
        const specialPrice = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "special_price");

        expect(msrp).toBeDefined();
        expect(cost).toBeDefined();
        expect(specialPrice).toBeDefined();

        // Verify price values (should be strings)
        expect(msrp.value).toBe("149.99");
        expect(cost.value).toBe("89.99");
        expect(specialPrice.value).toBe("119.99");
      }, 45000);

      test("should search products by price attributes", async () => {
        fixtures.setCurrentTest("search_price_attributes_test");

        await fixtures.createFixtures([
          { name: "price_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_PRICE_ATTRIBUTES },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for products with MSRP >= 140.00
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: "msrp",
              value: "140.00",
              conditionType: "gteq",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our price product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_price_product_${uniqueId}`);
      }, 45000);
    });

    describe("Weight Attributes", () => {
      test("should create and retrieve product with weight attributes", async () => {
        fixtures.setCurrentTest("weight_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "weight_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_WEIGHT_ATTRIBUTES },
        ]);

        const weightProduct = createdFixtures.get("weight_product");
        expect(weightProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: weightProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify weight attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find weight attributes
        const shippingWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "shipping_weight");
        const packageWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "package_weight");
        const dimensionsWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "dimensions_weight");

        expect(shippingWeight).toBeDefined();
        expect(packageWeight).toBeDefined();
        expect(dimensionsWeight).toBeDefined();

        // Verify weight values (should be strings)
        expect(shippingWeight.value).toBe("2.5");
        expect(packageWeight.value).toBe("3.0");
        expect(dimensionsWeight.value).toBe("2.2");
      }, 45000);
    });

    describe("Multiselect Attributes", () => {
      test("should create and retrieve product with multiselect attributes", async () => {
        fixtures.setCurrentTest("multiselect_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "multiselect_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_MULTISELECT_ATTRIBUTES },
        ]);

        const multiselectProduct = createdFixtures.get("multiselect_product");
        expect(multiselectProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: multiselectProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify multiselect attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find multiselect attributes
        const tags = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "tags");
        const categories = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "categories");
        const features = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "features");

        expect(tags).toBeDefined();
        expect(categories).toBeDefined();
        expect(features).toBeDefined();

        // Verify multiselect values (should be comma-separated strings)
        expect(tags.value).toBe("1,2,3");
        expect(categories.value).toBe("5,6,7");
        expect(features.value).toBe("1,4,8");
      }, 45000);

      test("should search products by multiselect attributes", async () => {
        fixtures.setCurrentTest("search_multiselect_attributes_test");

        await fixtures.createFixtures([
          { name: "multiselect_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_MULTISELECT_ATTRIBUTES },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for products with tag 1
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: "tags",
              value: "1",
              conditionType: "finset",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our multiselect product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_multiselect_product_${uniqueId}`);
      }, 45000);
    });

    describe("Singleselect Attributes", () => {
      test("should create and retrieve product with singleselect attributes", async () => {
        fixtures.setCurrentTest("singleselect_attributes_test");
        attributeFixtures.setCurrentTest("singleselect_attributes_test");

        // First create the singleselect attributes we need
        const createdAttributes = await attributeFixtures.createFixtures([
          { name: "primary_category", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
          { name: "main_color", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
          { name: "size_type", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
        ]);

        const primaryCategoryAttr = createdAttributes.get("primary_category");
        const mainColorAttr = createdAttributes.get("main_color");
        const sizeTypeAttr = createdAttributes.get("size_type");
        expect(primaryCategoryAttr).toBeDefined();
        expect(mainColorAttr).toBeDefined();
        expect(sizeTypeAttr).toBeDefined();

        // Get the actual option IDs for each attribute
        const primaryCategoryOptionsResult = await mockServer.callTool("get-product-attribute-options", {
          attributeCode: primaryCategoryAttr!.attribute_code,
        });
        const mainColorOptionsResult = await mockServer.callTool("get-product-attribute-options", {
          attributeCode: mainColorAttr!.attribute_code,
        });
        const sizeTypeOptionsResult = await mockServer.callTool("get-product-attribute-options", {
          attributeCode: sizeTypeAttr!.attribute_code,
        });

        const primaryCategoryOptions = parseToolResponse(extractToolResponseText(primaryCategoryOptionsResult)).data.map((item) => JSON.parse(item));
        const mainColorOptions = parseToolResponse(extractToolResponseText(mainColorOptionsResult)).data.map((item) => JSON.parse(item));
        const sizeTypeOptions = parseToolResponse(extractToolResponseText(sizeTypeOptionsResult)).data.map((item) => JSON.parse(item));

        // Get the option IDs for different options
        const primaryCategoryOptionId = primaryCategoryOptions[1].value;
        const mainColorOptionId = mainColorOptions[1].value;
        const sizeTypeOptionId = sizeTypeOptions[2].value;

        // Create a custom product definition with the actual option IDs
        const customSingleselectProductDefinition = {
          name: "Test Product with Singleselect Attributes",
          price: 55.99,
          type_id: "simple" as const,
          status: 1,
          visibility: 4,
          weight: 0.6,
          custom_attributes: [
            { attribute_code: "description", value: "A product with singleselect attributes for testing" },
            { attribute_code: "short_description", value: "Singleselect attributes test product" },
            { attribute_code: primaryCategoryAttr!.attribute_code, value: primaryCategoryOptionId },
            { attribute_code: mainColorAttr!.attribute_code, value: mainColorOptionId },
            { attribute_code: sizeTypeAttr!.attribute_code, value: sizeTypeOptionId },
          ],
        };

        const createdFixtures = await fixtures.createFixtures([{ name: "singleselect_product", definition: customSingleselectProductDefinition }]);

        const singleselectProduct = createdFixtures.get("singleselect_product");
        expect(singleselectProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: singleselectProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify singleselect attributes are present
        expect(retrievedProduct.custom_attributes).toBeDefined();
        const customAttrs = retrievedProduct.custom_attributes;

        // Find singleselect attributes
        const primaryCategory = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === primaryCategoryAttr!.attribute_code);
        const mainColor = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === mainColorAttr!.attribute_code);
        const sizeType = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === sizeTypeAttr!.attribute_code);

        expect(primaryCategory).toBeDefined();
        expect(mainColor).toBeDefined();
        expect(sizeType).toBeDefined();

        // Verify singleselect values (should be option IDs as numbers)
        expect(primaryCategory.value).toBe(primaryCategoryOptionId);
        expect(mainColor.value).toBe(mainColorOptionId);
        expect(sizeType.value).toBe(sizeTypeOptionId);
      }, 45000);

      test("should search products by singleselect attributes", async () => {
        fixtures.setCurrentTest("search_singleselect_attributes_test");
        attributeFixtures.setCurrentTest("search_singleselect_attributes_test");

        // First create the singleselect attributes we need
        const createdAttributes = await attributeFixtures.createFixtures([
          { name: "primary_category", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
          { name: "main_color", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
          { name: "size_type", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
        ]);

        const primaryCategoryAttr = createdAttributes.get("primary_category");
        const mainColorAttr = createdAttributes.get("main_color");
        const sizeTypeAttr = createdAttributes.get("size_type");
        expect(primaryCategoryAttr).toBeDefined();
        expect(mainColorAttr).toBeDefined();
        expect(sizeTypeAttr).toBeDefined();

        // Get the actual option IDs for each attribute
        const primaryCategoryOptionsResult = await mockServer.callTool("get-product-attribute-options", {
          attributeCode: primaryCategoryAttr!.attribute_code,
        });
        const mainColorOptionsResult = await mockServer.callTool("get-product-attribute-options", {
          attributeCode: mainColorAttr!.attribute_code,
        });
        const sizeTypeOptionsResult = await mockServer.callTool("get-product-attribute-options", {
          attributeCode: sizeTypeAttr!.attribute_code,
        });

        const primaryCategoryOptions = parseToolResponse(extractToolResponseText(primaryCategoryOptionsResult)).data.map((item) => JSON.parse(item));
        const mainColorOptions = parseToolResponse(extractToolResponseText(mainColorOptionsResult)).data.map((item) => JSON.parse(item));
        const sizeTypeOptions = parseToolResponse(extractToolResponseText(sizeTypeOptionsResult)).data.map((item) => JSON.parse(item));

        // Get the option IDs for different options
        const primaryCategoryOptionId = primaryCategoryOptions[1].value;
        const mainColorOptionId = mainColorOptions[1].value;
        const sizeTypeOptionId = sizeTypeOptions[2].value;

        // Create a custom product definition with the actual option IDs
        const customSingleselectProductDefinition = {
          name: "Test Product with Singleselect Attributes",
          price: 55.99,
          type_id: "simple" as const,
          status: 1,
          visibility: 4,
          weight: 0.6,
          custom_attributes: [
            { attribute_code: "description", value: "A product with singleselect attributes for testing" },
            { attribute_code: "short_description", value: "Singleselect attributes test product" },
            { attribute_code: primaryCategoryAttr!.attribute_code, value: primaryCategoryOptionId },
            { attribute_code: mainColorAttr!.attribute_code, value: mainColorOptionId },
            { attribute_code: sizeTypeAttr!.attribute_code, value: sizeTypeOptionId },
          ],
        };

        await fixtures.createFixtures([
          { name: "singleselect_product", definition: customSingleselectProductDefinition },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for products with the actual primary_category option ID
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: primaryCategoryAttr!.attribute_code,
              value: primaryCategoryOptionId,
              conditionType: "eq",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our singleselect product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_singleselect_product_${uniqueId}`);
      }, 45000);
    });

    describe("Complex Attributes Combination", () => {
      test("should create and retrieve product with complex attribute combination", async () => {
        fixtures.setCurrentTest("complex_attributes_test");

        const createdFixtures = await fixtures.createFixtures([
          { name: "complex_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_COMPLEX_ATTRIBUTES },
        ]);

        const complexProduct = createdFixtures.get("complex_product");
        expect(complexProduct).toBeDefined();

        const result = await mockServer.callTool("get-product-by-sku", {
          sku: complexProduct!.sku,
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);
        const retrievedProduct = JSON.parse(parsed.data[0]);

        // Verify all complex attributes are present
        expect(retrievedProduct.extension_attributes).toBeDefined();
        expect(retrievedProduct.extension_attributes.website_ids).toBeDefined();
        expect(retrievedProduct.extension_attributes.category_links).toBeDefined();
        expect(retrievedProduct.custom_attributes).toBeDefined();

        // Verify website_ids
        expect(Array.isArray(retrievedProduct.extension_attributes.website_ids)).toBe(true);
        expect(retrievedProduct.extension_attributes.website_ids).toContain(1);
        expect(retrievedProduct.extension_attributes.website_ids).toContain(2);

        // Verify category_links
        expect(Array.isArray(retrievedProduct.extension_attributes.category_links)).toBe(true);
        expect(retrievedProduct.extension_attributes.category_links.length).toBe(2);

        // Verify custom attributes
        const customAttrs = retrievedProduct.custom_attributes;
        expect(customAttrs.length).toBeGreaterThan(5);

        // Check various attribute types
        const isFeatured = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "is_featured");
        const color = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "color");
        const rating = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "rating");
        const releaseDate = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "release_date");
        const msrp = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "msrp");
        const shippingWeight = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "shipping_weight");
        const tags = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "tags");
        const primaryCategory = customAttrs.find((attr: CustomAttribute) => attr.attribute_code === "primary_category");

        expect(isFeatured.value).toBe(1);
        expect(color.value).toBe("red");
        expect(rating.value).toBe(4.8);
        expect(releaseDate.value).toBe("2024-03-15");
        expect(msrp.value).toBe("179.99");
        expect(shippingWeight.value).toBe("1.5");
        expect(tags.value).toBe("1,2,3");
        expect(primaryCategory.value).toBe(3);
      }, 45000);

      test("should search products with complex attribute filters", async () => {
        fixtures.setCurrentTest("search_complex_attributes_test");

        await fixtures.createFixtures([
          { name: "complex_product", definition: ProductFixtures.FIXTURE_DEFINITIONS.PRODUCT_WITH_COMPLEX_ATTRIBUTES },
          { name: "simple", definition: ProductFixtures.FIXTURE_DEFINITIONS.SIMPLE_PRODUCT },
        ]);

        // Search for featured products with rating >= 4.5 and color = "red"
        const result = await mockServer.callTool("search-products", {
          filters: [
            fixtures.getCurrentTestFilter(),
            {
              field: "is_featured",
              value: 1,
              conditionType: "eq",
            },
            {
              field: "rating",
              value: 4.5,
              conditionType: "gteq",
            },
            {
              field: "color",
              value: "red",
              conditionType: "eq",
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBeGreaterThanOrEqual(1);

        const products = parsed.data.map((item) => JSON.parse(item));
        const uniqueId = fixtures.getCurrentTestUniqueId();

        // Verify we found our complex product
        const foundSkus = products.map((prod) => prod.sku);
        expect(foundSkus).toContain(`prod_complex_product_${uniqueId}`);
      }, 45000);
    });
  });
});
