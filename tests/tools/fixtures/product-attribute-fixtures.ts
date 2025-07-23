import { AdobeCommerceClient } from "../../../src/adobe/adobe-commerce-client";
import { createProductAttribute, deleteProductAttribute } from "../../../src/adobe/products/api-products-attributes";
import { mapCreateProductAttributeInputToApiPayload } from "../../../src/adobe/products/mapping/attribute-mapping";
import type { CreateProductAttributeInput } from "../../../src/adobe/products/schemas";
import type { ProductAttribute } from "../../../src/adobe/products/types/product";

export interface FixtureAttributeDefinition {
  type: CreateProductAttributeInput["type"];
  defaultFrontendLabel: string;
  scope: CreateProductAttributeInput["scope"];
  options?: CreateProductAttributeInput["options"];
  description?: string;
}

export class ProductAttributeFixtures {
  private client: AdobeCommerceClient;
  private testRunId: string;
  private currentTestId: string = "";
  private currentTestUniqueId: string = "";
  private createdAttributes: Map<string, ProductAttribute> = new Map();

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
   * Generate attribute code with shared unique ID for current test case
   */
  private generateAttributeCode(baseName: string): string {
    if (!this.currentTestUniqueId) {
      throw new Error("Current test unique ID not set. Call setCurrentTest() before creating fixtures.");
    }
    // Format: attr_basename_uniqueId (e.g., attr_text_143432, attr_select_143432)
    return `attr_${baseName}_${this.currentTestUniqueId}`;
  }

  /**
   * Predefined fixture definitions for common test scenarios
   */
  static readonly FIXTURE_DEFINITIONS: Record<string, FixtureAttributeDefinition> = {
    TEXT_ATTRIBUTE: {
      type: "text",
      defaultFrontendLabel: "Test Text Attribute",
      scope: "global",
      description: "A simple text attribute for testing",
    },

    TEXTAREA_ATTRIBUTE: {
      type: "textarea",
      defaultFrontendLabel: "Test Textarea Attribute",
      scope: "store",
      description: "A textarea attribute for testing",
    },

    BOOLEAN_ATTRIBUTE: {
      type: "boolean",
      defaultFrontendLabel: "Test Boolean Attribute",
      scope: "global",
      description: "A boolean attribute for testing",
    },

    SELECT_ATTRIBUTE: {
      type: "singleselect",
      defaultFrontendLabel: "Test Select Attribute",
      scope: "global",
      options: [
        {
          label: "Option One",
          sortOrder: 1,
          isDefault: true,
        },
        {
          label: "Option Two",
          sortOrder: 2,
          isDefault: false,
        },
        {
          label: "Option Three",
          sortOrder: 3,
          isDefault: false,
        },
      ],
      description: "A select attribute with multiple options for testing",
    },

    MULTISELECT_ATTRIBUTE: {
      type: "multiselect",
      defaultFrontendLabel: "Test Multiselect Attribute",
      scope: "website",
      options: [
        {
          label: "Feature A",
          sortOrder: 1,
          isDefault: false,
        },
        {
          label: "Feature B",
          sortOrder: 2,
          isDefault: true,
        },
        {
          label: "Feature C",
          sortOrder: 3,
          isDefault: false,
        },
      ],
      description: "A multiselect attribute for testing",
    },

    PRICE_ATTRIBUTE: {
      type: "price",
      defaultFrontendLabel: "Test Price Attribute",
      scope: "global",
      description: "A price attribute for testing",
    },

    DATE_ATTRIBUTE: {
      type: "date",
      defaultFrontendLabel: "Test Date Attribute",
      scope: "store",
      description: "A date attribute for testing",
    },

    INTEGER_ATTRIBUTE: {
      type: "integer",
      defaultFrontendLabel: "Test Integer Attribute",
      scope: "global",
      description: "An integer attribute for testing",
    },

    DECIMAL_ATTRIBUTE: {
      type: "decimal",
      defaultFrontendLabel: "Test Decimal Attribute",
      scope: "global",
      description: "A decimal attribute for testing",
    },
  };

  /**
   * Create a single fixture attribute for the current test
   */
  async createFixture(baseName: string, definition?: FixtureAttributeDefinition): Promise<ProductAttribute> {
    if (!this.currentTestId) {
      throw new Error("Current test ID not set. Call setCurrentTest() before creating fixtures.");
    }

    // Use provided definition or look up predefined one
    let fixtureDefinition: FixtureAttributeDefinition;
    if (definition) {
      fixtureDefinition = definition;
    } else {
      const predefKey = baseName.toUpperCase() + "_ATTRIBUTE";
      if (!(predefKey in ProductAttributeFixtures.FIXTURE_DEFINITIONS)) {
        throw new Error(`No predefined fixture found for "${baseName}" and no definition provided`);
      }
      fixtureDefinition = ProductAttributeFixtures.FIXTURE_DEFINITIONS[predefKey as keyof typeof ProductAttributeFixtures.FIXTURE_DEFINITIONS];
    }

    const attributeCode = this.generateAttributeCode(baseName);

    const input: CreateProductAttributeInput = {
      type: fixtureDefinition.type,
      attributeCode,
      defaultFrontendLabel: fixtureDefinition.defaultFrontendLabel,
      scope: fixtureDefinition.scope,
      options: fixtureDefinition.options,
    };

    console.log(`🔧 Creating fixture attribute: ${attributeCode} (${fixtureDefinition.description})`);

    try {
      const payload = mapCreateProductAttributeInputToApiPayload(input);
      const response = await createProductAttribute(this.client, payload);

      if (!response.success || !response.data) {
        throw new Error(`Failed to create attribute ${attributeCode}: ${response.error}`);
      }

      this.createdAttributes.set(attributeCode, response.data);
      console.log(`✅ Created fixture attribute: ${attributeCode}`);

      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create attribute ${attributeCode}:`, error);
      throw error;
    }
  }

  /**
   * Create multiple fixtures for the current test
   */
  async createFixtures(fixtures: Array<{ name: string; definition?: FixtureAttributeDefinition }>): Promise<Map<string, ProductAttribute>> {
    const results = new Map<string, ProductAttribute>();

    for (const fixture of fixtures) {
      const attribute = await this.createFixture(fixture.name, fixture.definition);
      results.set(fixture.name, attribute);
    }

    return results;
  }

  /**
   * Get filter criteria to find only current test's attributes
   */
  getCurrentTestFilter() {
    return {
      field: "attribute_code", 
      value: `%${this.currentTestUniqueId}%`,
      conditionType: "like" as const,
    };
  }

  /**
   * Get all created attributes for current test
   */
  getCurrentTestAttributes(): Map<string, ProductAttribute> {
    const currentTestAttrs = new Map<string, ProductAttribute>();
    
    for (const [code, attr] of this.createdAttributes) {
      if (code.includes(this.currentTestUniqueId)) {
        currentTestAttrs.set(code, attr);
      }
    }
    
    return currentTestAttrs;
  }

  /**
   * Clean up fixtures for the current test only
   */
  async cleanupCurrentTest(): Promise<void> {
    const currentTestAttrs = this.getCurrentTestAttributes();

    if (currentTestAttrs.size === 0) {
      console.log(`🧹 No fixtures to clean up for test: ${this.currentTestId}`);
      return;
    }

    console.log(`🧹 Cleaning up ${currentTestAttrs.size} fixtures for test: ${this.currentTestId} (ID: ${this.currentTestUniqueId})`);

    const cleanupPromises = Array.from(currentTestAttrs.keys()).map(async (attributeCode) => {
      try {
        const response = await deleteProductAttribute(this.client, attributeCode);
        if (response.success) {
          console.log(`✅ Deleted fixture attribute: ${attributeCode}`);
          this.createdAttributes.delete(attributeCode);
        } else {
          console.log(`⚠️ Could not delete attribute ${attributeCode}: ${response.error}`);
        }
      } catch (error) {
        console.log(`⚠️ Error deleting attribute ${attributeCode}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
    console.log(`🎉 Test cleanup completed for: ${this.currentTestId}`);
  }
}
