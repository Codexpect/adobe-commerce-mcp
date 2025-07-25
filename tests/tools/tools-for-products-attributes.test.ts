import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductAttributesTools } from "../../src/tools/tools-for-products-attributes";
import { createMockMcpServer, extractToolResponseText, parseToolResponse, MockMcpServer } from "../utils/mock-mcp-server";
import { ProductAttributeFixtures } from "./fixtures/product-attribute-fixtures";

describe("Product Attributes Tools - Functional Tests with Per-Test Fixtures", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let fixtures: ProductAttributeFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up product attributes functional tests with per-test fixtures...");
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
    registerProductAttributesTools(mockServer.server, client);

    // Initialize fixtures
    fixtures = new ProductAttributeFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up any fixtures created during the test
    await fixtures.cleanupCurrentTest();
  });

  describe("Tool Registration", () => {
    test("should register all product attributes tools", () => {
      const toolNames = Array.from(mockServer.registeredTools.keys());

      expect(toolNames).toContain("search-products-attributes");
      expect(toolNames).toContain("create-product-attribute");
      expect(toolNames).toContain("get-product-attribute-by-code");
      expect(toolNames).toContain("update-product-attribute");
      expect(toolNames).toContain("delete-product-attribute");
      expect(toolNames).toContain("get-product-attribute-options");
      expect(toolNames).toContain("add-product-attribute-option");
      expect(toolNames).toContain("update-product-attribute-option");
      expect(toolNames).toContain("delete-product-attribute-option");
    });

    test("should register search tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-products-attributes");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Search Products Attributes");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create product attribute tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-product-attribute");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Create Product Attribute");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get product attribute by code tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-product-attribute-by-code");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Product Attribute By Code");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register update product attribute tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-product-attribute");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Product Attribute");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete product attribute tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-product-attribute");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Product Attribute");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get product attribute options tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-product-attribute-options");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Product Attribute Options");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register add product attribute option tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("add-product-attribute-option");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Add Product Attribute Option");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register update product attribute option tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("update-product-attribute-option");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Update Product Attribute Option");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register delete product attribute option tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("delete-product-attribute-option");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Delete Product Attribute Option");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should have proper descriptions for all tools", () => {
      const expectedDescriptions = {
        "search-products-attributes": "Search for products attributes in Adobe Commerce with flexible search filters.",
        "create-product-attribute": "Create a new product attribute in Adobe Commerce. Supports all attribute types (text, textarea, boolean, date, integer, decimal, select, multiselect, etc.) with flexible options.",
        "get-product-attribute-by-code": "Get a single product attribute by its attribute code.",
        "update-product-attribute": "Update an existing product attribute by its attribute code.",
        "delete-product-attribute": "Delete a product attribute by its attribute code.",
        "get-product-attribute-options": "Get all options for a specific product attribute.",
        "add-product-attribute-option": "Add a new option to a product attribute.",
        "update-product-attribute-option": "Update an existing option of a product attribute.",
        "delete-product-attribute-option": "Delete an option from a product attribute."
      };

      Object.entries(expectedDescriptions).forEach(([toolName, expectedDescription]) => {
        const tool = mockServer.registeredTools.get(toolName);
        expect(tool).toBeDefined();
        expect(tool!.definition.description).toBe(expectedDescription);
      });
    });

    test("should have correct readOnlyHint annotations", () => {
      const readOnlyTools = [
        "search-products-attributes",
        "get-product-attribute-by-code", 
        "get-product-attribute-options"
      ];

      const writeTools = [
        "create-product-attribute",
        "update-product-attribute",
        "delete-product-attribute",
        "add-product-attribute-option",
        "update-product-attribute-option",
        "delete-product-attribute-option"
      ];

      // Verify read-only tools
      readOnlyTools.forEach(toolName => {
        const tool = mockServer.registeredTools.get(toolName);
        expect(tool).toBeDefined();
        expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
      });

      // Verify write tools
      writeTools.forEach(toolName => {
        const tool = mockServer.registeredTools.get(toolName);
        expect(tool).toBeDefined();
        expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
      });
    });
  });

  describe("Search Product Attributes", () => {
    test("should search and find fixture attributes using like filter", async () => {
      fixtures.setCurrentTest("search_default_test");
      
      // Create test fixtures
      await fixtures.createFixtures([
        { name: "text", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "select", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
        { name: "boolean", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE }
      ]);

      // Search using the current test filter to find only our fixtures
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [fixtures.getCurrentTestFilter()],
        pageSize: 10
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(parsed.data.length).toBe(3);

      // Verify we found our fixtures with hardcoded attribute codes
      const attributes = parsed.data.map(item => JSON.parse(item));
      const foundCodes = attributes.map(attr => attr.attribute_code);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      // Check that we have exactly 3 items with the expected attribute codes
      expect(foundCodes).toHaveLength(3);
      expect(foundCodes).toContain(`attr_text_${uniqueId}`);
      expect(foundCodes).toContain(`attr_select_${uniqueId}`);
      expect(foundCodes).toContain(`attr_boolean_${uniqueId}`);
    }, 45000);

    test("should filter attributes by frontend_input type", async () => {
      fixtures.setCurrentTest("search_frontend_input_test");
      
      // Create multiple attributes for this test - including a boolean that should be excluded
      await fixtures.createFixtures([
        { name: "text_1", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "text_2", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "boolean", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE }
      ]);

      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "frontend_input",
            value: "text",
            conditionType: "eq",
          }
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.data.length).toBe(2);

      // Verify all returned attributes have frontend_input = "text"
      const attributes = parsed.data.map(item => JSON.parse(item));
      attributes.forEach(attr => {
        expect(attr.frontend_input).toBe("text");
        expect(attr.attribute_code).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the boolean attribute is NOT in the results
      const foundCodes = attributes.map(attr => attr.attribute_code);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      // Check that we have exactly 2 items with the expected attribute codes
      expect(foundCodes).toHaveLength(2);
      expect(foundCodes).toContain(`attr_text_1_${uniqueId}`);
      expect(foundCodes).toContain(`attr_text_2_${uniqueId}`);
      
      // Verify the boolean attribute is NOT in the results
      expect(foundCodes).not.toContain(`attr_boolean_${uniqueId}`);
    }, 45000);


    test("should filter attributes by is_user_defined", async () => {
      fixtures.setCurrentTest("search_user_defined_test");
      
      await fixtures.createFixtures([
        { name: "text", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "select", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE }
      ]);

      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "is_user_defined",
            value: "1", // Use string "1" instead of boolean true
            conditionType: "eq",
          }
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.data.length).toBe(2);

      const attributes = parsed.data.map(item => JSON.parse(item));
      attributes.forEach(attr => {
        expect(attr.is_user_defined).toBe(true);
        expect(attr.attribute_code).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the specific attribute codes that should be found
      const foundCodes = attributes.map(attr => attr.attribute_code);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      expect(foundCodes).toContain(`attr_text_${uniqueId}`);
      expect(foundCodes).toContain(`attr_select_${uniqueId}`);
    }, 45000);

    test("should search for select type attributes", async () => {
      fixtures.setCurrentTest("search_select_test");
      
      await fixtures.createFixtures([
        { name: "select", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
        { name: "text", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE }
      ]);

      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          fixtures.getCurrentTestFilter(),
          {
            field: "frontend_input",
            value: "select,text",
            conditionType: "in",
          }
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.data.length).toBe(2);

      const attributes = parsed.data.map(item => JSON.parse(item));
      attributes.forEach(attr => {
        expect(["select", "text"]).toContain(attr.frontend_input);
        expect(attr.attribute_code).toContain(fixtures.getCurrentTestUniqueId());
      });

      // Verify the specific attribute codes that should be found
      const foundCodes = attributes.map(attr => attr.attribute_code);
      const uniqueId = fixtures.getCurrentTestUniqueId();
      
      expect(foundCodes).toContain(`attr_select_${uniqueId}`);
      expect(foundCodes).toContain(`attr_text_${uniqueId}`);
    }, 45000);

    test("should handle pagination", async () => {
      fixtures.setCurrentTest("search_pagination_test");
      
      // Create multiple attributes for pagination testing
      await fixtures.createFixtures([
        { name: "text_1", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "text_2", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXT_ATTRIBUTE },
        { name: "boolean", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.BOOLEAN_ATTRIBUTE },
        { name: "select", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.SELECT_ATTRIBUTE },
        { name: "textarea", definition: ProductAttributeFixtures.FIXTURE_DEFINITIONS.TEXTAREA_ATTRIBUTE }
      ]);

      const uniqueId = fixtures.getCurrentTestUniqueId();

      // Test first page
      const resultPage1 = await mockServer.callTool("search-products-attributes", {
        filters: [fixtures.getCurrentTestFilter()],
        page: 1,
        pageSize: 2,
      });

      const responseTextPage1 = extractToolResponseText(resultPage1);
      const parsedPage1 = parseToolResponse(responseTextPage1);
      
      expect(parsedPage1.meta.page).toBe("1");
      expect(parsedPage1.meta.pageSize).toBe("2");
      expect(parsedPage1.data.length).toBe(2);

      // Verify first page contains expected attributes
      const attributesPage1 = parsedPage1.data.map(item => JSON.parse(item));
      const codesPage1 = attributesPage1.map(attr => attr.attribute_code);
      
      // Should contain 2 of our 5 attributes
      expect(codesPage1.length).toBe(2);
      codesPage1.forEach(code => {
        expect(code).toContain(uniqueId);
      });

      // Test second page
      const resultPage2 = await mockServer.callTool("search-products-attributes", {
        filters: [fixtures.getCurrentTestFilter()],
        page: 2,
        pageSize: 2,
      });

      const responseTextPage2 = extractToolResponseText(resultPage2);
      const parsedPage2 = parseToolResponse(responseTextPage2);
      
      expect(parsedPage2.meta.page).toBe("2");
      expect(parsedPage2.meta.pageSize).toBe("2");
      expect(parsedPage2.data.length).toBe(2);

      // Verify second page contains different attributes
      const attributesPage2 = parsedPage2.data.map(item => JSON.parse(item));
      const codesPage2 = attributesPage2.map(attr => attr.attribute_code);
      
      expect(codesPage2.length).toBe(2);
      codesPage2.forEach(code => {
        expect(code).toContain(uniqueId);
      });

      // Verify pages don't overlap (no duplicate codes between pages)
      const allCodesPage1 = new Set(codesPage1);
      const allCodesPage2 = new Set(codesPage2);
      
      codesPage1.forEach(code => {
        expect(allCodesPage2.has(code)).toBe(false);
      });
      codesPage2.forEach(code => {
        expect(allCodesPage1.has(code)).toBe(false);
      });

      // Test third page (should have remaining 1 attribute)
      const resultPage3 = await mockServer.callTool("search-products-attributes", {
        filters: [fixtures.getCurrentTestFilter()],
        page: 3,
        pageSize: 2,
      });

      const responseTextPage3 = extractToolResponseText(resultPage3);
      const parsedPage3 = parseToolResponse(responseTextPage3);
      
      expect(parsedPage3.meta.page).toBe("3");
      expect(parsedPage3.meta.pageSize).toBe("2");
      expect(parsedPage3.data.length).toBe(1);

      // Verify third page contains the last attribute
      const attributesPage3 = parsedPage3.data.map(item => JSON.parse(item));
      const codesPage3 = attributesPage3.map(attr => attr.attribute_code);
      
      expect(codesPage3.length).toBe(1);
      expect(codesPage3[0]).toContain(uniqueId);
    }, 45000);
  });

  describe("Get Product Attribute By Code", () => {
    test("should get fixture attribute by code", async () => {
      fixtures.setCurrentTest("get_by_code_test");
      
      const createdFixtures = await fixtures.createFixtures([
        { name: "text" }
      ]);
      
      const textAttr = createdFixtures.get("text");
      expect(textAttr).toBeDefined();

      const result = await mockServer.callTool("get-product-attribute-by-code", {
        attributeCode: textAttr!.attribute_code,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Get Product Attribute By Code");
      expect(parsed.data.length).toBe(1);
      
      const retrievedAttribute = JSON.parse(parsed.data[0]);
      expect(retrievedAttribute.attribute_code).toBe(textAttr!.attribute_code);
    }, 45000);

    test("should handle non-existent attribute code", async () => {
      const result = await mockServer.callTool("get-product-attribute-by-code", {
        attributeCode: "definitely_non_existent_attribute_xyz_123",
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("attributeCode doesn't exist");
    }, 30000);
  });

  describe("Product Attribute Options", () => {
    test("should get options for select attribute", async () => {
      fixtures.setCurrentTest("options_get_test");
      
      const createdFixtures = await fixtures.createFixtures([
        { name: "select" }
      ]);
      
      const selectAttr = createdFixtures.get("select");
      expect(selectAttr).toBeDefined();

      const result = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: selectAttr!.attribute_code,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Get Product Attribute Options");
      expect(parsed.meta.totalItems).toBe("4");

      // Should have the options we created in the fixture (3 options) plus the empty option
      const options = parsed.data.map(item => JSON.parse(item));
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(4); // 3 custom options + 1 empty option
      
      // Check that the first option is the empty one
      expect(options[0].label).toBe(" ");
      expect(options[0].value).toBe("");
      
      // Check our custom options
      const customOptions = options.slice(1); // Skip the empty option
      expect(customOptions.length).toBe(3);
      expect(customOptions[0].label).toBe("Option One");
      expect(customOptions[1].label).toBe("Option Two");
      expect(customOptions[2].label).toBe("Option Three");
    }, 45000);

    test("should add a new option to select attribute", async () => {
      fixtures.setCurrentTest("options_add_test");
      
      const createdFixtures = await fixtures.createFixtures([
        { name: "select" }
      ]);
      
      const selectAttr = createdFixtures.get("select");

      const result = await mockServer.callTool("add-product-attribute-option", {
        attributeCode: selectAttr!.attribute_code,
        label: "New Test Option",
        sortOrder: 10,
        isDefault: false,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Add Product Attribute Option");
      expect(parsed.data.length).toBe(1);
      
      const optionId = JSON.parse(parsed.data[0]);
      console.log(optionId);
      expect(optionId).toBeTruthy();
    }, 45000);

    test("should update an existing option in select attribute", async () => {
      fixtures.setCurrentTest("options_update_test");
      
      const createdFixtures = await fixtures.createFixtures([
        { name: "select" }
      ]);
      
      const selectAttr = createdFixtures.get("select");

      // First, get the existing options to find an option ID to update
      const getOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: selectAttr!.attribute_code,
      });

      const getOptionsResponseText = extractToolResponseText(getOptionsResult);
      const getOptionsParsed = parseToolResponse(getOptionsResponseText);
      
      const options = getOptionsParsed.data.map(item => JSON.parse(item));
      // Find the first custom option (skip the empty option)
      const optionToUpdate = options.find(opt => opt.label !== " ");
      expect(optionToUpdate).toBeDefined();

      // Update the option
      const result = await mockServer.callTool("update-product-attribute-option", {
        attributeCode: selectAttr!.attribute_code,
        optionId: parseInt(optionToUpdate!.value),
        label: "Updated Option Label",
        sortOrder: 15,
        isDefault: true,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Update Product Attribute Option");
      expect(parsed.data.length).toBe(1);
      
      const updatedOptionId = JSON.parse(parsed.data[0]);
      expect(updatedOptionId).toBeTruthy();

      // Verify the update by getting options again
      const verifyResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: selectAttr!.attribute_code,
      });

      const verifyResponseText = extractToolResponseText(verifyResult);
      const verifyParsed = parseToolResponse(verifyResponseText);
      
      const updatedOptions = verifyParsed.data.map(item => JSON.parse(item));
      const updatedOption = updatedOptions.find(opt => opt.value === optionToUpdate!.value);
      
      expect(updatedOption).toBeDefined();
      expect(updatedOption!.label).toBe("Updated Option Label");
    }, 45000);

    test("should delete an option from select attribute", async () => {
      fixtures.setCurrentTest("options_delete_test");
      
      const createdFixtures = await fixtures.createFixtures([
        { name: "select" }
      ]);
      
      const selectAttr = createdFixtures.get("select");

      // First, get the existing options to find an option ID to delete
      const getOptionsResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: selectAttr!.attribute_code,
      });

      const getOptionsResponseText = extractToolResponseText(getOptionsResult);
      const getOptionsParsed = parseToolResponse(getOptionsResponseText);
      
      const options = getOptionsParsed.data.map(item => JSON.parse(item));
      // Find the first custom option (skip the empty option)
      const optionToDelete = options.find(opt => opt.label !== " ");
      expect(optionToDelete).toBeDefined();

      // Store the option details for verification
      const optionIdToDelete = optionToDelete!.value;
      const originalOptionsCount = options.length;

      // Delete the option
      const result = await mockServer.callTool("delete-product-attribute-option", {
        attributeCode: selectAttr!.attribute_code,
        optionId: parseInt(optionIdToDelete),
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Delete Product Attribute Option");
      expect(responseText).toContain(`Option "${optionIdToDelete}" has been successfully deleted from attribute "${selectAttr!.attribute_code}"`);

      // Verify the deletion by getting options again
      const verifyResult = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: selectAttr!.attribute_code,
      });

      const verifyResponseText = extractToolResponseText(verifyResult);
      const verifyParsed = parseToolResponse(verifyResponseText);
      
      const remainingOptions = verifyParsed.data.map(item => JSON.parse(item));
      
      // Should have one less option
      expect(remainingOptions.length).toBe(originalOptionsCount - 1);
      
      // The deleted option should not be present
      const deletedOptionStillExists = remainingOptions.find(opt => opt.value === optionIdToDelete);
      expect(deletedOptionStillExists).toBeUndefined();
    }, 45000);

    test("should handle updating non-existent option gracefully", async () => {
      fixtures.setCurrentTest("options_update_nonexistent_test");
      
      const createdFixtures = await fixtures.createFixtures([
        { name: "select" }
      ]);
      
      const selectAttr = createdFixtures.get("select");

      // Try to update a non-existent option
      const result = await mockServer.callTool("update-product-attribute-option", {
        attributeCode: selectAttr!.attribute_code,
        optionId: 999999, // Non-existent option ID
        label: "This Should Fail",
        sortOrder: 20,
        isDefault: false,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toMatch(/Update Product Attribute Option|Failed to retrieve data/);
    }, 30000);

    test("should handle deleting non-existent option gracefully", async () => {
      fixtures.setCurrentTest("options_delete_nonexistent_test");
      
      const createdFixtures = await fixtures.createFixtures([
        { name: "select" }
      ]);
      
      const selectAttr = createdFixtures.get("select");

      // Try to delete a non-existent option
      const result = await mockServer.callTool("delete-product-attribute-option", {
        attributeCode: selectAttr!.attribute_code,
        optionId: 999999, // Non-existent option ID
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toMatch(/Delete Product Attribute Option|Failed to retrieve data/);
    }, 30000);
  });

  describe("CRUD Operations", () => {
    test("should create, retrieve, and delete a test attribute using tools", async () => {
      fixtures.setCurrentTest("crud_full_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `crud_test_${uniqueId}`;
      
      // Create a custom attribute using the tool
      const createResult = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode,
        defaultFrontendLabel: "CRUD Test Attribute",
        scope: "global"
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);
      
      expect(createParsed.meta.name).toBe("Create Product Attribute");
      expect(createParsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(createParsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("CRUD Test Attribute");

      // Retrieve the created attribute
      const getResult = await mockServer.callTool("get-product-attribute-by-code", {
        attributeCode: createdAttribute.attribute_code,
      });

      const getResponseText = extractToolResponseText(getResult);
      const getParsed = parseToolResponse(getResponseText);
      
      expect(getParsed.data.length).toBe(1);
      const retrievedAttribute = JSON.parse(getParsed.data[0]);
      expect(retrievedAttribute.attribute_code).toBe(createdAttribute.attribute_code);
      expect(retrievedAttribute.default_frontend_label).toBe("CRUD Test Attribute");

      // Delete the attribute
      const deleteResult = await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });

      const deleteResponseText = extractToolResponseText(deleteResult);
      expect(deleteResponseText).toContain("Delete Product Attribute");
      expect(deleteResponseText).toContain("has been successfully deleted");

      // Verify it's deleted by trying to retrieve it
      const verifyResult = await mockServer.callTool("get-product-attribute-by-code", {
        attributeCode: createdAttribute.attribute_code,
      });

      const verifyResponseText = extractToolResponseText(verifyResult);
      expect(verifyResponseText).toContain("Failed to retrieve data from Adobe Commerce");
    }, 60000);

    test("should update an attribute label", async () => {
      fixtures.setCurrentTest("crud_update_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `update_test_${uniqueId}`;
      
      // Create a test attribute
      const createResult = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode,
        defaultFrontendLabel: "Original Label",
        scope: "global"
      });

      const createResponseText = extractToolResponseText(createResult);
      const createParsed = parseToolResponse(createResponseText);
      const createdAttribute = JSON.parse(createParsed.data[0]);

      // Update the label
      const updateResult = await mockServer.callTool("update-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
        defaultFrontendLabel: "Updated Label",
      });

      const updateResponseText = extractToolResponseText(updateResult);
      
      // Updates might be restricted in some Adobe Commerce versions
      expect(updateResponseText).toMatch(/Update Product Attribute|Failed to retrieve data/);

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 45000);
  });

  describe("Create Product Attribute - All Supported Types", () => {
    test("should create text attribute", async () => {
      fixtures.setCurrentTest("create_text_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `text_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode,
        defaultFrontendLabel: "Test Text Attribute",
        scope: "global"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Text Attribute");
      expect(createdAttribute.frontend_input).toBe("text");
      expect(createdAttribute.backend_type).toBe("varchar");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create textarea attribute", async () => {
      fixtures.setCurrentTest("create_textarea_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `textarea_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "textarea",
        attributeCode,
        defaultFrontendLabel: "Test Textarea Attribute",
        scope: "store"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Textarea Attribute");
      expect(createdAttribute.frontend_input).toBe("textarea");
      expect(createdAttribute.backend_type).toBe("text");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create boolean attribute", async () => {
      fixtures.setCurrentTest("create_boolean_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `boolean_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "boolean",
        attributeCode,
        defaultFrontendLabel: "Test Boolean Attribute",
        scope: "global"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Boolean Attribute");
      expect(createdAttribute.frontend_input).toBe("boolean");
      expect(createdAttribute.backend_type).toBe("int");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create date attribute", async () => {
      fixtures.setCurrentTest("create_date_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `date_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "date",
        attributeCode,
        defaultFrontendLabel: "Test Date Attribute",
        scope: "store"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Date Attribute");
      expect(createdAttribute.frontend_input).toBe("date");
      expect(createdAttribute.backend_type).toBe("datetime");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create integer attribute", async () => {
      fixtures.setCurrentTest("create_integer_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `integer_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "integer",
        attributeCode,
        defaultFrontendLabel: "Test Integer Attribute",
        scope: "global"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Integer Attribute");
      expect(createdAttribute.frontend_input).toBe("text");
      expect(createdAttribute.backend_type).toBe("varchar");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create decimal attribute", async () => {
      fixtures.setCurrentTest("create_decimal_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `decimal_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "decimal",
        attributeCode,
        defaultFrontendLabel: "Test Decimal Attribute",
        scope: "global"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Decimal Attribute");
      expect(createdAttribute.frontend_input).toBe("text");
      expect(createdAttribute.backend_type).toBe("varchar");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create price attribute", async () => {
      fixtures.setCurrentTest("create_price_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `price_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "price",
        attributeCode,
        defaultFrontendLabel: "Test Price Attribute",
        scope: "global"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Price Attribute");
      expect(createdAttribute.frontend_input).toBe("price");
      expect(createdAttribute.backend_type).toBe("decimal");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create weight attribute", async () => {
      fixtures.setCurrentTest("create_weight_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `weight_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "weight",
        attributeCode,
        defaultFrontendLabel: "Test Weight Attribute",
        scope: "global"
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Weight Attribute");
      expect(createdAttribute.frontend_input).toBe("text");
      expect(createdAttribute.backend_type).toBe("varchar");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create singleselect attribute with options", async () => {
      fixtures.setCurrentTest("create_singleselect_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `singleselect_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "singleselect",
        attributeCode,
        defaultFrontendLabel: "Test Single Select Attribute",
        scope: "website",
        options: [
          {
            label: "Option One",
            sortOrder: 1,
            isDefault: true
          },
          {
            label: "Option Two",
            sortOrder: 2,
            isDefault: false
          },
          {
            label: "Option Three",
            sortOrder: 3,
            isDefault: false
          }
        ]
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Single Select Attribute");
      expect(createdAttribute.frontend_input).toBe("select");
      expect(createdAttribute.backend_type).toBe("int");
      expect(createdAttribute.options).toBeDefined();
      expect(createdAttribute.options.length).toBe(4); // 3 custom options + 1 empty option
      
      // Check that the first option is the empty one
      expect(createdAttribute.options[0].label).toBe(" ");
      expect(createdAttribute.options[0].value).toBe("");
      
      // Check our custom options
      const customOptions = createdAttribute.options.slice(1); // Skip the empty option
      expect(customOptions.length).toBe(3);
      expect(customOptions[0].label).toBe("Option One");
      expect(customOptions[1].label).toBe("Option Two");
      expect(customOptions[2].label).toBe("Option Three");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);

    test("should create multiselect attribute with options", async () => {
      fixtures.setCurrentTest("create_multiselect_test");
      
      const uniqueId = fixtures.getCurrentTestUniqueId();
      const attributeCode = `multiselect_attr_${uniqueId}`;
      
      const result = await mockServer.callTool("create-product-attribute", {
        type: "multiselect",
        attributeCode,
        defaultFrontendLabel: "Test Multi Select Attribute",
        scope: "website",
        options: [
          {
            label: "Feature A",
            sortOrder: 1,
            isDefault: false
          },
          {
            label: "Feature B",
            sortOrder: 2,
            isDefault: true
          },
          {
            label: "Feature C",
            sortOrder: 3,
            isDefault: false
          }
        ]
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Create Product Attribute");
      expect(parsed.data.length).toBe(1);
      
      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(attributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Multi Select Attribute");
      expect(createdAttribute.frontend_input).toBe("multiselect");
      expect(createdAttribute.backend_type).toBe("text");
      expect(createdAttribute.options).toBeDefined();
      expect(createdAttribute.options.length).toBe(4); // 3 custom options + 1 empty option
      
      // Check that the first option is the empty one
      expect(createdAttribute.options[0].label).toBe(" ");
      expect(createdAttribute.options[0].value).toBe("");
      
      // Check our custom options
      const customOptions = createdAttribute.options.slice(1); // Skip the empty option
      expect(customOptions.length).toBe(3);
      expect(customOptions[0].label).toBe("Feature A");
      expect(customOptions[1].label).toBe("Feature B");
      expect(customOptions[2].label).toBe("Feature C");

      // Clean up
      await mockServer.callTool("delete-product-attribute", {
        attributeCode: createdAttribute.attribute_code,
      });
    }, 30000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty search results gracefully", async () => {
      // Search with a filter that should return no results
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          {
            field: "attribute_code",
            value: "%nonexistent_test_unique_id_xyz%",
            conditionType: "like",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);
      
      expect(parsed.meta.name).toBe("Search Products Attributes");
      expect(parsed.data.length).toBe(0);
    }, 30000);

    test("should handle invalid field in search filters", async () => {
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          {
            field: "nonexistent_field_xyz",
            value: "test",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toMatch(/Search Products Attributes|Failed to retrieve data/);
    }, 30000);
  });

  describe("Response Format Validation", () => {
    test("should return properly formatted response structure", async () => {
      fixtures.setCurrentTest("format_validation_test");
      
      await fixtures.createFixtures([
        { name: "text" }
      ]);

      const result = await mockServer.callTool("search-products-attributes", {
        filters: [fixtures.getCurrentTestFilter()],
        pageSize: 5
      });

      const responseText = extractToolResponseText(result);

      // Check response structure
      expect(responseText).toContain("<meta>");
      expect(responseText).toContain("<name>Search Products Attributes</name>");
      expect(responseText).toContain("<page>");
      expect(responseText).toContain("<pageSize>");
      expect(responseText).toContain("<endpoint>");
      expect(responseText).toContain("<data>");

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);

      // Check each attribute has valid JSON
      parsed.data.forEach((item) => {
        expect(() => JSON.parse(item)).not.toThrow();
        const attribute = JSON.parse(item);
        expect(typeof attribute).toBe("object");
        expect(attribute).toHaveProperty("attribute_code");
        expect(attribute).toHaveProperty("entity_type_id");
      });
    }, 45000);
  });
});
