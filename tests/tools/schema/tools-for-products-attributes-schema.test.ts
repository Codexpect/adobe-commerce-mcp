import { z } from "zod";
import { 
  createProductAttributeInputSchema,
  getProductAttributeByCodeInputSchema,
  updateProductAttributeInputSchema,
  deleteProductAttributeInputSchema,
  getProductAttributeOptionsInputSchema,
  addProductAttributeOptionInputSchema,
  updateProductAttributeOptionInputSchema,
  deleteProductAttributeOptionInputSchema
} from "../../../src/adobe/products/schemas";
import { searchCriteriaInputSchema } from "../../../src/adobe/search-criteria/schema";

describe("Product Attributes Tools - Schema Validation Tests", () => {
  // Helper function to test schema validation
  const testSchema = (schema: Record<string, z.ZodTypeAny>, validInputs: unknown[], invalidInputs: unknown[], schemaName: string) => {
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

  describe("Search Products Attributes Schema", () => {
    const validInputs = [
      {}, // Empty object should work
      { page: 1, pageSize: 10 },
      { sortOrders: [{ field: "attribute_code", direction: "ASC" }] },
      {
        filters: [
          { field: "frontend_input", value: "text", conditionType: "eq" },
          { field: "is_required", value: "1", conditionType: "eq" },
        ],
      },
      {
        page: 2,
        pageSize: 5,
        filters: [{ field: "attribute_code", value: "color", conditionType: "like" }],
        sortOrders: [{ field: "sort_order", direction: "DESC" }],
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
      { filters: [{ field: "", value: "test", conditionType: "eq" }] }, // Empty field now rejected
      { filters: [{ field: "test", value: "test", conditionType: "invalid" }] }, // Invalid conditionType
      { sortOrders: "invalid" }, // SortOrders must be array
      { sortOrders: [{}] }, // SortOrder must have required fields
      { sortOrders: [{ field: "test" }] }, // Missing direction
      { sortOrders: [{ direction: "ASC" }] }, // Missing field
      { sortOrders: [{ field: "", direction: "ASC" }] }, // Empty field now rejected
      { sortOrders: [{ field: "test", direction: "INVALID" }] }, // Invalid direction
    ];

    testSchema(searchCriteriaInputSchema, validInputs, invalidInputs, "Search Criteria");
  });

  describe("Create Product Attribute Schema", () => {
    const validInputs = [
      {
        type: "text",
        attributeCode: "test_text",
        defaultFrontendLabel: "Test Text",
        scope: "global",
      },
      {
        type: "singleselect",
        attributeCode: "test_select",
        defaultFrontendLabel: "Test Select",
        scope: "store",
        options: [
          {
            label: "Option 1",
            sortOrder: 1,
            isDefault: true,
          },
        ],
      },
      {
        type: "multiselect",
        attributeCode: "test_multi",
        defaultFrontendLabel: "Test Multi",
        scope: "website",
        options: [
          {
            label: "Option 1",
            sortOrder: 1,
            isDefault: false,
            storeLabels: [
              {
                storeId: 1,
                label: "Store Label 1",
              },
            ],
          },
        ],
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { type: "text" }, // Missing attributeCode
      { type: "text", attributeCode: "test" }, // Missing defaultFrontendLabel
      { type: "text", attributeCode: "test", defaultFrontendLabel: "Test" }, // Missing scope
      {
        type: "invalid_type",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
      }, // Invalid type
      { type: "text", attributeCode: "", defaultFrontendLabel: "Test", scope: "global" }, // Empty attributeCode now rejected
      { type: "text", attributeCode: "test", defaultFrontendLabel: "", scope: "global" }, // Empty label now rejected
      { type: "text", attributeCode: "test@invalid", defaultFrontendLabel: "Test", scope: "global" }, // Invalid attributeCode pattern
      { type: "text", attributeCode: "test-invalid", defaultFrontendLabel: "Test", scope: "global" }, // Hyphens not allowed in attributeCode
      {
        type: "text",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "invalid_scope",
      }, // Invalid scope
      {
        type: "text",
        attributeCode: 123,
        defaultFrontendLabel: "Test",
        scope: "global",
      }, // Wrong type for attributeCode
      {
        type: "text",
        attributeCode: "test",
        defaultFrontendLabel: 123,
        scope: "global",
      }, // Wrong type for defaultFrontendLabel
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: "invalid", // Options must be array
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [{}], // Option missing required fields
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [{ label: "", sortOrder: 1, isDefault: true }], // Empty option label now rejected
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [
          {
            label: "Test",
            sortOrder: "invalid",
            isDefault: true,
          },
        ], // Wrong type for sortOrder
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [
          {
            label: "Test",
            sortOrder: 1,
            isDefault: "invalid",
          },
        ], // Wrong type for isDefault
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [
          {
            label: "Test",
            sortOrder: 1,
            isDefault: true,
            storeLabels: "invalid", // storeLabels must be array
          },
        ],
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [
          {
            label: "Test",
            sortOrder: 1,
            isDefault: true,
            storeLabels: [{}], // storeLabel missing required fields
          },
        ],
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [
          {
            label: "Test",
            sortOrder: 1,
            isDefault: true,
            storeLabels: [{ storeId: 1, label: "" }], // Empty store label now rejected
          },
        ],
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [
          {
            label: "Test",
            sortOrder: 1,
            isDefault: true,
            storeLabels: [
              {
                storeId: "invalid",
                label: "Test",
              },
            ], // Wrong type for storeId
          },
        ],
      },
      {
        type: "singleselect",
        attributeCode: "test",
        defaultFrontendLabel: "Test",
        scope: "global",
        options: [
          {
            label: "Test",
            sortOrder: 1,
            isDefault: true,
            storeLabels: [
              {
                storeId: 0, // Zero or negative storeId now rejected
                label: "Test",
              },
            ],
          },
        ],
      },
    ];

    testSchema(createProductAttributeInputSchema, validInputs, invalidInputs, "Create Product Attribute");
  });

  describe("Get Product Attribute By Code Schema", () => {
    const validInputs = [
      { attributeCode: "name" },
      { attributeCode: "color" },
      { attributeCode: "test_attribute_123" },
      { attributeCode: "attribute_with_underscores" },
    ];

    const invalidInputs = [
      {}, // Missing attributeCode
      { attributeCode: "" }, // Empty attributeCode now rejected
      { attributeCode: 123 }, // Wrong type
      { attributeCode: null }, // Null value
      { attributeCode: undefined }, // Undefined value
      { wrongField: "test" }, // Wrong field name
    ];

    testSchema(getProductAttributeByCodeInputSchema, validInputs, invalidInputs, "Get Product Attribute By Code");
  });

  describe("Update Product Attribute Schema", () => {
    const validInputs = [
      {
        attributeCode: "test",
        defaultFrontendLabel: "Updated Label",
      },
      {
        attributeCode: "test",
        scope: "store",
      },
      {
        attributeCode: "test",
        frontendInput: "text",
      },
      {
        attributeCode: "test",
        defaultFrontendLabel: "Updated",
        scope: "global",
        frontendInput: "textarea",
      },
      {
        attributeCode: "test",
        options: [
          {
            label: "New Option",
            sortOrder: 1,
            isDefault: false,
          },
        ],
      },
    ];

    const invalidInputs = [
      {}, // Missing attributeCode
      { attributeCode: "" }, // Empty attributeCode now rejected
      { attributeCode: 123 }, // Wrong type for attributeCode
      {
        attributeCode: "test",
        defaultFrontendLabel: "",
      }, // Empty defaultFrontendLabel now rejected
      {
        attributeCode: "test",
        defaultFrontendLabel: 123,
      }, // Wrong type for defaultFrontendLabel
      {
        attributeCode: "test",
        scope: "invalid",
      }, // Invalid scope
      {
        attributeCode: "test",
        frontendInput: "invalid",
      }, // Invalid frontendInput
      {
        attributeCode: "test",
        options: "invalid",
      }, // Options must be array
      {
        attributeCode: "test",
        options: [{}],
      }, // Option missing required fields
      {
        attributeCode: "test",
        options: [{ label: "", sortOrder: 1, isDefault: true }],
      }, // Empty option label now rejected
    ];

    testSchema(updateProductAttributeInputSchema, validInputs, invalidInputs, "Update Product Attribute");
  });

  describe("Delete Product Attribute Schema", () => {
    const validInputs = [
      { attributeCode: "test_attribute" },
      { attributeCode: "another_test" },
      { attributeCode: "attribute_123" },
    ];

    const invalidInputs = [
      {}, // Missing attributeCode
      { attributeCode: "" }, // Empty attributeCode now rejected
      { attributeCode: 123 }, // Wrong type
      { wrongField: "test" }, // Wrong field name
    ];

    testSchema(deleteProductAttributeInputSchema, validInputs, invalidInputs, "Delete Product Attribute");
  });

  describe("Get Product Attribute Options Schema", () => {
    const validInputs = [
      { attributeCode: "color" },
      { attributeCode: "size" },
      { attributeCode: "test_select_attribute" },
    ];

    const invalidInputs = [
      {}, // Missing attributeCode
      { attributeCode: "" }, // Empty attributeCode now rejected
      { attributeCode: 123 }, // Wrong type
      { wrongField: "test" }, // Wrong field name
    ];

    testSchema(getProductAttributeOptionsInputSchema, validInputs, invalidInputs, "Get Product Attribute Options");
  });

  describe("Add Product Attribute Option Schema", () => {
    const validInputs = [
      {
        attributeCode: "color",
        label: "Red",
        sortOrder: 1,
        isDefault: false,
      },
      {
        attributeCode: "size",
        label: "Large",
        sortOrder: 2,
        isDefault: true,
        storeLabels: [
          {
            storeId: 1,
            label: "Grande",
          },
        ],
      },
      {
        attributeCode: "test",
        label: "Test Option",
        // Optional fields should work with defaults
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { attributeCode: "test" }, // Missing label
      { label: "Test" }, // Missing attributeCode
      { attributeCode: "", label: "Test" }, // Empty attributeCode now rejected
      { attributeCode: "test", label: "" }, // Empty label now rejected
      { attributeCode: 123, label: "Test" }, // Wrong type for attributeCode
      { attributeCode: "test", label: 123 }, // Wrong type for label
      {
        attributeCode: "test",
        label: "Test",
        sortOrder: "invalid",
      }, // Wrong type for sortOrder
      {
        attributeCode: "test",
        label: "Test",
        isDefault: "invalid",
      }, // Wrong type for isDefault
      {
        attributeCode: "test",
        label: "Test",
        storeLabels: "invalid",
      }, // storeLabels must be array
      {
        attributeCode: "test",
        label: "Test",
        storeLabels: [{}],
      }, // storeLabel missing required fields
      {
        attributeCode: "test",
        label: "Test",
        storeLabels: [
          {
            storeId: "invalid",
            label: "Test",
          },
        ],
      }, // Wrong type for storeId
    ];

    testSchema(addProductAttributeOptionInputSchema, validInputs, invalidInputs, "Add Product Attribute Option");
  });

  describe("Update Product Attribute Option Schema", () => {
    const validInputs = [
      {
        attributeCode: "color",
        optionId: 123,
        label: "Updated Red",
      },
      {
        attributeCode: "size",
        optionId: 456,
        sortOrder: 5,
      },
      {
        attributeCode: "test",
        optionId: 789,
        isDefault: true,
      },
      {
        attributeCode: "test",
        optionId: 101,
        storeLabels: [
          {
            storeId: 1,
            label: "Updated Label",
          },
        ],
      },
      {
        attributeCode: "test",
        optionId: 102,
        label: "Full Update",
        sortOrder: 10,
        isDefault: false,
        storeLabels: [
          {
            storeId: 1,
            label: "Store Label",
          },
        ],
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { attributeCode: "test" }, // Missing optionId
      { optionId: 123 }, // Missing attributeCode
      { attributeCode: "", optionId: 123 }, // Empty attributeCode now rejected
      { attributeCode: "test", optionId: 0 }, // Zero optionId now rejected
      { attributeCode: "test", optionId: -1 }, // Negative optionId now rejected
      { attributeCode: 123, optionId: 123 }, // Wrong type for attributeCode
      { attributeCode: "test", optionId: "123" }, // Wrong type for optionId (string instead of number)
      {
        attributeCode: "test",
        optionId: 123,
        label: "",
      }, // Empty label now rejected
      {
        attributeCode: "test",
        optionId: 123,
        label: 123,
      }, // Wrong type for label
      {
        attributeCode: "test",
        optionId: 123,
        sortOrder: "invalid",
      }, // Wrong type for sortOrder
      {
        attributeCode: "test",
        optionId: 123,
        isDefault: "invalid",
      }, // Wrong type for isDefault
      {
        attributeCode: "test",
        optionId: 123,
        storeLabels: "invalid",
      }, // storeLabels must be array
      {
        attributeCode: "test",
        optionId: 123,
        storeLabels: [{}],
      }, // storeLabel missing required fields
      {
        attributeCode: "test",
        optionId: 123,
        storeLabels: [{ storeId: 1, label: "" }],
      }, // Empty store label now rejected
    ];

    testSchema(updateProductAttributeOptionInputSchema, validInputs, invalidInputs, "Update Product Attribute Option");
  });

  describe("Delete Product Attribute Option Schema", () => {
    const validInputs = [
      { attributeCode: "color", optionId: 123 },
      { attributeCode: "size", optionId: 456 },
      { attributeCode: "test_attribute", optionId: 789 },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { attributeCode: "test" }, // Missing optionId
      { optionId: 123 }, // Missing attributeCode
      { attributeCode: "", optionId: 123 }, // Empty attributeCode now rejected
      { attributeCode: "test", optionId: 0 }, // Zero optionId now rejected
      { attributeCode: "test", optionId: -1 }, // Negative optionId now rejected
      { attributeCode: 123, optionId: 123 }, // Wrong type for attributeCode
      { attributeCode: "test", optionId: "123" }, // Wrong type for optionId (string instead of number)
      { wrongField1: "test", wrongField2: 123 }, // Wrong field names
    ];

    testSchema(deleteProductAttributeOptionInputSchema, validInputs, invalidInputs, "Delete Product Attribute Option");
  });

  describe("Edge Cases and Boundary Values", () => {
    test("should handle extreme but valid values", () => {
      const createSchema = z.object(createProductAttributeInputSchema);
      const searchSchema = z.object(searchCriteriaInputSchema);
      const addOptionSchema = z.object(addProductAttributeOptionInputSchema);

      // Very long strings (within reasonable limits)
      expect(() => createSchema.parse({
        type: "text",
        attributeCode: "a".repeat(30), // Reasonable length
        defaultFrontendLabel: "A".repeat(100),
        scope: "global",
      })).not.toThrow();

      // Maximum page size
      expect(() => searchSchema.parse({ pageSize: 10 })).not.toThrow();

      // Large sort order values
      expect(() => addOptionSchema.parse({
        attributeCode: "test",
        label: "Test",
        sortOrder: 999999,
      })).not.toThrow();

      // Multiple store labels
      expect(() => addOptionSchema.parse({
        attributeCode: "test",
        label: "Test",
        storeLabels: Array.from({ length: 10 }, (_, i) => ({
          storeId: i + 1,
          label: `Store ${i + 1} Label`,
        })),
      })).not.toThrow();
    });

    test("should reject extreme invalid values", () => {
      const searchSchema = z.object(searchCriteriaInputSchema);

      // Negative values where not allowed
      expect(() => searchSchema.parse({ page: -999 })).toThrow();
      expect(() => searchSchema.parse({ pageSize: -1 })).toThrow();

      // Zero values where not allowed
      expect(() => searchSchema.parse({ page: 0 })).toThrow();
      expect(() => searchSchema.parse({ pageSize: 0 })).toThrow();

      // Values exceeding limits
      expect(() => searchSchema.parse({ pageSize: 11 })).toThrow();
    });
  });

  describe("Type Coercion and Validation", () => {
    test("should not coerce invalid types", () => {
      const searchSchema = z.object(searchCriteriaInputSchema);
      const addOptionSchema = z.object(addProductAttributeOptionInputSchema);

      // Numbers as strings where numbers are expected
      expect(() => searchSchema.parse({ page: "1" })).toThrow();
      expect(() => searchSchema.parse({ pageSize: "10" })).toThrow();
      expect(() => addOptionSchema.parse({ attributeCode: "test", label: "Test", sortOrder: "1" })).toThrow();

      // Booleans as strings where booleans are expected
      expect(() => addOptionSchema.parse({ attributeCode: "test", label: "Test", isDefault: "true" })).toThrow();
    });
  });
}); 