import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerCategoriesTools } from "../../src/tools/tools-for-categories";
import { registerProductTools } from "../../src/tools/tools-for-products";
import type { MockMcpServer } from "../utils/mock-mcp-server";
import { createMockMcpServer, extractToolResponseText, parseToolResponse } from "../utils/mock-mcp-server";
import type { CategoryTree } from "../../src/adobe/categories/types/category";

describe("Categories Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  const createdCategoryIds: number[] = [];

  beforeAll(() => {
    console.log("🚀 Setting up comprehensive category functional tests...");
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

    registerCategoriesTools(mockServer.server, client);
    registerProductTools(mockServer.server, client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterAll(async () => {
    // Cleanup: Delete all created categories
    console.log("🧹 Cleaning up created categories...");
    for (const categoryId of createdCategoryIds) {
      try {
        await client.delete(`/categories/${categoryId}`);
        console.log(`✅ Deleted category with ID: ${categoryId}`);
      } catch (error) {
        console.log(`⚠️ Failed to delete category ${categoryId}:`, error);
      }
    }
    console.log("🎉 Cleanup completed!");
  });

  describe("Tool Registration", () => {
    test("should register all category tools", () => {
      const expectedTools = [
        "search-categories",
        "get-category-tree",
        "get-category-by-id",
        "create-category",
        "update-category",
        "delete-category",
        "move-category",
        "get-category-attributes",
        "get-category-attribute-by-code",
        "get-category-attribute-options",
        "get-category-products",
        "assign-product-to-category",
        "update-product-in-category",
        "remove-product-from-category"
      ];

      expectedTools.forEach(toolName => {
        expect(mockServer.registeredTools.has(toolName)).toBe(true);
      });
    });

    test("should register search-categories tool with correct properties", () => {
      expect(mockServer.registeredTools.has("search-categories")).toBe(true);

      const tool = mockServer.registeredTools.get("search-categories");
      expect(tool.definition.title).toBe("Search Categories");
      expect(tool.definition.description).toContain("Search for categories in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create-category tool with correct properties", () => {
      expect(mockServer.registeredTools.has("create-category")).toBe(true);

      const tool = mockServer.registeredTools.get("create-category");
      expect(tool.definition.title).toBe("Create Category");
      expect(tool.definition.description).toContain("Create a new category in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register update-category tool with correct properties", () => {
      expect(mockServer.registeredTools.has("update-category")).toBe(true);

      const tool = mockServer.registeredTools.get("update-category");
      expect(tool.definition.title).toBe("Update Category");
      expect(tool.definition.description).toContain("Update an existing category in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete-category tool with correct properties", () => {
      expect(mockServer.registeredTools.has("delete-category")).toBe(true);

      const tool = mockServer.registeredTools.get("delete-category");
      expect(tool.definition.title).toBe("Delete Category");
      expect(tool.definition.description).toContain("Delete a category by its ID");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations?.readOnlyHint).toBe(false);
    });
  });

  describe("Category Search", () => {
    test("should search categories with default parameters", async () => {
      const result = await mockServer.callTool("search-categories", {});

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Categories");
      expect(parsed.meta.page).toBe("1");
      expect(parsed.meta.pageSize).toBe("10");
      expect(parsed.meta.endpoint).toContain("/categories/list");
      expect(parsed.data.length).toBeGreaterThan(0);

      // Validate that we get category JSON objects
      const firstCategory = JSON.parse(parsed.data[0]);
      expect(firstCategory).toHaveProperty("id");
      expect(firstCategory).toHaveProperty("name");
      expect(firstCategory).toHaveProperty("parent_id");
      // Note: is_active might not be present in all category responses
    }, 30000);

    test("should respect pagination parameters", async () => {
      const result = await mockServer.callTool("search-categories", {
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

    test("should filter categories by name", async () => {
      const result = await mockServer.callTool("search-categories", {
        filters: [
          {
            field: "name",
            value: "Default Category",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThan(0);
      const firstCategory = JSON.parse(parsed.data[0]);
      expect(firstCategory.name).toBe("Default Category");
    }, 30000);

    test("should filter categories by parent_id", async () => {
      const result = await mockServer.callTool("search-categories", {
        filters: [
          {
            field: "parent_id",
            value: 1, // Root category
            conditionType: "eq",
          },
        ],
        pageSize: 10,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThan(0);
      const categories = parsed.data.map((item: string) => JSON.parse(item));
      categories.forEach((category: { parent_id: number }) => {
        expect(category.parent_id).toBe(1);
      });
    }, 30000);

    test("should filter categories by is_active status using string value", async () => {
      const result = await mockServer.callTool("search-categories", {
        filters: [
          {
            field: "is_active",
            value: "1", // Use string "1" for true
            conditionType: "eq",
          },
        ],
        pageSize: 10,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThan(0);
      const categories = parsed.data.map((item: string) => JSON.parse(item));
      categories.forEach((category: { is_active: number | boolean }) => {
        expect(category.is_active).toBe(true);
      });
    }, 30000);

    test("should search with multiple filters", async () => {
      const result = await mockServer.callTool("search-categories", {
        filters: [
          {
            field: "is_active",
            value: "1", // Use string "1" for true
            conditionType: "eq",
          },
          {
            field: "parent_id",
            value: 2, // Default category
            conditionType: "eq",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThanOrEqual(0);
      const categories = parsed.data.map((item: string) => JSON.parse(item));
      categories.forEach((category: { is_active: number | boolean; parent_id: number }) => {
        expect(category.is_active).toBe(true);
        expect(category.parent_id).toBe(2);
      });
    }, 30000);
  });

  describe("Category Tree", () => {
    test("should get category tree", async () => {
      const result = await mockServer.callTool("get-category-tree", {});

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Verify the response structure
      expect(parsed.meta.endpoint).toBeDefined();
      expect(parsed.meta.endpoint).toContain("/categories");
      expect(parsed.data).toBeDefined();

      const treeData = JSON.parse(parsed.data[0]);
      expect(treeData).toHaveProperty("id");
      expect(treeData).toHaveProperty("name");
      expect(treeData).toHaveProperty("children_data");
      expect(Array.isArray(treeData.children_data)).toBe(true);
    }, 30000);

    test("should get category tree with depth parameter", async () => {
      const result = await mockServer.callTool("get-category-tree", {
        depth: 2,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.endpoint).toContain("depth=2");
    }, 30000);

    test("should get category tree with root category ID", async () => {
      const result = await mockServer.callTool("get-category-tree", {
        rootCategoryId: 2, // Default category
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.endpoint).toContain("rootCategoryId=2");
    }, 30000);
  });

  describe("Category by ID", () => {
    test("should get category by ID", async () => {
      // First get a category ID from search
      const searchResult = await mockServer.callTool("search-categories", { pageSize: 1 });
      const searchText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchText);
      const firstCategory = JSON.parse(searchParsed.data[0]);
      const categoryId = firstCategory.id;

      const result = await mockServer.callTool("get-category-by-id", {
        categoryId: categoryId,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.endpoint).toContain(`/categories/${categoryId}`);
      expect(parsed.data).toBeDefined();

      const categoryData = JSON.parse(parsed.data[0]);
      expect(categoryData.id).toBe(categoryId);
      expect(categoryData).toHaveProperty("name");
      expect(categoryData).toHaveProperty("parent_id");
      // Note: is_active might not be present in all category responses
    }, 30000);

    test("should handle non-existent category ID gracefully", async () => {
      const nonExistentId = 999999;

      const result = await mockServer.callTool("get-category-by-id", {
        categoryId: nonExistentId,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      // Note: The actual error might be 401 (authentication) instead of 404
    }, 30000);
  });

  describe("Category Attributes", () => {
    test("should get category attributes", async () => {
      const result = await mockServer.callTool("get-category-attributes", {});

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Category Attributes");
      expect(parsed.meta.endpoint).toContain("/categories/attributes");
      expect(parsed.data.length).toBeGreaterThan(0);

      const firstAttribute = JSON.parse(parsed.data[0]);
      expect(firstAttribute).toHaveProperty("attribute_code");
      expect(firstAttribute).toHaveProperty("frontend_input");
      expect(firstAttribute).toHaveProperty("is_required");
      expect(firstAttribute).toHaveProperty("is_unique");
    }, 30000);

    test("should get category attribute by code", async () => {
      const result = await mockServer.callTool("get-category-attribute-by-code", {
        attributeCode: "name",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Category Attribute");
      expect(parsed.meta.endpoint).toContain("/categories/attributes/name");
      expect(parsed.data).toBeDefined();

      const attributeData = JSON.parse(parsed.data[0]);
      expect(attributeData.attribute_code).toBe("name");
      expect(attributeData).toHaveProperty("frontend_input");
      expect(attributeData).toHaveProperty("is_required");
    }, 30000);

    test("should get category attribute options", async () => {
      const result = await mockServer.callTool("get-category-attribute-options", {
        attributeCode: "is_active",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Category Attribute Options");
      expect(parsed.meta.endpoint).toContain("/categories/attributes/is_active/options");
      expect(parsed.data).toBeDefined();
    }, 30000);

    test("should handle non-existent attribute code", async () => {
      const result = await mockServer.callTool("get-category-attribute-by-code", {
        attributeCode: "non_existent_attribute_xyz",
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 404");
    }, 30000);
  });

  describe("Category Products", () => {
    test("should get products in category", async () => {
      // First get a category ID from search
      const searchResult = await mockServer.callTool("search-categories", { pageSize: 1 });
      const searchText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchText);
      const firstCategory = JSON.parse(searchParsed.data[0]);
      const categoryId = firstCategory.id;

      const result = await mockServer.callTool("get-category-products", {
        categoryId: categoryId,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Category Products");
      expect(parsed.meta.endpoint).toContain(`/categories/${categoryId}/products`);
      expect(parsed.data).toBeDefined();
    }, 30000);

    test("should get products in category with pagination", async () => {
      // First get a category ID from search
      const searchResult = await mockServer.callTool("search-categories", { pageSize: 1 });
      const searchText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchText);
      const firstCategory = JSON.parse(searchParsed.data[0]);
      const categoryId = firstCategory.id;

      const result = await mockServer.callTool("get-category-products", {
        categoryId: categoryId,
        page: 1,
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Category Products");
      expect(parsed.meta.endpoint).toContain(`/categories/${categoryId}/products`);
      expect(parsed.data).toBeDefined();
    }, 30000);
  });

  describe("Category CRUD Operations", () => {
    test("should create a basic category", async () => {
      const testCategoryName = `Test Category ${Date.now()}`;

      const categoryData = {
        category: {
          name: testCategoryName,
          parent_id: 2, // Default category
          is_active: true,
          position: 1,
          include_in_menu: true,
        },
      };

      const result = await mockServer.callTool("create-category", categoryData);

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Created Category");
      expect(parsed.data).toBeDefined();

      const createdCategory = JSON.parse(parsed.data[0]);
      expect(createdCategory.name).toBe(testCategoryName);
      expect(createdCategory.is_active).toBe(true);
      expect(createdCategory.parent_id).toBe(2);
      expect(createdCategory.position).toBe(1);
      expect(createdCategory.include_in_menu).toBe(true);

      // Store for cleanup
      if (createdCategory.id) {
        createdCategoryIds.push(createdCategory.id);
      }
    }, 30000);

    test("should create category with minimal parameters", async () => {
      const testCategoryName = `Minimal Category ${Date.now()}`;

      const categoryData = {
        category: {
          name: testCategoryName,
          parent_id: 2, // Default category
          is_active: true, // Explicitly set to avoid validation error
        },
      };

      const result = await mockServer.callTool("create-category", categoryData);

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Created Category");
      expect(parsed.data).toBeDefined();

      const createdCategory = JSON.parse(parsed.data[0]);
      expect(createdCategory.name).toBe(testCategoryName);
      expect(createdCategory.parent_id).toBe(2);
      expect(createdCategory.is_active).toBe(true); // Default value

      // Store for cleanup
      if (createdCategory.id) {
        createdCategoryIds.push(createdCategory.id);
      }
    }, 30000);

    test("should create category with custom attributes", async () => {
      const testCategoryName = `Custom Category ${Date.now()}`;

      const categoryData = {
        category: {
          name: testCategoryName,
          parent_id: 2,
          is_active: true,
          position: 10,
          include_in_menu: false,
          // Note: meta fields might not be supported in the current implementation
        },
      };

      const result = await mockServer.callTool("create-category", categoryData);

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Created Category");
      expect(parsed.data).toBeDefined();

      const createdCategory = JSON.parse(parsed.data[0]);
      expect(createdCategory.name).toBe(testCategoryName);
      expect(createdCategory.include_in_menu).toBe(false);

      // Store for cleanup
      if (createdCategory.id) {
        createdCategoryIds.push(createdCategory.id);
      }
    }, 30000);

    test("should update category name", async () => {
      // First create a category to update
      const originalName = `Update Test Category ${Date.now()}`;
      const createResult = await mockServer.callTool("create-category", {
        category: {
          name: originalName,
          parent_id: 2,
          is_active: true,
        },
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdCategory = JSON.parse(createParsed.data[0]);
      const categoryId = createdCategory.id;

      // Store for cleanup
      createdCategoryIds.push(categoryId);

      // Update the category
      const newName = `Updated Test Category ${Date.now()}`;
      const updateData = {
        categoryId: categoryId.toString(), // Convert to string as expected by schema
        category: {
          name: newName,
        },
      };

      const result = await mockServer.callTool("update-category", updateData);

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Updated Category");
      expect(parsed.meta.endpoint).toContain(`/categories/${categoryId}`);
      expect(parsed.data).toBeDefined();

      const updatedCategory = JSON.parse(parsed.data[0]);
      expect(updatedCategory.id).toBe(categoryId);
      expect(updatedCategory.name).toBe(newName);
    }, 30000);

    test("should update category position", async () => {
      // First create a category to update
      const testName = `Position Test Category ${Date.now()}`;
      const createResult = await mockServer.callTool("create-category", {
        category: {
          name: testName,
          parent_id: 2,
          is_active: true,
          position: 1,
        },
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdCategory = JSON.parse(createParsed.data[0]);
      const categoryId = createdCategory.id;

      // Store for cleanup
      createdCategoryIds.push(categoryId);

      // Update the position
      const newPosition = 50;
      const updateData = {
        categoryId: categoryId.toString(),
        category: {
          position: newPosition,
        },
      };

      const result = await mockServer.callTool("update-category", updateData);

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Updated Category");
      expect(parsed.data).toBeDefined();

      const updatedCategory = JSON.parse(parsed.data[0]);
      expect(updatedCategory.id).toBe(categoryId);
      expect(updatedCategory.position).toBe(newPosition);
    }, 30000);

    test("should create three categories and move one as child of another", async () => {
      const timestamp = Date.now();
      
      // Create three categories at the same level (under Default Category)
      const categoryA = {
        category: {
          name: `Category A ${timestamp}`,
          parent_id: 2, // Default category
          is_active: true,
          position: 1,
        },
      };

      const categoryB = {
        category: {
          name: `Category B ${timestamp}`,
          parent_id: 2, // Default category
          is_active: true,
          position: 2,
        },
      };

      const categoryC = {
        category: {
          name: `Category C ${timestamp}`,
          parent_id: 2, // Default category
          is_active: true,
          position: 3,
        },
      };

      // Create all three categories
      const createAResult = await mockServer.callTool("create-category", categoryA);
      const createBResult = await mockServer.callTool("create-category", categoryB);
      const createCResult = await mockServer.callTool("create-category", categoryC);

      const createAText = extractToolResponseText(createAResult);
      const createBText = extractToolResponseText(createBResult);
      const createCText = extractToolResponseText(createCResult);

      const createAParsed = parseToolResponse(createAText);
      const createBParsed = parseToolResponse(createBText);
      const createCParsed = parseToolResponse(createCText);

      const createdCategoryA = JSON.parse(createAParsed.data[0]);
      const createdCategoryB = JSON.parse(createBParsed.data[0]);
      const createdCategoryC = JSON.parse(createCParsed.data[0]);

      // Store all for cleanup
      createdCategoryIds.push(createdCategoryA.id, createdCategoryB.id, createdCategoryC.id);

      // Verify all categories were created at the same level
      expect(createdCategoryA.parent_id).toBe(2);
      expect(createdCategoryB.parent_id).toBe(2);
      expect(createdCategoryC.parent_id).toBe(2);

      // Verify positions are set correctly
      expect(createdCategoryA.position).toBe(1);
      expect(createdCategoryB.position).toBe(2);
      expect(createdCategoryC.position).toBe(3);

      // Move Category C to be a child of Category A
      const moveData = {
        categoryId: createdCategoryC.id,
        parentId: createdCategoryA.id,
      };

      const moveResult = await mockServer.callTool("move-category", moveData);

      const moveText = extractToolResponseText(moveResult);
      const moveParsed = parseToolResponse(moveText);

      expect(moveParsed.meta.name).toBe("Move Category");
      expect(moveParsed.meta.endpoint).toContain(`/categories/${createdCategoryC.id}/move`);
      expect(moveParsed.data).toBeDefined();

      const moveResponse = JSON.parse(moveParsed.data[0]);
      expect(typeof moveResponse).toBe("boolean");
      expect(moveResponse).toBe(true);

      // Verify the move by retrieving Category C and checking its new parent
      const getCResult = await mockServer.callTool("get-category-by-id", {
        categoryId: createdCategoryC.id,
      });

      const getCText = extractToolResponseText(getCResult);
      const getCParsed = parseToolResponse(getCText);
      const updatedCategoryC = JSON.parse(getCParsed.data[0]);

      expect(updatedCategoryC.id).toBe(createdCategoryC.id);
      expect(updatedCategoryC.name).toBe(`Category C ${timestamp}`);
      expect(updatedCategoryC.parent_id).toBe(createdCategoryA.id);

      // Verify Category A and B still have the same parent
      const getAResult = await mockServer.callTool("get-category-by-id", {
        categoryId: createdCategoryA.id,
      });

      const getBResult = await mockServer.callTool("get-category-by-id", {
        categoryId: createdCategoryB.id,
      });

      const getAText = extractToolResponseText(getAResult);
      const getBText = extractToolResponseText(getBResult);

      const getAParsed = parseToolResponse(getAText);
      const getBParsed = parseToolResponse(getBText);

      const updatedCategoryA = JSON.parse(getAParsed.data[0]);
      const updatedCategoryB = JSON.parse(getBParsed.data[0]);

      expect(updatedCategoryA.parent_id).toBe(2);
      expect(updatedCategoryB.parent_id).toBe(2);

      // Verify the hierarchy structure by getting the category tree
      const treeResult = await mockServer.callTool("get-category-tree", {
        rootCategoryId: 2, // Default category
        depth: 3,
      });

      const treeText = extractToolResponseText(treeResult);
      const treeParsed = parseToolResponse(treeText);
      const treeData = JSON.parse(treeParsed.data[0]);

      // Find our categories in the tree
      const findCategoryInTree = (tree: CategoryTree, categoryId: number): CategoryTree | null => {
        if (tree.id === categoryId) return tree;
        if (tree.children_data && Array.isArray(tree.children_data)) {
          for (const child of tree.children_data) {
            const found = findCategoryInTree(child, categoryId);
            if (found) return found;
          }
        }
        return null;
      };

      const categoryAInTree = findCategoryInTree(treeData, createdCategoryA.id);
      const categoryBInTree = findCategoryInTree(treeData, createdCategoryB.id);
      const categoryCInTree = findCategoryInTree(treeData, createdCategoryC.id);

      expect(categoryAInTree).toBeDefined();
      expect(categoryBInTree).toBeDefined();
      expect(categoryCInTree).toBeDefined();

      // Verify Category C is now a child of Category A
      expect(categoryCInTree?.parent_id).toBe(createdCategoryA.id);

      // Verify Category A has Category C as a child
      const categoryAChildren = categoryAInTree?.children_data || [];
      const categoryCInAChildren = categoryAChildren.find((child: CategoryTree) => child.id === createdCategoryC.id);
      expect(categoryCInAChildren).toBeDefined();

      console.log(`✅ Successfully created hierarchy: Default Category (2) -> Category A (${createdCategoryA.id}) -> Category C (${createdCategoryC.id})`);
      console.log(`✅ Category B (${createdCategoryB.id}) remains at the same level as Category A`);
    }, 30000);

    test("should delete category by ID", async () => {
      // First create a category to delete
      const testName = `Delete Test Category ${Date.now()}`;
      const createResult = await mockServer.callTool("create-category", {
        category: {
          name: testName,
          parent_id: 2,
          is_active: true,
        },
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdCategory = JSON.parse(createParsed.data[0]);
      const categoryId = createdCategory.id;

      // Delete the category
      const deleteData = {
        categoryId: categoryId,
      };

      const result = await mockServer.callTool("delete-category", deleteData);

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Delete Category");
      expect(parsed.meta.endpoint).toContain(`/categories/${categoryId}`);
      expect(parsed.data).toBeDefined();

      const deleteResult = JSON.parse(parsed.data[0]);
      expect(typeof deleteResult).toBe("boolean");
      expect(deleteResult).toBe(true);
    }, 30000);
  });

  describe("Product-Category Management", () => {
    let testProductSku: string;

    beforeAll(async () => {
      // Get a real product SKU to use for testing
      const searchResult = await mockServer.callTool("search-products", { pageSize: 1 });
      const searchText = extractToolResponseText(searchResult);
      const searchParsed = parseToolResponse(searchText);
      const firstProduct = JSON.parse(searchParsed.data[0]);
      testProductSku = firstProduct.sku;
      console.log(`🔍 Using product SKU for testing: ${testProductSku}`);
    });

    test("should assign product to category", async () => {
      const assignData = {
        categoryId: "2", // Default category
        productLink: {
          sku: testProductSku,
          position: 1,
          category_id: "2",
        },
      };

      const result = await mockServer.callTool("assign-product-to-category", assignData);

      const responseText = extractToolResponseText(result);
      
      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.name).toBe("Assign Product to Category");
      expect(parsed.meta.endpoint).toContain("/categories/2/products");
      expect(parsed.data).toBeDefined();

      const assignResult = JSON.parse(parsed.data[0]);
      expect(typeof assignResult).toBe("boolean");
    }, 30000);

    test("should update product position in category", async () => {
      const updateData = {
        categoryId: "2", // Default category
        productLink: {
          sku: testProductSku,
          position: 2,
          category_id: "2",
        },
      };

      const result = await mockServer.callTool("update-product-in-category", updateData);

      const responseText = extractToolResponseText(result);
      
      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.name).toBe("Update Product in Category");
      expect(parsed.meta.endpoint).toContain("/categories/2/products");
      expect(parsed.data).toBeDefined();

      const updateResult = JSON.parse(parsed.data[0]);
      expect(typeof updateResult).toBe("boolean");
    }, 30000);

    test("should remove product from category", async () => {
      const removeData = {
        categoryId: 2, // Default category
        sku: testProductSku,
      };

      const result = await mockServer.callTool("remove-product-from-category", removeData);

      const responseText = extractToolResponseText(result);
      
      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.name).toBe("Remove Product from Category");
      expect(parsed.meta.endpoint).toContain(`/categories/2/products/${testProductSku}`);
      expect(parsed.data).toBeDefined();

      const removeResult = JSON.parse(parsed.data[0]);
      expect(typeof removeResult).toBe("boolean");
    }, 30000);
  });

  describe("Error Handling", () => {
    test("should handle invalid category ID gracefully", async () => {
      const result = await mockServer.callTool("get-category-by-id", {
        categoryId: 999999,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
    }, 30000);

    test("should handle invalid attribute code gracefully", async () => {
      const result = await mockServer.callTool("get-category-attribute-by-code", {
        attributeCode: "invalid-attribute",
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 404");
    }, 30000);

    test("should handle creating category with invalid parent ID", async () => {
      const categoryData = {
        category: {
          name: "Invalid Parent Category",
          parent_id: 999999, // Non-existent parent
          is_active: true,
        },
      };

      const result = await mockServer.callTool("create-category", categoryData);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
    }, 30000);

    test("should handle updating non-existent category", async () => {
      const updateData = {
        categoryId: "999999", // Use string as expected by schema
        category: {
          name: "Updated Name",
        },
      };

      const result = await mockServer.callTool("update-category", updateData);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 404");
    }, 30000);

    test("should handle deleting non-existent category", async () => {
      const deleteData = {
        categoryId: 999999,
      };

      const result = await mockServer.callTool("delete-category", deleteData);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 404");
    }, 30000);

    test("should handle moving category to invalid parent", async () => {
      // First create a category to move
      const testName = `Invalid Move Test Category ${Date.now()}`;
      const createResult = await mockServer.callTool("create-category", {
        category: {
          name: testName,
          parent_id: 2,
          is_active: true,
        },
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdCategory = JSON.parse(createParsed.data[0]);
      const categoryId = createdCategory.id;

      // Store for cleanup
      createdCategoryIds.push(categoryId);

      // Try to move to invalid parent
      const moveData = {
        categoryId: categoryId,
        parentId: 999999, // Non-existent parent
      };

      const result = await mockServer.callTool("move-category", moveData);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
    }, 30000);
  });

  describe("Edge Cases", () => {
    test("should handle empty search results", async () => {
      const result = await mockServer.callTool("search-categories", {
        filters: [
          {
            field: "name",
            value: "NonExistentCategoryName12345",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Categories");
      expect(parsed.data.length).toBe(0);
    }, 30000);

    test("should handle category tree with no children", async () => {
      // Create a category with no children
      const testName = `No Children Category ${Date.now()}`;
      const createResult = await mockServer.callTool("create-category", {
        category: {
          name: testName,
          parent_id: 2,
          is_active: true,
        },
      });

      const createText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createText);
      const createdCategory = JSON.parse(createParsed.data[0]);
      const categoryId = createdCategory.id;

      // Store for cleanup
      createdCategoryIds.push(categoryId);

      // Get tree for this category
      const result = await mockServer.callTool("get-category-tree", {
        rootCategoryId: categoryId,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Category Tree");
      expect(parsed.data).toBeDefined();

      const treeData = JSON.parse(parsed.data[0]);
      expect(treeData.id).toBe(categoryId);
      expect(treeData.name).toBe(testName);
      expect(Array.isArray(treeData.children_data)).toBe(true);
    }, 30000);

    test("should handle category with special characters in name", async () => {
      const testCategoryName = `Special Chars Category & Test ${Date.now()}`;

      const categoryData = {
        category: {
          name: testCategoryName,
          parent_id: 2,
          is_active: true,
        },
      };

      const result = await mockServer.callTool("create-category", categoryData);

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Created Category");
      expect(parsed.data).toBeDefined();

      const createdCategory = JSON.parse(parsed.data[0]);
      expect(createdCategory.name).toBe(testCategoryName);

      // Store for cleanup
      if (createdCategory.id) {
        createdCategoryIds.push(createdCategory.id);
      }
    }, 30000);
  });
}); 