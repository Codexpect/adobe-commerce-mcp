import { AdobeCommerceClient } from "../../../src/adobe/adobe-commerce-client";
import { createCategory, deleteCategory } from "../../../src/adobe/categories/api-categories";
import type { Category } from "../../../src/adobe/categories/types/category";

export interface FixtureCategoryDefinition {
  name: string;
  parent_id: number;
  is_active?: boolean;
  position?: number;
  include_in_menu?: boolean;
  description?: string;
}

export class CategoryFixtures {
  private client: AdobeCommerceClient;
  private testRunId: string;
  private currentTestId: string = "";
  private currentTestUniqueId: string = "";
  private createdCategories: Map<string, Category> = new Map();

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
   * Generate category name with shared unique ID for current test case
   */
  private generateCategoryName(baseName: string): string {
    if (!this.currentTestUniqueId) {
      throw new Error("Current test unique ID not set. Call setCurrentTest() before creating fixtures.");
    }
    // Format: Test BaseName UniqueId (e.g., Test Electronics 143432, Test Clothing 143432)
    return `Test ${baseName} ${this.currentTestUniqueId}`;
  }

  /**
   * Predefined fixture definitions for common test scenarios
   */
  static readonly FIXTURE_DEFINITIONS: Record<string, FixtureCategoryDefinition> = {
    ELECTRONICS_CATEGORY: {
      name: "Electronics",
      parent_id: 2, // Default category
      is_active: true,
      position: 1,
      include_in_menu: true,
      description: "An electronics category for testing",
    },

    CLOTHING_CATEGORY: {
      name: "Clothing",
      parent_id: 2, // Default category
      is_active: true,
      position: 2,
      include_in_menu: true,
      description: "A clothing category for testing",
    },

    BOOKS_CATEGORY: {
      name: "Books",
      parent_id: 2, // Default category
      is_active: true,
      position: 3,
      include_in_menu: true,
      description: "A books category for testing",
    },

    HIDDEN_CATEGORY: {
      name: "Hidden Category",
      parent_id: 2, // Default category
      is_active: true,
      position: 4,
      include_in_menu: false,
      description: "A hidden category (not in menu) for testing",
    },

    INACTIVE_CATEGORY: {
      name: "Inactive Category",
      parent_id: 2, // Default category
      is_active: false,
      position: 5,
      include_in_menu: false,
      description: "An inactive category for testing",
    },

    SUB_CATEGORY: {
      name: "Sub Category",
      parent_id: 2, // Default category - will be moved to parent in tests
      is_active: true,
      position: 6,
      include_in_menu: true,
      description: "A sub category for testing hierarchy operations",
    },

    FEATURED_CATEGORY: {
      name: "Featured",
      parent_id: 2, // Default category
      is_active: true,
      position: 1,
      include_in_menu: true,
      description: "A featured category for testing",
    },

    SALE_CATEGORY: {
      name: "Sale",
      parent_id: 2, // Default category
      is_active: true,
      position: 10,
      include_in_menu: true,
      description: "A sale category for testing",
    },
  };

  /**
   * Create a single fixture category for the current test
   */
  async createFixture(baseName: string, definition?: FixtureCategoryDefinition): Promise<Category> {
    if (!this.currentTestId) {
      throw new Error("Current test ID not set. Call setCurrentTest() before creating fixtures.");
    }

    // Use provided definition or look up predefined one
    let fixtureDefinition: FixtureCategoryDefinition;
    if (definition) {
      fixtureDefinition = definition;
    } else {
      const predefKey = baseName.toUpperCase() + "_CATEGORY";
      if (!(predefKey in CategoryFixtures.FIXTURE_DEFINITIONS)) {
        throw new Error(`No predefined fixture found for "${baseName}" and no definition provided`);
      }
      fixtureDefinition = CategoryFixtures.FIXTURE_DEFINITIONS[predefKey as keyof typeof CategoryFixtures.FIXTURE_DEFINITIONS];
    }

    const categoryName = this.generateCategoryName(fixtureDefinition.name);

    const categoryData: Category = {
      name: categoryName,
      parent_id: fixtureDefinition.parent_id,
      is_active: fixtureDefinition.is_active ?? true,
      position: fixtureDefinition.position ?? 1,
      include_in_menu: fixtureDefinition.include_in_menu ?? true,
    };

    console.log(`🔧 Creating fixture category: ${categoryName} (${fixtureDefinition.description})`);

    try {
      const response = await createCategory(this.client, categoryData);

      if (!response.success || !response.data) {
        throw new Error(`Failed to create category ${categoryName}: ${response.error}`);
      }

      this.createdCategories.set(categoryName, response.data);
      console.log(`✅ Created fixture category: ${categoryName} (ID: ${response.data.id})`);

      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create category ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Create multiple fixtures for the current test
   */
  async createFixtures(fixtures: Array<{ name: string; definition?: FixtureCategoryDefinition }>): Promise<Map<string, Category>> {
    const results = new Map<string, Category>();

    for (const fixture of fixtures) {
      const category = await this.createFixture(fixture.name, fixture.definition);
      results.set(fixture.name, category);
    }

    return results;
  }

  /**
   * Get filter criteria to find only current test's categories
   */
  getCurrentTestFilter() {
    return {
      field: "name", 
      value: `%${this.currentTestUniqueId}%`,
      conditionType: "like" as const,
    };
  }

  /**
   * Get all created categories for current test
   */
  getCurrentTestCategories(): Map<string, Category> {
    const currentTestCats = new Map<string, Category>();
    
    for (const [name, cat] of this.createdCategories) {
      if (name.includes(this.currentTestUniqueId)) {
        currentTestCats.set(name, cat);
      }
    }
    
    return currentTestCats;
  }

  /**
   * Clean up fixtures for the current test only
   */
  async cleanupCurrentTest(): Promise<void> {
    const currentTestCats = this.getCurrentTestCategories();

    if (currentTestCats.size === 0) {
      console.log(`🧹 No fixtures to clean up for test: ${this.currentTestId}`);
      return;
    }

    console.log(`🧹 Cleaning up ${currentTestCats.size} fixtures for test: ${this.currentTestId} (ID: ${this.currentTestUniqueId})`);

    const cleanupPromises = Array.from(currentTestCats.values()).map(async (category) => {
      if (!category.id) {
        console.log(`⚠️ Category ${category.name} has no ID, skipping cleanup`);
        return;
      }

      try {
        const response = await deleteCategory(this.client, category.id);
        if (response.success) {
          console.log(`✅ Deleted fixture category: ${category.name} (ID: ${category.id})`);
          this.createdCategories.delete(category.id.toString());
        } else {
          console.log(`⚠️ Could not delete category ${category.name}: ${response.error}`);
        }
      } catch (error) {
        console.log(`⚠️ Error deleting category ${category.name}:`, error);
      }
    });

    await Promise.all(cleanupPromises);
    console.log(`🎉 Test cleanup completed for: ${this.currentTestId}`);
  }
} 