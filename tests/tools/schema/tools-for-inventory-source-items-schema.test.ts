import { z } from "zod";
import {
  createSourceItemInputSchema,
  deleteSourceItemInputSchema,
} from "../../../src/adobe/inventory/schemas";
import { searchCriteriaInputSchema } from "../../../src/adobe/search-criteria/schema";
import { testSchema } from "../../utils/schema-test-utils";

describe("Inventory Source Items Tools - Schema Validation Tests", () => {
  describe("Search Source Items Schema", () => {
    const validInputs = [
      {}, // Empty object should work
      { page: 1, pageSize: 10 },
      { sortOrders: [{ field: "sku", direction: "ASC" }] },
      {
        filters: [
          { field: "sku", value: "PROD-001", conditionType: "eq" },
          { field: "source_code", value: "warehouse_us", conditionType: "eq" },
        ],
      },
      {
        page: 2,
        pageSize: 5,
        filters: [{ field: "sku", value: "product", conditionType: "like" }],
        sortOrders: [{ field: "created_at", direction: "DESC" }],
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

    testSchema(searchCriteriaInputSchema, validInputs, invalidInputs, "Search Source Items");
  });

  describe("Create Source Item Schema", () => {
    const validInputs = [
      {
        sku: "PROD-001",
        source_code: "default",
        quantity: 100,
      },
      {
        sku: "product_123",
        source_code: "warehouse_1",
        quantity: 50,
        status: 1,
      },
      {
        sku: "configurable-product",
        source_code: "warehouse_2",
        quantity: 0,
        status: 2,
      },
      {
        sku: "PROD-001",
        source_code: "default",
        quantity: 999999,
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "PROD-001" }, // Missing source_code and quantity
      { source_code: "default", quantity: 100 }, // Missing sku
      { sku: "PROD-001", source_code: "default" }, // Missing quantity
      { sku: "PROD-001", quantity: 100 }, // Missing source_code
      { sku: "", source_code: "default", quantity: 100 }, // Empty SKU
      { sku: "   ", source_code: "default", quantity: 100 }, // Whitespace-only SKU
      { sku: "PROD-001", source_code: "", quantity: 100 }, // Empty source_code
      { sku: "PROD-001", source_code: "   ", quantity: 100 }, // Whitespace-only source_code
      { sku: "PROD-001", source_code: "default", quantity: -1 }, // Negative quantity
      { sku: "PROD-001", source_code: "default", quantity: "100" }, // Invalid quantity type
      { sku: "PROD-001", source_code: "default", quantity: 100, status: 0 }, // Invalid status (must be 1 or 2)
      { sku: "PROD-001", source_code: "default", quantity: 100, status: 3 }, // Invalid status (must be 1 or 2)
      { sku: "PROD-001", source_code: "default", quantity: 100, status: 1.5 }, // Non-integer status
      { sku: "PROD-001", source_code: "default", quantity: 100, status: "1" }, // Invalid status type
    ];

    testSchema(createSourceItemInputSchema, validInputs, invalidInputs, "Create Source Item");
  });

  describe("Delete Source Item Schema", () => {
    const validInputs = [
      {
        sku: "PROD-001",
        source_code: "default",
      },
      {
        sku: "product_123",
        source_code: "warehouse_1",
      },
      {
        sku: "configurable-product",
        source_code: "warehouse_2",
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "PROD-001" }, // Missing source_code
      { source_code: "default" }, // Missing sku
      { sku: "", source_code: "default" }, // Empty SKU
      { sku: "   ", source_code: "default" }, // Whitespace-only SKU
      { sku: "PROD-001", source_code: "" }, // Empty source_code
      { sku: "PROD-001", source_code: "   " }, // Whitespace-only source_code
    ];

    testSchema(deleteSourceItemInputSchema, validInputs, invalidInputs, "Delete Source Item");
  });

  describe("SECURITY: AI agents must not manipulate empty or invalid data", () => {
    test("should reject empty SKUs for create operations", () => {
      const createSourceItemSchema = z.object(createSourceItemInputSchema);

      expect(() =>
        createSourceItemSchema.parse({
          sku: "", // AI agents must not create with empty SKUs
          source_code: "default",
          quantity: 100,
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        createSourceItemSchema.parse({
          sku: "   ", // AI agents must not create with whitespace-only SKUs
          source_code: "default",
          quantity: 100,
        })
      ).toThrow("SKU can only contain letters, numbers, hyphens, and underscores");
    });

    test("should reject empty SKUs for delete operations", () => {
      const deleteSourceItemSchema = z.object(deleteSourceItemInputSchema);

      expect(() =>
        deleteSourceItemSchema.parse({
          sku: "", // AI agents must not delete with empty SKUs
          source_code: "default",
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        deleteSourceItemSchema.parse({
          sku: "   ", // AI agents must not delete with whitespace-only SKUs
          source_code: "default",
        })
      ).toThrow("SKU can only contain letters, numbers, hyphens, and underscores");
    });

    test("should reject empty source codes", () => {
      const createSourceItemSchema = z.object(createSourceItemInputSchema);
      const deleteSourceItemSchema = z.object(deleteSourceItemInputSchema);

      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "", // AI agents must not create with empty source codes
          quantity: 100,
        })
      ).toThrow("Source code is required");

      expect(() =>
        deleteSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "", // AI agents must not delete with empty source codes
        })
      ).toThrow("Source code is required");
    });
  });

  describe("BOUNDARY: Edge cases properly handled", () => {
    test("should handle maximum quantity values", () => {
      const createSourceItemSchema = z.object(createSourceItemInputSchema);

      // Very large quantities should be accepted (within reasonable limits)
      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "default",
          quantity: 999999, // Large but valid quantity
        })
      ).not.toThrow();

      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "default",
          quantity: 0, // Zero quantity should be valid
        })
      ).not.toThrow();
    });

    test("should handle long SKUs and source codes", () => {
      const createSourceItemSchema = z.object(createSourceItemInputSchema);

      // Long but valid SKUs and source codes should be accepted
      expect(() =>
        createSourceItemSchema.parse({
          sku: "A".repeat(64), // Long but valid SKU
          source_code: "a".repeat(64), // Long but valid source code
          quantity: 100,
        })
      ).not.toThrow();
    });

    test("should handle special characters in SKUs and source codes", () => {
      const createSourceItemSchema = z.object(createSourceItemInputSchema);

      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001_ABC-123", // SKU with special characters
          source_code: "warehouse_us-east", // Source code with special characters
          quantity: 100,
        })
      ).not.toThrow();

      expect(() =>
        createSourceItemSchema.parse({
          sku: "product_123", // SKU with underscores
          source_code: "warehouse_1", // Source code with underscores
          quantity: 100,
        })
      ).not.toThrow();
    });

    test("should reject invalid status values", () => {
      const createSourceItemSchema = z.object(createSourceItemInputSchema);

      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "default",
          quantity: 100,
          status: 0, // Invalid status (must be 1 or 2)
        })
      ).toThrow("Number must be greater than or equal to 1");

      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "default",
          quantity: 100,
          status: 3, // Invalid status (must be 1 or 2)
        })
      ).toThrow("Number must be less than or equal to 2");

      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "default",
          quantity: 100,
          status: 1.5, // Non-integer status
        })
      ).toThrow("Expected integer");
    });

    test("should reject negative quantities", () => {
      const createSourceItemSchema = z.object(createSourceItemInputSchema);

      expect(() =>
        createSourceItemSchema.parse({
          sku: "PROD-001",
          source_code: "default",
          quantity: -1, // Negative quantity
        })
      ).toThrow("Quantity must be non-negative");
    });
  });
}); 