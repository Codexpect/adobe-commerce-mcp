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
      expect(parsed.data.length).toBeGreaterThan(0);
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
      // First, let's see what products are available to find a good search term
      const initialResult = await mockServer.callTool("search-products", { pageSize: 3 });
      const initialText = extractToolResponseText(initialResult);
      const initialParsed = parseToolResponse(initialText);

      // Get a word from the first product's name to use as search term
      const firstProduct = JSON.parse(initialParsed.data[0]);
      const productName = firstProduct.name.toLowerCase();
      const searchTerm = productName.split(" ")[0]; // Use first word of product name

      console.log(`🔍 Searching for products with "${searchTerm}" in name`);

      const result = await mockServer.callTool("search-products", {
        filters: [
          {
            field: "name",
            value: "%" + searchTerm + "%",
            conditionType: "like",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Should find products with the search term in the name
      expect(parsed.data.length).toBeGreaterThan(0);

      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((product) => {
        expect(product.name.toLowerCase()).toContain(searchTerm);
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

      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.meta.name).toBe("Products");
      expect(parsed.meta.endpoint).toContain("/products");

      const products = parsed.data.map((item) => JSON.parse(item));
      const productsWithPrice = products.filter((product) => product.price !== undefined && product.price > 0);

      // Validate that all products with price data are within the specified range
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

      expect(parsed.data.length).toBeGreaterThan(0);

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

      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.meta.name).toBe("Products");
      expect(parsed.meta.endpoint).toContain("/products");

      // Validate sorting if we have multiple products
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

      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.meta.name).toBe("Products");
      expect(parsed.meta.endpoint).toContain("/products");

      // Validate price sorting if we have products with price data
      const products = parsed.data.map((item) => JSON.parse(item));
      const prices = products.map((p) => p.price).filter((p) => p !== undefined);

      // Check that prices are in descending order
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
      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.meta.name).toBe("Products");
      expect(parsed.meta.endpoint).toContain("/products");

      // Validate filters on returned products
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

      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.meta.name).toBe("Products");
      expect(parsed.meta.endpoint).toContain("/products");

      // Validate that returned products are configurable
      const products = parsed.data.map((item) => JSON.parse(item));
      products.forEach((product) => {
        expect(product.type_id).toBe("configurable");
      });
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
});
