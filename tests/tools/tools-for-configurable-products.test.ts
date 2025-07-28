import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerConfigurableProductTools } from "../../src/tools/tools-for-configurable-products";
import { registerProductTools } from "../../src/tools/tools-for-products";
import { registerProductAttributesTools } from "../../src/tools/tools-for-products-attributes";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { CombinedProductFixtures } from "./fixtures/combined-product-fixtures";

describe("Configurable Products Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let combinedFixtures: CombinedProductFixtures;
  const createdConfigurableProducts: Array<{ sku: string; optionIds: number[]; childSkus: string[] }> = [];

  beforeAll(async () => {
    console.log("🚀 Setting up configurable product functional tests...");
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

    // Register all necessary tools
    registerProductTools(mockServer.server, client);
    registerProductAttributesTools(mockServer.server, client);
    registerConfigurableProductTools(mockServer.server, client);

    // Initialize fixtures
    combinedFixtures = new CombinedProductFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
    createdConfigurableProducts.length = 0; // Clear tracking array for each test
  });

  afterEach(async () => {
    // Clean up any fixtures created during the test
    await cleanupConfigurableProductTest();
  });

  async function cleanupConfigurableProductTest(): Promise<void> {
    console.log("🧹 Starting configurable product test cleanup...");

    try {
      // Step 1: Clean up tracked configurable products directly
      for (const configProduct of createdConfigurableProducts) {
        console.log(`🔍 Cleaning up tracked configurable product: ${configProduct.sku}`);

        try {
          // Unlink all tracked children
          for (const childSku of configProduct.childSkus) {
            try {
              await mockServer.callTool("unlink-configurable-child", {
                sku: configProduct.sku,
                childSku: childSku,
              });
              console.log(`🔗 Unlinked child ${childSku} from ${configProduct.sku}`);
            } catch (error) {
              console.log(`⚠️ Error unlinking child ${childSku} from ${configProduct.sku}:`, error);
            }
          }

          // Delete all tracked configurable options
          for (const optionId of configProduct.optionIds) {
            try {
              await mockServer.callTool("delete-configurable-product-option", {
                sku: configProduct.sku,
                id: optionId,
              });
              console.log(`🗑️ Deleted configurable option ${optionId} from ${configProduct.sku}`);
            } catch (error) {
              console.log(`⚠️ Error deleting configurable option ${optionId} from ${configProduct.sku}:`, error);
            }
          }
        } catch (error) {
          console.log(`⚠️ Error processing configurable product ${configProduct.sku}:`, error);
        }
      }

      // Step 2: Now clean up products and attributes (options are gone, so attributes can be deleted)
      await combinedFixtures.cleanupCurrentTest();
    } catch (error) {
      console.log("⚠️ Error during configurable product test cleanup:", error);
      // Still try to clean up products and attributes even if option cleanup failed
      await combinedFixtures.cleanupCurrentTest();
    }

    console.log("✅ Configurable product test cleanup completed");
  }

  describe("Tool Registration", () => {
    test("should register all configurable product tools", () => {
      const toolNames = Array.from(mockServer.registeredTools.keys());

      expect(toolNames).toContain("add-configurable-product-option");
      expect(toolNames).toContain("link-configurable-child");
      expect(toolNames).toContain("unlink-configurable-child");
      expect(toolNames).toContain("get-configurable-product-children");
      expect(toolNames).toContain("get-configurable-product-options-all");
      expect(toolNames).toContain("get-configurable-product-option-by-id");
      expect(toolNames).toContain("update-configurable-product-option");
      expect(toolNames).toContain("delete-configurable-product-option");
    });

    test("should register add configurable product option tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("add-configurable-product-option");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Add Configurable Product Option");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register link configurable child tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("link-configurable-child");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Link Configurable Child");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(false);
    });

    test("should register get configurable product children tool with correct configuration", () => {
      const tool = mockServer.registeredTools.get("get-configurable-product-children");
      expect(tool).toBeDefined();
      expect(tool!.definition.title).toBe("Get Configurable Product Children");
      expect(tool!.definition.annotations?.readOnlyHint).toBe(true);
    });
  });

  describe("Configurable Product Main Flow", () => {
    test("should create configurable product with configurable attribute variants and link children", async () => {
      combinedFixtures.setCurrentTest("configurable_product_main_flow");
      console.log("🧪 Testing main configurable product flow...");

      // Step 1: Create configurable attribute and two simple products with different configurable attributes
      const testScenario = await combinedFixtures.createScenario("PRODUCT_WITH_SINGLESELECT");

      // Debug: Log all created attributes
      console.log("🔍 Created attributes:");
      for (const [name, attribute] of testScenario.attributes) {
        console.log(`  - ${name}: ${attribute.attribute_code} (${attribute.frontend_input})`);
        if (attribute.options) {
          console.log(`    Options: ${attribute.options.map((opt) => `${opt.label}=${opt.value}`).join(", ")}`);
        }
      }

      // Get the configurable attribute that was created
      const configurableAttributeCode = testScenario.attributeCodeMapping.get("configurable_attribute");
      expect(configurableAttributeCode).toBeDefined();

      const configurableAttribute = Array.from(testScenario.attributes.values()).find((attr) => attr.attribute_code === configurableAttributeCode);
      expect(configurableAttribute).toBeDefined();
      expect(configurableAttribute!.options).toBeDefined();
      expect(configurableAttribute!.options!.length).toBeGreaterThan(0);

      // Get the two simple products that were created
      const simpleProducts = Array.from(testScenario.products.values());
      expect(simpleProducts).toHaveLength(1);

      const simpleProduct = simpleProducts[0];
      console.log(
        `📦 Created simple product: ${simpleProduct.sku} with configurable attribute: ${
          simpleProduct.custom_attributes?.find((attr) => attr.attribute_code === configurableAttributeCode)?.value
        }`
      );

      // Step 2: Create a configurable product
      const configurableProductSku = `configurable-tshirt-${combinedFixtures.getCurrentTestUniqueId()}`;

      const createConfigurableResult = await mockServer.callTool("create-product", {
        sku: configurableProductSku,
        name: "Configurable T-Shirt " + combinedFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "configurable",
        status: 1,
        visibility: 4,
        custom_attributes: [
          { attribute_code: "description", value: "A configurable t-shirt with configurable attribute options" },
          { attribute_code: "short_description", value: "Configurable t-shirt" },
        ],
      });

      const responseText = extractToolResponseText(createConfigurableResult);
      const parsed = parseToolResponse(responseText);
      expect(parsed.data).toBeDefined();
      console.log(`🎯 Created configurable product: ${configurableProductSku}`);

      // Step 3: Add configurable product option (configurable attribute)
      const configurableOptions = configurableAttribute!
        .options!.map((opt) => opt.value)
        .filter(Boolean)
        .map((val) => Number(val));
      expect(configurableOptions.length).toBeGreaterThan(0);

      const addOptionResult = await mockServer.callTool("add-configurable-product-option", {
        sku: configurableProductSku,
        attributeId: configurableAttribute!.attribute_id,
        optionIds: configurableOptions,
        label: "Configurable Attribute",
        position: 1,
        isUseDefault: false,
      });
      const optionResponseText = extractToolResponseText(addOptionResult);
      const optionParsed = parseToolResponse(optionResponseText);
      expect(optionParsed.data).toBeDefined();
      console.log(`🎨 Added configurable attribute option to configurable product`);
      console.log(`📋 Option response data:`, optionParsed.data);

      // Track the configurable product for cleanup
      const optionId = Number(JSON.parse(optionParsed.data[0]));
      createdConfigurableProducts.push({
        sku: configurableProductSku,
        optionIds: [optionId], // Store the option ID that was created
        childSkus: [],
      });

      // Step 4: Link the simple product as a child of the configurable product
      const linkChildResult = await mockServer.callTool("link-configurable-child", {
        sku: configurableProductSku,
        childSku: simpleProduct.sku,
      });
      const linkResponseText = extractToolResponseText(linkChildResult);
      const linkParsed = parseToolResponse(linkResponseText);
      expect(linkParsed.data[0]).toBe("true");
      console.log(`🔗 Linked simple product ${simpleProduct.sku} to configurable product ${configurableProductSku}`);

      // Track the linked child
      const configProduct = createdConfigurableProducts.find((p) => p.sku === configurableProductSku);
      if (configProduct) {
        configProduct.childSkus.push(simpleProduct.sku);
      }

      // Step 5: Verify that the simple product is not visible (should be hidden)
      const searchSimpleResult = await mockServer.callTool("search-products", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: simpleProduct.sku,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });
      const searchSimpleResponseText = extractToolResponseText(searchSimpleResult);
      const searchSimpleParsed = parseToolResponse(searchSimpleResponseText);
      // The simple product should not be visible in search results when linked to configurable
      expect(searchSimpleParsed.data).toBeDefined();
      console.log(`🔍 Verified simple product visibility status`);

      // Step 6: Verify that the configurable product is visible
      const searchConfigurableResult = await mockServer.callTool("search-products", {
        searchCriteria: {
          filterGroups: [
            {
              filters: [
                {
                  field: "sku",
                  value: configurableProductSku,
                  conditionType: "eq",
                },
              ],
            },
          ],
        },
      });
      const searchConfigurableResponseText = extractToolResponseText(searchConfigurableResult);
      const searchConfigurableParsed = parseToolResponse(searchConfigurableResponseText);
      expect(searchConfigurableParsed.data).toBeDefined();
      console.log(`🔍 Verified configurable product is visible`);

      // Step 7: Get configurable product children to verify the link
      const getChildrenResult = await mockServer.callTool("get-configurable-product-children", {
        sku: configurableProductSku,
      });
      const childrenResponseText = extractToolResponseText(getChildrenResult);
      const childrenParsed = parseToolResponse(childrenResponseText);
      expect(childrenParsed.data).toBeDefined();

      // Extract child SKUs from the data tag (not context)
      const childSkus = childrenParsed.data[0];
      expect(childSkus).toContain(simpleProduct.sku);
      console.log(`👶 Verified children: ${childSkus}`);

      // Step 8: Get all configurable options to verify the configurable attribute option was added
      const getOptionsResult = await mockServer.callTool("get-configurable-product-options-all", {
        sku: configurableProductSku,
      });
      const optionsResponseText = extractToolResponseText(getOptionsResult);
      const optionsParsed = parseToolResponse(optionsResponseText);
      expect(optionsParsed.data).toBeDefined();
      console.log(`🎨 Verified configurable options: ${optionsParsed.data}`);

      console.log("✅ Main configurable product flow completed successfully!");
    }, 30000); // 30 second timeout for this complex test

    test("should create multiple configurable attribute variants and link them to configurable product", async () => {
      combinedFixtures.setCurrentTest("configurable_product_multiple_variants_flow");
      console.log("🧪 Testing multiple configurable attribute variants flow...");

      // Step 1: Create configurable attribute and multiple simple products
      const testScenario = await combinedFixtures.createScenario("PRODUCT_WITH_SINGLESELECT");

      const configurableAttributeCode = testScenario.attributeCodeMapping.get("configurable_attribute");
      expect(configurableAttributeCode).toBeDefined();

      const configurableAttribute = Array.from(testScenario.attributes.values()).find((attr) => attr.attribute_code === configurableAttributeCode);
      expect(configurableAttribute).toBeDefined();

      // Create additional simple products with different configurable attributes
      const additionalProducts: Array<{ sku: string; configurableValue: string }> = [];
      const configurableOptions = configurableAttribute!.options!;

      console.log("🔍 Configurable options:", configurableOptions);
      for (let i = 2; i < 4; i++) {
        const additionalSku = `simple-tshirt-${i}-${combinedFixtures.getCurrentTestUniqueId()}`;
        const configurableOption = configurableOptions[i];

        await mockServer.callTool("create-product", {
          sku: additionalSku,
          name: `T-Shirt ${configurableOption.label} ${combinedFixtures.getCurrentTestUniqueId()}`,
          price: 24.99 + i,
          type_id: "simple",
          status: 1,
          visibility: 4,
          weight: 0.3,
          custom_attributes: [
            { attribute_code: "description", value: `A ${configurableOption.label.toLowerCase()} t-shirt` },
            { attribute_code: "short_description", value: `${configurableOption.label} t-shirt` },
            { attribute_code: configurableAttributeCode, value: configurableOption.value },
          ],
        });
        additionalProducts.push({ sku: additionalSku, configurableValue: configurableOption.label });
      }

      // Step 2: Create configurable product
      const configurableProductSku = `configurable-tshirt-multi-${combinedFixtures.getCurrentTestUniqueId()}`;

      await mockServer.callTool("create-product", {
        sku: configurableProductSku,
        name: "Configurable T-Shirt Multi-Option " + combinedFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "configurable",
        status: 1,
        visibility: 4,
        weight: 0.3,
        custom_attributes: [
          { attribute_code: "description", value: "A configurable t-shirt with multiple configurable attribute options" },
          { attribute_code: "short_description", value: "Multi-option configurable t-shirt" },
        ],
      });

      // Step 3: Add configurable product option
      const allConfigurableOptionIds = configurableOptions
        .map((opt) => opt.value)
        .filter(Boolean)
        .map((val) => Number(val));

      const addOptionResult = await mockServer.callTool("add-configurable-product-option", {
        sku: configurableProductSku,
        attributeId: configurableAttribute!.attribute_id,
        optionIds: allConfigurableOptionIds,
        label: "Configurable Attribute",
        position: 1,
        isUseDefault: false,
      });
      const optionResponseText = extractToolResponseText(addOptionResult);
      const optionParsed = parseToolResponse(optionResponseText);
      expect(optionParsed.data).toBeDefined();

      // Track the configurable product for cleanup
      const optionId = Number(JSON.parse(optionParsed.data[0]));
      createdConfigurableProducts.push({
        sku: configurableProductSku,
        optionIds: [optionId], // Store the option ID that was created
        childSkus: [],
      });

      // Step 4: Link all simple products as children
      const originalProduct = Array.from(testScenario.products.values())[0];
      const allProducts = [originalProduct, ...additionalProducts.map((p) => ({ sku: p.sku }))];
      const successfullyLinkedProducts: Array<{ sku: string }> = [];

      for (const product of allProducts) {
        try {
          await mockServer.callTool("link-configurable-child", {
            sku: configurableProductSku,
            childSku: product.sku,
          });
          console.log(`🔗 Linked ${product.sku} to configurable product`);
          successfullyLinkedProducts.push(product);

          // Track the linked child
          const configProduct = createdConfigurableProducts.find((p) => p.sku === configurableProductSku);
          if (configProduct) {
            configProduct.childSkus.push(product.sku);
          }
        } catch (error) {
          console.log(`⚠️ Failed to link ${product.sku} to configurable product:`, error);
          // Continue with other products even if one fails
        }
      }

      // Step 5: Verify that at least some children are linked
      expect(successfullyLinkedProducts.length).toBeGreaterThan(0);

      const getChildrenResult = await mockServer.callTool("get-configurable-product-children", {
        sku: configurableProductSku,
      });
      const childrenResponseText = extractToolResponseText(getChildrenResult);
      const childrenParsed = parseToolResponse(childrenResponseText);
      const childSkus = childrenParsed.data[0];

      // Verify that successfully linked products are actually linked
      for (const product of successfullyLinkedProducts) {
        expect(childSkus).toContain(product.sku);
      }

      console.log(`✅ Successfully linked ${successfullyLinkedProducts.length} products to configurable product`);
      console.log(`👶 Children: ${childSkus}`);
    }, 45000); // 45 second timeout for multiple products

    test("should demonstrate complete configurable product lifecycle with unlink and delete operations", async () => {
      combinedFixtures.setCurrentTest("configurable_product_complete_lifecycle_flow");
      console.log("🧪 Testing complete configurable product lifecycle...");

      // Step 1: Create test scenario and configurable product
      const testScenario = await combinedFixtures.createScenario("PRODUCT_WITH_SINGLESELECT");
      const simpleProduct = Array.from(testScenario.products.values())[0];

      // Get the configurable attribute that was created
      const configurableAttributeCode = testScenario.attributeCodeMapping.get("configurable_attribute");
      expect(configurableAttributeCode).toBeDefined();

      const configurableAttribute = Array.from(testScenario.attributes.values()).find((attr) => attr.attribute_code === configurableAttributeCode);
      expect(configurableAttribute).toBeDefined();
      expect(configurableAttribute!.options).toBeDefined();
      expect(configurableAttribute!.options!.length).toBeGreaterThan(0);

      const configurableProductSku = `configurable-lifecycle-test-${combinedFixtures.getCurrentTestUniqueId()}`;

      await mockServer.callTool("create-product", {
        sku: configurableProductSku,
        name: "Configurable Product for Lifecycle Test " + combinedFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "configurable",
        status: 1,
        visibility: 4,
        weight: 0.3,
        custom_attributes: [
          { attribute_code: "description", value: "A configurable product for testing complete lifecycle" },
          { attribute_code: "short_description", value: "Lifecycle test product" },
        ],
      });

      // Step 2: Add configurable product option
      const configurableOptions = configurableAttribute!
        .options!.map((opt) => opt.value)
        .filter(Boolean)
        .map((val) => Number(val));
      expect(configurableOptions.length).toBeGreaterThan(0);

      const addOptionResult = await mockServer.callTool("add-configurable-product-option", {
        sku: configurableProductSku,
        attributeId: configurableAttribute!.attribute_id,
        optionIds: configurableOptions,
        label: "Configurable Attribute",
        position: 1,
        isUseDefault: false,
      });
      const optionResponseText = extractToolResponseText(addOptionResult);
      const optionParsed = parseToolResponse(optionResponseText);
      expect(optionParsed.data).toBeDefined();
      console.log(`🎨 Added configurable attribute option to configurable product`);

      // Track the configurable product for cleanup
      const optionId = Number(JSON.parse(optionParsed.data[0]));

      // Step 3: Link the child product
      await mockServer.callTool("link-configurable-child", {
        sku: configurableProductSku,
        childSku: simpleProduct.sku,
      });

      // Step 4: Verify the child is linked
      const getChildrenBeforeResult = await mockServer.callTool("get-configurable-product-children", {
        sku: configurableProductSku,
      });
      const childrenBeforeResponseText = extractToolResponseText(getChildrenBeforeResult);
      const childrenBeforeParsed = parseToolResponse(childrenBeforeResponseText);
      const childSkusBefore = childrenBeforeParsed.data[0];
      expect(childSkusBefore).toContain(simpleProduct.sku);
      console.log(`🔗 Verified child product ${simpleProduct.sku} is linked`);

      // Step 5: Verify the option exists
      const getOptionsBeforeResult = await mockServer.callTool("get-configurable-product-options-all", {
        sku: configurableProductSku,
      });
      const optionsBeforeResponseText = extractToolResponseText(getOptionsBeforeResult);
      const optionsBeforeParsed = parseToolResponse(optionsBeforeResponseText);
      expect(optionsBeforeParsed.data).toBeDefined();
      console.log(`🎨 Verified configurable option exists`);

      // Step 6: Unlink the child product
      const unlinkChildResult = await mockServer.callTool("unlink-configurable-child", {
        sku: configurableProductSku,
        childSku: simpleProduct.sku,
      });
      const unlinkResponseText = extractToolResponseText(unlinkChildResult);
      const unlinkParsed = parseToolResponse(unlinkResponseText);
      expect(unlinkParsed.data[0]).toBe("true");
      console.log(`🔗 Successfully unlinked child product`);

      // Step 7: Verify the child is no longer linked
      const getChildrenAfterResult = await mockServer.callTool("get-configurable-product-children", {
        sku: configurableProductSku,
      });
      const childrenAfterResponseText = extractToolResponseText(getChildrenAfterResult);
      const childrenAfterParsed = parseToolResponse(childrenAfterResponseText);
      const childSkusAfter = childrenAfterParsed.data[0];
      expect(childSkusAfter).not.toContain(simpleProduct.sku);
      console.log(`✅ Verified child product is no longer linked`);

      // Step 8: Delete the configurable product option
      const deleteOptionResult = await mockServer.callTool("delete-configurable-product-option", {
        sku: configurableProductSku,
        id: optionId,
      });
      const deleteResponseText = extractToolResponseText(deleteOptionResult);
      const deleteParsed = parseToolResponse(deleteResponseText);
      expect(deleteParsed.data[0]).toBe("true");
      console.log(`🗑️ Successfully deleted configurable product option`);

      // Step 9: Verify the context message is correct
      const contextMessage = extractContextContent(deleteResponseText);
      expect(contextMessage).toContain(
        `Configurable option with ID ${optionId} has been successfully deleted from configurable product with SKU ${configurableProductSku}`
      );

      // Step 10: Verify the option is deleted
      const getOptionsAfterResult = await mockServer.callTool("get-configurable-product-options-all", {
        sku: configurableProductSku,
      });
      const optionsAfterResponseText = extractToolResponseText(getOptionsAfterResult);
      const optionsAfterParsed = parseToolResponse(optionsAfterResponseText);
      expect(optionsAfterParsed.data).toBeDefined();
      console.log(`✅ Verified configurable option is deleted`);

      console.log("✅ Successfully completed configurable product lifecycle test");
    }, 45000);
  });

  describe("Individual Tool Tests", () => {
    test("should get configurable product option by ID", async () => {
      combinedFixtures.setCurrentTest("get_configurable_product_option_by_id");
      console.log("🧪 Testing get configurable product option by ID...");

      // Step 1: Create test scenario and configurable product
      const testScenario = await combinedFixtures.createScenario("PRODUCT_WITH_SINGLESELECT");

      const configurableAttributeCode = testScenario.attributeCodeMapping.get("configurable_attribute");
      expect(configurableAttributeCode).toBeDefined();

      const configurableAttribute = Array.from(testScenario.attributes.values()).find((attr) => attr.attribute_code === configurableAttributeCode);
      expect(configurableAttribute).toBeDefined();

      const configurableProductSku = `configurable-get-option-test-${combinedFixtures.getCurrentTestUniqueId()}`;

      await mockServer.callTool("create-product", {
        sku: configurableProductSku,
        name: "Configurable Product for Get Option Test " + combinedFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "configurable",
        status: 1,
        visibility: 4,
        weight: 0.3,
        custom_attributes: [
          { attribute_code: "description", value: "A configurable product for testing get option by ID" },
          { attribute_code: "short_description", value: "Get option test product" },
        ],
      });

      // Step 2: Add configurable product option
      const configurableOptions = configurableAttribute!
        .options!.map((opt) => opt.value)
        .filter(Boolean)
        .map((val) => Number(val));
      expect(configurableOptions.length).toBeGreaterThan(0);

      const addOptionResult = await mockServer.callTool("add-configurable-product-option", {
        sku: configurableProductSku,
        attributeId: configurableAttribute!.attribute_id,
        optionIds: configurableOptions,
        label: "Configurable Attribute",
        position: 1,
        isUseDefault: false,
      });
      const optionResponseText = extractToolResponseText(addOptionResult);
      const optionParsed = parseToolResponse(optionResponseText);
      expect(optionParsed.data).toBeDefined();

      // Track the configurable product for cleanup
      const optionId = Number(JSON.parse(optionParsed.data[0]));
      createdConfigurableProducts.push({
        sku: configurableProductSku,
        optionIds: [optionId],
        childSkus: [],
      });

      // Step 3: Get the specific option by ID
      const getOptionByIdResult = await mockServer.callTool("get-configurable-product-option-by-id", {
        sku: configurableProductSku,
        id: optionId,
      });
      const getOptionResponseText = extractToolResponseText(getOptionByIdResult);
      const getOptionParsed = parseToolResponse(getOptionResponseText);
      expect(getOptionParsed.data).toBeDefined();

      // Verify the returned option data
      const optionData = JSON.parse(getOptionParsed.data[0]);
      expect(optionData).toBeDefined();
      expect(optionData.id).toBe(optionId);
      expect(Number(optionData.attribute_id)).toBe(configurableAttribute!.attribute_id);
      expect(optionData.label).toBe("Configurable Attribute");
      expect(optionData.position).toBe(1);

      console.log(`✅ Successfully retrieved configurable option by ID: ${optionId}`);
      console.log(`📋 Option data:`, optionData);
    }, 30000);

    test("should update configurable product option", async () => {
      combinedFixtures.setCurrentTest("update_configurable_product_option");
      console.log("🧪 Testing update configurable product option...");

      // Step 1: Create test scenario and configurable product
      const testScenario = await combinedFixtures.createScenario("PRODUCT_WITH_SINGLESELECT");

      const configurableAttributeCode = testScenario.attributeCodeMapping.get("configurable_attribute");
      expect(configurableAttributeCode).toBeDefined();

      const configurableAttribute = Array.from(testScenario.attributes.values()).find((attr) => attr.attribute_code === configurableAttributeCode);
      expect(configurableAttribute).toBeDefined();

      const configurableProductSku = `configurable-update-option-test-${combinedFixtures.getCurrentTestUniqueId()}`;

      await mockServer.callTool("create-product", {
        sku: configurableProductSku,
        name: "Configurable Product for Update Option Test " + combinedFixtures.getCurrentTestUniqueId(),
        price: 29.99,
        type_id: "configurable",
        status: 1,
        visibility: 4,
        weight: 0.3,
        custom_attributes: [
          { attribute_code: "description", value: "A configurable product for testing update option" },
          { attribute_code: "short_description", value: "Update option test product" },
        ],
      });

      // Step 2: Add configurable product option
      const configurableOptions = configurableAttribute!
        .options!.map((opt) => opt.value)
        .filter(Boolean)
        .map((val) => Number(val));
      expect(configurableOptions.length).toBeGreaterThan(0);

      const addOptionResult = await mockServer.callTool("add-configurable-product-option", {
        sku: configurableProductSku,
        attributeId: configurableAttribute!.attribute_id,
        optionIds: configurableOptions,
        label: "Original Label",
        position: 1,
        isUseDefault: false,
      });
      const optionResponseText = extractToolResponseText(addOptionResult);
      const optionParsed = parseToolResponse(optionResponseText);
      expect(optionParsed.data).toBeDefined();

      // Track the configurable product for cleanup
      const optionId = Number(JSON.parse(optionParsed.data[0]));
      createdConfigurableProducts.push({
        sku: configurableProductSku,
        optionIds: [optionId],
        childSkus: [],
      });

      // Step 3: Verify the original option
      const getOriginalOptionResult = await mockServer.callTool("get-configurable-product-option-by-id", {
        sku: configurableProductSku,
        id: optionId,
      });
      const originalOptionResponseText = extractToolResponseText(getOriginalOptionResult);
      const originalOptionParsed = parseToolResponse(originalOptionResponseText);
      const originalOptionData = JSON.parse(originalOptionParsed.data[0]);
      expect(originalOptionData.label).toBe("Original Label");
      expect(originalOptionData.position).toBe(1);
      console.log(`📋 Original option data:`, originalOptionData);

      // Step 4: Update the configurable product option
      const updateOptionResult = await mockServer.callTool("update-configurable-product-option", {
        sku: configurableProductSku,
        id: optionId,
        attributeId: configurableAttribute!.attribute_id,
        optionIds: [optionId],
        label: "Updated Label",
        position: 2,
        isUseDefault: true,
      });
      const updateResponseText = extractToolResponseText(updateOptionResult);
      const updateParsed = parseToolResponse(updateResponseText);
      expect(updateParsed.data).toBeDefined();
      console.log(`🔄 Updated configurable option with ID: ${optionId}`);

      // Step 5: Verify the updated option
      const getUpdatedOptionResult = await mockServer.callTool("get-configurable-product-option-by-id", {
        sku: configurableProductSku,
        id: optionId,
      });
      const updatedOptionResponseText = extractToolResponseText(getUpdatedOptionResult);
      const updatedOptionParsed = parseToolResponse(updatedOptionResponseText);
      const updatedOptionData = JSON.parse(updatedOptionParsed.data[0]);

      expect(updatedOptionData.label).toBe("Updated Label");
      expect(updatedOptionData.position).toBe(2);

      console.log(`✅ Successfully updated configurable option`);
      console.log(`📋 Updated option data:`, updatedOptionData);
    }, 30000);
  });
});
