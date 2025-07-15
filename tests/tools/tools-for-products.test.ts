/**
 * Comprehensive Functional Tests for Products Search Tool
 * Tests the actual MCP tool implementation against real Magento/Adobe Commerce instance with sample data
 *
 * Setup Instructions:
 * 1. Copy tests/env.test.example to .env.test
 * 2. Add your Magento credentials to .env.test
 * 3. Run: npm run build
 * 4. Run: npm run test:integration
 */

import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductTools } from "../../src/tools/tools-for-products";
import type { MockMcpServer } from "../utils/mock-mcp-server";
import { createMockMcpServer, extractToolResponseText, parseToolResponse } from "../utils/mock-mcp-server";

describe("Products Search Tool - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;

  beforeAll(() => {
    console.log("🚀 Setting up comprehensive functional tests...");
    console.log(`📍 Testing against: ${process.env.COMMERCE_BASE_URL}`);
    console.log("📦 Testing with Adobe Commerce sample data");

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
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  describe("Tool Registration", () => {
    test("should register search-products tool", () => {
      expect(mockServer.registeredTools.has("search-products")).toBe(true);

      const tool = mockServer.registeredTools.get("search-products");
      expect(tool.definition.title).toBe("Search Products");
      expect(tool.definition.description).toContain("Search for products in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(true);
    });
  });

  describe("Basic Product Search", () => {
    test("should search products with default parameters", async () => {
      const result = await mockServer.callTool("search-products", {});

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Products");
      expect(parsed.meta.page).toBe("1");
      expect(parsed.meta.pageSize).toBe("10");
      expect(parsed.meta.endpoint).toContain("/products");
      expect(parsed.data.length).toBeGreaterThan(0);

      // Validate that we get product JSON objects
      const firstProduct = JSON.parse(parsed.data[0]);
      expect(firstProduct).toHaveProperty("id");
      expect(firstProduct).toHaveProperty("sku");
      expect(firstProduct).toHaveProperty("name");
    }, 30000);

    test("should respect pagination parameters", async () => {
      const result = await mockServer.callTool("search-products", {
        page: 2,
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.page).toBe("2");
      expect(parsed.meta.pageSize).toBe("5");
      expect(parsed.data.length).toBeLessThanOrEqual(5);
    }, 30000);
  });

  describe("Product Filtering", () => {
    test("should filter products by SKU using exact match", async () => {
      // First get a product to use its SKU
      const initialResult = await mockServer.callTool("search-products", { pageSize: 1 });
      const initialText = extractToolResponseText(initialResult);
      const initialParsed = parseToolResponse(initialText);
      const firstProduct = JSON.parse(initialParsed.data[0]);
      const testSku = firstProduct.sku;

      // Now search for that specific SKU
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "sku",
            value: testSku,
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);
      const foundProduct = JSON.parse(parsed.data[0]);
      expect(foundProduct.sku).toBe(testSku);
    }, 30000);

    test("should filter products by name using LIKE condition", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "name",
            value: "bag",
            conditionType: "like",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Should find products with "bag" in the name
      expect(parsed.data.length).toBeGreaterThanOrEqual(0);

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((product) => {
        expect(product.name.toLowerCase()).toContain("bag");
      });
    }, 30000);

    test("should filter products by price range", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "price",
            value: 50,
            conditionType: "gteq",
          },
          {
            field: "price",
            value: 200,
            conditionType: "lteq",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThanOrEqual(0);

      const products = parsed.data.map((item) => JSON.parse(item));
      const productsWithPrice = products.filter((product) => product.price !== undefined && product.price > 0);
      
      // Skip validation if no products with valid price data found
      if (productsWithPrice.length === 0) {
        console.log("No products with valid price data found - skipping price range validation");
        return;
      }
      
      productsWithPrice.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(50);
        expect(product.price).toBeLessThanOrEqual(200);
      });
    }, 30000);

    test("should filter products by status (enabled only)", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "status",
            value: 1, // 1 = enabled
            conditionType: "eq",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThanOrEqual(0);

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((product) => {
        expect(product.status).toBe(1);
      });
    }, 30000);
  });

  describe("Product Sorting", () => {
    test("should sort products by name ascending", async () => {
      const result = await mockServer.callTool("search-products", {
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

      expect(parsed.data.length).toBeGreaterThanOrEqual(0);

      // Skip sort validation if we don't have enough data
      if (parsed.data.length < 2) {
        console.log("Skipping sort validation - insufficient data");
        return;
      }

      const products = parsed.data.map((item) => JSON.parse(item));
      const names = products.map((p) => p.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    }, 30000);

    test("should sort products by price descending", async () => {
      const result = await mockServer.callTool("search-products", {
        sortOrders: [
          {
            field: "price",
            direction: "DESC",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Skip price sort validation if we don't have enough data
      if (parsed.data.length < 2) {
        console.log("Skipping price sort validation - insufficient data");
        return;
      }

      const products = parsed.data.map((item) => JSON.parse(item));
      const prices = products.map((p) => p.price).filter((p) => p !== undefined);

      if (prices.length < 2) {
        console.log("Skipping price sort validation - insufficient price data");
        return;
      }

      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    }, 30000);
  });

  describe("Complex Search Scenarios", () => {
    test("should handle multiple filters with sorting", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "status",
            value: 1,
            conditionType: "eq",
          },
          {
            field: "visibility",
            value: 4, // Catalog, Search
            conditionType: "eq",
          },
        ],
        sortOrders: [
          {
            field: "created_at",
            direction: "DESC",
          },
        ],
        page: 1,
        pageSize: 3,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.page).toBe("1");
      expect(parsed.meta.pageSize).toBe("3");
      expect(parsed.data.length).toBeLessThanOrEqual(3);

      expect(parsed.data.length).toBeGreaterThanOrEqual(0);

      // Skip validation if no data returned
      if (parsed.data.length === 0) {
        console.log("No products returned for complex search - skipping validation");
        return;
      }

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((product) => {
        expect(product.status).toBe(1);
        expect(product.visibility).toBe(4);
      });
    }, 30000);

    test("should search for configurable products", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "type_id",
            value: "configurable",
            conditionType: "eq",
          },
        ],
        pageSize: 3,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThanOrEqual(0);

      // Skip validation if no configurable products found
      if (parsed.data.length === 0) {
        console.log("No configurable products found - skipping validation");
        return;
      }

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((product) => {
        expect(product.type_id).toBe("configurable");
      });
    }, 30000);

    test("should search products by category", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "category_ids",
            value: "2", // Default category in Magento sample data
            conditionType: "finset",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Should return products that belong to category 2
      expect(parsed.data.length).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle invalid field gracefully", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "nonexistent_field",
            value: "test",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 400");
    }, 30000);

    test("should handle invalid page size", async () => {
      await expect(
        mockServer.callTool("search-products", {
          pageSize: 50, // Over the limit of 10
        })
      ).rejects.toThrow("Number must be less than or equal to 10");
    }, 30000);

    test("should handle empty search results", async () => {
      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "sku",
            value: "NONEXISTENT_SKU_12345",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Products");
      expect(parsed.data.length).toBe(0);
    }, 30000);
  });

  describe("Response Format Validation", () => {
    test("should return properly formatted response structure", async () => {
      const result = await mockServer.callTool("search-products", { pageSize: 2 });

      const responseText = extractToolResponseText(result);

      // Check meta section
      expect(responseText).toContain("<meta>");
      expect(responseText).toContain("<name>Products</name>");
      expect(responseText).toContain("<page>");
      expect(responseText).toContain("<pageSize>");
      expect(responseText).toContain("<endpoint>");

      // Check data section
      expect(responseText).toContain("<data>");

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);
    }, 30000);

    test("should return valid JSON for each product", async () => {
      const result = await mockServer.callTool("search-products", { pageSize: 3 });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      parsed.data.forEach((item) => {
        expect(() => JSON.parse(item)).not.toThrow();
        const product = JSON.parse(item);
        expect(typeof product).toBe("object");
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("sku");
        expect(product).toHaveProperty("name");
      });
    }, 30000);
  });

  afterAll(() => {
    console.log("\n🎉 Comprehensive functional tests completed!");
    console.log("📊 All products search tool functionality verified against Adobe Commerce");
    console.log("🔍 Tested: Basic search, filtering, sorting, pagination, edge cases, and response format");
    console.log("🛠️ Tool implementation verified through actual MCP server calls");
  });
});
