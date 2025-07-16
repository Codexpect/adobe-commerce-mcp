import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductAttributesTools } from "../../src/tools/tools-for-products-attributes";
import type { MockMcpServer } from "../utils/mock-mcp-server";
import { createMockMcpServer, extractToolResponseText, parseToolResponse } from "../utils/mock-mcp-server";

describe("Products Attributes Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  const createdAttributeIds: number[] = [];

  beforeAll(() => {
    console.log("🚀 Setting up comprehensive functional tests for products attributes...");
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

    registerProductAttributesTools(mockServer.server, client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterAll(async () => {
    // Cleanup: Delete all created attributes
    console.log("🧹 Cleaning up created attributes...");
    for (const attributeId of createdAttributeIds) {
      try {
        await client.delete(`/products/attributes/${attributeId}`);
        console.log(`✅ Deleted attribute with ID: ${attributeId}`);
      } catch (error) {
        console.log(`⚠️ Failed to delete attribute ${attributeId}:`, error);
      }
    }
    console.log("🎉 Cleanup completed!");
  });

  describe("Tool Registration", () => {
    test("should register search-products-attributes tool", () => {
      expect(mockServer.registeredTools.has("search-products-attributes")).toBe(true);

      const tool = mockServer.registeredTools.get("search-products-attributes");
      expect(tool.definition.title).toBe("Search Products Attributes");
      expect(tool.definition.description).toContain("Search for products attributes in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(true);
    });

    test("should register create-product-attribute tool", () => {
      expect(mockServer.registeredTools.has("create-product-attribute")).toBe(true);

      const tool = mockServer.registeredTools.get("create-product-attribute");
      expect(tool.definition.title).toBe("Create Product Attribute");
      expect(tool.definition.description).toContain("Create a new product attribute in Adobe Commerce");
      expect(tool.definition.inputSchema).toBeDefined();
      expect(tool.definition.annotations.readOnlyHint).toBe(false);
    });
  });

  describe("Search Products Attributes", () => {
    test("should search attributes with default parameters", async () => {
      const result = await mockServer.callTool("search-products-attributes", {});

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Products Attributes");
      expect(parsed.meta.page).toBe("1");
      expect(parsed.meta.pageSize).toBe("10");
      expect(parsed.meta.endpoint).toContain("/products/attributes");
      expect(parsed.data.length).toBeGreaterThan(0);

      // Validate that we get attribute JSON objects
      const firstAttribute = JSON.parse(parsed.data[0]);
      expect(firstAttribute).toHaveProperty("attribute_code");
      expect(firstAttribute).toHaveProperty("default_frontend_label");
      expect(firstAttribute).toHaveProperty("entity_type_id");
    }, 30000);

    test("should respect pagination parameters", async () => {
      const result = await mockServer.callTool("search-products-attributes", {
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

    test("should filter attributes by attribute code", async () => {
      // First get an attribute to use its code
      const initialResult = await mockServer.callTool("search-products-attributes", { pageSize: 1 });
      const initialText = extractToolResponseText(initialResult);
      const initialParsed = parseToolResponse(initialText);
      const firstAttribute = JSON.parse(initialParsed.data[0]);
      const testCode = firstAttribute.attribute_code;

      // Now search for that specific attribute code
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          {
            field: "attribute_code",
            value: testCode,
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);
      const foundAttribute = JSON.parse(parsed.data[0]);
      expect(foundAttribute.attribute_code).toBe(testCode);
    }, 30000);

    test("should filter attributes by frontend input type", async () => {
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          {
            field: "frontend_input",
            value: "text",
            conditionType: "eq",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThan(0);

      const attributes = parsed.data.map((item) => JSON.parse(item));
      attributes.forEach((attribute) => {
        expect(attribute.frontend_input).toBe("text");
      });
    }, 30000);
  });

  describe("Create Product Attribute", () => {
    test("should create a simple text attribute", async () => {
      const testAttributeCode = `test_text_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Text Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.meta.name).toBe("Product Attribute");
      expect(parsed.meta.endpoint).toContain("/products/attributes");
      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Text Attribute");
      expect(createdAttribute.entity_type_id).toBe("4"); // Product entity type
      expect(createdAttribute.backend_type).toBe("varchar");
      expect(createdAttribute.frontend_input).toBe("text");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a textarea attribute", async () => {
      const testAttributeCode = `test_textarea_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "textarea",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Textarea Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Textarea Attribute");
      expect(createdAttribute.backend_type).toBe("text");
      expect(createdAttribute.frontend_input).toBe("textarea");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a boolean attribute", async () => {
      const testAttributeCode = `test_boolean_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "boolean",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Boolean Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Boolean Attribute");
      expect(createdAttribute.backend_type).toBe("int");
      expect(createdAttribute.frontend_input).toBe("boolean");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a select attribute with options", async () => {
      const testAttributeCode = `test_select_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "singleselect",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Select Attribute",
        scope: "global",
        options: [
          {
            label: "Option 1",
            sortOrder: 1,
            isDefault: true,
          },
          {
            label: "Option 2",
            sortOrder: 2,
            isDefault: false,
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Select Attribute");
      expect(createdAttribute.backend_type).toBe("int");
      expect(createdAttribute.frontend_input).toBe("select");

      // Assert that options were created
      expect(createdAttribute.options).toBeDefined();
      expect(Array.isArray(createdAttribute.options)).toBe(true);
      expect(createdAttribute.options.length).toBe(3); // 1 empty option from Magento + 2 custom options

      // Verify the additional empty option that Magento always returns first
      expect(createdAttribute.options[0]).toHaveProperty("label", " ");
      expect(createdAttribute.options[0]).toHaveProperty("value", "");

      // Verify first custom option (should be in correct order)
      expect(createdAttribute.options[1]).toHaveProperty("label", "Option 1");

      // Verify second custom option (should be in correct order)
      expect(createdAttribute.options[2]).toHaveProperty("label", "Option 2");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a multiselect attribute", async () => {
      const testAttributeCode = `test_multiselect_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "multiselect",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Multiselect Attribute",
        scope: "global",
        options: [
          {
            label: "Multi Option 1",
            sortOrder: 1,
            isDefault: false,
          },
          {
            label: "Multi Option 2",
            sortOrder: 2,
            isDefault: false,
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Multiselect Attribute");
      expect(createdAttribute.backend_type).toBe("text");
      expect(createdAttribute.frontend_input).toBe("multiselect");

      // Assert that options were created
      expect(createdAttribute.options).toBeDefined();
      expect(Array.isArray(createdAttribute.options)).toBe(true);
      expect(createdAttribute.options.length).toBe(3); // 1 empty option from Magento + 2 custom options

      // Verify the additional empty option that Magento always returns first
      expect(createdAttribute.options[0]).toHaveProperty("label", " ");
      expect(createdAttribute.options[0]).toHaveProperty("value", "");

      // Verify first custom option (should be in correct order)
      expect(createdAttribute.options[1]).toHaveProperty("label", "Multi Option 1");

      // Verify second custom option (should be in correct order)
      expect(createdAttribute.options[2]).toHaveProperty("label", "Multi Option 2");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a decimal attribute", async () => {
      const testAttributeCode = `test_decimal_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "decimal",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Decimal Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Decimal Attribute");
      expect(createdAttribute.backend_type).toBe("varchar");
      expect(createdAttribute.frontend_input).toBe("text");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a price attribute", async () => {
      const testAttributeCode = `test_price_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "price",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Price Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Price Attribute");
      expect(createdAttribute.backend_type).toBe("decimal");
      expect(createdAttribute.frontend_input).toBe("price");
      expect(createdAttribute.backend_model).toBe("Magento\\Catalog\\Model\\Product\\Attribute\\Backend\\Price");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a weight attribute", async () => {
      const testAttributeCode = `test_weight_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "weight",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Weight Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Weight Attribute");
      expect(createdAttribute.backend_type).toBe("varchar");
      expect(createdAttribute.frontend_input).toBe("text");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create an integer attribute", async () => {
      const testAttributeCode = `test_integer_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "integer",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Integer Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Integer Attribute");
      expect(createdAttribute.backend_type).toBe("varchar");
      expect(createdAttribute.frontend_input).toBe("text");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create a date attribute", async () => {
      const testAttributeCode = `test_date_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "date",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Date Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Date Attribute");
      expect(createdAttribute.backend_type).toBe("datetime");
      expect(createdAttribute.frontend_input).toBe("date");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);
  });

  describe("Error Handling and Validation", () => {
    test("should handle duplicate attribute code error", async () => {
      const duplicateCode = `duplicate_test_attr_${Date.now()}`;

      // Create first attribute
      await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: duplicateCode,
        defaultFrontendLabel: "First Test Attribute",
        scope: "global",
      });

      // Try to create second attribute with same code
      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: duplicateCode,
        defaultFrontendLabel: "Second Test Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("Request failed with status code 400");
    }, 30000);

    test("should handle invalid attribute type", async () => {
      await expect(
        mockServer.callTool("create-product-attribute", {
          type: "invalid_type",
          attributeCode: "test_invalid",
          defaultFrontendLabel: "Test Invalid",
          scope: "global",
        })
      ).rejects.toThrow("Invalid enum value");
    }, 30000);

    test("should handle missing required fields", async () => {
      await expect(
        mockServer.callTool("create-product-attribute", {
          type: "text",
          // Missing attributeCode
          defaultFrontendLabel: "Test Missing",
          scope: "global",
        })
      ).rejects.toThrow("Required");
    }, 30000);

    test("should handle invalid scope", async () => {
      await expect(
        mockServer.callTool("create-product-attribute", {
          type: "text",
          attributeCode: "test_invalid_scope",
          defaultFrontendLabel: "Test Invalid Scope",
          scope: "invalid_scope",
        })
      ).rejects.toThrow("Invalid enum value");
    }, 30000);
  });

  describe("Scope Tests", () => {
    test("should create attribute with global scope", async () => {
      const testAttributeCode = `test_global_scope_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Global Scope Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Global Scope Attribute");
      expect(createdAttribute.scope).toBe("global");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create attribute with website scope", async () => {
      const testAttributeCode = `test_website_scope_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Website Scope Attribute",
        scope: "website",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Website Scope Attribute");
      expect(createdAttribute.scope).toBe("website");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create attribute with store scope", async () => {
      const testAttributeCode = `test_store_scope_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Store Scope Attribute",
        scope: "store",
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBe(1);

      const createdAttribute = JSON.parse(parsed.data[0]);
      expect(createdAttribute.attribute_code).toBe(testAttributeCode);
      expect(createdAttribute.default_frontend_label).toBe("Test Store Scope Attribute");
      expect(createdAttribute.scope).toBe("store");

      // Store for cleanup
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should create select attribute with options and different scopes", async () => {
      const scopes = ["global", "website", "store"] as const;

      for (const scope of scopes) {
        const testAttributeCode = `test_scope_select_${scope}_${Date.now()}`;

        const result = await mockServer.callTool("create-product-attribute", {
          type: "singleselect",
          attributeCode: testAttributeCode,
          defaultFrontendLabel: `Test ${scope.charAt(0).toUpperCase() + scope.slice(1)} Scope Select`,
          scope,
          options: [
            {
              label: `${scope} Option 1`,
              sortOrder: 1,
              isDefault: true,
            },
            {
              label: `${scope} Option 2`,
              sortOrder: 2,
              isDefault: false,
            },
          ],
        });

        const responseText = extractToolResponseText(result);
        const parsed = parseToolResponse(responseText);

        expect(parsed.data.length).toBe(1);

        const createdAttribute = JSON.parse(parsed.data[0]);
        expect(createdAttribute.attribute_code).toBe(testAttributeCode);
        expect(createdAttribute.default_frontend_label).toBe(`Test ${scope.charAt(0).toUpperCase() + scope.slice(1)} Scope Select`);
        expect(createdAttribute.scope).toBe(scope);
        expect(createdAttribute.frontend_input).toBe("select");
        expect(createdAttribute.backend_type).toBe("int");

        // Assert that options were created
        expect(createdAttribute.options).toBeDefined();
        expect(Array.isArray(createdAttribute.options)).toBe(true);
        expect(createdAttribute.options.length).toBe(3); // 1 empty option from Magento + 2 custom options

        // Verify the additional empty option that Magento always returns first
        expect(createdAttribute.options[0]).toHaveProperty("label", " ");
        expect(createdAttribute.options[0]).toHaveProperty("value", "");

        // Verify options have correct scope context
        expect(createdAttribute.options[1]).toHaveProperty("label", `${scope} Option 1`);
        expect(createdAttribute.options[2]).toHaveProperty("label", `${scope} Option 2`);

        // Store for cleanup
        if (createdAttribute.attribute_id) {
          createdAttributeIds.push(createdAttribute.attribute_id);
        }
      }
    }, 30000);
  });

  describe("Response Format Validation", () => {
    test("should return properly formatted search response structure", async () => {
      const result = await mockServer.callTool("search-products-attributes", { pageSize: 2 });

      const responseText = extractToolResponseText(result);

      // Check meta section
      expect(responseText).toContain("<meta>");
      expect(responseText).toContain("<name>Products Attributes</name>");
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

    test("should return properly formatted create response structure", async () => {
      const testAttributeCode = `test_format_attr_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Format Attribute",
        scope: "global",
      });

      const responseText = extractToolResponseText(result);

      // Check meta section
      expect(responseText).toContain("<meta>");
      expect(responseText).toContain("<name>Product Attribute</name>");
      expect(responseText).toContain("<endpoint>");

      // Check data section
      expect(responseText).toContain("<data>");

      const parsed = parseToolResponse(responseText);
      expect(parsed.meta).toBeDefined();
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed.data.length).toBe(1);

      // Store for cleanup
      const createdAttribute = JSON.parse(parsed.data[0]);
      if (createdAttribute.attribute_id) {
        createdAttributeIds.push(createdAttribute.attribute_id);
      }
    }, 30000);

    test("should return valid JSON for each attribute", async () => {
      const result = await mockServer.callTool("search-products-attributes", { pageSize: 3 });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      parsed.data.forEach((item) => {
        expect(() => JSON.parse(item)).not.toThrow();
        const attribute = JSON.parse(item);
        expect(typeof attribute).toBe("object");
        expect(attribute).toHaveProperty("attribute_code");
        expect(attribute).toHaveProperty("default_frontend_label");
        expect(attribute).toHaveProperty("entity_type_id");
      });
    }, 30000);
  });

  describe("Complex Search Scenarios", () => {
    test("should handle multiple filters with sorting", async () => {
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          {
            field: "backend_type",
            value: "varchar",
            conditionType: "eq",
          },
          {
            field: "frontend_input",
            value: "text",
            conditionType: "eq",
          },
        ],
        sortOrders: [
          {
            field: "attribute_code",
            direction: "ASC",
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
      expect(parsed.meta.name).toBe("Products Attributes");
      expect(parsed.meta.endpoint).toContain("/products/attributes");

      // Validate filters on returned attributes
      const attributes = parsed.data.map((item) => JSON.parse(item));
      attributes.forEach((attribute) => {
        expect(attribute.backend_type).toBe("varchar");
        expect(attribute.frontend_input).toBe("text");
      });
    }, 30000);

    test("should search for user-defined attributes", async () => {
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          {
            field: "is_user_defined",
            value: 1,
            conditionType: "eq",
          },
        ],
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      const parsed = parseToolResponse(responseText);

      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.meta.name).toBe("Products Attributes");
      expect(parsed.meta.endpoint).toContain("/products/attributes");

      // Validate that returned attributes are user-defined
      const attributes = parsed.data.map((item) => JSON.parse(item));
      attributes.forEach((attribute) => {
        expect(attribute.is_user_defined).toBe(true);
      });
    }, 30000);
  });
});
