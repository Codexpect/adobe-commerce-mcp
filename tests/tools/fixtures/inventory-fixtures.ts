import { AdobeCommerceClient } from "../../../src/adobe/adobe-commerce-client";
import { createSource, getSourceByCode } from "../../../src/adobe/inventory/api-inventory-msi-sources";
import { createStockSourceLinks, deleteStockSourceLinks } from "../../../src/adobe/inventory/api-inventory-msi-stock-source-links";
import { createStock, deleteStock, getStockById } from "../../../src/adobe/inventory/api-inventory-msi-stocks";
import type { Source, Stock, StockSourceLink } from "../../../src/adobe/inventory/types/inventory";

export interface FixtureStockDefinition {
  name: string;
  // sales_channels removed as it's not supported by the API
}

export interface FixtureSourceDefinition {
  source_code?: string; // Optional since we generate it dynamically
  name: string;
  enabled: boolean;
  country_id: string;
  email?: string;
  contact_name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  region_id?: number;
  region?: string;
  city?: string;
  street?: string;
  postcode?: string;
  phone?: string;
  fax?: string;
  use_default_carrier_config?: boolean;
  carrier_links?: Array<{ carrier_code: string; position: number }>;
}

export interface FixtureStockSourceLinkDefinition {
  stock_id: number;
  source_code: string;
  priority: number;
}

export class InventoryFixtures {
  private client: AdobeCommerceClient;
  private testRunId: string;
  private currentTestId: string = "";
  private currentTestUniqueId: string = "";
  private createdStocks: Map<string, Stock> = new Map();
  private createdSources: Map<string, Source> = new Map();
  private createdStockSourceLinks: Map<string, StockSourceLink> = new Map();

  constructor(client: AdobeCommerceClient) {
    this.client = client;
    // Create a short unique test run identifier
    this.testRunId = `test_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substr(2, 4)}`;
    console.log(`🏷️  Test Run ID: ${this.testRunId}`);
  }

  /**
   * Set the current test identifier for fixture naming and generate a unique ID for this test case
   */
  setCurrentTest(testName: string): void {
    this.currentTestId = testName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    // Generate a unique ID for this specific test case
    this.currentTestUniqueId = `${Date.now().toString().slice(-6)}_${Math.random().toString(36).substr(2, 3)}`;
    console.log(`🎯 Test "${testName}" - Unique ID: ${this.currentTestUniqueId}`);
  }

  /**
   * Get the current test's unique ID
   */
  getCurrentTestUniqueId(): string {
    return this.currentTestUniqueId;
  }

  /**
   * Generate stock name with shared unique ID for current test case
   */
  private generateStockName(baseName: string): string {
    if (!this.currentTestUniqueId) {
      throw new Error("Current test unique ID not set. Call setCurrentTest() before creating fixtures.");
    }
    return `${baseName} ${this.currentTestUniqueId}`;
  }

  /**
   * Generate source code with shared unique ID for current test case
   */
  private generateSourceCode(baseName: string): string {
    if (!this.currentTestUniqueId) {
      throw new Error("Current test unique ID not set. Call setCurrentTest() before creating fixtures.");
    }
    return `${baseName}_${this.currentTestUniqueId}`;
  }

  /**
   * Predefined fixture definitions for common test scenarios
   */
  static readonly STOCK_FIXTURE_DEFINITIONS: Record<string, FixtureStockDefinition> = {
    MAIN_STOCK: {
      name: "Main Stock",
    },

    EU_STOCK: {
      name: "EU Warehouse Stock",
    },

    US_STOCK: {
      name: "US Store Stock",
    },

    SIMPLE_STOCK: {
      name: "Simple Test Stock",
    },
  };

  static readonly SOURCE_FIXTURE_DEFINITIONS: Record<string, FixtureSourceDefinition> = {
    SIMPLE_SOURCE: {
      name: "Simple Test Source",
      enabled: true,
      country_id: "US",
      postcode: "10001",
    },

    US_WAREHOUSE: {
      name: "US Warehouse",
      enabled: true,
      country_id: "US",
      email: "warehouse@example.com",
      contact_name: "John Doe",
      description: "Main US warehouse location",
      latitude: 40.7128,
      longitude: -74.006,
      region_id: 12,
      region: "New York",
      city: "New York",
      street: "123 Warehouse St",
      postcode: "10001",
      phone: "+1-555-123-4567",
      use_default_carrier_config: true,
    },

    EU_WAREHOUSE: {
      name: "EU Warehouse",
      enabled: true,
      country_id: "DE",
      postcode: "80331",
    },

    NYC_STORE: {
      name: "NYC Store",
      enabled: true,
      country_id: "US",
      postcode: "10002",
    },

    DISABLED_SOURCE: {
      source_code: "disabled_source",
      name: "Disabled Source",
      enabled: false,
      country_id: "US",
      description: "A disabled source for testing",
      postcode: "10001",
    },
  };

  /**
   * Create a stock fixture
   */
  async createStockFixture(baseName: string): Promise<Stock> {
    const stockName = this.generateStockName(baseName);

    console.log(`🏭 Creating stock fixture: ${stockName}`);

    try {
      const createResult = await createStock(this.client, {
        name: stockName,
        // Remove sales_channels as it's not supported by the API
      });

      if (!createResult.success) {
        throw new Error(`Failed to create stock: ${createResult.error}`);
      }

      const stockId = createResult.data;
      if (!stockId) {
        throw new Error("Failed to create stock - no ID returned");
      }
      console.log(`✅ Created stock with ID: ${stockId}`);

      // Get the created stock to return full details
      const getResult = await getStockById(this.client, stockId);
      if (!getResult.success) {
        throw new Error(`Failed to get created stock: ${getResult.error}`);
      }

      const stock = getResult.data;
      if (!stock) {
        throw new Error("Failed to get created stock - no data returned");
      }
      this.createdStocks.set(stockName, stock);

      console.log(`📦 Stock fixture created: ${stockName} (ID: ${stock.stock_id})`);
      return stock;
    } catch (error) {
      console.error(`❌ Failed to create stock fixture ${stockName}:`, error);
      throw error;
    }
  }

  /**
   * Create a source fixture
   */
  async createSourceFixture(baseName: string, definition?: FixtureSourceDefinition): Promise<Source> {
    const sourceCode = this.generateSourceCode(baseName);
    const sourceDefinition = definition || InventoryFixtures.SOURCE_FIXTURE_DEFINITIONS.SIMPLE_SOURCE;

    console.log(`🏪 Creating source fixture: ${sourceCode}`);

    try {
      const createResult = await createSource(this.client, {
        source_code: sourceCode,
        name: `${sourceDefinition.name} ${sourceCode}`,
        enabled: sourceDefinition.enabled,
        country_id: sourceDefinition.country_id || "US",
        postcode: sourceDefinition.postcode || "10001",
        // Only include other fields if they exist to avoid validation errors
        ...(sourceDefinition.email && { email: sourceDefinition.email }),
        ...(sourceDefinition.contact_name && { contact_name: sourceDefinition.contact_name }),
        ...(sourceDefinition.description && { description: sourceDefinition.description }),
        ...(sourceDefinition.latitude && { latitude: sourceDefinition.latitude }),
        ...(sourceDefinition.longitude && { longitude: sourceDefinition.longitude }),
        ...(sourceDefinition.region && { region: sourceDefinition.region }),
        ...(sourceDefinition.city && { city: sourceDefinition.city }),
        ...(sourceDefinition.street && { street: sourceDefinition.street }),
        ...(sourceDefinition.phone && { phone: sourceDefinition.phone }),
        // Remove region_id as it might cause validation issues
        ...(sourceDefinition.use_default_carrier_config !== undefined && { use_default_carrier_config: sourceDefinition.use_default_carrier_config }),
      });

      if (!createResult.success) {
        throw new Error(`Failed to create source: ${createResult.error}`);
      }

      // Since createSource now returns a number (success indicator), we need to fetch the created source
      const getSourceResult = await getSourceByCode(this.client, sourceCode);
      if (!getSourceResult.success) {
        throw new Error(`Failed to get created source: ${getSourceResult.error}`);
      }

      const source = getSourceResult.data;
      if (!source) {
        throw new Error("Failed to get created source - no data returned");
      }

      // Ensure the source_code is set correctly
      if (!source.source_code) {
        source.source_code = sourceCode;
      }

      this.createdSources.set(sourceCode, source);

      console.log(`📦 Source fixture created: ${sourceCode} (${source.source_code})`);
      return source;
    } catch (error) {
      console.error(`❌ Failed to create source fixture ${sourceCode}:`, error);
      throw error;
    }
  }

  /**
   * Create a stock-source link fixture
   */
  async createStockSourceLinkFixture(stockId: number, sourceCode: string, priority: number = 1): Promise<StockSourceLink> {
    const linkKey = `${stockId}_${sourceCode}`;

    console.log(`🔗 Creating stock-source link fixture: ${linkKey}`);

    try {
      const createResult = await createStockSourceLinks(this.client, [
        {
          stock_id: stockId,
          source_code: sourceCode,
          priority: priority,
        },
      ]);

      if (!createResult.success) {
        throw new Error(`Failed to create stock-source link: ${createResult.error}`);
      }

      const link: StockSourceLink = {
        stock_id: stockId,
        source_code: sourceCode,
        priority: priority,
      };

      this.createdStockSourceLinks.set(linkKey, link);

      console.log(`✅ Stock-source link fixture created: ${linkKey}`);
      return link;
    } catch (error) {
      console.error(`❌ Failed to create stock-source link fixture ${linkKey}:`, error);
      throw error;
    }
  }

  /**
   * Create multiple stock fixtures
   */
  async createStockFixtures(fixtures: Array<{ name: string }>): Promise<Map<string, Stock>> {
    const createdStocks = new Map<string, Stock>();

    for (const fixture of fixtures) {
      const stock = await this.createStockFixture(fixture.name);
      createdStocks.set(fixture.name, stock);
    }

    return createdStocks;
  }

  /**
   * Create multiple source fixtures
   */
  async createSourceFixtures(fixtures: Array<{ name: string; definition?: FixtureSourceDefinition }>): Promise<Map<string, Source>> {
    const createdSources = new Map<string, Source>();

    for (const fixture of fixtures) {
      const source = await this.createSourceFixture(fixture.name, fixture.definition);
      createdSources.set(fixture.name, source);
    }

    return createdSources;
  }

  /**
   * Get filter criteria to find only current test's sources
   */
  getCurrentTestSourceFilter() {
    return {
      field: "source_code",
      value: `%${this.currentTestUniqueId}%`,
      conditionType: "like" as const,
    };
  }

  /**
   * Get filter criteria to find only current test's stocks
   */
  getCurrentTestStockFilter() {
    return {
      field: "name",
      value: `%${this.currentTestUniqueId}%`,
      conditionType: "like" as const,
    };
  }

  /**
   * Get current test stocks
   */
  getCurrentTestStocks(): Map<string, Stock> {
    return this.createdStocks;
  }

  /**
   * Get current test sources
   */
  getCurrentTestSources(): Map<string, Source> {
    return this.createdSources;
  }

  /**
   * Get current test stock-source links
   */
  getCurrentTestStockSourceLinks(): Map<string, StockSourceLink> {
    return this.createdStockSourceLinks;
  }

  /**
   * Clean up all fixtures created during the current test
   */
  async cleanupCurrentTest(): Promise<void> {
    console.log("🧹 Starting inventory test cleanup...");

    try {
      // Step 1: Clean up stock-source links
      console.log("🔗 Cleaning up stock-source links...");
      for (const [linkKey, link] of this.createdStockSourceLinks) {
        try {
          await deleteStockSourceLinks(this.client, [link]);
          console.log(`✅ Deleted stock-source link: ${linkKey}`);
        } catch (error) {
          console.log(`⚠️ Error deleting stock-source link ${linkKey}:`, error);
        }
      }

      // Step 2: Clean up sources
      console.log("🏪 Cleaning up sources...");
      for (const [sourceCode] of this.createdSources) {
        try {
          // Note: deleteSource function doesn't exist in the API, so we'll skip this
          // In a real scenario, you might want to disable the source instead
          console.log(`⚠️ Skipping source deletion for ${sourceCode} (API not available)`);
        } catch (error) {
          console.log(`⚠️ Error processing source ${sourceCode}:`, error);
        }
      }

      // Step 3: Clean up stocks
      console.log("🏭 Cleaning up stocks...");
      for (const [stockName, stock] of this.createdStocks) {
        try {
          if (stock.stock_id) {
            await deleteStock(this.client, stock.stock_id);
            console.log(`✅ Deleted stock: ${stockName} (ID: ${stock.stock_id})`);
          }
        } catch (error) {
          console.log(`⚠️ Error deleting stock ${stockName}:`, error);
        }
      }

      // Clear the tracking maps
      this.createdStocks.clear();
      this.createdSources.clear();
      this.createdStockSourceLinks.clear();

      console.log("✅ Inventory test cleanup completed");
    } catch (error) {
      console.log("⚠️ Error during inventory test cleanup:", error);
    }
  }

  /**
   * Create a complete inventory scenario with stocks, sources, and links
   */
  async createScenario(scenarioName: string): Promise<{
    stocks: Map<string, Stock>;
    sources: Map<string, Source>;
    links: Map<string, StockSourceLink>;
  }> {
    console.log(`🎬 Creating inventory scenario: ${scenarioName}`);

    const stocks = new Map<string, Stock>();
    const sources = new Map<string, Source>();
    const links = new Map<string, StockSourceLink>();

    switch (scenarioName) {
      case "BASIC_INVENTORY": {
        // Create one stock and one source, then link them
        const stock = await this.createStockFixture("basic_stock");
        const source = await this.createSourceFixture("basic_source");
        const link = await this.createStockSourceLinkFixture(stock.stock_id!, source.source_code!);

        stocks.set("main_stock", stock);
        sources.set("main_source", source);
        links.set("main_link", link);
        break;
      }

      case "MULTI_LOCATION": {
        // Create multiple stocks and sources with various links
        const usStock = await this.createStockFixture("us_stock");
        const euStock = await this.createStockFixture("eu_stock");

        const usWarehouse = await this.createSourceFixture("us_warehouse", InventoryFixtures.SOURCE_FIXTURE_DEFINITIONS.US_WAREHOUSE);
        const euWarehouse = await this.createSourceFixture("eu_warehouse", InventoryFixtures.SOURCE_FIXTURE_DEFINITIONS.EU_WAREHOUSE);
        const nycStore = await this.createSourceFixture("nyc_store", InventoryFixtures.SOURCE_FIXTURE_DEFINITIONS.NYC_STORE);

        const usLink = await this.createStockSourceLinkFixture(usStock.stock_id!, usWarehouse.source_code!, 1);
        const euLink = await this.createStockSourceLinkFixture(euStock.stock_id!, euWarehouse.source_code!, 1);
        const storeLink = await this.createStockSourceLinkFixture(usStock.stock_id!, nycStore.source_code!, 2);

        stocks.set("us_stock", usStock);
        stocks.set("eu_stock", euStock);
        sources.set("us_warehouse", usWarehouse);
        sources.set("eu_warehouse", euWarehouse);
        sources.set("nyc_store", nycStore);
        links.set("us_link", usLink);
        links.set("eu_link", euLink);
        links.set("store_link", storeLink);
        break;
      }

      default:
        throw new Error(`Unknown inventory scenario: ${scenarioName}`);
    }

    console.log(`✅ Created inventory scenario: ${scenarioName}`);
    return { stocks, sources, links };
  }
}
