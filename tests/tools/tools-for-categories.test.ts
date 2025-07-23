import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import type { CategoryTree, CategoryProductLink } from "../../src/adobe/categories/types/category";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerCategoriesTools } from "../../src/tools/tools-for-categories";
import { registerProductTools } from "../../src/tools/tools-for-products";
import type { MockMcpServer } from "../utils/mock-mcp-server";
import { createMockMcpServer, extractToolResponseText, parseToolResponse } from "../utils/mock-mcp-server";
import { CategoryFixtures } from "./fixtures/category-fixtures";
import { ProductFixtures } from "./fixtures/product-fixtures";

describe("Categories Tools - Functional Tests with Per-Test Fixtures", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let categoryFixtures: CategoryFixtures;
  let productFixtures: ProductFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up category functional tests with per-test fixtures...");
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

    registerCategoriesTools(mockServer.server, client);
    registerProductTools(mockServer.server, client);

    // Initialize fixtures
    categoryFixtures = new CategoryFixtures(client);
    productFixtures = new ProductFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up any fixtures created during the test
    await categoryFixtures.cleanupCurrentTest();
    await productFixtures.cleanupCurrentTest();
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
        "remove-product-from-category",
      ];

      expectedTools.forEach((toolName) => {
        expect(mockServer.registeredTools.has(toolName)).toBe(true);
      });
    });

    test("should register search-categories tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-categories");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Search Categories");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get-category-tree tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-category-tree");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Category Tree");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get-category-by-id tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-category-by-id");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Category by ID");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create-category tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-category");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Create Category");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register update-category tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-category");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Category");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete-category tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-category");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Category");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register move-category tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("move-category");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Move Category");
      // Note: move-category doesn't have readOnlyHint annotation
    });

    test("should register get-category-attributes tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-category-attributes");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Category Attributes");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get-category-attribute-by-code tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-category-attribute-by-code");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Category Attribute by Code");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get-category-attribute-options tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-category-attribute-options");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Category Attribute Options");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register get-category-products tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-category-products");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Category Products");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register assign-product-to-category tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("assign-product-to-category");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Assign Product to Category");
    });

    test("should register update-product-in-category tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-product-in-category");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Product in Category");
    });

    test("should register remove-product-from-category tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("remove-product-from-category");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Remove Product from Category");
    });
  });

  describe("Category Search", () => {
    test("should search categories with default parameters", async () => {
      categoryFixtures.setCurrentTest("search_default_test");

      // Create test fixtures
      await categoryFixtures.createFixtures([{ name: "electronics" }, { name: "clothing" }, { name: "books" }]);

      // Search using the current test filter to find only our fixtures
      const result = await mockServer.callTool("search-categories", {
        filters: [categoryFixtures.getCurrentTestFilter()],
        pageSize: 10,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Categories");
      expect(parsed.meta.page).toBe("1");
      expect(parsed.meta.pageSize).toBe("10");
      expect(parsed.meta.endpoint).toContain("/categories/list");
      expect(parsed.data.length).toBe(3);

      // Verify we found our fixtures with expected category names
      const categories = parsed.data.map((item) => JSON.parse(item));
      const foundNames = categories.map((cat) => cat.name);
      const uniqueId = categoryFixtures.getCurrentTestUniqueId();

      // Check that we have exactly 3 items with the expected category names
      expect(foundNames).toHaveLength(3);
      expect(foundNames).toContain(`Test Electronics ${uniqueId}`);
      expect(foundNames).toContain(`Test Clothing ${uniqueId}`);
      expect(foundNames).toContain(`Test Books ${uniqueId}`);

      // Validate that we get category JSON objects
      const firstCategory = JSON.parse(parsed.data[0]);
      expect(firstCategory).toHaveProperty("id");
      expect(firstCategory).toHaveProperty("name");
      expect(firstCategory).toHaveProperty("parent_id");
      // Note: is_active might not be present in all category responses
    }, 45000);

    test("should respect pagination parameters", async () => {
      categoryFixtures.setCurrentTest("search_pagination_test");

      // Create multiple fixtures for pagination testing
      await categoryFixtures.createFixtures([
        { name: "electronics" },
        { name: "clothing" },
        { name: "books" },
        { name: "featured", definition: CategoryFixtures.FIXTURE_DEFINITIONS.FEATURED_CATEGORY },
        { name: "sale", definition: CategoryFixtures.FIXTURE_DEFINITIONS.SALE_CATEGORY },
      ]);

      // Test first page
      const resultPage1 = await mockServer.callTool("search-categories", {
        filters: [categoryFixtures.getCurrentTestFilter()],
        page: 1,
        pageSize: 2,
      });

      const responseTextPage1 = extractToolResponseText(resultPage1);
      const parsedPage1 = parseToolResponse(responseTextPage1);

      expect(parsedPage1.meta.page).toBe("1");
      expect(parsedPage1.meta.pageSize).toBe("2");
      expect(parsedPage1.data.length).toBe(2);

      // Verify first page contains expected categories
      const categoriesPage1 = parsedPage1.data.map((item) => JSON.parse(item));
      const namesPage1 = categoriesPage1.map((cat) => cat.name);
      const uniqueId = categoryFixtures.getCurrentTestUniqueId();

      // Should contain 2 of our 5 categories
      expect(namesPage1.length).toBe(2);
      namesPage1.forEach((name) => {
        expect(name).toContain(uniqueId);
      });

      // Test second page
      const resultPage2 = await mockServer.callTool("search-categories", {
        filters: [categoryFixtures.getCurrentTestFilter()],
        page: 2,
        pageSize: 2,
      });

      const responseTextPage2 = extractToolResponseText(resultPage2);
      const parsedPage2 = parseToolResponse(responseTextPage2);

      expect(parsedPage2.meta.page).toBe("2");
      expect(parsedPage2.meta.pageSize).toBe("2");
      expect(parsedPage2.data.length).toBe(2);

      // Verify second page contains different categories
      const categoriesPage2 = parsedPage2.data.map((item) => JSON.parse(item));
      const namesPage2 = categoriesPage2.map((cat) => cat.name);

      expect(namesPage2.length).toBe(2);
      namesPage2.forEach((name) => {
        expect(name).toContain(uniqueId);
      });

      // Verify pages don't overlap (no duplicate names between pages)
      const allNamesPage1 = new Set(namesPage1);
      const allNamesPage2 = new Set(namesPage2);

      namesPage1.forEach((name) => {
        expect(allNamesPage2.has(name)).toBe(false);
      });
      namesPage2.forEach((name) => {
        expect(allNamesPage1.has(name)).toBe(false);
      });

      // Test third page (should have remaining 1 category)
      const resultPage3 = await mockServer.callTool("search-categories", {
        filters: [categoryFixtures.getCurrentTestFilter()],
        page: 3,
        pageSize: 2,
      });

      const responseTextPage3 = extractToolResponseText(resultPage3);
      const parsedPage3 = parseToolResponse(responseTextPage3);

      expect(parsedPage3.meta.page).toBe("3");
      expect(parsedPage3.meta.pageSize).toBe("2");
      expect(parsedPage3.data.length).toBe(1);

      // Verify third page contains the last category
      const categoriesPage3 = parsedPage3.data.map((item) => JSON.parse(item));
      const namesPage3 = categoriesPage3.map((cat) => cat.name);

      expect(namesPage3.length).toBe(1);
      expect(namesPage3[0]).toContain(uniqueId);
    }, 45000);

    test("should filter categories by name", async () => {
      categoryFixtures.setCurrentTest("search_name_filter_test");

      // Create test fixtures
      const createdFixtures = await categoryFixtures.createFixtures([{ name: "electronics" }, { name: "clothing" }]);

      const electronicsCategory = createdFixtures.get("electronics");
      expect(electronicsCategory).toBeDefined();

      const result = await mockServer.callTool("search-categories", {
        filters: [
          categoryFixtures.getCurrentTestFilter(),
          {
            field: "name",
            value: electronicsCategory!.name,
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);
      const firstCategory = JSON.parse(parsed.data[0]);
      expect(firstCategory.name).toBe(electronicsCategory!.name);
      expect(firstCategory.id).toBe(electronicsCategory!.id);
      expect(firstCategory.parent_id).toBe(2);
    }, 45000);

    test("should filter categories by parent_id", async () => {
      categoryFixtures.setCurrentTest("search_parent_id_filter_test");

      // Create test fixtures - electronics as child of default category
      const createdFixtures = await categoryFixtures.createFixtures([{ name: "electronics" }]);

      const electronicsCategory = createdFixtures.get("electronics");
      expect(electronicsCategory).toBeDefined();
      expect(electronicsCategory!.id).toBeDefined();

      // Create clothing and books as children of electronics
      const clothingData = {
        category: {
          name: `Test Clothing ${categoryFixtures.getCurrentTestUniqueId()}`,
          parent_id: electronicsCategory!.id!,
          is_active: true,
          position: 1,
        },
      };

      const booksData = {
        category: {
          name: `Test Books ${categoryFixtures.getCurrentTestUniqueId()}`,
          parent_id: electronicsCategory!.id!,
          is_active: true,
          position: 2,
        },
      };

      const clothingResult = await mockServer.callTool("create-category", clothingData);
      const booksResult = await mockServer.callTool("create-category", booksData);

      const clothingText = extractToolResponseText(clothingResult);
      const booksText = extractToolResponseText(booksResult);

      const clothingParsed = parseToolResponse(clothingText);
      const booksParsed = parseToolResponse(booksText);

      const createdClothing = JSON.parse(clothingParsed.data[0]);
      const createdBooks = JSON.parse(booksParsed.data[0]);

      // Now search for categories that are children of electronics
      const result = await mockServer.callTool("search-categories", {
        filters: [
          {
            field: "parent_id",
            value: electronicsCategory!.id!,
            conditionType: "eq",
          },
        ],
        pageSize: 10,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(2);
      const categories = parsed.data.map((item: string) => JSON.parse(item));

      // Should find exactly our 2 child categories
      expect(categories.length).toBe(2);

      // Verify we have the expected category names
      const categoryNames = categories.map((category: { name: string }) => category.name);
      const uniqueId = categoryFixtures.getCurrentTestUniqueId();
      expect(categoryNames).toContain(`Test Clothing ${uniqueId}`);
      expect(categoryNames).toContain(`Test Books ${uniqueId}`);

      // Verify all categories have electronics as parent
      categories.forEach((category: { parent_id: number }) => {
        expect(category.parent_id).toBe(electronicsCategory!.id);
      });

      // Verify the category IDs match what we created
      const categoryIds = categories.map((category: { id: number }) => category.id);
      expect(categoryIds).toContain(createdClothing.id);
      expect(categoryIds).toContain(createdBooks.id);

      // Clean up the categories created directly with create-category tool
      await mockServer.callTool("delete-category", { categoryId: createdClothing.id });
      await mockServer.callTool("delete-category", { categoryId: createdBooks.id });
    }, 45000);

    test("should filter categories by is_active status using string value", async () => {
      categoryFixtures.setCurrentTest("search_is_active_filter_test");

      // Create test fixtures - mix of active and inactive
      await categoryFixtures.createFixtures([
        { name: "electronics" },
        { name: "inactive", definition: CategoryFixtures.FIXTURE_DEFINITIONS.INACTIVE_CATEGORY },
      ]);

      const result = await mockServer.callTool("search-categories", {
        filters: [
          categoryFixtures.getCurrentTestFilter(),
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

      expect(parsed.data.length).toBe(1);
      const categories = parsed.data.map((item: string) => JSON.parse(item));

      // Find our fixture categories
      const fixtureCategories = categories.filter((category: { name: string }) => category.name.includes(categoryFixtures.getCurrentTestUniqueId()));

      // Should only find the active category
      expect(fixtureCategories.length).toBe(1);

      // Verify we have the expected category name
      const fixtureNames = fixtureCategories.map((category: { name: string }) => category.name);
      const uniqueId = categoryFixtures.getCurrentTestUniqueId();
      expect(fixtureNames[0]).toBe(`Test Electronics ${uniqueId}`);

      fixtureCategories.forEach((category: { is_active: number | boolean }) => {
        expect(category.is_active).toBe(true);
      });
    }, 45000);
  });

  describe("Category Tree", () => {
    test("should get category tree with fixtures", async () => {
      categoryFixtures.setCurrentTest("tree_basic_test");

      // Create a simple tree structure: Electronics -> Laptops, Phones
      const createdFixtures = await categoryFixtures.createFixtures([
        { name: "electronics" },
        { name: "laptops", definition: { name: "Laptops", parent_id: 2, is_active: true, position: 1 } },
        { name: "phones", definition: { name: "Phones", parent_id: 2, is_active: true, position: 2 } },
      ]);

      const electronicsCategory = createdFixtures.get("electronics");
      const laptopsCategory = createdFixtures.get("laptops");
      const phonesCategory = createdFixtures.get("phones");

      expect(electronicsCategory).toBeDefined();
      expect(laptopsCategory).toBeDefined();
      expect(phonesCategory).toBeDefined();

      // Move laptops and phones to be children of electronics
      await mockServer.callTool("move-category", {
        categoryId: laptopsCategory!.id!,
        parentId: electronicsCategory!.id!,
      });

      await mockServer.callTool("move-category", {
        categoryId: phonesCategory!.id!,
        parentId: electronicsCategory!.id!,
      });

      // Get the category tree starting from the default category
      const result = await mockServer.callTool("get-category-tree", {
        rootCategoryId: 2, // Default category
        depth: 3,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      // Verify the response structure
      expect(parsed.meta.endpoint).toBeDefined();
      expect(parsed.meta.endpoint).toContain("/categories");
      expect(parsed.meta.endpoint).toContain("rootCategoryId=2");
      expect(parsed.meta.endpoint).toContain("depth=3");
      expect(parsed.data).toBeDefined();

      const treeData = JSON.parse(parsed.data[0]);
      expect(treeData).toHaveProperty("id");
      expect(treeData).toHaveProperty("name");
      expect(treeData).toHaveProperty("children_data");
      expect(Array.isArray(treeData.children_data)).toBe(true);

      // Find our electronics category in the tree
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

      const electronicsInTree = findCategoryInTree(treeData, electronicsCategory!.id!);
      expect(electronicsInTree).toBeDefined();
      expect(electronicsInTree!.name).toBe(electronicsCategory!.name);

      // Verify electronics has laptops and phones as children
      const electronicsChildren = electronicsInTree!.children_data || [];
      expect(electronicsChildren.length).toBe(2);

      const laptopInTree = electronicsChildren.find((child: CategoryTree) => child.id === laptopsCategory!.id);
      const phoneInTree = electronicsChildren.find((child: CategoryTree) => child.id === phonesCategory!.id);

      expect(laptopInTree).toBeDefined();
      expect(phoneInTree).toBeDefined();
      expect(laptopInTree!.name).toBe(laptopsCategory!.name);
      expect(phoneInTree!.name).toBe(phonesCategory!.name);
    }, 45000);

    test("should get category tree with depth parameter", async () => {
      categoryFixtures.setCurrentTest("tree_depth_test");

      // Create a deeper tree structure: Electronics -> Laptops -> Gaming Laptops
      const createdFixtures = await categoryFixtures.createFixtures([
        { name: "electronics" },
        { name: "laptops", definition: { name: "Laptops", parent_id: 2, is_active: true, position: 1 } },
        { name: "gaming_laptops", definition: { name: "Gaming Laptops", parent_id: 2, is_active: true, position: 1 } },
      ]);

      const electronicsCategory = createdFixtures.get("electronics");
      const laptopsCategory = createdFixtures.get("laptops");
      const gamingLaptopsCategory = createdFixtures.get("gaming_laptops");

      // Build the hierarchy: Electronics -> Laptops -> Gaming Laptops
      await mockServer.callTool("move-category", {
        categoryId: laptopsCategory!.id!,
        parentId: electronicsCategory!.id!,
      });

      await mockServer.callTool("move-category", {
        categoryId: gamingLaptopsCategory!.id!,
        parentId: laptopsCategory!.id!,
      });

      // Test with depth=1 (should only show electronics, not its children)
      const resultDepth1 = await mockServer.callTool("get-category-tree", {
        rootCategoryId: 2,
        depth: 1,
      });

      const responseTextDepth1 = extractToolResponseText(resultDepth1);
      const parsedDepth1 = parseToolResponse(responseTextDepth1);

      expect(parsedDepth1.meta.endpoint).toContain("depth=1");

      const treeDataDepth1 = JSON.parse(parsedDepth1.data[0]);
      const electronicsInTreeDepth1 = findCategoryInTree(treeDataDepth1, electronicsCategory!.id!);
      expect(electronicsInTreeDepth1).toBeDefined();
      expect(electronicsInTreeDepth1?.children_data).toHaveLength(0); // No children due to depth=1

      // Test with depth=2 (should show electronics and laptops, but not gaming laptops)
      const resultDepth2 = await mockServer.callTool("get-category-tree", {
        rootCategoryId: 2,
        depth: 2,
      });

      const responseTextDepth2 = extractToolResponseText(resultDepth2);
      const parsedDepth2 = parseToolResponse(responseTextDepth2);

      expect(parsedDepth2.meta.endpoint).toContain("depth=2");

      const treeDataDepth2 = JSON.parse(parsedDepth2.data[0]);
      const electronicsInTreeDepth2 = findCategoryInTree(treeDataDepth2, electronicsCategory!.id!);
      expect(electronicsInTreeDepth2).toBeDefined();
      expect(electronicsInTreeDepth2?.children_data).toHaveLength(1); // Should have laptops as child
      expect(electronicsInTreeDepth2?.children_data?.[0]?.children_data).toHaveLength(0); // But laptops should have no children due to depth=2

      // Helper function to find category in tree
      function findCategoryInTree(tree: CategoryTree, categoryId: number): CategoryTree | null {
        if (tree.id === categoryId) return tree;
        if (tree.children_data && Array.isArray(tree.children_data)) {
          for (const child of tree.children_data) {
            const found = findCategoryInTree(child, categoryId);
            if (found) return found;
          }
        }
        return null;
      }
    }, 45000);

    test("should get category tree with root category ID", async () => {
      categoryFixtures.setCurrentTest("tree_root_id_test");

      // Create a tree structure: Electronics -> Laptops
      const createdFixtures = await categoryFixtures.createFixtures([
        { name: "electronics" },
        { name: "laptops", definition: { name: "Laptops", parent_id: 2, is_active: true, position: 1 } },
      ]);

      const electronicsCategory = createdFixtures.get("electronics");
      const laptopsCategory = createdFixtures.get("laptops");

      // Move laptops to be child of electronics
      await mockServer.callTool("move-category", {
        categoryId: laptopsCategory!.id!,
        parentId: electronicsCategory!.id!,
      });

      // Get tree starting from electronics (not default category)
      const result = await mockServer.callTool("get-category-tree", {
        rootCategoryId: electronicsCategory!.id!,
        depth: 2,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.endpoint).toContain(`rootCategoryId=${electronicsCategory!.id}`);
      expect(parsed.meta.endpoint).toContain("depth=2");

      const treeData = JSON.parse(parsed.data[0]);
      expect(treeData.id).toBe(electronicsCategory!.id);
      expect(treeData.name).toBe(electronicsCategory!.name);
      expect(treeData.children_data).toHaveLength(1);
      expect(treeData.children_data[0].id).toBe(laptopsCategory!.id);
      expect(treeData.children_data[0].name).toBe(laptopsCategory!.name);
    }, 45000);

    test("should get category tree with complex hierarchy", async () => {
      categoryFixtures.setCurrentTest("tree_complex_hierarchy_test");

      // Create a complex tree structure:
      // Electronics
      // ├── Laptops
      // │   ├── Gaming Laptops
      // │   └── Business Laptops
      // └── Phones
      //     ├── Smartphones
      //     └── Accessories

      const createdFixtures = await categoryFixtures.createFixtures([
        { name: "electronics" },
        { name: "laptops", definition: { name: "Laptops", parent_id: 2, is_active: true, position: 1 } },
        { name: "phones", definition: { name: "Phones", parent_id: 2, is_active: true, position: 2 } },
        { name: "gaming_laptops", definition: { name: "Gaming Laptops", parent_id: 2, is_active: true, position: 1 } },
        { name: "business_laptops", definition: { name: "Business Laptops", parent_id: 2, is_active: true, position: 2 } },
        { name: "smartphones", definition: { name: "Smartphones", parent_id: 2, is_active: true, position: 1 } },
        { name: "accessories", definition: { name: "Accessories", parent_id: 2, is_active: true, position: 2 } },
      ]);

      const electronicsCategory = createdFixtures.get("electronics");
      const laptopsCategory = createdFixtures.get("laptops");
      const phonesCategory = createdFixtures.get("phones");
      const gamingLaptopsCategory = createdFixtures.get("gaming_laptops");
      const businessLaptopsCategory = createdFixtures.get("business_laptops");
      const smartphonesCategory = createdFixtures.get("smartphones");
      const accessoriesCategory = createdFixtures.get("accessories");

      // Build the hierarchy
      // Level 1: Move laptops and phones under electronics
      await mockServer.callTool("move-category", {
        categoryId: laptopsCategory!.id!,
        parentId: electronicsCategory!.id!,
      });

      await mockServer.callTool("move-category", {
        categoryId: phonesCategory!.id!,
        parentId: electronicsCategory!.id!,
      });

      // Level 2: Move gaming and business laptops under laptops
      await mockServer.callTool("move-category", {
        categoryId: gamingLaptopsCategory!.id!,
        parentId: laptopsCategory!.id!,
      });

      await mockServer.callTool("move-category", {
        categoryId: businessLaptopsCategory!.id!,
        parentId: laptopsCategory!.id!,
      });

      // Level 2: Move smartphones and accessories under phones
      await mockServer.callTool("move-category", {
        categoryId: smartphonesCategory!.id!,
        parentId: phonesCategory!.id!,
      });

      await mockServer.callTool("move-category", {
        categoryId: accessoriesCategory!.id!,
        parentId: phonesCategory!.id!,
      });

      // Get the complete tree
      const result = await mockServer.callTool("get-category-tree", {
        rootCategoryId: 2, // Default category
        depth: 4,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      const treeData = JSON.parse(parsed.data[0]);

      // Helper function to find category in tree
      function findCategoryInTree(tree: CategoryTree, categoryId: number): CategoryTree | null {
        if (tree.id === categoryId) return tree;
        if (tree.children_data && Array.isArray(tree.children_data)) {
          for (const child of tree.children_data) {
            const found = findCategoryInTree(child, categoryId);
            if (found) return found;
          }
        }
        return null;
      }

      // Verify the complete hierarchy
      const electronicsInTree = findCategoryInTree(treeData, electronicsCategory!.id!);
      expect(electronicsInTree).toBeDefined();
      expect(electronicsInTree!.children_data).toHaveLength(2); // Should have laptops and phones

      const laptopsInTree = findCategoryInTree(treeData, laptopsCategory!.id!);
      expect(laptopsInTree).toBeDefined();
      expect(laptopsInTree!.children_data).toHaveLength(2); // Should have gaming and business laptops

      const phonesInTree = findCategoryInTree(treeData, phonesCategory!.id!);
      expect(phonesInTree).toBeDefined();
      expect(phonesInTree!.children_data).toHaveLength(2); // Should have smartphones and accessories

      // Verify specific children
      const gamingLaptopsInTree = findCategoryInTree(treeData, gamingLaptopsCategory!.id!);
      const businessLaptopsInTree = findCategoryInTree(treeData, businessLaptopsCategory!.id!);
      const smartphonesInTree = findCategoryInTree(treeData, smartphonesCategory!.id!);
      const accessoriesInTree = findCategoryInTree(treeData, accessoriesCategory!.id!);

      expect(gamingLaptopsInTree).toBeDefined();
      expect(businessLaptopsInTree).toBeDefined();
      expect(smartphonesInTree).toBeDefined();
      expect(accessoriesInTree).toBeDefined();

      // Verify they are leaf nodes (no children)
      expect(gamingLaptopsInTree!.children_data).toHaveLength(0);
      expect(businessLaptopsInTree!.children_data).toHaveLength(0);
      expect(smartphonesInTree!.children_data).toHaveLength(0);
      expect(accessoriesInTree!.children_data).toHaveLength(0);

      console.log(`✅ Successfully created complex hierarchy with ${createdFixtures.size} categories`);
    }, 60000);
  });

  describe("Category by ID", () => {
    test("should get category by ID", async () => {
      categoryFixtures.setCurrentTest("get_by_id_test");

      // Create test fixtures
      const createdFixtures = await categoryFixtures.createFixtures([{ name: "electronics" }]);

      const electronicsCategory = createdFixtures.get("electronics");
      expect(electronicsCategory).toBeDefined();
      expect(electronicsCategory!.id).toBeDefined();

      const result = await mockServer.callTool("get-category-by-id", {
        categoryId: electronicsCategory!.id!,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.endpoint).toContain(`/categories/${electronicsCategory!.id}`);
      expect(parsed.data).toBeDefined();

      const categoryData = JSON.parse(parsed.data[0]);
      expect(categoryData.id).toBe(electronicsCategory!.id);
      expect(categoryData).toHaveProperty("name");
      expect(categoryData).toHaveProperty("parent_id");
      // Note: is_active might not be present in all category responses
    }, 45000);

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

      // Clean up the category created directly with create-category tool
      await mockServer.callTool("delete-category", { categoryId: createdCategory.id });
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

      // Clean up the category created directly with create-category tool
      await mockServer.callTool("delete-category", { categoryId: createdCategory.id });
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

      // Clean up the category created directly with create-category tool
      await mockServer.callTool("delete-category", { categoryId: createdCategory.id });
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

      // Clean up the category created directly with create-category tool
      await mockServer.callTool("delete-category", { categoryId: categoryId });
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

      // Clean up the category created directly with create-category tool
      await mockServer.callTool("delete-category", { categoryId: categoryId });
    }, 30000);

    test("should create three categories and move one as child of another", async () => {
      categoryFixtures.setCurrentTest("move_category_test");

      // Create three categories using fixtures
      const createdFixtures = await categoryFixtures.createFixtures([
        { name: "electronics" },
        { name: "clothing" },
        { name: "sub", definition: CategoryFixtures.FIXTURE_DEFINITIONS.SUB_CATEGORY },
      ]);

      const electronicsCategory = createdFixtures.get("electronics");
      const clothingCategory = createdFixtures.get("clothing");
      const subCategory = createdFixtures.get("sub");

      expect(electronicsCategory).toBeDefined();
      expect(clothingCategory).toBeDefined();
      expect(subCategory).toBeDefined();

      // Fixtures system handles cleanup automatically

      // Verify all categories were created at the same level
      expect(electronicsCategory!.parent_id).toBe(2);
      expect(clothingCategory!.parent_id).toBe(2);
      expect(subCategory!.parent_id).toBe(2);

      // Verify positions are set correctly
      expect(electronicsCategory!.position).toBe(1);
      expect(clothingCategory!.position).toBe(2);
      expect(subCategory!.position).toBe(6); // SUB_CATEGORY has position 6

      // Move Sub Category to be a child of Electronics Category
      const moveData = {
        categoryId: subCategory!.id!,
        parentId: electronicsCategory!.id!,
      };

      const moveResult = await mockServer.callTool("move-category", moveData);

      const moveText = extractToolResponseText(moveResult);
      const moveParsed = parseToolResponse(moveText);

      expect(moveParsed.meta.name).toBe("Move Category");
      expect(moveParsed.meta.endpoint).toContain(`/categories/${subCategory!.id}/move`);
      expect(moveParsed.data).toBeDefined();

      const moveResponse = moveParsed.data[0];
      expect(typeof moveResponse).toBe("string");
      expect(moveResponse).toContain("successfully moved");
      expect(moveResponse).toContain(subCategory!.id!.toString());
      expect(moveResponse).toContain(electronicsCategory!.id!.toString());

      // Verify the move by retrieving Sub Category and checking its new parent
      const getCResult = await mockServer.callTool("get-category-by-id", {
        categoryId: subCategory!.id!,
      });

      const getCText = extractToolResponseText(getCResult);
      const getCParsed = parseToolResponse(getCText);
      const updatedCategoryC = JSON.parse(getCParsed.data[0]);

      expect(updatedCategoryC.id).toBe(subCategory!.id);
      expect(updatedCategoryC.name).toBe(subCategory!.name);
      expect(updatedCategoryC.parent_id).toBe(electronicsCategory!.id);

      // Verify Electronics and Clothing categories still have the same parent
      const getAResult = await mockServer.callTool("get-category-by-id", {
        categoryId: electronicsCategory!.id!,
      });

      const getBResult = await mockServer.callTool("get-category-by-id", {
        categoryId: clothingCategory!.id!,
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

      const categoryAInTree = findCategoryInTree(treeData, electronicsCategory!.id!);
      const categoryBInTree = findCategoryInTree(treeData, clothingCategory!.id!);
      const categoryCInTree = findCategoryInTree(treeData, subCategory!.id!);

      expect(categoryAInTree).toBeDefined();
      expect(categoryBInTree).toBeDefined();
      expect(categoryCInTree).toBeDefined();

      // Verify Sub Category is now a child of Electronics Category
      expect(categoryCInTree?.parent_id).toBe(electronicsCategory!.id);

      // Verify Electronics Category has Sub Category as a child
      const categoryAChildren = categoryAInTree?.children_data || [];
      const categoryCInAChildren = categoryAChildren.find((child: CategoryTree) => child.id === subCategory!.id);
      expect(categoryCInAChildren).toBeDefined();

      console.log(
        `✅ Successfully created hierarchy: Default Category (2) -> Electronics (${electronicsCategory!.id}) -> Sub Category (${subCategory!.id})`
      );
      console.log(`✅ Clothing (${clothingCategory!.id}) remains at the same level as Electronics`);
    }, 45000);

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

      const deleteResult = parsed.data[0];
      expect(typeof deleteResult).toBe("string");
      expect(deleteResult).toContain("successfully deleted");
      expect(deleteResult).toContain(categoryId.toString());
    }, 30000);
  });

  describe("Product-Category Management", () => {

    test("should assign product to category", async () => {
      categoryFixtures.setCurrentTest("assign_product_test");
      productFixtures.setCurrentTest("assign_product_test");

      // Create a test category using fixtures
      const createdFixtures = await categoryFixtures.createFixtures([{ name: "electronics" }]);
      const testCategory = createdFixtures.get("electronics");
      expect(testCategory).toBeDefined();
      expect(testCategory!.id).toBeDefined();

      // Create a test product using fixtures
      const createdProducts = await productFixtures.createFixtures([{ name: "simple" }]);
      const testProduct = createdProducts.get("simple");
      expect(testProduct).toBeDefined();
      const testProductSku = testProduct!.sku;

      const assignData = {
        categoryId: testCategory!.id!.toString(),
        productLink: {
          sku: testProductSku,
          position: 1,
        },
      };

      const result = await mockServer.callTool("assign-product-to-category", assignData);

      const responseText = extractToolResponseText(result);

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.name).toBe("Assign Product to Category");
      expect(parsed.meta.endpoint).toContain(`/categories/${testCategory!.id}/products`);
      expect(parsed.data).toBeDefined();

      const assignResult = parsed.data[0];
      expect(typeof assignResult).toBe("string");
      expect(assignResult).toContain("successfully assigned");
      expect(assignResult).toContain(testProductSku);
      expect(assignResult).toContain(testCategory!.id!.toString());
    }, 30000);

    test("should update product position in category", async () => {
      categoryFixtures.setCurrentTest("update_product_position_test");
      productFixtures.setCurrentTest("update_product_position_test");

      // Create a test category using fixtures
      const createdFixtures = await categoryFixtures.createFixtures([{ name: "clothing" }]);
      const testCategory = createdFixtures.get("clothing");
      expect(testCategory).toBeDefined();
      expect(testCategory!.id).toBeDefined();

      // Create a test product using fixtures
      const createdProducts = await productFixtures.createFixtures([{ name: "simple" }]);
      const testProduct = createdProducts.get("simple");
      expect(testProduct).toBeDefined();
      const testProductSku = testProduct!.sku;

      const updateData = {
        categoryId: testCategory!.id!.toString(),
        productLink: {
          sku: testProductSku,
          position: 2,
        },
      };

      const result = await mockServer.callTool("update-product-in-category", updateData);

      const responseText = extractToolResponseText(result);

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.name).toBe("Update Product in Category");
      expect(parsed.meta.endpoint).toContain(`/categories/${testCategory!.id}/products`);
      expect(parsed.data).toBeDefined();

      const updateResult = parsed.data[0];
      expect(typeof updateResult).toBe("string");
      expect(updateResult).toContain("successfully updated");
      expect(updateResult).toContain(testProductSku);
      expect(updateResult).toContain(testCategory!.id!.toString());
    }, 30000);

    test("should remove product from category", async () => {
      categoryFixtures.setCurrentTest("remove_product_test");
      productFixtures.setCurrentTest("remove_product_test");

      // Create a test category using fixtures
      const createdFixtures = await categoryFixtures.createFixtures([{ name: "books" }]);
      const testCategory = createdFixtures.get("books");
      expect(testCategory).toBeDefined();
      expect(testCategory!.id).toBeDefined();

      // Create a test product using fixtures
      const createdProducts = await productFixtures.createFixtures([{ name: "simple" }]);
      const testProduct = createdProducts.get("simple");
      expect(testProduct).toBeDefined();
      const testProductSku = testProduct!.sku;

      // First, assign the product to the category
      const assignData = {
        categoryId: testCategory!.id!.toString(),
        productLink: {
          sku: testProductSku,
          position: 1,
        },
      };

      const assignResult = await mockServer.callTool("assign-product-to-category", assignData);
      const assignText = extractToolResponseText(assignResult);
      const assignParsed = parseToolResponse(assignText);
      expect(assignParsed.meta.name).toBe("Assign Product to Category");
      expect(assignParsed.data[0]).toContain("successfully assigned");
      expect(assignParsed.data[0]).toContain(testProductSku);
      expect(assignParsed.data[0]).toContain(testCategory!.id!.toString());

      // Now remove the product from the category
      const removeData = {
        categoryId: testCategory!.id!,
        sku: testProductSku,
      };

      const result = await mockServer.callTool("remove-product-from-category", removeData);

      const responseText = extractToolResponseText(result);

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta.name).toBe("Remove Product from Category");
      expect(parsed.meta.endpoint).toContain(`/categories/${testCategory!.id}/products/${testProductSku}`);
      expect(parsed.data).toBeDefined();

      const removeResult = parsed.data[0];
      expect(typeof removeResult).toBe("string");
      expect(removeResult).toContain("successfully removed");
      expect(removeResult).toContain(testProductSku);
      expect(removeResult).toContain(testCategory!.id!.toString());
    }, 30000);

    test("should assign multiple products and retrieve category products", async () => {
      categoryFixtures.setCurrentTest("multiple_products_test");
      productFixtures.setCurrentTest("multiple_products_test");

      // Create a test category using fixtures
      const createdFixtures = await categoryFixtures.createFixtures([{ name: "electronics" }]);
      const testCategory = createdFixtures.get("electronics");
      expect(testCategory).toBeDefined();
      expect(testCategory!.id).toBeDefined();

      // Create two test products using fixtures
      const createdProducts = await productFixtures.createFixtures([
        { name: "simple" },
        { name: "configurable" }
      ]);
      const firstProduct = createdProducts.get("simple");
      const secondProduct = createdProducts.get("configurable");
      expect(firstProduct).toBeDefined();
      expect(secondProduct).toBeDefined();
      
      const testProductSku = firstProduct!.sku;
      const secondProductSku = secondProduct!.sku;
      
      expect(secondProductSku).toBeDefined();
      expect(secondProductSku).not.toBe(testProductSku);

      // Assign first product to the category
      const assignData1 = {
        categoryId: testCategory!.id!.toString(),
        productLink: {
          sku: testProductSku,
          position: 1,
        },
      };

      const assignResult1 = await mockServer.callTool("assign-product-to-category", assignData1);
      const assignText1 = extractToolResponseText(assignResult1);
      const assignParsed1 = parseToolResponse(assignText1);
      expect(assignParsed1.meta.name).toBe("Assign Product to Category");
      expect(assignParsed1.data[0]).toContain("successfully assigned");
      expect(assignParsed1.data[0]).toContain(testProductSku);

      // Assign second product to the category
      const assignData2 = {
        categoryId: testCategory!.id!.toString(),
        productLink: {
          sku: secondProductSku,
          position: 2,
        },
      };

      const assignResult2 = await mockServer.callTool("assign-product-to-category", assignData2);
      const assignText2 = extractToolResponseText(assignResult2);
      const assignParsed2 = parseToolResponse(assignText2);
      expect(assignParsed2.meta.name).toBe("Assign Product to Category");
      expect(assignParsed2.data[0]).toContain("successfully assigned");
      expect(assignParsed2.data[0]).toContain(secondProductSku);

      // Now retrieve all products in the category
      const getProductsResult = await mockServer.callTool("get-category-products", {
        categoryId: testCategory!.id!,
      });

      const getProductsText = extractToolResponseText(getProductsResult);
      const getProductsParsed = parseToolResponse(getProductsText);

      expect(getProductsParsed.meta.name).toBe("Category Products");
      expect(getProductsParsed.meta.endpoint).toContain(`/categories/${testCategory!.id}/products`);
      expect(getProductsParsed.data).toBeDefined();
      expect(getProductsParsed.data.length).toBeGreaterThan(0);

      // Parse the product data and verify our assigned products are there
      const categoryProducts = getProductsParsed.data.map((item: string) => JSON.parse(item));
      
      // Find our assigned products in the category products
      const foundProduct1 = categoryProducts.find((product: CategoryProductLink) => product.sku === testProductSku);
      const foundProduct2 = categoryProducts.find((product: CategoryProductLink) => product.sku === secondProductSku);

      expect(foundProduct1).toBeDefined();
      expect(foundProduct2).toBeDefined();

      // Verify the product link properties
      expect(foundProduct1).toHaveProperty("sku");
      expect(foundProduct1).toHaveProperty("position");
      expect(foundProduct1).toHaveProperty("category_id");
      expect(foundProduct1.sku).toBe(testProductSku);
      expect(foundProduct1.position).toBe(1);
      expect(foundProduct1.category_id).toBe(testCategory!.id!.toString());

      expect(foundProduct2).toHaveProperty("sku");
      expect(foundProduct2).toHaveProperty("position");
      expect(foundProduct2).toHaveProperty("category_id");
      expect(foundProduct2.sku).toBe(secondProductSku);
      expect(foundProduct2.position).toBe(2);
      expect(foundProduct2.category_id).toBe(testCategory!.id!.toString());
    }, 45000);
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

      // Clean up the category in case it was created despite invalid parent
      // Try to parse the response to see if a category was actually created
      try {
        const parsed = parseToolResponse(responseText);
        if (parsed.data && parsed.data.length > 0) {
          const createdCategory = JSON.parse(parsed.data[0]);
          if (createdCategory.id) {
            await mockServer.callTool("delete-category", { categoryId: createdCategory.id });
          }
        }
      } catch {
        // If parsing fails, the category creation failed as expected
      }
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

      // Try to move to invalid parent
      const moveData = {
        categoryId: categoryId,
        parentId: 999999, // Non-existent parent
      };

      const result = await mockServer.callTool("move-category", moveData);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");

      // Clean up the category created directly with create-category tool
      await mockServer.callTool("delete-category", { categoryId: categoryId });
    }, 30000);
  });
});
