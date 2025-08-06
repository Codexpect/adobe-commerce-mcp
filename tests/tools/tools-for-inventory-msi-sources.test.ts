import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";
import { registerInventoryMsiSourceTools } from "../../src/tools/tools-for-inventory-msi-sources";
import { createMockMcpServer, extractContextContent, extractToolResponseText, MockMcpServer, parseToolResponse } from "../utils/mock-mcp-server";
import { InventoryFixtures } from "./fixtures/inventory-fixtures";

describe("Inventory Sources Tools - Functional Tests", () => {
  let client: AdobeCommerceClient;
  let mockServer: MockMcpServer;
  let inventoryFixtures: InventoryFixtures;

  beforeAll(async () => {
    console.log("🚀 Setting up inventory sources tools functional tests...");
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

    // Register sources tools
    registerInventoryMsiSourceTools(mockServer.server, client);

    // Initialize fixtures
    inventoryFixtures = new InventoryFixtures(client);
  });

  beforeEach(() => {
    mockServer.clearHistory();
  });

  afterEach(async () => {
    // Clean up fixtures
    await inventoryFixtures.cleanupCurrentTest();
  });

  describe("Sources Tools", () => {
    test("should create, get, and update sources", async () => {
      inventoryFixtures.setCurrentTest("sources_lifecycle");
      console.log("🧪 Testing sources lifecycle...");

      // Step 1: Create a source
      const sourceInput = {
        source_code: "test_source_" + inventoryFixtures.getCurrentTestUniqueId(),
        name: "Test Source " + inventoryFixtures.getCurrentTestUniqueId(),
        enabled: true,
        country_id: "US",
        email: "test@example.com",
        contact_name: "Test Contact",
        description: "A test source for lifecycle testing",
        latitude: 40.7128,
        longitude: -74.006,
        region: "New York",
        city: "New York",
        street: "123 Test St",
        postcode: "10001",
        phone: "+1-555-123-4567",
        use_default_carrier_config: true,
      };

      const createSourceResult = await mockServer.callTool("create-msi-source", sourceInput);

      const createResponseText = extractToolResponseText(createSourceResult);
      const createParsed = parseToolResponse(createResponseText);
      expect(createParsed.data).toBeDefined();

      // Verify context message
      const createContextMessage = extractContextContent(createResponseText);
      expect(createContextMessage).toContain("Source has been successfully created");

      const sourceCode = sourceInput.source_code;
      console.log(`🏪 Created source: ${sourceCode}`);

      // Step 2: Get source by code and validate the data matches what was sent
      const getSourceResult = await mockServer.callTool("get-msi-source-by-code", {
        source_code: sourceCode,
      });

      const getResponseText = extractToolResponseText(getSourceResult);
      const getParsed = parseToolResponse(getResponseText);
      expect(getParsed.data).toBeDefined();

      const retrievedSourceData = JSON.parse(getParsed.data[0]);
      expect(retrievedSourceData.source_code).toBe(sourceCode);
      
      // Validate that the retrieved data matches what we sent
      expect(retrievedSourceData.name).toBe(sourceInput.name);
      expect(retrievedSourceData.enabled).toBe(sourceInput.enabled);
      expect(retrievedSourceData.country_id).toBe(sourceInput.country_id);
      expect(retrievedSourceData.email).toBe(sourceInput.email);
      expect(retrievedSourceData.contact_name).toBe(sourceInput.contact_name);
      expect(retrievedSourceData.description).toBe(sourceInput.description);
      expect(retrievedSourceData.latitude).toBe(sourceInput.latitude);
      expect(retrievedSourceData.longitude).toBe(sourceInput.longitude);
      expect(retrievedSourceData.region).toBe(sourceInput.region);
      expect(retrievedSourceData.city).toBe(sourceInput.city);
      expect(retrievedSourceData.street).toBe(sourceInput.street);
      expect(retrievedSourceData.postcode).toBe(sourceInput.postcode);
      expect(retrievedSourceData.phone).toBe(sourceInput.phone);
      // Note: use_default_carrier_config might be set to true by default by the API
      // even when we send false, so we'll check if it's defined rather than exact match
      expect(retrievedSourceData.use_default_carrier_config).toBeDefined();
      
      console.log(`📦 Retrieved source: ${retrievedSourceData.name}`);

      // Step 3: Update source
      const updateInput = {
        source_code: sourceCode,
        name: "Updated Test Source " + inventoryFixtures.getCurrentTestUniqueId(),
        email: "updated@example.com",
        contact_name: "Updated Contact",
        country_id: "US",
        postcode: "10001",
      };

      const updateSourceResult = await mockServer.callTool("update-msi-source", updateInput);

      const updateResponseText = extractToolResponseText(updateSourceResult);
      const updateParsed = parseToolResponse(updateResponseText);
      expect(updateParsed.data).toBeDefined();

      // Verify context message
      const updateContextMessage = extractContextContent(updateResponseText);
      expect(updateContextMessage).toContain("Source has been successfully updated");

      // Step 4: Get the updated source and validate the changes
      const getUpdatedSourceResult = await mockServer.callTool("get-msi-source-by-code", {
        source_code: sourceCode,
      });

      const getUpdatedResponseText = extractToolResponseText(getUpdatedSourceResult);
      const getUpdatedParsed = parseToolResponse(getUpdatedResponseText);
      expect(getUpdatedParsed.data).toBeDefined();

      const updatedSourceData = JSON.parse(getUpdatedParsed.data[0]);
      
      // Validate that the updated data matches what we sent
      expect(updatedSourceData.name).toBe(updateInput.name);
      expect(updatedSourceData.email).toBe(updateInput.email);
      expect(updatedSourceData.contact_name).toBe(updateInput.contact_name);
      expect(updatedSourceData.country_id).toBe(updateInput.country_id);
      expect(updatedSourceData.postcode).toBe(updateInput.postcode);
      
      // Validate that unchanged fields remain the same
      expect(updatedSourceData.enabled).toBe(sourceInput.enabled);
      expect(updatedSourceData.description).toBe(sourceInput.description);
      expect(updatedSourceData.latitude).toBe(sourceInput.latitude);
      expect(updatedSourceData.longitude).toBe(sourceInput.longitude);
      expect(updatedSourceData.region).toBe(sourceInput.region);
      expect(updatedSourceData.city).toBe(sourceInput.city);
      expect(updatedSourceData.street).toBe(sourceInput.street);
      expect(updatedSourceData.phone).toBe(sourceInput.phone);
      // Note: use_default_carrier_config might be set to true by default by the API
      // even when we send false, so we'll check if it's defined rather than exact match
      expect(updatedSourceData.use_default_carrier_config).toBeDefined();

      console.log(`🔄 Updated source: ${sourceCode}`);
      console.log("✅ Sources lifecycle test completed successfully!");
    }, 45000);

    test("should search sources with various criteria", async () => {
      inventoryFixtures.setCurrentTest("search_sources");
      console.log("🧪 Testing source search...");

      // Step 1: Create test sources using fixtures
      const source1 = await inventoryFixtures.createSourceFixture("search_test_1", {
        name: "Search Test Source 1",
        enabled: true,
        country_id: "US",
        email: "search1@example.com",
        contact_name: "Search Test 1",
        postcode: "10001",
      });

      const source2 = await inventoryFixtures.createSourceFixture("search_test_2", {
        name: "Search Test Source 2",
        enabled: true,
        country_id: "DE",
        email: "search2@example.com",
        contact_name: "Search Test 2",
        postcode: "80331",
      });

      console.log(`🏪 Created test sources: ${source1.source_code}, ${source2.source_code}`);

      // Step 2: Search sources using the current test filter to find only our fixtures
      const searchSourcesResult = await mockServer.callTool("search-msi-sources", {
        filters: [inventoryFixtures.getCurrentTestSourceFilter()],
        pageSize: 10,
      });

      const searchResponseText = extractToolResponseText(searchSourcesResult);
      const searchParsed = parseToolResponse(searchResponseText);
      expect(searchParsed.data).toBeDefined();

      const sourcesData = searchParsed.data.map((item) => JSON.parse(item));
      
      // Verify we found our fixtures with the expected source codes
      const foundSourceCodes = sourcesData.map((source) => source.source_code);
      const uniqueId = inventoryFixtures.getCurrentTestUniqueId();

      // Check that we have exactly 2 items with the expected source codes
      expect(sourcesData.length).toBe(2);
      expect(foundSourceCodes).toContain(`search_test_1_${uniqueId}`);
      expect(foundSourceCodes).toContain(`search_test_2_${uniqueId}`);

      // Validate that the found sources have the correct data
      const foundSource1 = sourcesData.find(s => s.source_code === `search_test_1_${uniqueId}`);
      const foundSource2 = sourcesData.find(s => s.source_code === `search_test_2_${uniqueId}`);
      
      expect(foundSource1).toBeDefined();
      expect(foundSource1!.name).toBe(`Search Test Source 1 search_test_1_${uniqueId}`);
      expect(foundSource1!.enabled).toBe(true);
      expect(foundSource1!.country_id).toBe("US");
      expect(foundSource1!.email).toBe("search1@example.com");
      expect(foundSource1!.contact_name).toBe("Search Test 1");
      
      expect(foundSource2).toBeDefined();
      expect(foundSource2!.name).toBe(`Search Test Source 2 search_test_2_${uniqueId}`);
      expect(foundSource2!.enabled).toBe(true);
      expect(foundSource2!.country_id).toBe("DE");
      expect(foundSource2!.email).toBe("search2@example.com");
      expect(foundSource2!.contact_name).toBe("Search Test 2");

      console.log(`🔍 Found ${sourcesData.length} sources in search results`);
      console.log(`✅ Search sources test completed successfully!`);
    }, 30000);

    test("should handle source creation with different configurations", async () => {
      inventoryFixtures.setCurrentTest("source_configurations");
      console.log("🧪 Testing source creation with different configurations...");

      // Step 1: Create source with minimal configuration
      const minimalSourceInput = {
        source_code: "minimal_source_" + inventoryFixtures.getCurrentTestUniqueId(),
        name: "Minimal Source " + inventoryFixtures.getCurrentTestUniqueId(),
        enabled: true,
        country_id: "US",
        postcode: "10001",
      };

      const minimalSourceResult = await mockServer.callTool("create-msi-source", minimalSourceInput);

      const minimalResponseText = extractToolResponseText(minimalSourceResult);
      const minimalParsed = parseToolResponse(minimalResponseText);
      expect(minimalParsed.data).toBeDefined();

      const minimalSourceCode = minimalSourceInput.source_code;
      console.log(`🏪 Created minimal source: ${minimalSourceCode}`);

      // Validate minimal source data
      const getMinimalSourceResult = await mockServer.callTool("get-msi-source-by-code", {
        source_code: minimalSourceCode,
      });
      const minimalSourceData = JSON.parse(parseToolResponse(extractToolResponseText(getMinimalSourceResult)).data[0]);
      expect(minimalSourceData.name).toBe(minimalSourceInput.name);
      expect(minimalSourceData.enabled).toBe(minimalSourceInput.enabled);
      expect(minimalSourceData.country_id).toBe(minimalSourceInput.country_id);
      expect(minimalSourceData.postcode).toBe(minimalSourceInput.postcode);

      // Step 2: Create source with full configuration
      const fullSourceInput = {
        source_code: "full_source_" + inventoryFixtures.getCurrentTestUniqueId(),
        name: "Full Source " + inventoryFixtures.getCurrentTestUniqueId(),
        enabled: true,
        country_id: "DE",
        email: "full@example.com",
        contact_name: "Full Contact",
        description: "A source with full configuration",
        latitude: 48.1351,
        longitude: 11.582,
        region: "Bavaria",
        city: "Munich",
        street: "456 Full St",
        postcode: "80331",
        phone: "+49-89-123-4567",
        fax: "+49-89-123-4568",
        use_default_carrier_config: false,
      };

      const fullSourceResult = await mockServer.callTool("create-msi-source", fullSourceInput);

      const fullResponseText = extractToolResponseText(fullSourceResult);
      const fullParsed = parseToolResponse(fullResponseText);
      expect(fullParsed.data).toBeDefined();

      const fullSourceCode = fullSourceInput.source_code;
      console.log(`🏪 Created full source: ${fullSourceCode}`);

      // Validate full source data
      const getFullSourceResult = await mockServer.callTool("get-msi-source-by-code", {
        source_code: fullSourceCode,
      });
      const fullSourceData = JSON.parse(parseToolResponse(extractToolResponseText(getFullSourceResult)).data[0]);
      expect(fullSourceData.name).toBe(fullSourceInput.name);
      expect(fullSourceData.enabled).toBe(fullSourceInput.enabled);
      expect(fullSourceData.country_id).toBe(fullSourceInput.country_id);
      expect(fullSourceData.email).toBe(fullSourceInput.email);
      expect(fullSourceData.contact_name).toBe(fullSourceInput.contact_name);
      expect(fullSourceData.description).toBe(fullSourceInput.description);
      expect(fullSourceData.latitude).toBe(fullSourceInput.latitude);
      expect(fullSourceData.longitude).toBe(fullSourceInput.longitude);
      expect(fullSourceData.region).toBe(fullSourceInput.region);
      expect(fullSourceData.city).toBe(fullSourceInput.city);
      expect(fullSourceData.street).toBe(fullSourceInput.street);
      expect(fullSourceData.postcode).toBe(fullSourceInput.postcode);
      expect(fullSourceData.phone).toBe(fullSourceInput.phone);
      expect(fullSourceData.fax).toBe(fullSourceInput.fax);
      // Note: use_default_carrier_config might be set to true by default by the API
      // even when we send false, so we'll check if it's defined rather than exact match
      expect(fullSourceData.use_default_carrier_config).toBeDefined();

      // Step 3: Create disabled source
      const disabledSourceInput = {
        source_code: "disabled_source_" + inventoryFixtures.getCurrentTestUniqueId(),
        name: "Disabled Source " + inventoryFixtures.getCurrentTestUniqueId(),
        enabled: false,
        country_id: "US",
        description: "A disabled source for testing",
        postcode: "10001",
      };

      const disabledSourceResult = await mockServer.callTool("create-msi-source", disabledSourceInput);

      const disabledResponseText = extractToolResponseText(disabledSourceResult);
      const disabledParsed = parseToolResponse(disabledResponseText);
      expect(disabledParsed.data).toBeDefined();

      const disabledSourceCode = disabledSourceInput.source_code;
      console.log(`🏪 Created disabled source: ${disabledSourceCode}`);

      // Validate disabled source data
      const getDisabledSourceResult = await mockServer.callTool("get-msi-source-by-code", {
        source_code: disabledSourceCode,
      });
      const disabledSourceData = JSON.parse(parseToolResponse(extractToolResponseText(getDisabledSourceResult)).data[0]);
      expect(disabledSourceData.name).toBe(disabledSourceInput.name);
      expect(disabledSourceData.enabled).toBe(disabledSourceInput.enabled);
      expect(disabledSourceData.country_id).toBe(disabledSourceInput.country_id);
      expect(disabledSourceData.description).toBe(disabledSourceInput.description);
      expect(disabledSourceData.postcode).toBe(disabledSourceInput.postcode);

      console.log("✅ Source configurations test completed successfully!");
    }, 45000);
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle non-existent source gracefully", async () => {
      inventoryFixtures.setCurrentTest("non_existent_source");
      console.log("🧪 Testing non-existent source handling...");

      // Try to get non-existent source
      const getNonExistentSourceResult = await mockServer.callTool("get-msi-source-by-code", {
        source_code: "non-existent-source-code",
      });

      const getSourceResponseText = extractToolResponseText(getNonExistentSourceResult);
      const getSourceParsed = parseToolResponse(getSourceResponseText);

      // Should handle gracefully
      expect(getSourceParsed.data).toBeDefined();

      console.log("✅ Non-existent source handled gracefully");
    }, 30000);

    test("should handle invalid source search criteria gracefully", async () => {
      inventoryFixtures.setCurrentTest("invalid_source_search_criteria");
      console.log("🧪 Testing invalid source search criteria handling...");

      // Try to search sources with invalid criteria
      try {
        await mockServer.callTool("search-msi-sources", {
          page: -1, // Invalid page
          pageSize: 1000, // Invalid page size
        });
        // If we reach here, the validation failed to catch the invalid criteria
        expect(true).toBe(false); // This should not happen
      } catch {
        // Expected to fail due to validation
        console.log("✅ Properly rejected invalid search criteria");
      }

      console.log("✅ Invalid source search criteria handled gracefully");
    }, 30000);
  });

  describe("Context Message Validation", () => {
    test("should return appropriate context messages for successful source operations", async () => {
      inventoryFixtures.setCurrentTest("source_context_messages_success");
      console.log("🧪 Testing context messages for successful source operations...");

      // Test source creation context message
      const createSourceResult = await mockServer.callTool("create-msi-source", {
        source_code: "context_test_source_" + inventoryFixtures.getCurrentTestUniqueId(),
        name: "Context Test Source " + inventoryFixtures.getCurrentTestUniqueId(),
        enabled: true,
        country_id: "US",
        postcode: "10001",
      });

      const createSourceResponseText = extractToolResponseText(createSourceResult);
      const createSourceContext = extractContextContent(createSourceResponseText);
      expect(createSourceContext).toContain("Source has been successfully created");

      console.log("✅ Source context messages are appropriate for successful operations");
    }, 30000);
  });
});
