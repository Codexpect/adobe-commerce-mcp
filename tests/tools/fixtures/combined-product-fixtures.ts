import { AdobeCommerceClient } from "../../../src/adobe/adobe-commerce-client";
import type { Product, ProductAttribute } from "../../../src/adobe/products/types/product";
import { FixtureAttributeDefinition, ProductAttributeFixtures } from "./product-attribute-fixtures";
import { FixtureProductDefinition, ProductFixtures } from "./product-fixtures";

export interface CustomAttributeDefinition {
  name: string;
  definition: FixtureAttributeDefinition;
}

export interface CustomProductDefinition {
  name: string;
  definition: FixtureProductDefinition;
  requiredAttributes?: string[]; // Names of attributes this product needs
}

export interface TestFixtureResult {
  attributes: Map<string, ProductAttribute>;
  products: Map<string, Product>;
  attributeCodeMapping: Map<string, string>; // Maps attribute names to actual codes
}

export class CombinedProductFixtures {
  private productFixtures: ProductFixtures;
  private attributeFixtures: ProductAttributeFixtures;

  // Predefined attribute definitions for common test scenarios
  static readonly ATTRIBUTE_DEFINITIONS: Record<string, FixtureAttributeDefinition> = {
    BOOLEAN_FEATURED: {
      type: "boolean",
      defaultFrontendLabel: "Is Featured",
      scope: "store",
      description: "Boolean attribute for featured products",
    },
    BOOLEAN_NEW: {
      type: "boolean",
      defaultFrontendLabel: "Is New",
      scope: "store",
      description: "Boolean attribute for new products",
    },
    BOOLEAN_SALE: {
      type: "boolean",
      defaultFrontendLabel: "Is Sale",
      scope: "store",
      description: "Boolean attribute for sale products",
    },
    TEXT_COLOR: {
      type: "text",
      defaultFrontendLabel: "Color",
      scope: "store",
      description: "Text attribute for product color",
    },
    TEXT_SIZE: {
      type: "text",
      defaultFrontendLabel: "Size",
      scope: "store",
      description: "Text attribute for product size",
    },
    TEXT_BRAND: {
      type: "text",
      defaultFrontendLabel: "Brand",
      scope: "store",
      description: "Text attribute for product brand",
    },
    DECIMAL_RATING: {
      type: "decimal",
      defaultFrontendLabel: "Rating",
      scope: "store",
      description: "Decimal attribute for product rating",
    },
    INTEGER_STOCK: {
      type: "integer",
      defaultFrontendLabel: "Stock Quantity",
      scope: "store",
      description: "Integer attribute for stock quantity",
    },
    DATE_RELEASE: {
      type: "date",
      defaultFrontendLabel: "Release Date",
      scope: "store",
      description: "Date attribute for release date",
    },
    DATE_EXPIRY: {
      type: "date",
      defaultFrontendLabel: "Expiry Date",
      scope: "store",
      description: "Date attribute for expiry date",
    },
    DATE_MANUFACTURE: {
      type: "date",
      defaultFrontendLabel: "Manufacture Date",
      scope: "store",
      description: "Date attribute for manufacture date",
    },
    DATETIME_CREATED: {
      type: "datetime",
      defaultFrontendLabel: "Created At",
      scope: "store",
      description: "Datetime attribute for creation time",
    },
    DATETIME_UPDATED: {
      type: "datetime",
      defaultFrontendLabel: "Updated At",
      scope: "store",
      description: "Datetime attribute for update time",
    },
    DATETIME_MODIFIED: {
      type: "datetime",
      defaultFrontendLabel: "Last Modified",
      scope: "store",
      description: "Datetime attribute for last modification",
    },
    PRICE_MSRP: {
      type: "price",
      defaultFrontendLabel: "MSRP",
      scope: "store",
      description: "Price attribute for MSRP",
    },
    PRICE_COST: {
      type: "price",
      defaultFrontendLabel: "Cost",
      scope: "store",
      description: "Price attribute for cost",
    },
    PRICE_SPECIAL: {
      type: "price",
      defaultFrontendLabel: "Special Price",
      scope: "store",
      description: "Price attribute for special price",
    },
    DECIMAL_WEIGHT: {
      type: "decimal",
      defaultFrontendLabel: "Shipping Weight",
      scope: "store",
      description: "Decimal attribute for shipping weight",
    },
    DECIMAL_PACKAGE_WEIGHT: {
      type: "decimal",
      defaultFrontendLabel: "Package Weight",
      scope: "store",
      description: "Decimal attribute for package weight",
    },
    DECIMAL_DIMENSIONS_WEIGHT: {
      type: "decimal",
      defaultFrontendLabel: "Dimensions Weight",
      scope: "store",
      description: "Decimal attribute for dimensions weight",
    },
    SELECT_CATEGORY: {
      type: "singleselect",
      defaultFrontendLabel: "Primary Category",
      scope: "store",
      options: [
        { label: "Category A", sortOrder: 1, isDefault: true },
        { label: "Category B", sortOrder: 2, isDefault: false },
        { label: "Category C", sortOrder: 3, isDefault: false },
      ],
      description: "Select attribute for primary category",
    },
    SELECT_COLOR: {
      type: "singleselect",
      defaultFrontendLabel: "Main Color",
      scope: "store",
      options: [
        { label: "Red", sortOrder: 1, isDefault: true },
        { label: "Blue", sortOrder: 2, isDefault: false },
        { label: "Green", sortOrder: 3, isDefault: false },
      ],
      description: "Select attribute for main color",
    },
    SELECT_CONFIGURABLE_ATTRIBUTE: {
      type: "singleselect",
      defaultFrontendLabel: "Configurable Attribute",
      scope: "global",
      options: [
        { label: "Option 1", sortOrder: 1, isDefault: true },
        { label: "Option 2", sortOrder: 2, isDefault: false },
        { label: "Option 3", sortOrder: 3, isDefault: false },
      ],
      description: "Select attribute for configurable attribute",
    },
    SELECT_SIZE_TYPE: {
      type: "singleselect",
      defaultFrontendLabel: "Size Type",
      scope: "store",
      options: [
        { label: "Small", sortOrder: 1, isDefault: false },
        { label: "Medium", sortOrder: 2, isDefault: true },
        { label: "Large", sortOrder: 3, isDefault: false },
      ],
      description: "Select attribute for size type",
    },
    MULTISELECT_TAGS: {
      type: "multiselect",
      defaultFrontendLabel: "Tags",
      scope: "store",
      options: [
        { label: "Tag 1", sortOrder: 1, isDefault: false },
        { label: "Tag 2", sortOrder: 2, isDefault: false },
        { label: "Tag 3", sortOrder: 3, isDefault: false },
      ],
      description: "Multiselect attribute for tags",
    },
    MULTISELECT_CATEGORIES: {
      type: "multiselect",
      defaultFrontendLabel: "Categories",
      scope: "store",
      options: [
        { label: "Category 1", sortOrder: 1, isDefault: false },
        { label: "Category 2", sortOrder: 2, isDefault: false },
        { label: "Category 3", sortOrder: 3, isDefault: false },
      ],
      description: "Multiselect attribute for categories",
    },
    MULTISELECT_FEATURES: {
      type: "multiselect",
      defaultFrontendLabel: "Features",
      scope: "store",
      options: [
        { label: "Feature 1", sortOrder: 1, isDefault: false },
        { label: "Feature 2", sortOrder: 2, isDefault: false },
        { label: "Feature 3", sortOrder: 3, isDefault: false },
      ],
      description: "Multiselect attribute for features",
    },
  };

  // Attribute code mapping - centralized to avoid duplication
  private static readonly ATTRIBUTE_CODE_MAP: Record<string, string> = {
    BOOLEAN_FEATURED: "is_featured",
    BOOLEAN_NEW: "is_new",
    BOOLEAN_SALE: "is_sale",
    TEXT_COLOR: "color",
    TEXT_SIZE: "size",
    TEXT_BRAND: "brand",
    DECIMAL_RATING: "rating",
    INTEGER_STOCK: "stock_quantity",
    DATE_RELEASE: "release_date",
    DATE_EXPIRY: "expiry_date",
    DATE_MANUFACTURE: "manufacture_date",
    DATETIME_CREATED: "created_at",
    DATETIME_UPDATED: "updated_at",
    DATETIME_MODIFIED: "last_modified",
    PRICE_MSRP: "msrp",
    PRICE_COST: "cost",
    PRICE_SPECIAL: "special_price",
    DECIMAL_WEIGHT: "shipping_weight",
    DECIMAL_PACKAGE_WEIGHT: "package_weight",
    DECIMAL_DIMENSIONS_WEIGHT: "dimensions_weight",
    SELECT_CATEGORY: "primary_category",
    SELECT_COLOR: "main_color",
    SELECT_SIZE_TYPE: "size_type",
    SELECT_CONFIGURABLE_ATTRIBUTE: "configurable_attribute",
    MULTISELECT_TAGS: "tags",
    MULTISELECT_CATEGORIES: "categories",
    MULTISELECT_FEATURES: "features",
  };

  static readonly TEST_SCENARIOS: Record<
    string,
    {
      attributes: string[];
      products: Array<{
        name: string;
        definition: FixtureProductDefinition;
      }>;
    }
  > = {
    PRODUCT_WITH_BOOLEAN: {
      attributes: ["BOOLEAN_FEATURED", "BOOLEAN_NEW", "BOOLEAN_SALE"],
      products: [
        {
          name: "boolean_product",
          definition: {
            name: "Test Product with Boolean Attributes",
            price: 49.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 0.4,
            custom_attributes: [
              { attribute_code: "description", value: "A product with boolean attributes for testing" },
              { attribute_code: "short_description", value: "Boolean attributes test product" },
              { attribute_code: "is_featured", value: 1 },
              { attribute_code: "is_new", value: 0 },
              { attribute_code: "is_sale", value: 1 },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_TEXT: {
      attributes: ["TEXT_COLOR", "TEXT_SIZE", "TEXT_BRAND"],
      products: [
        {
          name: "text_product",
          definition: {
            name: "Test Product with Text Attributes",
            price: 39.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 0.3,
            custom_attributes: [
              { attribute_code: "description", value: "A product with text attributes for testing" },
              { attribute_code: "short_description", value: "Text attributes test product" },
              { attribute_code: "color", value: "blue" },
              { attribute_code: "size", value: "large" },
              { attribute_code: "brand", value: "TestBrand" },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_NUMERIC: {
      attributes: ["DECIMAL_RATING", "INTEGER_STOCK"],
      products: [
        {
          name: "numeric_product",
          definition: {
            name: "Test Product with Numeric Attributes",
            price: 79.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 1.0,
            custom_attributes: [
              { attribute_code: "description", value: "A product with numeric attributes for testing" },
              { attribute_code: "short_description", value: "Numeric attributes test product" },
              { attribute_code: "rating", value: 4.5 },
              { attribute_code: "stock_quantity", value: 100 },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_SELECT: {
      attributes: ["SELECT_CATEGORY", "MULTISELECT_TAGS"],
      products: [
        {
          name: "select_product",
          definition: {
            name: "Test Product with Select Attributes",
            price: 65.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 0.8,
            custom_attributes: [
              { attribute_code: "description", value: "A product with select attributes for testing" },
              { attribute_code: "short_description", value: "Select attributes test product" },
              // Note: These will be updated with actual option_ids after attribute creation
              { attribute_code: "primary_category", value: "Category A" }, // Will be replaced with option_id
              { attribute_code: "tags", value: "Tag 1,Tag 2" }, // Will be replaced with option_ids
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_MIXED: {
      attributes: ["BOOLEAN_FEATURED", "TEXT_COLOR", "DECIMAL_RATING"],
      products: [
        {
          name: "mixed_product",
          definition: {
            name: "Test Product with Mixed Attributes",
            price: 89.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 1.2,
            custom_attributes: [
              { attribute_code: "description", value: "A product with mixed attributes for testing" },
              { attribute_code: "short_description", value: "Mixed attributes test product" },
              { attribute_code: "is_featured", value: 1 },
              { attribute_code: "color", value: "blue" },
              { attribute_code: "rating", value: 4.8 },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_DATE: {
      attributes: ["DATE_RELEASE", "DATE_EXPIRY", "DATE_MANUFACTURE"],
      products: [
        {
          name: "date_product",
          definition: {
            name: "Test Product with Date Attributes",
            price: 59.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 0.7,
            custom_attributes: [
              { attribute_code: "description", value: "A product with date attributes for testing" },
              { attribute_code: "short_description", value: "Date attributes test product" },
              { attribute_code: "release_date", value: "2024-01-15" },
              { attribute_code: "expiry_date", value: "2025-12-31" },
              { attribute_code: "manufacture_date", value: "2023-06-01" },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_DATETIME: {
      attributes: ["DATETIME_CREATED", "DATETIME_UPDATED", "DATETIME_MODIFIED"],
      products: [
        {
          name: "datetime_product",
          definition: {
            name: "Test Product with Datetime Attributes",
            price: 69.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 0.8,
            custom_attributes: [
              { attribute_code: "description", value: "A product with datetime attributes for testing" },
              { attribute_code: "short_description", value: "Datetime attributes test product" },
              { attribute_code: "created_at", value: "2024-01-15 10:30:00" },
              { attribute_code: "updated_at", value: "2024-01-20 14:45:00" },
              { attribute_code: "last_modified", value: "2024-01-25 09:15:00" },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_PRICE: {
      attributes: ["PRICE_MSRP", "PRICE_COST", "PRICE_SPECIAL"],
      products: [
        {
          name: "price_product",
          definition: {
            name: "Test Product with Price Attributes",
            price: 99.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 1.1,
            custom_attributes: [
              { attribute_code: "description", value: "A product with price attributes for testing" },
              { attribute_code: "short_description", value: "Price attributes test product" },
              { attribute_code: "msrp", value: "149.99" },
              { attribute_code: "cost", value: "89.99" },
              { attribute_code: "special_price", value: "119.99" },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_WEIGHT: {
      attributes: ["DECIMAL_WEIGHT", "DECIMAL_PACKAGE_WEIGHT", "DECIMAL_DIMENSIONS_WEIGHT"],
      products: [
        {
          name: "weight_product",
          definition: {
            name: "Test Product with Weight Attributes",
            price: 45.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 0.9,
            custom_attributes: [
              { attribute_code: "description", value: "A product with weight attributes for testing" },
              { attribute_code: "short_description", value: "Weight attributes test product" },
              { attribute_code: "shipping_weight", value: "2.5" },
              { attribute_code: "package_weight", value: "3.0" },
              { attribute_code: "dimensions_weight", value: "2.2" },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_SINGLESELECT: {
      attributes: ["SELECT_CATEGORY", "SELECT_COLOR", "SELECT_SIZE_TYPE", "SELECT_CONFIGURABLE_ATTRIBUTE"],
      products: [
        {
          name: "singleselect_product",
          definition: {
            name: "Test Product with Singleselect Attributes",
            price: 55.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 0.6,
            custom_attributes: [
              { attribute_code: "description", value: "A product with singleselect attributes for testing" },
              { attribute_code: "short_description", value: "Singleselect attributes test product" },
              { attribute_code: "primary_category", value: "Category B" },
              { attribute_code: "main_color", value: "Blue" },
              { attribute_code: "size_type", value: "Large" },
              { attribute_code: "configurable_attribute", value: "Option 1" },
            ],
          },
        },
      ],
    },
    PRODUCT_WITH_MULTISELECT: {
      attributes: ["MULTISELECT_TAGS", "MULTISELECT_CATEGORIES", "MULTISELECT_FEATURES"],
      products: [
        {
          name: "multiselect_product",
          definition: {
            name: "Test Product with Multiselect Attributes",
            price: 75.99,
            type_id: "simple",
            status: 1,
            visibility: 4,
            weight: 1.0,
            custom_attributes: [
              { attribute_code: "description", value: "A product with multiselect attributes for testing" },
              { attribute_code: "short_description", value: "Multiselect attributes test product" },
              { attribute_code: "tags", value: "Tag 1,Tag 2" },
              { attribute_code: "categories", value: "Category 1,Category 2" },
              { attribute_code: "features", value: "Feature 1,Feature 3" },
            ],
          },
        },
      ],
    },
  };

  constructor(client: AdobeCommerceClient) {
    this.productFixtures = new ProductFixtures(client);
    this.attributeFixtures = new ProductAttributeFixtures(client);
  }

  /**
   * Set the current test identifier for both fixtures
   */
  setCurrentTest(testName: string): void {
    this.productFixtures.setCurrentTest(testName);
    this.attributeFixtures.setCurrentTest(testName);
  }

  /**
   * Get the current test's unique ID
   */
  getCurrentTestUniqueId(): string {
    return this.productFixtures.getCurrentTestUniqueId();
  }

  /**
   * Get filter criteria to find only current test's products
   */
  getCurrentTestFilter() {
    return this.productFixtures.getCurrentTestFilter();
  }

  /**
   * Just pass a scenario name like "PRODUCT_WITH_BOOLEAN"
   */
  async createScenario(scenarioName: string): Promise<TestFixtureResult> {
    const scenario = CombinedProductFixtures.TEST_SCENARIOS[scenarioName];
    if (!scenario) {
      throw new Error(
        `Unknown test scenario: ${scenarioName}. Available scenarios: ${Object.keys(CombinedProductFixtures.TEST_SCENARIOS).join(", ")}`
      );
    }

    console.log(`🔧 Creating scenario: ${scenarioName} with ${scenario.attributes.length} attributes and ${scenario.products.length} products`);

    // Convert scenario names to actual definitions
    const attributes: CustomAttributeDefinition[] = scenario.attributes.map((name) => {
      return {
        name: CombinedProductFixtures.ATTRIBUTE_CODE_MAP[name] || name.toLowerCase().replace(/_/g, "_"),
        definition: CombinedProductFixtures.ATTRIBUTE_DEFINITIONS[name],
      };
    });

    const products: CustomProductDefinition[] = scenario.products.map((productDef) => ({
      name: productDef.name,
      definition: productDef.definition,
    }));

    return await this.createTestScenario(attributes, products);
  }

  /**
   * Create multiple predefined scenarios at once
   */
  async createScenarios(scenarioNames: string[]): Promise<TestFixtureResult> {
    console.log(`🔧 Creating multiple scenarios: ${scenarioNames.join(", ")}`);

    // Collect all unique attributes and products from all scenarios
    const allAttributes = new Map<string, FixtureAttributeDefinition>();
    const allProducts = new Map<string, FixtureProductDefinition>();

    for (const scenarioName of scenarioNames) {
      const scenario = CombinedProductFixtures.TEST_SCENARIOS[scenarioName];
      if (!scenario) {
        throw new Error(`Unknown test scenario: ${scenarioName}`);
      }

      // Add attributes
      for (const attrName of scenario.attributes) {
        const attrKey = CombinedProductFixtures.ATTRIBUTE_CODE_MAP[attrName] || attrName.toLowerCase().replace(/_/g, "_");
        if (!allAttributes.has(attrKey)) {
          allAttributes.set(attrKey, CombinedProductFixtures.ATTRIBUTE_DEFINITIONS[attrName]);
        }
      }

      // Add products
      for (const productDef of scenario.products) {
        const prodKey = productDef.name;
        if (!allProducts.has(prodKey)) {
          allProducts.set(prodKey, productDef.definition);
        }
      }
    }

    // Convert to arrays
    const attributes: CustomAttributeDefinition[] = Array.from(allAttributes.entries()).map(([name, definition]) => ({
      name,
      definition,
    }));

    const products: CustomProductDefinition[] = Array.from(allProducts.entries()).map(([name, definition]) => ({
      name,
      definition,
    }));

    return await this.createTestScenario(attributes, products);
  }

  /**
   * Create attributes and products for a test scenario
   * This is the main method for creating test fixtures with custom attributes
   */
  async createTestScenario(attributes: CustomAttributeDefinition[], products: CustomProductDefinition[]): Promise<TestFixtureResult> {
    console.log(`🔧 Creating test scenario with ${attributes.length} attributes and ${products.length} products`);

    // Step 1: Create all required attributes
    const createdAttributes = await this.attributeFixtures.createFixtures(
      attributes.map((attr) => ({ name: attr.name, definition: attr.definition }))
    );

    // Step 2: Create attribute code mapping (attribute name -> actual code)
    const attributeCodeMapping = new Map<string, string>();
    for (const [name, attribute] of createdAttributes) {
      attributeCodeMapping.set(name, attribute.attribute_code);
    }

    // Step 3: Update product definitions with actual attribute codes and option_ids for select/multiselect
    const updatedProducts = products.map((productDef) => {
      const updatedDefinition = { ...productDef.definition };

      if (updatedDefinition.custom_attributes) {
        updatedDefinition.custom_attributes = updatedDefinition.custom_attributes.map((attr) => {
          // Check if this attribute code needs to be mapped
          const actualCode = attributeCodeMapping.get(attr.attribute_code);
          let updatedAttr = actualCode ? { ...attr, attribute_code: actualCode } : attr;

          // Handle select/multiselect attributes by replacing placeholder values with option_ids
          if (actualCode) {
            const attribute = createdAttributes.get(attr.attribute_code);
            if (attribute && (attribute.frontend_input === "select" || attribute.frontend_input === "multiselect")) {
              const optionIds = this.getOptionIdsForAttribute(attribute, attr.value);
              if (optionIds) {
                updatedAttr = { ...updatedAttr, value: optionIds };
              }
            }
          }

          return updatedAttr;
        });
      }

      return { name: productDef.name, definition: updatedDefinition };
    });

    // Step 4: Create products with updated definitions
    const createdProducts = await this.productFixtures.createFixtures(updatedProducts);

    return {
      attributes: createdAttributes,
      products: createdProducts,
      attributeCodeMapping,
    };
  }

  /**
   * Get option IDs for select/multiselect attributes based on option labels
   */
  private getOptionIdsForAttribute(attribute: ProductAttribute, value: string | number | boolean): string | number | undefined {
    if (!attribute.options || !value) {
      return undefined;
    }

    // Only handle string values for select/multiselect attributes
    if (typeof value !== "string") {
      return undefined;
    }

    // Handle multiselect (comma-separated values)
    if (attribute.frontend_input === "multiselect") {
      const labels = value.split(",").map((label: string) => label.trim());
      const optionIds = labels
        .map((label: string) => {
          const option = attribute.options?.find((opt) => opt.label === label);
          return option?.value;
        })
        .filter((id) => id !== undefined);

      return optionIds.length > 0 ? optionIds.join(",") : undefined;
    }

    // Handle singleselect
    if (attribute.frontend_input === "select") {
      const option = attribute.options?.find((opt) => opt.label === value);
      return option?.value;
    }

    return undefined;
  }

  /**
   * Clean up both attributes and products for the current test
   */
  async cleanupCurrentTest(): Promise<void> {
    await this.productFixtures.cleanupCurrentTest();
    await this.attributeFixtures.cleanupCurrentTest();
  }

  /**
   * Get access to the underlying fixtures for advanced usage
   */
  get productFixturesInstance(): ProductFixtures {
    return this.productFixtures;
  }

  get attributeFixturesInstance(): ProductAttributeFixtures {
    return this.attributeFixtures;
  }
}
