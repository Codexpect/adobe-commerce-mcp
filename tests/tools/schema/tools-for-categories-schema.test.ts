import { z } from "zod";
import {
  getCategoryTreeInputSchema,
  getCategoryByIdInputSchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
  deleteCategoryInputSchema,
  moveCategoryInputSchema,
  getCategoryAttributeByCodeInputSchema,
  getCategoryAttributeOptionsInputSchema,
  getCategoryProductsInputSchema,
  assignProductToCategoryInputSchema,
  updateProductInCategoryInputSchema,
  removeProductFromCategoryInputSchema,
} from "../../../src/adobe/categories/schemas";
import { searchCriteriaInputSchema } from "../../../src/adobe/search-criteria/schema";

/**
 * Helper function to test Zod schemas with valid and invalid inputs
 */
const testSchema = (
  schema: Record<string, z.ZodTypeAny>,
  validInputs: unknown[],
  invalidInputs: unknown[],
  schemaName: string
) => {
  const zodSchema = z.object(schema);

  describe(`${schemaName} Schema`, () => {
    test("should accept valid inputs", () => {
      validInputs.forEach((input) => {
        expect(() => zodSchema.parse(input)).not.toThrow();
      });
    });

    test("should reject invalid inputs", () => {
      invalidInputs.forEach((input) => {
        expect(() => zodSchema.parse(input)).toThrow();
      });
    });
  });
};

describe("Categories Tools - Schema Validation Tests", () => {
  describe("Search Categories Schema", () => {
    const validInputs = [
      {}, // Empty object should work
      { page: 1, pageSize: 10 },
      { sortOrders: [{ field: "name", direction: "ASC" }] },
      {
        filters: [
          { field: "name", value: "Electronics", conditionType: "eq" },
          { field: "is_active", value: "1", conditionType: "eq" },
        ],
      },
      {
        page: 2,
        pageSize: 5,
        filters: [{ field: "name", value: "Electronics", conditionType: "like" }],
        sortOrders: [{ field: "position", direction: "DESC" }],
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

    testSchema(searchCriteriaInputSchema, validInputs, invalidInputs, "Search Categories");
  });

  describe("Get Category Tree Schema", () => {
    const validInputs = [
      {}, // All fields optional
      { rootCategoryId: 1 },
      { depth: 3 },
      { rootCategoryId: 1, depth: 5 },
      { rootCategoryId: 999, depth: 10 },
    ];

    const invalidInputs = [
      { rootCategoryId: 0 }, // Zero category ID
      { rootCategoryId: -1 }, // Negative category ID
      { rootCategoryId: "invalid" }, // Wrong type
      { depth: 0 }, // Zero depth
      { depth: -1 }, // Negative depth
      { depth: 11 }, // Exceeds max depth
      { depth: "invalid" }, // Wrong type
      { rootCategoryId: null }, // Null value
      { depth: null }, // Null value
    ];

    testSchema(getCategoryTreeInputSchema, validInputs, invalidInputs, "Get Category Tree");
  });

  describe("Get Category By ID Schema", () => {
    const validInputs = [
      { categoryId: 1 },
      { categoryId: 1, storeId: 1 },
      { categoryId: 999, storeId: 2 },
    ];

    const invalidInputs = [
      {}, // Missing categoryId
      { categoryId: 0 }, // Zero category ID
      { categoryId: -1 }, // Negative category ID
      { categoryId: "invalid" }, // Wrong type
      { categoryId: null }, // Null value
      { storeId: 1 }, // Missing categoryId
      { categoryId: 1, storeId: 0 }, // Zero store ID
      { categoryId: 1, storeId: -1 }, // Negative store ID
      { categoryId: 1, storeId: "invalid" }, // Wrong type for storeId
    ];

    testSchema(getCategoryByIdInputSchema, validInputs, invalidInputs, "Get Category By ID");
  });

  describe("Create Category Schema", () => {
    const validInputs = [
      {
        category: {
          name: "Electronics",
        },
      },
      {
        category: {
          name: "Clothing & Apparel",
          parent_id: 2,
          is_active: true,
          position: 1,
          include_in_menu: true,
          available_sort_by: ["name", "position"],
        },
      },
      {
        category: {
          name: "Books & Media",
          parent_id: 3,
          is_active: false,
          position: 0,
          include_in_menu: false,
          available_sort_by: ["name"],
        },
      },
    ];

    const invalidInputs = [
      {}, // Missing category
      { category: {} }, // Missing name
      { category: { name: "" } }, // Empty name
      { category: { name: 123 } }, // Wrong type for name
      { category: { name: null } }, // Null name
      {
        category: {
          name: "Test",
          parent_id: 0,
        },
      }, // Zero parent_id
      {
        category: {
          name: "Test",
          parent_id: -1,
        },
      }, // Negative parent_id
      {
        category: {
          name: "Test",
          parent_id: "invalid",
        },
      }, // Wrong type for parent_id
      {
        category: {
          name: "Test",
          is_active: "invalid",
        },
      }, // Wrong type for is_active
      {
        category: {
          name: "Test",
          position: -1,
        },
      }, // Negative position
      {
        category: {
          name: "Test",
          position: "invalid",
        },
      }, // Wrong type for position
      {
        category: {
          name: "Test",
          include_in_menu: "invalid",
        },
      }, // Wrong type for include_in_menu
      {
        category: {
          name: "Test",
          available_sort_by: "invalid",
        },
      }, // Wrong type for available_sort_by
      {
        category: {
          name: "Test",
          available_sort_by: [""],
        },
      }, // Empty string in array
    ];

    testSchema(createCategoryInputSchema, validInputs, invalidInputs, "Create Category");
  });

  describe("Update Category Schema", () => {
    const validInputs = [
      {
        categoryId: "1",
        category: {
          name: "Updated Electronics",
        },
      },
      {
        categoryId: "2",
        category: {
          position: 2,
          is_active: false,
        },
      },
      {
        categoryId: "999",
        category: {
          name: "Updated Name",
          parent_id: 3,
          position: 5,
          include_in_menu: true,
          available_sort_by: ["name", "position", "price"],
        },
      },
    ];

    const invalidInputs = [
      {}, // Missing categoryId
      { categoryId: "" }, // Empty categoryId
      { category: { name: "Test" } }, // Missing categoryId
      { categoryId: "1" }, // Missing category
      { categoryId: 123 }, // Wrong type for categoryId
      { categoryId: null }, // Null categoryId
      {
        categoryId: "1",
        category: {
          name: "",
        },
      }, // Empty name
      {
        categoryId: "1",
        category: {
          name: 123,
        },
      }, // Wrong type for name
      {
        categoryId: "1",
        category: {
          parent_id: 0,
        },
      }, // Zero parent_id
      {
        categoryId: "1",
        category: {
          parent_id: -1,
        },
      }, // Negative parent_id
      {
        categoryId: "1",
        category: {
          position: -1,
        },
      }, // Negative position
      {
        categoryId: "1",
        category: {
          available_sort_by: [""],
        },
      }, // Empty string in array
    ];

    testSchema(updateCategoryInputSchema, validInputs, invalidInputs, "Update Category");
  });

  describe("Delete Category Schema", () => {
    const validInputs = [
      { categoryId: 1 },
      { categoryId: 4 },
      { categoryId: 999 },
    ];

    const invalidInputs = [
      {}, // Missing categoryId
      { categoryId: 0 }, // Zero category ID
      { categoryId: -1 }, // Negative category ID
      { categoryId: "invalid" }, // Wrong type
      { categoryId: null }, // Null value
      { categoryId: undefined }, // Undefined value
      { wrongField: 1 }, // Wrong field name
    ];

    testSchema(deleteCategoryInputSchema, validInputs, invalidInputs, "Delete Category");
  });

  describe("Move Category Schema", () => {
    const validInputs = [
      {
        categoryId: 1,
        parentId: 2,
      },
      {
        categoryId: 3,
        parentId: 4,
        afterId: 5,
      },
      {
        categoryId: 999,
        parentId: 1,
        afterId: 100,
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { categoryId: 1 }, // Missing parentId
      { parentId: 2 }, // Missing categoryId
      { categoryId: 0, parentId: 2 }, // Zero categoryId
      { categoryId: -1, parentId: 2 }, // Negative categoryId
      { categoryId: 1, parentId: 0 }, // Zero parentId
      { categoryId: 1, parentId: -1 }, // Negative parentId
      { categoryId: "invalid", parentId: 2 }, // Wrong type for categoryId
      { categoryId: 1, parentId: "invalid" }, // Wrong type for parentId
      { categoryId: 1, parentId: 2, afterId: 0 }, // Zero afterId
      { categoryId: 1, parentId: 2, afterId: -1 }, // Negative afterId
      { categoryId: 1, parentId: 2, afterId: "invalid" }, // Wrong type for afterId
    ];

    testSchema(moveCategoryInputSchema, validInputs, invalidInputs, "Move Category");
  });

  describe("Get Category Attribute By Code Schema", () => {
    const validInputs = [
      { attributeCode: "name" },
      { attributeCode: "is_active" },
      { attributeCode: "test_attribute_123" },
      { attributeCode: "attribute_with_underscores" },
    ];

    const invalidInputs = [
      {}, // Missing attributeCode
      { attributeCode: "" }, // Empty attributeCode
      { attributeCode: 123 }, // Wrong type
      { attributeCode: null }, // Null value
      { attributeCode: undefined }, // Undefined value
      { attributeCode: "test@invalid" }, // Invalid pattern
      { attributeCode: "test-invalid" }, // Hyphens not allowed
      { attributeCode: "test invalid" }, // Spaces not allowed
      { wrongField: "test" }, // Wrong field name
    ];

    testSchema(getCategoryAttributeByCodeInputSchema, validInputs, invalidInputs, "Get Category Attribute By Code");
  });

  describe("Get Category Attribute Options Schema", () => {
    const validInputs = [
      { attributeCode: "is_active" },
      { attributeCode: "include_in_menu" },
      { attributeCode: "test_select_attribute" },
    ];

    const invalidInputs = [
      {}, // Missing attributeCode
      { attributeCode: "" }, // Empty attributeCode
      { attributeCode: 123 }, // Wrong type
      { attributeCode: null }, // Null value
      { attributeCode: "test@invalid" }, // Invalid pattern
      { attributeCode: "test-invalid" }, // Hyphens not allowed
      { wrongField: "test" }, // Wrong field name
    ];

    testSchema(getCategoryAttributeOptionsInputSchema, validInputs, invalidInputs, "Get Category Attribute Options");
  });

  describe("Get Category Products Schema", () => {
    const validInputs = [
      { categoryId: 1 },
      { categoryId: 4 },
      { categoryId: 999 },
    ];

    const invalidInputs = [
      {}, // Missing categoryId
      { categoryId: 0 }, // Zero category ID
      { categoryId: -1 }, // Negative category ID
      { categoryId: "invalid" }, // Wrong type
      { categoryId: null }, // Null value
      { wrongField: 1 }, // Wrong field name
    ];

    testSchema(getCategoryProductsInputSchema, validInputs, invalidInputs, "Get Category Products");
  });

  describe("Assign Product To Category Schema", () => {
    const validInputs = [
      {
        categoryId: "1",
        productLink: {
          sku: "test-sku",
          position: 1,
        },
      },
      {
        categoryId: "2",
        productLink: {
          sku: "another-sku",
        },
      },
      {
        categoryId: "999",
        productLink: {
          sku: "test-sku-123",
          position: 0,
        },
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { categoryId: "1" }, // Missing productLink
      { productLink: { sku: "test" } }, // Missing categoryId
      { categoryId: "", productLink: { sku: "test" } }, // Empty categoryId
      { categoryId: "1", productLink: {} }, // Missing sku in productLink
      { categoryId: "1", productLink: { sku: "" } }, // Empty sku
      { categoryId: "1", productLink: { sku: "test", position: -1 } }, // Negative position
      { categoryId: "1", productLink: { sku: "test", position: "invalid" } }, // Wrong type for position
      { categoryId: 123, productLink: { sku: "test" } }, // Wrong type for categoryId
    ];

    testSchema(assignProductToCategoryInputSchema, validInputs, invalidInputs, "Assign Product To Category");
  });

  describe("Update Product In Category Schema", () => {
    const validInputs = [
      {
        categoryId: "1",
        productLink: {
          sku: "test-sku",
          position: 2,
        },
      },
      {
        categoryId: "2",
        productLink: {
          sku: "another-sku",
        },
      },
      {
        categoryId: "999",
        productLink: {
          sku: "test-sku-123",
          position: 0,
        },
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { categoryId: "1" }, // Missing productLink
      { productLink: { sku: "test" } }, // Missing categoryId
      { categoryId: "", productLink: { sku: "test" } }, // Empty categoryId
      { categoryId: "1", productLink: {} }, // Missing sku in productLink
      { categoryId: "1", productLink: { sku: "" } }, // Empty sku
      { categoryId: "1", productLink: { sku: "test", position: -1 } }, // Negative position
      { categoryId: "1", productLink: { sku: "test", position: "invalid" } }, // Wrong type for position
      { categoryId: 123, productLink: { sku: "test" } }, // Wrong type for categoryId
    ];

    testSchema(updateProductInCategoryInputSchema, validInputs, invalidInputs, "Update Product In Category");
  });

  describe("Remove Product From Category Schema", () => {
    const validInputs = [
      { categoryId: 1, sku: "test-sku" },
      { categoryId: 4, sku: "another-sku" },
      { categoryId: 999, sku: "test-sku-123" },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { categoryId: 1 }, // Missing sku
      { sku: "test-sku" }, // Missing categoryId
      { categoryId: 0, sku: "test-sku" }, // Zero categoryId
      { categoryId: -1, sku: "test-sku" }, // Negative categoryId
      { categoryId: 1, sku: "" }, // Empty sku
      { categoryId: "invalid", sku: "test-sku" }, // Wrong type for categoryId
      { categoryId: 1, sku: 123 }, // Wrong type for sku
      { categoryId: null, sku: "test-sku" }, // Null categoryId
      { categoryId: 1, sku: null }, // Null sku
      { wrongField1: 1, wrongField2: "test" }, // Wrong field names
    ];

    testSchema(removeProductFromCategoryInputSchema, validInputs, invalidInputs, "Remove Product From Category");
  });

  describe("Edge Cases and Boundary Values", () => {
    test("should handle extreme but valid values", () => {
      const createSchema = z.object(createCategoryInputSchema);
      const searchSchema = z.object(searchCriteriaInputSchema);
      const moveSchema = z.object(moveCategoryInputSchema);

      // Very long but valid names
      const longName = "A".repeat(255);
      expect(() => createSchema.parse({
        category: {
          name: longName,
        },
      })).not.toThrow();

      // Large but valid IDs
      expect(() => moveSchema.parse({
        categoryId: 999999,
        parentId: 999999,
      })).not.toThrow();

      // Maximum page size
      expect(() => searchSchema.parse({ pageSize: 10 })).not.toThrow();

      // Large position values
      expect(() => createSchema.parse({
        category: {
          name: "Test",
          position: 999999,
        },
      })).not.toThrow();
    });

    test("should reject extreme invalid values", () => {
      const createSchema = z.object(createCategoryInputSchema);
      const searchSchema = z.object(searchCriteriaInputSchema);
      const moveSchema = z.object(moveCategoryInputSchema);

      // Negative positions
      expect(() => createSchema.parse({
        category: {
          name: "Test",
          position: -1,
        },
      })).toThrow();

      // Negative IDs
      expect(() => moveSchema.parse({
        categoryId: -1,
        parentId: 1,
      })).toThrow();

      // Values exceeding limits
      expect(() => searchSchema.parse({ pageSize: 11 })).toThrow();
      expect(() => searchSchema.parse({ page: 0 })).toThrow();
    });
  });

  describe("Type Coercion and Validation", () => {
    test("should not coerce invalid types", () => {
      const createSchema = z.object(createCategoryInputSchema);
      const searchSchema = z.object(searchCriteriaInputSchema);
      const moveSchema = z.object(moveCategoryInputSchema);

      // Numbers as strings where numbers are expected
      expect(() => createSchema.parse({
        category: {
          name: "Test",
          position: "10",
        },
      })).toThrow();

      expect(() => moveSchema.parse({
        categoryId: "1",
        parentId: "2",
      })).toThrow();

      expect(() => searchSchema.parse({ page: "1" })).toThrow();
      expect(() => searchSchema.parse({ pageSize: "10" })).toThrow();

      // Booleans as strings where booleans are expected
      expect(() => createSchema.parse({
        category: {
          name: "Test",
          is_active: "true",
        },
      })).toThrow();

      expect(() => createSchema.parse({
        category: {
          name: "Test",
          include_in_menu: "false",
        },
      })).toThrow();
    });
  });

  describe("Security and AI Agent Safety", () => {
    test("should reject empty strings in critical fields", () => {
      const createSchema = z.object(createCategoryInputSchema);
      const updateSchema = z.object(updateCategoryInputSchema);
      const assignSchema = z.object(assignProductToCategoryInputSchema);

      console.log("✅ SECURITY: Empty string validations properly reject invalid inputs");

      // Empty category names
      expect(() => createSchema.parse({
        category: {
          name: "",
        },
      })).toThrow("Category name cannot be empty");

      expect(() => updateSchema.parse({
        categoryId: "1",
        category: {
          name: "",
        },
      })).toThrow("Category name cannot be empty");

      // Empty category IDs
      expect(() => updateSchema.parse({
        categoryId: "",
        category: {
          name: "Test",
        },
      })).toThrow("Category ID cannot be empty");

      expect(() => assignSchema.parse({
        categoryId: "",
        productLink: {
          sku: "test",
          category_id: "1",
        },
      })).toThrow("Category ID cannot be empty");

      // Empty SKUs
      expect(() => assignSchema.parse({
        categoryId: "1",
        productLink: {
          sku: "",
          category_id: "1",
        },
      })).toThrow("Product SKU cannot be empty");
    });

    test("should validate attribute codes consistently", () => {
      const getAttrSchema = z.object(getCategoryAttributeByCodeInputSchema);
      const getOptionsSchema = z.object(getCategoryAttributeOptionsInputSchema);

      // Test that attributeCodeSchema is used consistently
      expect(() => getAttrSchema.parse({
        attributeCode: "test@invalid",
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() => getAttrSchema.parse({
        attributeCode: "test-invalid",
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() => getOptionsSchema.parse({
        attributeCode: "test@invalid",
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() => getOptionsSchema.parse({
        attributeCode: "test-invalid",
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");
    });

    test("should prevent zero or negative IDs where inappropriate", () => {
      const getByIdSchema = z.object(getCategoryByIdInputSchema);
      const deleteSchema = z.object(deleteCategoryInputSchema);
      const moveSchema = z.object(moveCategoryInputSchema);

      // Zero IDs should be rejected
      expect(() => getByIdSchema.parse({
        categoryId: 0,
      })).toThrow("Category ID must be a positive number");

      expect(() => deleteSchema.parse({
        categoryId: 0,
      })).toThrow("Category ID must be a positive number");

      expect(() => moveSchema.parse({
        categoryId: 0,
        parentId: 1,
      })).toThrow("Category ID must be a positive number");

      // Negative IDs should be rejected
      expect(() => getByIdSchema.parse({
        categoryId: -1,
      })).toThrow("Category ID must be a positive number");

      expect(() => deleteSchema.parse({
        categoryId: -1,
      })).toThrow("Category ID must be a positive number");

      expect(() => moveSchema.parse({
        categoryId: -1,
        parentId: 1,
      })).toThrow("Category ID must be a positive number");
    });

    test("SECURITY: Empty strings properly rejected for AI agent safety", () => {
      console.log("✅ SECURITY: Empty string validations properly reject invalid inputs");

      const createSchema = z.object(createCategoryInputSchema);
      const updateSchema = z.object(updateCategoryInputSchema);
      const assignSchema = z.object(assignProductToCategoryInputSchema);

      // Test critical fields
      expect(() => createSchema.parse({
        category: {
          name: "", // AI agents must not create empty names
        },
      })).toThrow("Category name cannot be empty");

      expect(() => updateSchema.parse({
        categoryId: "", // AI agents must not use empty IDs
        category: {
          name: "Test",
        },
      })).toThrow("Category ID cannot be empty");

      expect(() => assignSchema.parse({
        categoryId: "1",
        productLink: {
          sku: "", // AI agents must not use empty SKUs
          category_id: "1",
        },
      })).toThrow("Product SKU cannot be empty");
    });
  });
}); 