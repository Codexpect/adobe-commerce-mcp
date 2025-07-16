/**
 * Comprehensive Functional Tests for Products Attribute Sets Tools
 * Tests the actual MCP tool implementation against real Magento/Adobe Commerce instance
 *
 * Setup Instructions:
 * 1. Copy tests/env.test.example to .env.test
 * 2. Add your Magento credentials to .env.test
 * 3. Run: npm run build
 * 4. Run: npm run test:integration
 */

import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductAttributeSetsTools } from "../../src/tools/tools-for-products-attribute-sets";
import type { MockMcpServer } from "../utils/mock-mcp-server";
import { createMockMcpServer, extractToolResponseText, parseToolResponse } from "../utils/mock-mcp-server";

describe("Products Attribute Sets Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  const createdAttributeSetIds: number[] = [];

  beforeAll(() => {
    console.log("🚀 Setting up comprehensive functional tests for products attribute sets...");
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

    registerProductAttributeSetsTools(mockServer.server, client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterAll(async () => {
    // Cleanup: Delete all created attribute sets
    console.log("🧹 Cleaning up created attribute sets...");
    for (const attributeSetId of createdAttributeSetIds) {
      try {
        await client.delete(`/products/attribute-sets/${attributeSetId}`);
        console.log(`✅ Deleted attribute set with ID: ${attributeSetId}`);
      } catch (error) {
        console.log(`⚠️ Failed to delete attribute set ${attributeSetId}:`, error);
      }
    }
    console.log("🎉 Cleanup completed!");
  });

  describe("Tool Registration", () => {
    test("should register search-attribute-sets tool", () => {
      expect(mockServer.registeredTools.has("search-attribute-sets")).toBe(true);

      const tool = mockServer.registeredTools.get("search-attribute-sets");
      expect(tool.definition.title).toBe("Search Attribute Sets");
      expect(tool.definition.description).toContain("Search for attribute sets in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(true);
    });

    test("should register create-attribute-set tool", () => {
      expect(mockServer.registeredTools.has("create-attribute-set")).toBe(true);

      const tool = mockServer.registeredTools.get("create-attribute-set");
      expect(tool.definition.title).toBe("Create Attribute Set");
      expect(tool.definition.description).toContain("Create a new attribute set in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });

    test("should register get-attribute-set-by-id tool", () => {
      expect(mockServer.registeredTools.has("get-attribute-set-by-id")).toBe(true);

      const tool = mockServer.registeredTools.get("get-attribute-set-by-id");
      expect(tool.definition.title).toBe("Get Attribute Set By ID");
      expect(tool.definition.description).toContain("Get details of an attribute set by its ID");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(true);
    });

    test("should register update-attribute-set tool", () => {
      expect(mockServer.registeredTools.has("update-attribute-set")).toBe(true);

      const tool = mockServer.registeredTools.get("update-attribute-set");
      expect(tool.definition.title).toBe("Update Attribute Set");
      expect(tool.definition.description).toContain("Update an attribute set by its ID");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });

    test("should register delete-attribute-set tool", () => {
      expect(mockServer.registeredTools.has("delete-attribute-set")).toBe(true);

      const tool = mockServer.registeredTools.get("delete-attribute-set");
      expect(tool.definition.title).toBe("Delete Attribute Set");
      expect(tool.definition.description).toContain("Delete an attribute set by its ID");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });

    test("should register delete-attribute-from-set tool", () => {
      expect(mockServer.registeredTools.has("delete-attribute-from-set")).toBe(true);

      const tool = mockServer.registeredTools.get("delete-attribute-from-set");
      expect(tool.definition.title).toBe("Delete Attribute From Set");
      expect(tool.definition.description).toContain("Delete an attribute from an attribute set");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });
  });

  describe("Search Attribute Sets Tool", () => {
    test("should search attribute sets with default parameters", async () => {
      const result = await mockServer.callTool("search-attribute-sets", {});

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Attribute Sets");
      expect(parsed.meta.page).toBe("1");
      expect(parsed.meta.pageSize).toBe("10");
      expect(parsed.meta.endpoint).toContain("/products/attribute-sets");
      expect(parsed.data.length).toBeGreaterThan(0);

      // Validate that we get attribute set JSON objects
      const firstAttributeSet = JSON.parse(parsed.data[0]);
      expect(firstAttributeSet).toHaveProperty("attribute_set_id");
      expect(firstAttributeSet).toHaveProperty("attribute_set_name");
      expect(firstAttributeSet).toHaveProperty("entity_type_id");
    }, 30000);

    test("should respect pagination parameters", async () => {
      const result = await mockServer.callTool("search-attribute-sets", {
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

    test("should filter attribute sets by name", async () => {
      // First get an attribute set to use its name
      const initialResult = await mockServer.callTool("search-attribute-sets", { pageSize: 1 });
      const initialText = extractToolResponseText(initialResult);
      const initialParsed = parseToolResponse(initialText);
      const firstAttributeSet = JSON.parse(initialParsed.data[0]);
      const testName = firstAttributeSet.attribute_set_name;

      // Now search for that specific attribute set name
      const result = await mockServer.callTool("search-attribute-sets", {
        filters: [
          {
            field: "attribute_set_name",
            value: testName,
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);
      const foundAttributeSet = JSON.parse(parsed.data[0]);
      expect(foundAttributeSet.attribute_set_name).toBe(testName);
    }, 30000);

    test("should filter attribute sets by entity type", async () => {
      const result = await mockServer.callTool("search-attribute-sets", {
        filters: [
          {
            field: "entity_type_id",
            value: 4, // Product entity type
            conditionType: "eq",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThan(0);

      const attributeSets = parsed.data.map((item) => JSON.parse(item));
      attributeSets.forEach((attributeSet) => {
        expect(attributeSet.entity_type_id).toBe(4);
      });
    }, 30000);
  });

  describe("Create Attribute Set Tool", () => {
    test("should create a basic attribute set", async () => {
      const testAttributeSetName = `Test Attribute Set ${Date.now()}`;

      const result = await mockServer.callTool("create-attribute-set", {
        attributeSetName: testAttributeSetName,
        sortOrder: 100,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Attribute Set");
      expect(parsed.meta.endpoint).toContain("/products/attribute-sets");
      expect(parsed.data.length).toBe(1);

      const createdAttributeSet = JSON.parse(parsed.data[0]);
      expect(createdAttributeSet.attribute_set_name).toBe(testAttributeSetName);
      expect(createdAttributeSet.sort_order).toBe(100);
      expect(createdAttributeSet.entity_type_id).toBe(4); // Product entity type

      // Store for cleanup
      if (createdAttributeSet.attribute_set_id) {
        createdAttributeSetIds.push(createdAttributeSet.attribute_set_id);
      }
    }, 30000);

    test("should create attribute set with minimal parameters", async () => {
      const testAttributeSetName = `Minimal Set ${Date.now()}`;

      const result = await mockServer.callTool("create-attribute-set", {
        attributeSetName: testAttributeSetName,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Attribute Set");
      expect(parsed.data.length).toBe(1);

      const createdAttributeSet = JSON.parse(parsed.data[0]);
      expect(createdAttributeSet.attribute_set_name).toBe(testAttributeSetName);
      expect(createdAttributeSet.entity_type_id).toBe(4);

      // Store for cleanup
      if (createdAttributeSet.attribute_set_id) {
        createdAttributeSetIds.push(createdAttributeSet.attribute_set_id);
      }
    }, 30000);
  });

  describe("Get Attribute Set By ID Tool", () => {
    test("should get attribute set by ID", async () => {
      // First get an attribute set to use its ID
      const initialResult = await mockServer.callTool("search-attribute-sets", { pageSize: 1 });
      const initialText = extractToolResponseText(initialResult);
      const initialParsed = parseToolResponse(initialText);
      const firstAttributeSet = JSON.parse(initialParsed.data[0]);
      const testId = firstAttributeSet.attribute_set_id;

      const result = await mockServer.callTool("get-attribute-set-by-id", {
        attributeSetId: testId,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Attribute Set Details");
      expect(parsed.meta.endpoint).toContain("/products/attribute-sets");
      expect(parsed.data.length).toBe(1);

      const foundAttributeSet = JSON.parse(parsed.data[0]);
      expect(foundAttributeSet.attribute_set_id).toBe(testId);
      expect(foundAttributeSet.attribute_set_name).toBe(firstAttributeSet.attribute_set_name);
    }, 30000);

    test("should handle non-existent attribute set ID", async () => {
      const nonExistentId = 999999;

      await expect(
        mockServer.callTool("get-attribute-set-by-id", {
          attributeSetId: nonExistentId,
        })
      ).rejects.toThrow();
    }, 30000);
  });

  describe("Update Attribute Set Tool", () => {
    test("should update attribute set name", async () => {
      // First create an attribute set to update
      const originalName = `Update Test Set ${Date.now()}`;
      const createResult = await mockServer.callTool("create-attribute-set", {
        attributeSetName: originalName,
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdAttributeSet = JSON.parse(createParsed.data[0]);
      const attributeSetId = createdAttributeSet.attribute_set_id;

      // Store for cleanup
      createdAttributeSetIds.push(attributeSetId);

      // Update the attribute set
      const newName = `Updated Test Set ${Date.now()}`;
      const result = await mockServer.callTool("update-attribute-set", {
        attributeSetId: attributeSetId,
        attributeSetName: newName,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Update Attribute Set");
      expect(parsed.meta.endpoint).toContain("/products/attribute-sets");
      expect(parsed.data.length).toBe(1);

      const updatedAttributeSet = JSON.parse(parsed.data[0]);
      expect(updatedAttributeSet.attribute_set_id).toBe(attributeSetId);
      expect(updatedAttributeSet.attribute_set_name).toBe(newName);
    }, 30000);

    test("should update attribute set sort order", async () => {
      // First create an attribute set to update
      const testName = `Sort Order Test Set ${Date.now()}`;
      const createResult = await mockServer.callTool("create-attribute-set", {
        attributeSetName: testName,
        sortOrder: 50,
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdAttributeSet = JSON.parse(createParsed.data[0]);
      const attributeSetId = createdAttributeSet.attribute_set_id;

      // Store for cleanup
      createdAttributeSetIds.push(attributeSetId);

      // Update the sort order
      const newSortOrder = 200;
      const result = await mockServer.callTool("update-attribute-set", {
        attributeSetId: attributeSetId,
        sortOrder: newSortOrder,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Update Attribute Set");
      expect(parsed.data.length).toBe(1);

      const updatedAttributeSet = JSON.parse(parsed.data[0]);
      expect(updatedAttributeSet.attribute_set_id).toBe(attributeSetId);
      expect(updatedAttributeSet.sort_order).toBe(newSortOrder);
    }, 30000);
  });

  describe("Delete Attribute Set Tool", () => {
    test("should delete attribute set by ID", async () => {
      // First create an attribute set to delete
      const testName = `Delete Test Set ${Date.now()}`;
      const createResult = await mockServer.callTool("create-attribute-set", {
        attributeSetName: testName,
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdAttributeSet = JSON.parse(createParsed.data[0]);
      const attributeSetId = createdAttributeSet.attribute_set_id;

      // Delete the attribute set
      const result = await mockServer.callTool("delete-attribute-set", {
        attributeSetId: attributeSetId,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Delete Attribute Set");
      expect(parsed.meta.endpoint).toContain("/products/attribute-sets");
      expect(parsed.data[0]).toBe("Deleted");

      // Verify it's actually deleted by trying to get it
      await expect(
        mockServer.callTool("get-attribute-set-by-id", {
          attributeSetId: attributeSetId,
        })
      ).rejects.toThrow();
    }, 30000);
  });

  describe("Delete Attribute From Set Tool", () => {
    test("should delete attribute from set", async () => {
      // This test requires a more complex setup with attributes and attribute sets
      // For now, we'll test the tool registration and basic structure
      // In a real scenario, you'd need to:
      // 1. Create an attribute set
      // 2. Add attributes to the set
      // 3. Delete an attribute from the set
      
      // For now, just verify the tool is properly registered
      expect(mockServer.registeredTools.has("delete-attribute-from-set")).toBe(true);
      
      const tool = mockServer.registeredTools.get("delete-attribute-from-set");
      expect(tool.definition.title).toBe("Delete Attribute From Set");
      expect(tool.definition.description).toContain("Delete an attribute from an attribute set");
    });
  });
}); 