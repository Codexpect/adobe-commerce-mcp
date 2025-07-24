import { AdobeCommerceClient } from "../../../src/adobe/adobe-commerce-client";
import { createProduct, deleteProduct } from "../../../src/adobe/products/api-products";
import type { CreateProductInput } from "../../../src/adobe/products/schemas";
import type { Product } from "../../../src/adobe/products/types/product";

export interface FixtureProductDefinition {
  name: string;
  price: number;
  type_id?: CreateProductInput["type_id"];
  status?: CreateProductInput["status"];
  visibility?: CreateProductInput["visibility"];
  weight?: CreateProductInput["weight"];
  website_ids?: CreateProductInput["website_ids"];
  category_links?: CreateProductInput["category_links"];
  custom_attributes?: CreateProductInput["custom_attributes"];
}

export class ProductFixtures {
  private client: AdobeCommerceClient;
  private testRunId: string;
  private currentTestId: string = "";
  private currentTestUniqueId: string = "";
  private createdProducts: Map<string, Product> = new Map();

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
   * Generate product SKU with shared unique ID for current test case
   */
  private generateProductSku(baseName: string): string {
    if (!this.currentTestUniqueId) {
      throw new Error("Current test unique ID not set. Call setCurrentTest() before creating fixtures.");
    }
    // Format: prod_basename_uniqueId (e.g., prod_simple_143432, prod_configurable_143432)
    return `prod_${baseName}_${this.currentTestUniqueId}`;
  }

  /**
   * Predefined fixture definitions for common test scenarios
   */
  static readonly FIXTURE_DEFINITIONS: Record<string, FixtureProductDefinition> = {
    SIMPLE_PRODUCT: {
      name: "Test Simple Product",
      price: 29.99,
      type_id: "simple",
      status: 1,
      visibility: 4,
      weight: 0.5,
      custom_attributes: [
        { attribute_code: "description", value: "A simple product for testing" },
        { attribute_code: "short_description", value: "Simple test product" },
      ],
    },

    CONFIGURABLE_PRODUCT: {
      name: "Test Configurable Product",
      price: 49.99,
      type_id: "configurable",
      status: 1,
      visibility: 4,
      weight: 1.0,
      custom_attributes: [
        { attribute_code: "description", value: "A configurable product for testing" },
        { attribute_code: "short_description", value: "Configurable test product" },
      ],
    },

    DISABLED_PRODUCT: {
      name: "Test Disabled Product",
      price: 19.99,
      type_id: "simple",
      status: 2, // disabled
      visibility: 4,
      weight: 0.3,
      custom_attributes: [
        { attribute_code: "description", value: "A disabled product for testing" },
        { attribute_code: "short_description", value: "Disabled test product" },
      ],
    },

    CATALOG_ONLY_PRODUCT: {
      name: "Test Catalog Only Product",
      price: 39.99,
      type_id: "simple",
      status: 1,
      visibility: 2, // catalog only
      weight: 0.7,
      custom_attributes: [
        { attribute_code: "description", value: "A catalog-only product for testing" },
        { attribute_code: "short_description", value: "Catalog only test product" },
      ],
    },

    SEARCH_ONLY_PRODUCT: {
      name: "Test Search Only Product",
      price: 59.99,
      type_id: "simple",
      status: 1,
      visibility: 3, // search only
      weight: 0.8,
      custom_attributes: [
        { attribute_code: "description", value: "A search-only product for testing" },
        { attribute_code: "short_description", value: "Search only test product" },
      ],
    },

    HEAVY_PRODUCT: {
      name: "Test Heavy Product",
      price: 99.99,
      type_id: "simple",
      status: 1,
      visibility: 4,
      weight: 5.0,
      custom_attributes: [
        { attribute_code: "description", value: "A heavy product for testing shipping calculations" },
        { attribute_code: "short_description", value: "Heavy test product" },
      ],
    },

    EXPENSIVE_PRODUCT: {
      name: "Test Expensive Product",
      price: 299.99,
      type_id: "simple",
      status: 1,
      visibility: 4,
      weight: 2.0,
      custom_attributes: [
        { attribute_code: "description", value: "An expensive product for testing price filters" },
        { attribute_code: "short_description", value: "Expensive test product" },
      ],
    },

    CHEAP_PRODUCT: {
      name: "Test Cheap Product",
      price: 9.99,
      type_id: "simple",
      status: 1,
      visibility: 4,
      weight: 0.1,
      custom_attributes: [
        { attribute_code: "description", value: "A cheap product for testing price filters" },
        { attribute_code: "short_description", value: "Cheap test product" },
      ],
    },

    PRODUCT_WITH_EXTENSION_ATTRIBUTES: {
      name: "Test Product with Extension Attributes",
      price: 89.99,
      type_id: "simple",
      status: 1,
      visibility: 4,
      weight: 1.2,
      website_ids: [1],
      category_links: [
        {
          category_id: "3",
          position: 1,
        },
      ],
      custom_attributes: [
        { attribute_code: "description", value: "A product with extension attributes for testing" },
        { attribute_code: "short_description", value: "Extension attributes test product" },
      ],
    },

    // New fixtures for testing different attribute types and features
    PRODUCT_WITH_WEBSITE_IDS: {
      name: "Test Product with Website IDs",
      price: 69.99,
      type_id: "simple",
      status: 1,
      visibility: 4,
      weight: 0.8,
      website_ids: [1, 2],
      custom_attributes: [
        { attribute_code: "description", value: "A product assigned to multiple websites" },
        { attribute_code: "short_description", value: "Multi-website test product" },
      ],
    },

    PRODUCT_WITH_CATEGORY_LINKS: {
      name: "Test Product with Category Links",
      price: 59.99,
      type_id: "simple",
      status: 1,
      visibility: 4,
      weight: 0.6,
      category_links: [
        {
          category_id: "3",
          position: 1,
        },
        {
          category_id: "4",
          position: 2,
        },
      ],
      custom_attributes: [
        { attribute_code: "description", value: "A product assigned to multiple categories" },
        { attribute_code: "short_description", value: "Multi-category test product" },
      ],
    },
  };

  /**
   * Create a single fixture product for the current test
   */
  async createFixture(baseName: string, definition?: FixtureProductDefinition): Promise<Product> {
    if (!this.currentTestId) {
      throw new Error("Current test ID not set. Call setCurrentTest() before creating fixtures.");
    }

    // Use provided definition or look up predefined one
    let fixtureDefinition: FixtureProductDefinition;
    if (definition) {
      fixtureDefinition = definition;
    } else {
      const predefKey = baseName.toUpperCase() + "_PRODUCT";
      if (!(predefKey in ProductFixtures.FIXTURE_DEFINITIONS)) {
        throw new Error(`No predefined fixture found for "${baseName}" and no definition provided`);
      }
      fixtureDefinition = ProductFixtures.FIXTURE_DEFINITIONS[predefKey as keyof typeof ProductFixtures.FIXTURE_DEFINITIONS];
    }

    const productSku = this.generateProductSku(baseName);

    // Add unique test ID to product name to prevent URL key conflicts
    const uniqueProductName = `${baseName} ${this.currentTestUniqueId}`;

    const input: CreateProductInput = {
      sku: productSku,
      name: uniqueProductName,
      price: fixtureDefinition.price,
      attribute_set_id: 4, // Default attribute set ID
      type_id: fixtureDefinition.type_id || "simple",
      status: fixtureDefinition.status || 1,
      visibility: fixtureDefinition.visibility || 4,
      weight: fixtureDefinition.weight,
      website_ids: fixtureDefinition.website_ids,
      category_links: fixtureDefinition.category_links,
      custom_attributes: fixtureDefinition.custom_attributes,
    };

    console.log(`🔧 Creating fixture product: ${productSku} (${fixtureDefinition.name})`);

    try {
      const response = await createProduct(this.client, input);

      if (!response.success || !response.data) {
        throw new Error(`Failed to create product ${productSku}: ${response.error}`);
      }

      this.createdProducts.set(productSku, response.data);
      console.log(`✅ Created fixture product: ${productSku}`);

      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create product ${productSku}:`, error);
      throw error;
    }
  }

  /**
   * Create multiple fixtures for the current test
   */
  async createFixtures(fixtures: Array<{ name: string; definition?: FixtureProductDefinition }>): Promise<Map<string, Product>> {
    const results = new Map<string, Product>();

    for (const fixture of fixtures) {
      const product = await this.createFixture(fixture.name, fixture.definition);
      results.set(fixture.name, product);
    }

    return results;
  }

  /**
   * Get filter criteria to find only current test's products
   */
  getCurrentTestFilter() {
    return {
      field: "sku",
      value: `%${this.currentTestUniqueId}%`,
      conditionType: "like" as const,
    };
  }

  /**
   * Get all created products for current test
   */
  getCurrentTestProducts(): Map<string, Product> {
    const currentTestProducts = new Map<string, Product>();

    for (const [sku, product] of this.createdProducts) {
      if (sku.includes(this.currentTestUniqueId)) {
        currentTestProducts.set(sku, product);
      }
    }

    return currentTestProducts;
  }

  /**
   * Clean up fixtures for the current test only
   */
  async cleanupCurrentTest(): Promise<void> {
    const currentTestProducts = this.getCurrentTestProducts();

    if (currentTestProducts.size === 0) {
      console.log(`🧹 No fixtures to clean up for test: ${this.currentTestId}`);
      return;
    }

    console.log(`🧹 Cleaning up ${currentTestProducts.size} fixtures for test: ${this.currentTestId} (ID: ${this.currentTestUniqueId})`);

    const cleanupPromises = Array.from(currentTestProducts.keys()).map(async (productSku) => {
      try {
        const response = await deleteProduct(this.client, { sku: productSku });
        if (response.success) {
          console.log(`✅ Deleted fixture product: ${productSku}`);
          this.createdProducts.delete(productSku);
        } else {
          console.log(`⚠️ Could not delete product ${productSku}: ${response.error}`);
        }
      } catch (error) {
        console.log(`⚠️ Error deleting product ${productSku}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
    console.log(`🎉 Test cleanup completed for: ${this.currentTestId}`);
  }
}
