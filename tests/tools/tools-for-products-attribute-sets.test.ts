import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductAttributeSetsTools } from "../../src/tools/tools-for-products-attribute-sets";
import { registerProductAttributesTools } from "../../src/tools/tools-for-products-attributes";
import type { MockMcpServer } from "../utils/mock-mcp-server";
import { createMockMcpServer, extractToolResponseText, parseToolResponse } from "../utils/mock-mcp-server";
import { ProductAttributeSetsFixtures } from "./fixtures/product-attribute-sets-fixtures";

describe("Products Attribute Sets Tools - Functional Tests with Per-Test Fixtures", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let fixtures: ProductAttributeSetsFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up comprehensive functional tests for products attribute sets with per-test fixtures...");
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
    registerProductAttributeSetsTools(mockServer.server, client);
    registerProductAttributesTools(mockServer.server, client);

    // Initialize fixtures
    fixtures = new ProductAttributeSetsFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up any fixtures created during the test
    await fixtures.cleanupCurrentTest();
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

    test("should register get-attributes-from-set tool", () => {
      expect(mockServer.registeredTools.has("get-attributes-from-set")).toBe(true);

      const tool = mockServer.registeredTools.get("get-attributes-from-set");
      expect(tool.definition.title).toBe("Get Attributes From Set");
      expect(tool.definition.description).toContain("Get all attributes from an attribute set by its ID");
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

    test("should register assign-attribute-to-set-group tool", () => {
      expect(mockServer.registeredTools.has("assign-attribute-to-set-group")).toBe(true);
      const tool = mockServer.registeredTools.get("assign-attribute-to-set-group");
      expect(tool.definition.title).toBe("Assign Attribute to Set and Group");
      expect(tool.definition.description).toContain("Assign an attribute to an attribute set and group");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });

    test("should register search-attribute-groups tool", () => {
      expect(mockServer.registeredTools.has("search-attribute-groups")).toBe(true);
      const tool = mockServer.registeredTools.get("search-attribute-groups");
      expect(tool.definition.title).toBe("Search Attribute Groups");
      expect(tool.definition.description).toContain("Search for attribute groups in an attribute set in Adobe Commerce.");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(true);
    });

    test("should register create-attribute-group tool", () => {
      expect(mockServer.registeredTools.has("create-attribute-group")).toBe(true);
      const tool = mockServer.registeredTools.get("create-attribute-group");
      expect(tool.definition.title).toBe("Create Attribute Group");
      expect(tool.definition.description).toContain("Create a new attribute group in an attribute set in Adobe Commerce.");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });

    test("should register delete-attribute-group tool", () => {
      expect(mockServer.registeredTools.has("delete-attribute-group")).toBe(true);
      const tool = mockServer.registeredTools.get("delete-attribute-group");
      expect(tool.definition.title).toBe("Delete Attribute Group");
      expect(tool.definition.description).toContain("Delete an attribute group by its ID");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });

    test("should register update-attribute-group tool", () => {
      expect(mockServer.registeredTools.has("update-attribute-group")).toBe(true);
      const tool = mockServer.registeredTools.get("update-attribute-group");
      expect(tool.definition.title).toBe("Update Attribute Group");
      expect(tool.definition.description).toContain("Update an attribute group by its ID");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });
  });

  describe("Search Attribute Sets Tool", () => {
    test("should search and find fixture attribute sets using like filter", async () => {
      fixtures.setCurrentTest("search_default_test");
      
      // Create test fixtures
      await fixtures.createFixtureSets([
        { name: "electronics", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.ELECTRONICS_SET },
        { name: "clothing", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.CLOTHING_SET },
        { name: "books", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.BOOKS_SET }
      ]);

      // Search using the current test filter to find only our fixtures
      const result = await mockServer.callTool("search-attribute-sets", {
        filters: [fixtures.getCurrentTestSetFilter()],
        pageSize: 10
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(parsed.data.length).toBe(3);

      // Verify we found our fixtures with hardcoded attribute set names
      const attributeSets = parsed.data.map(item => JSON.parse(item));
      const foundNames = attributeSets.map(set => set.attribute_set_name);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      // Check that we have exactly 3 items with the expected attribute set names
      expect(foundNames).toHaveLength(3);
      expect(foundNames).toContain(`Set electronics ${uniqueId}`);
      expect(foundNames).toContain(`Set clothing ${uniqueId}`);
      expect(foundNames).toContain(`Set books ${uniqueId}`);
    }, 45000);

    test("should filter attribute sets by entity_type_id", async () => {
      fixtures.setCurrentTest("search_entity_type_test");
      
      // Create multiple attribute sets for this test
      await fixtures.createFixtureSets([
        { name: "electronics", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.ELECTRONICS_SET },
        { name: "clothing", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.CLOTHING_SET }
      ]);

      const result = await mockServer.callTool("search-attribute-sets", {
        filters: [
          fixtures.getCurrentTestSetFilter(),
          {
            field: "entity_type_id",
            value: 4, // Product entity type
            conditionType: "eq",
          }
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.data.length).toBe(2);

      // Verify all returned attribute sets have entity_type_id = 4
      const attributeSets = parsed.data.map(item => JSON.parse(item));
      attributeSets.forEach(set => {
        expect(set.entity_type_id).toBe(4);
        expect(set.attribute_set_name).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the specific attribute set names that should be found
      const foundNames = attributeSets.map(set => set.attribute_set_name);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      expect(foundNames).toContain(`Set electronics ${uniqueId}`);
      expect(foundNames).toContain(`Set clothing ${uniqueId}`);
    }, 45000);

    test("should handle pagination", async () => {
      fixtures.setCurrentTest("search_pagination_test");
      
      // Create multiple attribute sets for pagination testing
      await fixtures.createFixtureSets([
        { name: "electronics", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.ELECTRONICS_SET },
        { name: "clothing", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.CLOTHING_SET },
        { name: "books", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.BOOKS_SET },
        { name: "furniture", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.FURNITURE_SET },
        { name: "sports", definition: ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS.SPORTS_SET }
      ]);

      const uniqueId = fixtures.getCurrentTestUniqueId();

      // Test first page
      const resultPage1 = await mockServer.callTool("search-attribute-sets", {
        filters: [fixtures.getCurrentTestSetFilter()],
        page: 1,
        pageSize: 2,
      });

      const responseTextPage1 = extractToolResponseText(resultPage1);
      const parsedPage1 = parseToolResponse(responseTextPage1);
      
      expect(parsedPage1.meta.page).toBe("1");
      expect(parsedPage1.meta.pageSize).toBe("2");
      expect(parsedPage1.data.length).toBe(2);

      // Verify first page contains expected attribute sets
      const attributeSetsPage1 = parsedPage1.data.map(item => JSON.parse(item));
      const namesPage1 = attributeSetsPage1.map(set => set.attribute_set_name);
      
      // Should contain 2 of our 5 attribute sets
      expect(namesPage1.length).toBe(2);
      namesPage1.forEach(name => {
        expect(name).toContain(uniqueId);
      });

      // Test second page
      const resultPage2 = await mockServer.callTool("search-attribute-sets", {
        filters: [fixtures.getCurrentTestSetFilter()],
        page: 2,
        pageSize: 2,
      });

      const responseTextPage2 = extractToolResponseText(resultPage2);
      const parsedPage2 = parseToolResponse(responseTextPage2);
      
      expect(parsedPage2.meta.page).toBe("2");
      expect(parsedPage2.meta.pageSize).toBe("2");
      expect(parsedPage2.data.length).toBe(2);

      // Verify second page contains different attribute sets
      const attributeSetsPage2 = parsedPage2.data.map(item => JSON.parse(item));
      const namesPage2 = attributeSetsPage2.map(set => set.attribute_set_name);
      
      expect(namesPage2.length).toBe(2);
      namesPage2.forEach(name => {
        expect(name).toContain(uniqueId);
      });

      // Verify pages don't overlap (no duplicate names between pages)
      const allNamesPage1 = new Set(namesPage1);
      const allNamesPage2 = new Set(namesPage2);
      
      namesPage1.forEach(name => {
        expect(allNamesPage2.has(name)).toBe(false);
      });
      namesPage2.forEach(name => {
        expect(allNamesPage1.has(name)).toBe(false);
      });

      // Test third page (should have remaining 1 attribute set)
      const resultPage3 = await mockServer.callTool("search-attribute-sets", {
        filters: [fixtures.getCurrentTestSetFilter()],
        page: 3,
        pageSize: 2,
      });

      const responseTextPage3 = extractToolResponseText(resultPage3);
      const parsedPage3 = parseToolResponse(responseTextPage3);
      
      expect(parsedPage3.meta.page).toBe("3");
      expect(parsedPage3.meta.pageSize).toBe("2");
      expect(parsedPage3.data.length).toBe(1);

      // Verify third page contains the last attribute set
      const attributeSetsPage3 = parsedPage3.data.map(item => JSON.parse(item));
      const namesPage3 = attributeSetsPage3.map(set => set.attribute_set_name);
      
      expect(namesPage3.length).toBe(1);
      expect(namesPage3[0]).toContain(uniqueId);
    }, 45000);
  });

  describe("Get Attribute Set By ID Tool", () => {
    test("should get fixture attribute set by ID", async () => {
      fixtures.setCurrentTest("get_by_id_test");
      
      const createdFixtures = await fixtures.createFixtureSets([
        { name: "electronics" }
      ]);
      
      const electronicsSet = createdFixtures.get("electronics");
      expect(electronicsSet).toBeDefined();

      const result = await mockServer.callTool("get-attribute-set-by-id", {
        attributeSetId: electronicsSet!.attribute_set_id!,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Attribute Set Details");
      expect(parsed.data.length).toBe(1);
      
      const retrievedAttributeSet = JSON.parse(parsed.data[0]);
      expect(retrievedAttributeSet.attribute_set_id).toBe(electronicsSet!.attribute_set_id);
      expect(retrievedAttributeSet.attribute_set_name).toBe(electronicsSet!.attribute_set_name);
    }, 45000);

    test("should handle non-existent attribute set ID", async () => {
      const result = await mockServer.callTool("get-attribute-set-by-id", {
        attributeSetId: 999999,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 404");
    }, 30000);
  });

  describe("Get Attributes From Set Tool", () => {
    test("should get attributes from fixture attribute set", async () => {
      fixtures.setCurrentTest("get_attributes_from_set_test");
      
      const createdFixtures = await fixtures.createFixtureSets([
        { name: "electronics" }
      ]);
      
      const electronicsSet = createdFixtures.get("electronics");
      expect(electronicsSet).toBeDefined();

      const result = await mockServer.callTool("get-attributes-from-set", {
        attributeSetId: electronicsSet!.attribute_set_id!,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Attributes From Set");
      expect(parsed.meta.endpoint).toContain("/products/attribute-sets");
      expect(parsed.data.length).toBeGreaterThan(0);

      // The attribute set should have multiple attributes (inherited from default set)
      const attributes = JSON.parse(parsed.data[0]);
      expect(Array.isArray(attributes)).toBe(true);
      expect(attributes.length).toBeGreaterThan(0);

      // Check that attributes have expected properties
      const firstAttribute = attributes[0];
      expect(firstAttribute).toHaveProperty('attribute_code');
      expect(firstAttribute).toHaveProperty('attribute_id');
    }, 45000);

    test("should handle non-existent attribute set ID", async () => {
      const result = await mockServer.callTool("get-attributes-from-set", {
        attributeSetId: 999999,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 404");
    }, 30000);
  });

  describe("Search Attribute Groups Tool", () => {
    test("should search and find fixture attribute groups using like filter", async () => {
      fixtures.setCurrentTest("search_groups_test");
      
      // Create a test attribute set first
      const createdSets = await fixtures.createFixtureSets([
        { name: "electronics" }
      ]);
      const electronicsSet = createdSets.get("electronics")!;
      
      // Create test attribute groups
      await fixtures.createFixtureGroups([
        { name: "general", definition: ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS.GENERAL_GROUP },
        { name: "physical", definition: ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS.PHYSICAL_PROPERTIES_GROUP },
        { name: "pricing", definition: ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS.PRICING_GROUP }
      ], electronicsSet.attribute_set_id!);

      // Search using the current test filter to find only our fixtures
      const result = await mockServer.callTool("search-attribute-groups", {
        filters: [fixtures.getCurrentTestGroupFilter()],
        pageSize: 10
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(parsed.data.length).toBe(3);

      // Verify we found our fixtures with hardcoded attribute group names
      const attributeGroups = parsed.data.map(item => JSON.parse(item));
      const foundNames = attributeGroups.map(group => group.attribute_group_name);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      // Check that we have exactly 3 items with the expected attribute group names
      expect(foundNames).toHaveLength(3);
      expect(foundNames).toContain(`Group general ${uniqueId}`);
      expect(foundNames).toContain(`Group physical ${uniqueId}`);
      expect(foundNames).toContain(`Group pricing ${uniqueId}`);
    }, 45000);

    test("should filter attribute groups by attribute_set_id", async () => {
      fixtures.setCurrentTest("search_groups_by_set_test");
      
      // Create a test attribute set
      const createdSets = await fixtures.createFixtureSets([
        { name: "electronics" }
      ]);
      const electronicsSet = createdSets.get("electronics")!;
      
      // Create test attribute groups
      await fixtures.createFixtureGroups([
        { name: "general", definition: ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS.GENERAL_GROUP },
        { name: "physical", definition: ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS.PHYSICAL_PROPERTIES_GROUP }
      ], electronicsSet.attribute_set_id!);

      const result = await mockServer.callTool("search-attribute-groups", {
        filters: [
          fixtures.getCurrentTestGroupFilter(),
          {
            field: "attribute_set_id",
            value: electronicsSet.attribute_set_id,
            conditionType: "eq",
          }
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.data.length).toBe(2);

      // Verify all returned attribute groups belong to our attribute set
      const attributeGroups = parsed.data.map(item => JSON.parse(item));
      attributeGroups.forEach(group => {
        expect(group.attribute_set_id).toBe(electronicsSet.attribute_set_id);
        expect(group.attribute_group_name).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the specific attribute group names that should be found
      const foundNames = attributeGroups.map(group => group.attribute_group_name);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      expect(foundNames).toContain(`Group general ${uniqueId}`);
      expect(foundNames).toContain(`Group physical ${uniqueId}`);
    }, 45000);
  });

  describe("CRUD Operations", () => {
    test("should create, retrieve, and delete a test attribute set using tools", async () => {
      fixtures.setCurrentTest("crud_full_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeSetName = `CRUD Test Set ${uniqueId}`;
      
      // Create a custom attribute set using the tool
      const createResult = await mockServer.callTool("create-attribute-set", {
        attributeSetName,
        sortOrder: 100
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);
      
      expect(createParsed.meta.name).toBe("Create Attribute Set");
      expect(createParsed.data.length).toBe(1);
      
      const createdAttributeSet = JSON.parse(createParsed.data[0]);
      expect(createdAttributeSet.attribute_set_name).toBe(attributeSetName);
      expect(createdAttributeSet.sort_order).toBe(100);

      // Retrieve the created attribute set
      const getResult = await mockServer.callTool("get-attribute-set-by-id", {
        attributeSetId: createdAttributeSet.attribute_set_id,
      });

      const getResponseText = extractToolResponseText(getResult);
      const getParsed = parseToolResponse(getResponseText);
      
      expect(getParsed.data.length).toBe(1);
      const retrievedAttributeSet = JSON.parse(getParsed.data[0]);
      expect(retrievedAttributeSet.attribute_set_id).toBe(createdAttributeSet.attribute_set_id);
      expect(retrievedAttributeSet.attribute_set_name).toBe(attributeSetName);

      // Delete the attribute set
      const deleteResult = await mockServer.callTool("delete-attribute-set", {
        attributeSetId: createdAttributeSet.attribute_set_id,
      });

      const deleteResponseText = extractToolResponseText(deleteResult);
      expect(deleteResponseText).toContain("Delete Attribute Set");
      expect(deleteResponseText).toContain("has been successfully deleted");
    }, 60000);

    test("should update an attribute set name", async () => {
      fixtures.setCurrentTest("crud_update_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const originalName = `Update Test Set ${uniqueId}`;
      
      // Create a test attribute set
      const createResult = await mockServer.callTool("create-attribute-set", {
        attributeSetName: originalName,
        sortOrder: 50
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);
      const createdAttributeSet = JSON.parse(createParsed.data[0]);

      // Update the name
      const newName = `Updated Test Set ${uniqueId}`;
      const updateResult = await mockServer.callTool("update-attribute-set", {
        attributeSetId: createdAttributeSet.attribute_set_id,
        attributeSetName: newName,
      });

      const updateResponseText = extractToolResponseText(updateResult);
      const updateParsed = parseToolResponse(updateResponseText);
      
      expect(updateParsed.meta.name).toBe("Update Attribute Set");
      expect(updateParsed.data.length).toBe(1);
      
      const updatedAttributeSet = JSON.parse(updateParsed.data[0]);
      expect(updatedAttributeSet.attribute_set_id).toBe(createdAttributeSet.attribute_set_id);
      expect(updatedAttributeSet.attribute_set_name).toBe(newName);

      // Clean up
      await mockServer.callTool("delete-attribute-set", {
        attributeSetId: createdAttributeSet.attribute_set_id,
      });
    }, 45000);
  });

  describe("Attribute Groups CRUD Operations", () => {
    test("should create, retrieve, and delete a test attribute group using tools", async () => {
      fixtures.setCurrentTest("group_crud_full_test");
      
      // First create an attribute set to add the group to
      const createdSets = await fixtures.createFixtureSets([
        { name: "electronics" }
      ]);
      const electronicsSet = createdSets.get("electronics")!;
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeGroupName = `CRUD Test Group ${uniqueId}`;
      
      // Create a custom attribute group using the tool
      const createResult = await mockServer.callTool("create-attribute-group", {
        attributeSetId: electronicsSet.attribute_set_id,
        attributeGroupName,
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);
      
      expect(createParsed.meta.name).toBe("Create Attribute Group");
      expect(createParsed.data.length).toBe(1);
      
      const createdAttributeGroup = JSON.parse(createParsed.data[0]);
      expect(createdAttributeGroup.attribute_group_name).toBe(attributeGroupName);
      expect(createdAttributeGroup.attribute_set_id).toBe(electronicsSet.attribute_set_id);

      // Delete the attribute group
      const deleteResult = await mockServer.callTool("delete-attribute-group", {
        attributeGroupId: Number(createdAttributeGroup.attribute_group_id),
      });

      const deleteResponseText = extractToolResponseText(deleteResult);
      expect(deleteResponseText).toContain("Delete Attribute Group");
      expect(deleteResponseText).toContain("has been successfully deleted");
    }, 45000);

    test("should update an attribute group name", async () => {
      fixtures.setCurrentTest("group_crud_update_test");
      
      // First create an attribute set to add the group to
      const createdSets = await fixtures.createFixtureSets([
        { name: "electronics" }
      ]);
      const electronicsSet = createdSets.get("electronics")!;
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const originalName = `Update Test Group ${uniqueId}`;
      
      // Create a test attribute group
      const createResult = await mockServer.callTool("create-attribute-group", {
        attributeSetId: electronicsSet.attribute_set_id,
        attributeGroupName: originalName,
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);
      const createdAttributeGroup = JSON.parse(createParsed.data[0]);

      // Update the name
      const newName = `Updated Test Group ${uniqueId}`;
      const updateResult = await mockServer.callTool("update-attribute-group", {
        attributeSetId: electronicsSet.attribute_set_id,
        attributeGroupId: Number(createdAttributeGroup.attribute_group_id),
        attributeGroupName: newName,
      });

      const updateResponseText = extractToolResponseText(updateResult);
      const updateParsed = parseToolResponse(updateResponseText);
      
      expect(updateParsed.meta.name).toBe("Update Attribute Group");
      expect(updateParsed.data.length).toBe(1);
      
      const updatedAttributeGroup = JSON.parse(updateParsed.data[0]);
      expect(updatedAttributeGroup.attribute_group_id).toBe(createdAttributeGroup.attribute_group_id);
      expect(updatedAttributeGroup.attribute_group_name).toBe(newName);

      // Clean up
      await mockServer.callTool("delete-attribute-group", {
        attributeGroupId: Number(createdAttributeGroup.attribute_group_id),
      });
    }, 45000);
  });

  describe("Assign Attribute to Set and Group Tool", () => {
    test("should assign an attribute to a set and group", async () => {
      fixtures.setCurrentTest("assign_attr_test");
      
      // 1. Create an attribute set using tool
      const createSetResult = await mockServer.callTool("create-attribute-set", {
        attributeSetName: `Electronics Set ${fixtures.getCurrentTestUniqueId()}`,
        sortOrder: 10,
      });
      const createSetText = extractToolResponseText(createSetResult);
      const createSetParsed = parseToolResponse(createSetText);
      const electronicsSet = JSON.parse(createSetParsed.data[0]);

      // 2. Create a product attribute using tool
      const testAttributeCode = `assign_attr_${fixtures.getCurrentTestUniqueId()}`;
      await mockServer.callTool("create-product-attribute", {
        type: 'text',
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Assign Test Attribute",
        scope: 'global',
      });

      // 3. Get attribute group for set using the tool
      const groupsResult = await mockServer.callTool("search-attribute-groups", {
        filters: [
          { field: "attribute_set_id", value: electronicsSet.attribute_set_id, conditionType: "eq" },
        ],
        page: 1,
        pageSize: 10,
      });
      const groupsText = extractToolResponseText(groupsResult);
      const groupsParsed = parseToolResponse(groupsText);
      expect(groupsParsed.data.length).toBeGreaterThan(0);
      const group = JSON.parse(groupsParsed.data[0]);
      const attributeGroupId = group.attribute_group_id;

      // 4. Assign attribute to set/group
      const assignResult = await mockServer.callTool("assign-attribute-to-set-group", {
        attributeSetId: electronicsSet.attribute_set_id,
        attributeGroupId: Number(attributeGroupId),
        attributeCode: testAttributeCode,
        sortOrder: 10,
      });
      const assignText = extractToolResponseText(assignResult);
      expect(assignText).toContain("Assign Attribute to Set and Group");
      expect(assignText).toContain("has been successfully assigned");

      // 5. Clean up - delete the attribute and set
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: testAttributeCode,
      });
      await mockServer.callTool("delete-attribute-set", {
        attributeSetId: electronicsSet.attribute_set_id,
      });
    }, 45000);
  });

  describe("Delete Attribute From Set Tool", () => {
    test("should delete attribute from set", async () => {
      fixtures.setCurrentTest("delete_attr_from_set_test");
      
      // 1. Create an attribute set using tool
      const createSetResult = await mockServer.callTool("create-attribute-set", {
        attributeSetName: `Electronics Set ${fixtures.getCurrentTestUniqueId()}`,
        sortOrder: 10,
      });
      const createSetText = extractToolResponseText(createSetResult);
      const createSetParsed = parseToolResponse(createSetText);
      const electronicsSet = JSON.parse(createSetParsed.data[0]);

      // 2. Create a product attribute using tool
      const testAttributeCode = `delete_attr_${fixtures.getCurrentTestUniqueId()}`;
      await mockServer.callTool("create-product-attribute", {
        type: 'text',
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Delete Test Attribute",
        scope: 'global',
      });

      // 3. Get attribute group for set using the tool
      const groupsResult = await mockServer.callTool("search-attribute-groups", {
        filters: [
          { field: "attribute_set_id", value: electronicsSet.attribute_set_id, conditionType: "eq" },
        ],
        page: 1,
        pageSize: 10,
      });
      const groupsText = extractToolResponseText(groupsResult);
      const groupsParsed = parseToolResponse(groupsText);
      expect(groupsParsed.data.length).toBeGreaterThan(0);
      const group = JSON.parse(groupsParsed.data[0]);
      const attributeGroupId = group.attribute_group_id;

      // 4. Assign attribute to set/group
      const assignResult = await mockServer.callTool("assign-attribute-to-set-group", {
        attributeSetId: electronicsSet.attribute_set_id,
        attributeGroupId: Number(attributeGroupId),
        attributeCode: testAttributeCode,
        sortOrder: 10,
      });
      const assignText = extractToolResponseText(assignResult);
      expect(assignText).toContain("Assign Attribute to Set and Group");
      expect(assignText).toMatch(/has been successfully assigned|Failed to assign attribute/);

      // 5. Delete attribute from set
      const deleteResult = await mockServer.callTool("delete-attribute-from-set", {
        attributeSetId: electronicsSet.attribute_set_id,
        attributeCode: testAttributeCode,
      });
      const deleteText = extractToolResponseText(deleteResult);
      expect(deleteText).toContain("Delete Attribute From Set");
      expect(deleteText).toContain("has been successfully removed");
    }, 45000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty search results gracefully", async () => {
      // Search with a filter that should return no results
      const result = await mockServer.callTool("search-attribute-sets", {
        filters: [
          {
            field: "attribute_set_name",
            value: "%nonexistent_test_unique_id_xyz%",
            conditionType: "like",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Search Attribute Sets");
      expect(parsed.data.length).toBe(0);
    }, 30000);

    test("should handle invalid field in search filters", async () => {
      const result = await mockServer.callTool("search-attribute-sets", {
        filters: [
          {
            field: "nonexistent_field_xyz",
            value: "test",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toMatch(/Search Attribute Sets|Failed to retrieve data/);
    }, 30000);
  });

  describe("Response Format Validation", () => {
    test("should return properly formatted response structure", async () => {
      fixtures.setCurrentTest("format_validation_test");
      
      await fixtures.createFixtureSets([
        { name: "electronics" }
      ]);

      const result = await mockServer.callTool("search-attribute-sets", {
        filters: [fixtures.getCurrentTestSetFilter()],
        pageSize: 5
      });

      const responseText = extractToolResponseText(result);

      // Check response structure
      expect(responseText).toContain("<meta>");
      expect(responseText).toContain("<name>Search Attribute Sets</name>");
      expect(responseText).toContain("<page>");
      expect(responseText).toContain("<pageSize>");
      expect(responseText).toContain("<endpoint>");
      expect(responseText).toContain("<data>");

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);

      // Check each attribute set has valid JSON
      parsed.data.forEach((item) => {
        expect(() => JSON.parse(item)).not.toThrow();
        const attributeSet = JSON.parse(item);
        expect(typeof attributeSet).toBe("object");
        expect(attributeSet).toHaveProperty("attribute_set_id");
        expect(attributeSet).toHaveProperty("attribute_set_name");
        expect(attributeSet).toHaveProperty("entity_type_id");
      });
    }, 45000);
  });
}); 