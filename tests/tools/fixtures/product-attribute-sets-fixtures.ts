import { AdobeCommerceClient } from "../../../src/adobe/adobe-commerce-client";
import { createAttributeSet, deleteAttributeSet, createAttributeGroup, deleteAttributeGroup } from "../../../src/adobe/products/api-products-attributes-sets";
import { mapCreateAttributeSetInputToApiPayload, mapCreateAttributeGroupInputToApiPayload } from "../../../src/adobe/products/mapping/attribute-mapping";
import type { AttributeSet, AttributeGroup } from "../../../src/adobe/products/types/product";

export interface FixtureAttributeSetDefinition {
  attributeSetName: string;
  sortOrder?: number;
  description?: string;
}

export interface FixtureAttributeGroupDefinition {
  attributeGroupName: string;
  sortOrder?: number;
  description?: string;
}

export class ProductAttributeSetsFixtures {
  private client: AdobeCommerceClient;
  private testRunId: string;
  private currentTestId: string = "";
  private currentTestUniqueId: string = "";
  private createdAttributeSets: Map<string, AttributeSet> = new Map();
  private createdAttributeGroups: Map<string, AttributeGroup> = new Map();

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
   * Generate attribute set name with shared unique ID for current test case
   */
  private generateAttributeSetName(baseName: string): string {
    if (!this.currentTestUniqueId) {
      throw new Error("Current test unique ID not set. Call setCurrentTest() before creating fixtures.");
    }
    // Format: Set BaseName UniqueId (e.g., Set Electronics 143432, Set Clothing 143432)
    return `Set ${baseName} ${this.currentTestUniqueId}`;
  }

  /**
   * Generate attribute group name with shared unique ID for current test case
   */
  private generateAttributeGroupName(baseName: string): string {
    if (!this.currentTestUniqueId) {
      throw new Error("Current test unique ID not set. Call setCurrentTest() before creating fixtures.");
    }
    // Format: Group BaseName UniqueId (e.g., Group General 143432, Group Physical 143432)
    return `Group ${baseName} ${this.currentTestUniqueId}`;
  }

  /**
   * Predefined fixture definitions for common test scenarios
   */
  static readonly FIXTURE_DEFINITIONS: Record<string, FixtureAttributeSetDefinition> = {
    ELECTRONICS_SET: {
      attributeSetName: "Electronics",
      sortOrder: 100,
      description: "Attribute set for electronic products",
    },

    CLOTHING_SET: {
      attributeSetName: "Clothing",
      sortOrder: 200,
      description: "Attribute set for clothing products",
    },

    BOOKS_SET: {
      attributeSetName: "Books",
      sortOrder: 300,
      description: "Attribute set for book products",
    },

    FURNITURE_SET: {
      attributeSetName: "Furniture",
      sortOrder: 400,
      description: "Attribute set for furniture products",
    },

    SPORTS_SET: {
      attributeSetName: "Sports",
      sortOrder: 500,
      description: "Attribute set for sports equipment",
    },

    MINIMAL_SET: {
      attributeSetName: "Minimal",
      description: "Minimal attribute set for testing",
    },
  };

  /**
   * Predefined fixture definitions for attribute groups
   */
  static readonly GROUP_FIXTURE_DEFINITIONS: Record<string, FixtureAttributeGroupDefinition> = {
    GENERAL_GROUP: {
      attributeGroupName: "General",
      sortOrder: 10,
      description: "General product information group",
    },

    PHYSICAL_PROPERTIES_GROUP: {
      attributeGroupName: "Physical Properties",
      sortOrder: 20,
      description: "Physical properties of the product",
    },

    PRICING_GROUP: {
      attributeGroupName: "Pricing",
      sortOrder: 30,
      description: "Pricing and inventory information",
    },

    SEO_GROUP: {
      attributeGroupName: "SEO",
      sortOrder: 40,
      description: "Search engine optimization attributes",
    },

    ADVANCED_GROUP: {
      attributeGroupName: "Advanced",
      sortOrder: 50,
      description: "Advanced product settings",
    },

    MINIMAL_GROUP: {
      attributeGroupName: "Minimal",
      description: "Minimal attribute group for testing",
    },
  };

  /**
   * Create a single fixture attribute set for the current test
   */
  async createFixtureSet(baseName: string, definition?: FixtureAttributeSetDefinition): Promise<AttributeSet> {
    if (!this.currentTestId) {
      throw new Error("Current test ID not set. Call setCurrentTest() before creating fixtures.");
    }

    // Use provided definition or look up predefined one
    let fixtureDefinition: FixtureAttributeSetDefinition;
    if (definition) {
      fixtureDefinition = definition;
    } else {
      const predefKey = baseName.toUpperCase() + "_SET";
      if (!(predefKey in ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS)) {
        throw new Error(`No predefined fixture found for "${baseName}" and no definition provided`);
      }
      fixtureDefinition = ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS[predefKey as keyof typeof ProductAttributeSetsFixtures.FIXTURE_DEFINITIONS];
    }

    const attributeSetName = this.generateAttributeSetName(baseName);

    const input = {
      attributeSetName,
      sortOrder: fixtureDefinition.sortOrder,
    };

    console.log(`🔧 Creating fixture attribute set: ${attributeSetName} (${fixtureDefinition.description})`);

    try {
      const payload = mapCreateAttributeSetInputToApiPayload(input);
      const response = await createAttributeSet(this.client, payload);

      if (!response.success || !response.data) {
        throw new Error(`Failed to create attribute set ${attributeSetName}: ${response.error}`);
      }

      this.createdAttributeSets.set(attributeSetName, response.data);
      console.log(`✅ Created fixture attribute set: ${attributeSetName}`);

      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create attribute set ${attributeSetName}:`, error);
      throw error;
    }
  }

  /**
   * Create multiple fixture attribute sets for the current test
   */
  async createFixtureSets(fixtures: Array<{ name: string; definition?: FixtureAttributeSetDefinition }>): Promise<Map<string, AttributeSet>> {
    const results = new Map<string, AttributeSet>();

    for (const fixture of fixtures) {
      const attributeSet = await this.createFixtureSet(fixture.name, fixture.definition);
      results.set(fixture.name, attributeSet);
    }

    return results;
  }

  /**
   * Create a single fixture attribute group for the current test
   */
  async createFixtureGroup(
    baseName: string, 
    attributeSetId: number, 
    definition?: FixtureAttributeGroupDefinition
  ): Promise<AttributeGroup> {
    if (!this.currentTestId) {
      throw new Error("Current test ID not set. Call setCurrentTest() before creating fixtures.");
    }

    // Use provided definition or look up predefined one
    let fixtureDefinition: FixtureAttributeGroupDefinition;
    if (definition) {
      fixtureDefinition = definition;
    } else {
      const predefKey = baseName.toUpperCase() + "_GROUP";
      if (!(predefKey in ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS)) {
        throw new Error(`No predefined fixture found for "${baseName}" and no definition provided`);
      }
      fixtureDefinition = ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS[predefKey as keyof typeof ProductAttributeSetsFixtures.GROUP_FIXTURE_DEFINITIONS];
    }

    const attributeGroupName = this.generateAttributeGroupName(baseName);

    const input = {
      attributeSetId,
      attributeGroupName,
      sortOrder: fixtureDefinition.sortOrder,
    };

    console.log(`🔧 Creating fixture attribute group: ${attributeGroupName} (${fixtureDefinition.description})`);

    try {
      const payload = mapCreateAttributeGroupInputToApiPayload(input);
      const response = await createAttributeGroup(this.client, payload);

      if (!response.success || !response.data) {
        throw new Error(`Failed to create attribute group ${attributeGroupName}: ${response.error}`);
      }

      this.createdAttributeGroups.set(attributeGroupName, response.data);
      console.log(`✅ Created fixture attribute group: ${attributeGroupName}`);

      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create attribute group ${attributeGroupName}:`, error);
      throw error;
    }
  }

  /**
   * Create multiple fixture attribute groups for the current test
   */
  async createFixtureGroups(
    fixtures: Array<{ name: string; definition?: FixtureAttributeGroupDefinition }>,
    attributeSetId: number
  ): Promise<Map<string, AttributeGroup>> {
    const results = new Map<string, AttributeGroup>();

    for (const fixture of fixtures) {
      const attributeGroup = await this.createFixtureGroup(fixture.name, attributeSetId, fixture.definition);
      results.set(fixture.name, attributeGroup);
    }

    return results;
  }

  /**
   * Get filter criteria to find only current test's attribute sets
   */
  getCurrentTestSetFilter() {
    return {
      field: "attribute_set_name", 
      value: `%${this.currentTestUniqueId}%`,
      conditionType: "like" as const,
    };
  }

  /**
   * Get filter criteria to find only current test's attribute groups
   */
  getCurrentTestGroupFilter() {
    return {
      field: "attribute_group_name", 
      value: `%${this.currentTestUniqueId}%`,
      conditionType: "like" as const,
    };
  }

  /**
   * Get all created attribute sets for current test
   */
  getCurrentTestAttributeSets(): Map<string, AttributeSet> {
    const currentTestSets = new Map<string, AttributeSet>();
    
    for (const [name, set] of this.createdAttributeSets) {
      if (name.includes(this.currentTestUniqueId)) {
        currentTestSets.set(name, set);
      }
    }
    
    return currentTestSets;
  }

  /**
   * Get all created attribute groups for current test
   */
  getCurrentTestAttributeGroups(): Map<string, AttributeGroup> {
    const currentTestGroups = new Map<string, AttributeGroup>();
    
    for (const [name, group] of this.createdAttributeGroups) {
      if (name.includes(this.currentTestUniqueId)) {
        currentTestGroups.set(name, group);
      }
    }
    
    return currentTestGroups;
  }

  /**
   * Clean up fixtures for the current test only
   */
  async cleanupCurrentTest(): Promise<void> {
    const currentTestSets = this.getCurrentTestAttributeSets();
    const currentTestGroups = this.getCurrentTestAttributeGroups();

    if (currentTestSets.size === 0 && currentTestGroups.size === 0) {
      console.log(`🧹 No fixtures to clean up for test: ${this.currentTestId}`);
      return;
    }

    console.log(`🧹 Cleaning up ${currentTestSets.size} attribute sets and ${currentTestGroups.size} attribute groups for test: ${this.currentTestId} (ID: ${this.currentTestUniqueId})`);

    // Clean up attribute groups first (they depend on attribute sets)
    const groupCleanupPromises = Array.from(currentTestGroups.values()).map(async (attributeGroup) => {
      try {
        if (attributeGroup.attribute_group_id) {
          const response = await deleteAttributeGroup(this.client, attributeGroup.attribute_group_id);
          if (response.success) {
            console.log(`✅ Deleted fixture attribute group: ${attributeGroup.attribute_group_name}`);
            this.createdAttributeGroups.delete(attributeGroup.attribute_group_name);
          } else {
            console.log(`⚠️ Could not delete attribute group ${attributeGroup.attribute_group_name}: ${response.error}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Error deleting attribute group ${attributeGroup.attribute_group_name}:`, error);
      }
    });

    await Promise.all(groupCleanupPromises);

    // Clean up attribute sets
    const setCleanupPromises = Array.from(currentTestSets.values()).map(async (attributeSet) => {
      try {
        if (attributeSet.attribute_set_id) {
          const response = await deleteAttributeSet(this.client, attributeSet.attribute_set_id);
          if (response.success) {
            console.log(`✅ Deleted fixture attribute set: ${attributeSet.attribute_set_name}`);
            this.createdAttributeSets.delete(attributeSet.attribute_set_name!);
          } else {
            console.log(`⚠️ Could not delete attribute set ${attributeSet.attribute_set_name}: ${response.error}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Error deleting attribute set ${attributeSet.attribute_set_name}:`, error);
      }
    });

    await Promise.all(setCleanupPromises);
    console.log(`🎉 Test cleanup completed for: ${this.currentTestId}`);
  }
} 