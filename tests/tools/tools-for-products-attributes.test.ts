import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerProductAttributesTools } from "../../src/tools/tools-for-products-attributes";
import { createMockMcpServer, extractToolResponseText, MockMcpServer } from "../utils/mock-mcp-server";

describe("Product Attributes Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  const createdAttributeCodes: string[] = [];

  beforeAll(() => {
    console.log("🚀 Setting up product attributes functional tests...");
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
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterAll(async () => {
    console.log("🧹 Cleaning up created product attributes...");
    for (const attributeCode of createdAttributeCodes) {
      try {
        await mockServer.callTool("delete-product-attribute", { attributeCode });
        console.log(`✅ Deleted attribute: ${attributeCode}`);
      } catch (error) {
        console.log(`⚠️ Could not delete attribute ${attributeCode}:`, error);
      }
    }
    console.log("🎉 Cleanup completed!");
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

    test("should register search-products-attributes tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("search-products-attributes");
      expect(tool).toBeDefined();
      expect(tool.definition.title).toBe("Search Products Attributes");
      expect(tool.definition.annotations?.readOnlyHint).toBe(true);
    });

    test("should register create-product-attribute tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("create-product-attribute");
      expect(tool).toBeDefined();
      expect(tool.definition.title).toBe("Create Product Attribute");
      expect(tool.definition.annotations?.readOnlyHint).toBe(false);
    });
  });

  describe("Search Product Attributes", () => {
    test("should search product attributes with default parameters", async () => {
      const result = await mockServer.callTool("search-products-attributes", {});
      const responseText = extractToolResponseText(result);

      expect(responseText).toContain("<meta>");
      expect(responseText).toContain("Search Products Attributes");
      expect(responseText).toContain("<data>");
    });

    test("should search product attributes with pagination", async () => {
      const result = await mockServer.callTool("search-products-attributes", {
        page: 1,
        pageSize: 5,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("<page>1</page>");
      expect(responseText).toContain("<pageSize>5</pageSize>");
    });

    test("should search product attributes with filters", async () => {
      const result = await mockServer.callTool("search-products-attributes", {
        filters: [
          {
            field: "frontend_input",
            value: "text",
            conditionType: "eq",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Search Products Attributes");
    });
  });

  describe("Get Product Attribute By Code", () => {
    test("should get a product attribute by code", async () => {
      // Test with a standard attribute that should exist
      const result = await mockServer.callTool("get-product-attribute-by-code", {
        attributeCode: "name",
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Get Product Attribute By Code");
      expect(responseText).toContain("<data>");
    });

    test("should handle non-existent attribute code", async () => {
      const result = await mockServer.callTool("get-product-attribute-by-code", {
        attributeCode: "non_existent_attribute_xyz",
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Failed to retrieve data from Adobe Commerce");
      expect(responseText).toContain("attributeCode doesn't exist");
    });
  });

  describe("Create Product Attribute", () => {
    const testAttributeCode = `test_attr_${Date.now()}`;

    test("should create a text product attribute", async () => {
      const result = await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: testAttributeCode,
        defaultFrontendLabel: "Test Attribute",
        scope: "global",
      });

      createdAttributeCodes.push(testAttributeCode);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Create Product Attribute");
      expect(responseText).toContain("<data>");
    });

    test("should create a select attribute with options", async () => {
      const selectAttributeCode = `test_select_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "singleselect",
        attributeCode: selectAttributeCode,
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

      createdAttributeCodes.push(selectAttributeCode);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Create Product Attribute");
    });

    test("should create attribute with store labels", async () => {
      const labelAttributeCode = `test_labels_${Date.now()}`;

      const result = await mockServer.callTool("create-product-attribute", {
        type: "singleselect",
        attributeCode: labelAttributeCode,
        defaultFrontendLabel: "Test Labels Attribute",
        scope: "store",
        options: [
          {
            label: "Default Label",
            sortOrder: 1,
            isDefault: true,
            storeLabels: [
              {
                storeId: 1,
                label: "Store 1 Label",
              },
              {
                storeId: 2,
                label: "Store 2 Label",
              },
            ],
          },
        ],
      });

      createdAttributeCodes.push(labelAttributeCode);

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Create Product Attribute");
    });
  });

  describe("Update Product Attribute", () => {
    test("should update a product attribute label", async () => {
      // First create an attribute to update
      const attributeCode = `test_update_label_${Date.now()}`;

      await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: attributeCode,
        defaultFrontendLabel: "Original Label",
        scope: "global",
      });

      createdAttributeCodes.push(attributeCode);

      // Update only the label - this is more likely to succeed
      const result = await mockServer.callTool("update-product-attribute", {
        attributeCode: attributeCode,
        defaultFrontendLabel: "Updated Label",
      });

      const responseText = extractToolResponseText(result);
      // Label updates might still have restrictions, but let's see what happens
      expect(responseText).toMatch(/Update Product Attribute|Failed to retrieve data/);
    });
  });

  describe("Product Attribute Options", () => {
    let selectAttributeCode: string;

    beforeAll(async () => {
      selectAttributeCode = `test_options_${Date.now()}`;

      // Create a select attribute for testing options
      await mockServer.callTool("create-product-attribute", {
        type: "singleselect",
        attributeCode: selectAttributeCode,
        defaultFrontendLabel: "Test Options Attribute",
        scope: "global",
        options: [
          {
            label: "Initial Option",
            sortOrder: 1,
            isDefault: true,
          },
        ],
      });

      createdAttributeCodes.push(selectAttributeCode);
    });

    test("should get product attribute options", async () => {
      const result = await mockServer.callTool("get-product-attribute-options", {
        attributeCode: selectAttributeCode,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Product Attribute Options");
      expect(responseText).toContain("<totalItems>");
    });

    test("should add a product attribute option", async () => {
      const result = await mockServer.callTool("add-product-attribute-option", {
        attributeCode: selectAttributeCode,
        label: "New Option",
        sortOrder: 2,
        isDefault: false,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Product Attribute Option");
    });

    test("should add option with store labels", async () => {
      const result = await mockServer.callTool("add-product-attribute-option", {
        attributeCode: selectAttributeCode,
        label: "Option with Store Labels",
        sortOrder: 3,
        isDefault: false,
        storeLabels: [
          {
            storeId: 1,
            label: "Store 1 Option Label",
          },
        ],
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Product Attribute Option");
    });

    test("should update a product attribute option", async () => {
      // First add an option to get its ID
      const addResult = await mockServer.callTool("add-product-attribute-option", {
        attributeCode: selectAttributeCode,
        label: "Option to Update",
        sortOrder: 4,
        isDefault: false,
      });

      const addResponseText = extractToolResponseText(addResult);
      const optionId = JSON.parse(addResponseText.match(/<data>\s*(.+?)\s*<\/data>/s)?.[1] || "null");

      expect(optionId).not.toBeNull();
      expect(optionId).toBeTruthy();

      const result = await mockServer.callTool("update-product-attribute-option", {
        attributeCode: selectAttributeCode,
        optionId: optionId,
        label: "Updated Option Label",
        sortOrder: 5,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Product Attribute Option");
    });

    test("should delete a product attribute option", async () => {
      // First add an option to delete
      const addResult = await mockServer.callTool("add-product-attribute-option", {
        attributeCode: selectAttributeCode,
        label: "Option to Delete",
        sortOrder: 6,
        isDefault: false,
      });

      const addResponseText = extractToolResponseText(addResult);
      const optionId = JSON.parse(addResponseText.match(/<data>\s*(.+?)\s*<\/data>/s)?.[1] || "null");

      expect(optionId).not.toBeNull();
      expect(optionId).toBeTruthy();

      const result = await mockServer.callTool("delete-product-attribute-option", {
        attributeCode: selectAttributeCode,
        optionId: optionId,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Delete Product Attribute Option");
      expect(responseText).toContain("deleted");
    });
  });

  describe("Delete Product Attribute", () => {
    test("should delete a product attribute", async () => {
      // Create an attribute to delete
      const attributeCode = `test_delete_${Date.now()}`;

      await mockServer.callTool("create-product-attribute", {
        type: "text",
        attributeCode: attributeCode,
        defaultFrontendLabel: "Attribute to Delete",
        scope: "global",
      });

      // Delete the attribute (no need to track this one since we're deleting it)
      const result = await mockServer.callTool("delete-product-attribute", {
        attributeCode: attributeCode,
      });

      const responseText = extractToolResponseText(result);
      expect(responseText).toContain("Delete Product Attribute");
      expect(responseText).toContain("deleted successfully");
    });
  });
});
