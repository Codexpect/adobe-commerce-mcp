import { z } from "zod";
import {
  createProductInputSchema,
  deleteProductInputSchema,
  getProductBySkuInputSchema,
  updateProductInputSchema,
} from "../../../src/adobe/products/schemas/products/products";
import { searchCriteriaInputSchema } from "../../../src/adobe/search-criteria/schema";
import { testSchema } from "../../utils/schema-test-utils";

describe("Products Tools - Schema Validation Tests", () => {
  describe("Search Products Schema", () => {
    const validInputs = [
      {}, // Empty object should work
      { page: 1, pageSize: 10 },
      { sortOrders: [{ field: "name", direction: "ASC" }] },
      {
        filters: [
          { field: "sku", value: "PROD-001", conditionType: "eq" },
          { field: "status", value: "1", conditionType: "eq" },
        ],
      },
      {
        page: 2,
        pageSize: 5,
        filters: [{ field: "name", value: "iPhone", conditionType: "like" }],
        sortOrders: [{ field: "price", direction: "DESC" }],
      },
    ];

    const invalidInputs = [
      { page: 0 }, // Page must be >= 1
      { page: -1 },
      { pageSize: 0 }, // PageSize must be >= 1
      { pageSize: -5 },
      { pageSize: 11 }, // PageSize must be <= 10
      { page: "invalid" }, // Page must be number
      { pageSize: "invalid" }, // PageSize must be number
      { filters: "invalid" }, // Filters must be array
      { filters: [{}] }, // Filter must have required fields
      { filters: [{ field: "test" }] }, // Missing value
      { filters: [{ value: "test", conditionType: "eq" }] }, // Missing field
      { filters: [{ field: "", value: "test", conditionType: "eq" }] }, // Empty field
      { filters: [{ field: "test", value: "test", conditionType: "invalid" }] }, // Invalid conditionType
      { sortOrders: "invalid" }, // SortOrders must be array
      { sortOrders: [{}] }, // SortOrder must have required fields
      { sortOrders: [{ field: "test" }] }, // Missing direction
      { sortOrders: [{ direction: "ASC" }] }, // Missing field
      { sortOrders: [{ field: "", direction: "ASC" }] }, // Empty field
      { sortOrders: [{ field: "test", direction: "INVALID" }] }, // Invalid direction
    ];

    testSchema(searchCriteriaInputSchema, validInputs, invalidInputs, "Search Products");
  });

  describe("Create Product Schema", () => {
    const validInputs = [
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
      },
      {
        sku: "product_123",
        name: "Samsung Galaxy S24",
        price: 899.99,
        attribute_set_id: 4,
        status: 1,
        visibility: 4,
        type_id: "simple",
        weight: 0.5,
      },
      {
        sku: "configurable-product",
        name: "T-Shirt",
        price: 29.99,
        type_id: "configurable",
        custom_attributes: [
          {
            attribute_code: "color",
            value: "blue",
          },
          {
            attribute_code: "size",
            value: "large",
          },
          {
            attribute_code: "is_featured",
            value: 1,
          },
          {
            attribute_code: "category_ids",
            value: "1,2,3",
          },
          {
            attribute_code: "release_date",
            value: "2025-07-21",
          },
          {
            attribute_code: "price",
            value: "29.99",
          },
        ],
        website_ids: [1, 2],
        category_links: [
          {
            category_id: "3",
            position: 1,
          },
        ],
      },
      {
        sku: "simple-product",
        name: "Book",
        price: 19.99,
        weight: 0,
      },
      {
        sku: "default-website-product",
        name: "Default Website Product",
        price: 49.99,
        website_ids: [0, 1], // 0 is now valid for default website
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "PROD-001" }, // Missing name
      { name: "iPhone 15 Pro" }, // Missing sku
      { sku: "PROD-001", name: "iPhone 15 Pro" }, // Missing price
      { sku: "", name: "iPhone 15 Pro", price: 999.99 }, // Empty sku
      { sku: "PROD-001", name: "", price: 999.99 }, // Empty name
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 0 }, // Zero price
      { sku: "PROD-001", name: "iPhone 15 Pro", price: -100 }, // Negative price
      { sku: "PROD-001", name: "iPhone 15 Pro", price: "999.99" }, // Wrong type for price
      { sku: 123, name: "iPhone 15 Pro", price: 999.99 }, // Wrong type for sku
      { sku: "PROD-001", name: 123, price: 999.99 }, // Wrong type for name
      { sku: "PROD@001", name: "iPhone 15 Pro", price: 999.99 }, // Invalid sku pattern
      { sku: "PROD 001", name: "iPhone 15 Pro", price: 999.99 }, // Spaces in sku
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, attribute_set_id: 0 }, // Zero attribute_set_id
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, attribute_set_id: -1 }, // Negative attribute_set_id
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, status: 0 }, // Invalid status
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, status: 3 }, // Invalid status
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, visibility: 0 }, // Invalid visibility
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, visibility: 5 }, // Invalid visibility
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, type_id: "invalid" }, // Invalid type_id
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, weight: -1 }, // Negative weight
      { sku: "PROD-001", name: "iPhone 15 Pro", price: 999.99, weight: "0.5" }, // Wrong type for weight
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        custom_attributes: "invalid", // Must be array
      },
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        custom_attributes: [{}], // Missing required fields
      },
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        custom_attributes: [{ attribute_code: "", value: "test" }], // Empty attribute_code
      },
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        custom_attributes: [{ attribute_code: "test@invalid", value: "test" }], // Invalid attribute_code pattern
      },

      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        website_ids: [-1, 1], // Negative website_id
      },
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        category_links: [{}], // Missing required fields
      },
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        category_links: [{ category_id: "", position: 1 }], // Empty category_id
      },
      {
        sku: "PROD-001",
        name: "iPhone 15 Pro",
        price: 999.99,
        category_links: [{ category_id: "3", position: -1 }], // Negative position
      },
    ];

    testSchema(createProductInputSchema, validInputs, invalidInputs, "Create Product");
  });

  describe("Update Product Schema", () => {
    const validInputs = [
      {
        sku: "PROD-001",
        name: "Updated iPhone 15 Pro",
      },
      {
        sku: "product_123",
        price: 899.99,
        status: 2,
      },
      {
        sku: "configurable-product",
        type_id: "configurable",
        custom_attributes: [
          {
            attribute_code: "color",
            value: "red",
          },
          {
            attribute_code: "is_featured",
            value: 0,
          },
          {
            attribute_code: "category_ids",
            value: "5,6,7",
          },
        ],
        website_ids: [1, 2, 3],
        category_links: [
          {
            category_id: "5",
            position: 2,
          },
        ],
      },
      {
        sku: "simple-product",
        // Only SKU required for updates
      },
      {
        sku: "default-website-product",
        website_ids: [0, 1], // 0 is now valid for default website
      },
    ];

    const invalidInputs = [
      {}, // Missing sku
      { sku: "" }, // Empty sku
      { sku: "PROD@001" }, // Invalid sku pattern
      { sku: "PROD 001" }, // Spaces in sku
      { sku: 123 }, // Wrong type for sku
      { sku: "PROD-001", name: "" }, // Empty name
      { sku: "PROD-001", name: 123 }, // Wrong type for name
      { sku: "PROD-001", price: 0 }, // Zero price
      { sku: "PROD-001", price: -100 }, // Negative price
      { sku: "PROD-001", price: "999.99" }, // Wrong type for price
      { sku: "PROD-001", attribute_set_id: 0 }, // Zero attribute_set_id
      { sku: "PROD-001", attribute_set_id: -1 }, // Negative attribute_set_id
      { sku: "PROD-001", status: 0 }, // Invalid status
      { sku: "PROD-001", status: 3 }, // Invalid status
      { sku: "PROD-001", visibility: 0 }, // Invalid visibility
      { sku: "PROD-001", visibility: 5 }, // Invalid visibility
      { sku: "PROD-001", type_id: "invalid" }, // Invalid type_id
      { sku: "PROD-001", weight: -1 }, // Negative weight
      { sku: "PROD-001", weight: "0.5" }, // Wrong type for weight
      {
        sku: "PROD-001",
        custom_attributes: "invalid", // Must be array
      },
      {
        sku: "PROD-001",
        custom_attributes: [{}], // Missing required fields
      },
      {
        sku: "PROD-001",
        custom_attributes: [{ attribute_code: "", value: "test" }], // Empty attribute_code
      },
      {
        sku: "PROD-001",
        custom_attributes: [{ attribute_code: "test@invalid", value: "test" }], // Invalid attribute_code pattern
      },

      {
        sku: "PROD-001",
        website_ids: [-1, 1], // Negative website_id
      },
      {
        sku: "PROD-001",
        category_links: [{}], // Missing required fields
      },
      {
        sku: "PROD-001",
        category_links: [{ category_id: "", position: 1 }], // Empty category_id
      },
      {
        sku: "PROD-001",
        category_links: [{ category_id: "3", position: -1 }], // Negative position
      },
    ];

    testSchema(updateProductInputSchema, validInputs, invalidInputs, "Update Product");
  });

  describe("Get Product By SKU Schema", () => {
    const validInputs = [{ sku: "PROD-001" }, { sku: "product_123" }, { sku: "test-product-456" }, { sku: "product_with_underscores" }];

    const invalidInputs = [
      {}, // Missing sku
      { sku: "" }, // Empty sku
      { sku: 123 }, // Wrong type
      { sku: null }, // Null value
      { sku: undefined }, // Undefined value
      { sku: "PROD@001" }, // Invalid pattern
      { sku: "PROD 001" }, // Spaces not allowed
      { wrongField: "test" }, // Wrong field name
    ];

    testSchema(getProductBySkuInputSchema, validInputs, invalidInputs, "Get Product By SKU");
  });

  describe("Delete Product Schema", () => {
    const validInputs = [{ sku: "PROD-001" }, { sku: "product_123" }, { sku: "test-product-456" }, { sku: "product_with_underscores" }];

    const invalidInputs = [
      {}, // Missing sku
      { sku: "" }, // Empty sku
      { sku: 123 }, // Wrong type
      { sku: null }, // Null value
      { sku: undefined }, // Undefined value
      { sku: "PROD@001" }, // Invalid pattern
      { sku: "PROD 001" }, // Spaces not allowed
      { wrongField: "test" }, // Wrong field name
    ];

    testSchema(deleteProductInputSchema, validInputs, invalidInputs, "Delete Product");
  });

  describe("Edge Cases and Boundary Values", () => {
    test("should handle extreme but valid values", () => {
      const createSchema = z.object(createProductInputSchema);
      const searchSchema = z.object(searchCriteriaInputSchema);

      // Very long but valid names
      const longName = "A".repeat(255);
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: longName,
          price: 999.99,
        })
      ).not.toThrow();

      // Very high prices
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Luxury Product",
          price: 999999.99,
        })
      ).not.toThrow();

      // Very high weights
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Heavy Product",
          price: 999.99,
          weight: 999999.99,
        })
      ).not.toThrow();

      // Maximum page size
      expect(() => searchSchema.parse({ pageSize: 10 })).not.toThrow();

      // Large attribute set IDs
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          attribute_set_id: 999999,
        })
      ).not.toThrow();

      // Multiple custom attributes
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          custom_attributes: Array.from({ length: 10 }, (_, i) => ({
            attribute_code: `attr_${i}`,
            value: `value_${i}`,
          })),
        })
      ).not.toThrow();

      // Multiple website IDs
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          website_ids: Array.from({ length: 10 }, (_, i) => i + 1),
        })
      ).not.toThrow();
    });

    test("should reject extreme invalid values", () => {
      const createSchema = z.object(createProductInputSchema);
      const updateSchema = z.object(updateProductInputSchema);
      const searchSchema = z.object(searchCriteriaInputSchema);

      // Negative prices
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: -999999.99,
        })
      ).toThrow();

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          price: -999999.99,
        })
      ).toThrow();

      // Zero prices
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 0,
        })
      ).toThrow();

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          price: 0,
        })
      ).toThrow();

      // Negative weights
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          weight: -1,
        })
      ).toThrow();

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          weight: -1,
        })
      ).toThrow();

      // Values exceeding limits
      expect(() => searchSchema.parse({ pageSize: 11 })).toThrow();
      expect(() => searchSchema.parse({ page: 0 })).toThrow();
    });
  });

  describe("Type Coercion and Validation", () => {
    test("should not coerce invalid types", () => {
      const createSchema = z.object(createProductInputSchema);
      const updateSchema = z.object(updateProductInputSchema);
      const searchSchema = z.object(searchCriteriaInputSchema);

      // Numbers as strings where numbers are expected
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: "999.99",
        })
      ).toThrow();

      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          weight: "0.5",
        })
      ).toThrow();

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          price: "999.99",
        })
      ).toThrow();

      expect(() => searchSchema.parse({ page: "1" })).toThrow();
      expect(() => searchSchema.parse({ pageSize: "10" })).toThrow();

      // Note: Custom attributes value field accepts string, number, or boolean
      // So string values like "true" or "false" are actually valid
      // This is by design for the custom attributes schema
    });
  });

  describe("Security and AI Agent Safety", () => {
    test("should reject empty strings in critical fields", () => {
      const createSchema = z.object(createProductInputSchema);
      const updateSchema = z.object(updateProductInputSchema);
      const getSchema = z.object(getProductBySkuInputSchema);

      console.log("✅ SECURITY: Empty string validations properly reject invalid inputs");

      // Empty SKUs
      expect(() =>
        createSchema.parse({
          sku: "",
          name: "Test Product",
          price: 999.99,
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        updateSchema.parse({
          sku: "",
          name: "Updated Product",
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        getSchema.parse({
          sku: "",
        })
      ).toThrow("SKU cannot be empty");

      // Empty product names
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "",
          price: 999.99,
        })
      ).toThrow("Product name is required");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          name: "",
        })
      ).toThrow("Product name is required");

      // Empty category IDs in category_links
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          category_links: [
            {
              category_id: "",
              position: 1,
            },
          ],
        })
      ).toThrow("Category ID cannot be empty");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          category_links: [
            {
              category_id: "",
              position: 1,
            },
          ],
        })
      ).toThrow("Category ID cannot be empty");
    });

    test("should validate SKU patterns consistently", () => {
      const createSchema = z.object(createProductInputSchema);
      const updateSchema = z.object(updateProductInputSchema);
      const getSchema = z.object(getProductBySkuInputSchema);

      // Test that skuSchema is used consistently
      expect(() =>
        createSchema.parse({
          sku: "PROD@001",
          name: "Test Product",
          price: 999.99,
        })
      ).toThrow("SKU can only contain letters, numbers, hyphens, and underscores");

      expect(() =>
        createSchema.parse({
          sku: "PROD 001",
          name: "Test Product",
          price: 999.99,
        })
      ).toThrow("SKU can only contain letters, numbers, hyphens, and underscores");

      expect(() =>
        updateSchema.parse({
          sku: "PROD@001",
          name: "Updated Product",
        })
      ).toThrow("SKU can only contain letters, numbers, hyphens, and underscores");

      expect(() =>
        getSchema.parse({
          sku: "PROD@001",
        })
      ).toThrow("SKU can only contain letters, numbers, hyphens, and underscores");
    });

    test("should validate attribute codes consistently", () => {
      const createSchema = z.object(createProductInputSchema);
      const updateSchema = z.object(updateProductInputSchema);

      // Test that attributeCodeSchema is used consistently
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          custom_attributes: [
            {
              attribute_code: "test@invalid",
              value: "test",
            },
          ],
        })
      ).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          custom_attributes: [
            {
              attribute_code: "test-invalid",
              value: "test",
            },
          ],
        })
      ).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          custom_attributes: [
            {
              attribute_code: "test@invalid",
              value: "test",
            },
          ],
        })
      ).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          custom_attributes: [
            {
              attribute_code: "test-invalid",
              value: "test",
            },
          ],
        })
      ).toThrow("Attribute code can only contain letters, numbers, and underscores");
    });

    test("should prevent zero or negative values where inappropriate", () => {
      const createSchema = z.object(createProductInputSchema);
      const updateSchema = z.object(updateProductInputSchema);

      // Zero prices should be rejected
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 0,
        })
      ).toThrow("Price must be positive");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          price: 0,
        })
      ).toThrow("Price must be positive");

      // Negative prices should be rejected
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: -1,
        })
      ).toThrow("Price must be positive");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          price: -1,
        })
      ).toThrow("Price must be positive");

      // Zero attribute set IDs should be rejected
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          attribute_set_id: 0,
        })
      ).toThrow("Entity ID must be a positive integer");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          attribute_set_id: 0,
        })
      ).toThrow("Entity ID must be a positive integer");

      // Negative attribute set IDs should be rejected
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          attribute_set_id: -1,
        })
      ).toThrow("Entity ID must be a positive integer");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          attribute_set_id: -1,
        })
      ).toThrow("Entity ID must be a positive integer");

      // Zero website IDs are now valid (default website)
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          website_ids: [0, 1],
        })
      ).not.toThrow();

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          website_ids: [0, 1],
        })
      ).not.toThrow();

      // Negative website IDs should be rejected
      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "Test Product",
          price: 999.99,
          website_ids: [-1, 1],
        })
      ).toThrow("Website ID must be a non-negative integer");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          website_ids: [-1, 1],
        })
      ).toThrow("Website ID must be a non-negative integer");
    });

    test("SECURITY: Empty strings properly rejected for AI agent safety", () => {
      console.log("✅ SECURITY: Empty string validations properly reject invalid inputs");

      const createSchema = z.object(createProductInputSchema);
      const updateSchema = z.object(updateProductInputSchema);
      const getSchema = z.object(getProductBySkuInputSchema);

      // Test critical fields
      expect(() =>
        createSchema.parse({
          sku: "", // AI agents must not create empty SKUs
          name: "Test Product",
          price: 999.99,
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        updateSchema.parse({
          sku: "", // AI agents must not use empty SKUs
          name: "Updated Product",
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        getSchema.parse({
          sku: "", // AI agents must not query with empty SKUs
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        createSchema.parse({
          sku: "PROD-001",
          name: "", // AI agents must not create empty names
          price: 999.99,
        })
      ).toThrow("Product name is required");

      expect(() =>
        updateSchema.parse({
          sku: "PROD-001",
          name: "", // AI agents must not update with empty names
        })
      ).toThrow("Product name is required");
    });
  });
});
