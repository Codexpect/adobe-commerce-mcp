import { z } from "zod";
import {
  createAttributeSetInputSchema,
  updateAttributeSetInputSchema,
  getAttributeSetByIdInputSchema,
  getAttributesFromSetInputSchema,
  deleteAttributeSetInputSchema,
  deleteAttributeFromSetInputSchema,
  assignAttributeToSetGroupInputSchema,
  createAttributeGroupInputSchema,
  updateAttributeGroupInputSchema,
  deleteAttributeGroupInputSchema,
} from "../../../src/adobe/products/schemas";
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

describe("Product Attribute Sets and Groups - Schema Validation Tests", () => {
  describe("Attribute Set Schemas", () => {
    describe("Create Attribute Set Schema", () => {
      const validInputs = [
        {
          attributeSetName: "Electronics",
        },
        {
          attributeSetName: "Clothing",
          sortOrder: 10,
        },
        {
          attributeSetName: "Books & Media",
          sortOrder: 0,
        },
        {
          attributeSetName: "Test Set 123",
          sortOrder: 999,
        },
      ];

      const invalidInputs = [
        {}, // Missing attributeSetName
        { attributeSetName: "" }, // Empty attributeSetName
        { attributeSetName: 123 }, // Wrong type for attributeSetName
        { attributeSetName: null }, // Null attributeSetName
        { attributeSetName: undefined }, // Undefined attributeSetName
        {
          attributeSetName: "Test",
          sortOrder: "invalid",
        }, // Wrong type for sortOrder
        {
          attributeSetName: "Test",
          sortOrder: -1,
        }, // Negative sortOrder
        { wrongField: "test" }, // Wrong field name
      ];

      testSchema(createAttributeSetInputSchema, validInputs, invalidInputs, "Create Attribute Set");
    });

    describe("Update Attribute Set Schema", () => {
      const validInputs = [
        {
          attributeSetId: 1,
          attributeSetName: "Updated Electronics",
        },
        {
          attributeSetId: 2,
          sortOrder: 20,
        },
        {
          attributeSetId: 3,
          attributeSetName: "Updated Name",
          sortOrder: 5,
        },
        {
          attributeSetId: 999,
        }, // Only ID required
      ];

      const invalidInputs = [
        {}, // Missing attributeSetId
        { attributeSetId: "invalid" }, // Wrong type for attributeSetId
                 { attributeSetId: 0 }, // Zero attributeSetId (now properly rejected)
         { attributeSetId: -1 }, // Negative attributeSetId (now properly rejected)
        { attributeSetId: null }, // Null attributeSetId
        {
          attributeSetId: 1,
          attributeSetName: "",
        }, // Empty attributeSetName
        {
          attributeSetId: 1,
          attributeSetName: 123,
        }, // Wrong type for attributeSetName
        {
          attributeSetId: 1,
          sortOrder: "invalid",
        }, // Wrong type for sortOrder
        {
          attributeSetId: 1,
          sortOrder: -1,
        }, // Negative sortOrder
      ];

      testSchema(updateAttributeSetInputSchema, validInputs, invalidInputs, "Update Attribute Set");
    });

    describe("Get Attribute Set By ID Schema", () => {
      const validInputs = [
        { attributeSetId: 1 },
        { attributeSetId: 4 },
        { attributeSetId: 999 },
      ];

      const invalidInputs = [
        {}, // Missing attributeSetId
        { attributeSetId: "invalid" }, // Wrong type
        { attributeSetId: 0 }, // Zero value
        { attributeSetId: -1 }, // Negative value
        { attributeSetId: null }, // Null value
        { attributeSetId: undefined }, // Undefined value
        { wrongField: 1 }, // Wrong field name
      ];

      testSchema(getAttributeSetByIdInputSchema, validInputs, invalidInputs, "Get Attribute Set By ID");
    });

    describe("Get Attributes From Set Schema", () => {
      const validInputs = [
        { attributeSetId: 1 },
        { attributeSetId: 4 },
        { attributeSetId: 999 },
      ];

      const invalidInputs = [
        {}, // Missing attributeSetId
        { attributeSetId: "invalid" }, // Wrong type
        { attributeSetId: 0 }, // Zero value
        { attributeSetId: -1 }, // Negative value
        { attributeSetId: null }, // Null value
        { wrongField: 1 }, // Wrong field name
      ];

      testSchema(getAttributesFromSetInputSchema, validInputs, invalidInputs, "Get Attributes From Set");
    });

    describe("Delete Attribute Set Schema", () => {
      const validInputs = [
        { attributeSetId: 1 },
        { attributeSetId: 4 },
        { attributeSetId: 999 },
      ];

      const invalidInputs = [
        {}, // Missing attributeSetId
        { attributeSetId: "invalid" }, // Wrong type
        { attributeSetId: 0 }, // Zero value (default set shouldn't be deleted)
        { attributeSetId: -1 }, // Negative value
        { attributeSetId: null }, // Null value
        { wrongField: 1 }, // Wrong field name
      ];

      testSchema(deleteAttributeSetInputSchema, validInputs, invalidInputs, "Delete Attribute Set");
    });

    describe("Delete Attribute From Set Schema", () => {
      const validInputs = [
        {
          attributeSetId: 1,
          attributeCode: "color",
        },
        {
          attributeSetId: 4,
          attributeCode: "size",
        },
        {
          attributeSetId: 999,
          attributeCode: "test_attribute_123",
        },
      ];

      const invalidInputs = [
        {}, // Missing both fields
        { attributeSetId: 1 }, // Missing attributeCode
        { attributeCode: "color" }, // Missing attributeSetId
        { attributeSetId: "invalid", attributeCode: "color" }, // Wrong type for attributeSetId
        { attributeSetId: 1, attributeCode: "" }, // Empty attributeCode
        { attributeSetId: 1, attributeCode: 123 }, // Wrong type for attributeCode
        { attributeSetId: 0, attributeCode: "color" }, // Zero attributeSetId
        { attributeSetId: -1, attributeCode: "color" }, // Negative attributeSetId
      ];

      testSchema(deleteAttributeFromSetInputSchema, validInputs, invalidInputs, "Delete Attribute From Set");
    });

    describe("Assign Attribute To Set Group Schema", () => {
      const validInputs = [
        {
          attributeSetId: 1,
          attributeGroupId: 1,
          attributeCode: "color",
          sortOrder: 10,
        },
        {
          attributeSetId: 4,
          attributeGroupId: 2,
          attributeCode: "size",
          sortOrder: 0,
        },
        {
          attributeSetId: 999,
          attributeGroupId: 99,
          attributeCode: "test_attribute",
          sortOrder: 999,
        },
      ];

      const invalidInputs = [
        {}, // Missing all fields
        {
          attributeSetId: 1,
          attributeGroupId: 1,
          attributeCode: "color",
        }, // Missing sortOrder
        {
          attributeSetId: 1,
          attributeGroupId: 1,
          sortOrder: 10,
        }, // Missing attributeCode
        { attributeSetId: "invalid", attributeGroupId: 1, attributeCode: "color", sortOrder: 10 }, // Wrong type for attributeSetId
        { attributeSetId: 1, attributeGroupId: "invalid", attributeCode: "color", sortOrder: 10 }, // Wrong type for attributeGroupId
        { attributeSetId: 1, attributeGroupId: 1, attributeCode: "", sortOrder: 10 }, // Empty attributeCode
        { attributeSetId: 1, attributeGroupId: 1, attributeCode: "color", sortOrder: "invalid" }, // Wrong type for sortOrder
        { attributeSetId: 0, attributeGroupId: 1, attributeCode: "color", sortOrder: 10 }, // Zero attributeSetId
        { attributeSetId: 1, attributeGroupId: 0, attributeCode: "color", sortOrder: 10 }, // Zero attributeGroupId
        { attributeSetId: 1, attributeGroupId: 1, attributeCode: "color", sortOrder: -1 }, // Negative sortOrder
      ];

      testSchema(assignAttributeToSetGroupInputSchema, validInputs, invalidInputs, "Assign Attribute To Set Group");
    });
  });

  describe("Attribute Group Schemas", () => {
    describe("Create Attribute Group Schema", () => {
      const validInputs = [
        {
          attributeSetId: 1,
          attributeGroupName: "General",
        },
        {
          attributeSetId: 4,
          attributeGroupName: "Pricing & Inventory",
        },
        {
          attributeSetId: 999,
          attributeGroupName: "Custom Group 123",
        },
      ];

      const invalidInputs = [
        {}, // Missing both fields
        { attributeSetId: 1 }, // Missing attributeGroupName
        { attributeGroupName: "General" }, // Missing attributeSetId
        { attributeSetId: "invalid", attributeGroupName: "General" }, // Wrong type for attributeSetId
        { attributeSetId: 1, attributeGroupName: "" }, // Empty attributeGroupName
        { attributeSetId: 1, attributeGroupName: 123 }, // Wrong type for attributeGroupName
        { attributeSetId: 0, attributeGroupName: "General" }, // Zero attributeSetId
        { attributeSetId: -1, attributeGroupName: "General" }, // Negative attributeSetId
        { attributeSetId: null, attributeGroupName: "General" }, // Null attributeSetId
      ];

      testSchema(createAttributeGroupInputSchema, validInputs, invalidInputs, "Create Attribute Group");
    });

    describe("Update Attribute Group Schema", () => {
      const validInputs = [
        {
          attributeSetId: 1,
          attributeGroupId: 1,
          attributeGroupName: "Updated General",
        },
        {
          attributeSetId: 4,
          attributeGroupId: 2,
        }, // Only IDs required
        {
          attributeSetId: 999,
          attributeGroupId: 99,
          attributeGroupName: "Updated Custom Group",
        },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { attributeSetId: 1 }, // Missing attributeGroupId
        { attributeGroupId: 1 }, // Missing attributeSetId
        { attributeSetId: "invalid", attributeGroupId: 1 }, // Wrong type for attributeSetId
        { attributeSetId: 1, attributeGroupId: "invalid" }, // Wrong type for attributeGroupId
        {
          attributeSetId: 1,
          attributeGroupId: 1,
          attributeGroupName: "",
        }, // Empty attributeGroupName
        {
          attributeSetId: 1,
          attributeGroupId: 1,
          attributeGroupName: 123,
        }, // Wrong type for attributeGroupName
        { attributeSetId: 0, attributeGroupId: 1 }, // Zero attributeSetId
        { attributeSetId: 1, attributeGroupId: 0 }, // Zero attributeGroupId
        { attributeSetId: -1, attributeGroupId: 1 }, // Negative attributeSetId
        { attributeSetId: 1, attributeGroupId: -1 }, // Negative attributeGroupId
      ];

      testSchema(updateAttributeGroupInputSchema, validInputs, invalidInputs, "Update Attribute Group");
    });

    describe("Search Attribute Groups Schema", () => {
      const validInputs = [
        {},
        { page: 1 },
        { pageSize: 5 },
        { page: 1, pageSize: 10 },
        {
          filters: [{ field: "attribute_set_id", value: "4", conditionType: "eq" }],
        },
      ];

      const invalidInputs = [
        { page: 0 }, // Zero page
        { page: "invalid" }, // Wrong type for page
        { pageSize: 0 }, // Zero pageSize
        { pageSize: 11 }, // Exceeds max pageSize
        { pageSize: "invalid" }, // Wrong type for pageSize
        { filters: [{ field: "", value: "test", conditionType: "eq" }] }, // Empty field name
      ];

      testSchema(searchCriteriaInputSchema, validInputs, invalidInputs, "Search Attribute Groups");
    });

    describe("Delete Attribute Group Schema", () => {
      const validInputs = [
        {
          attributeSetId: 1,
          attributeGroupId: 1,
        },
        {
          attributeSetId: 4,
          attributeGroupId: 2,
        },
        {
          attributeSetId: 999,
          attributeGroupId: 99,
        },
      ];

      const invalidInputs = [
        {}, // Missing attributeGroupId
        { attributeGroupId: "invalid" }, // Wrong type for attributeGroupId
        { attributeGroupId: 0 }, // Zero attributeGroupId
        { attributeGroupId: -1 }, // Negative attributeGroupId
        { attributeGroupId: null }, // Null attributeGroupId
        { wrongField: 1 }, // Wrong field name
      ];

      testSchema(deleteAttributeGroupInputSchema, validInputs, invalidInputs, "Delete Attribute Group");
    });
  });

  describe("Edge Cases and Boundary Values", () => {
    test("should handle extreme but valid values", () => {
      const createSetSchema = z.object(createAttributeSetInputSchema);
      const updateSetSchema = z.object(updateAttributeSetInputSchema);
      const assignSchema = z.object(assignAttributeToSetGroupInputSchema);

      // Very long but valid names
      const longName = "A".repeat(255);
      expect(() => createSetSchema.parse({
        attributeSetName: longName,
      })).not.toThrow();

      // Large but valid IDs
      expect(() => updateSetSchema.parse({
        attributeSetId: 999999,
        sortOrder: 999999,
      })).not.toThrow();

      // Large sort orders
      expect(() => assignSchema.parse({
        attributeSetId: 1,
        attributeGroupId: 1,
        attributeCode: "test",
        sortOrder: 999999,
      })).not.toThrow();
    });

    test("should reject extreme invalid values", () => {
      const createSetSchema = z.object(createAttributeSetInputSchema);
      const updateSetSchema = z.object(updateAttributeSetInputSchema);

      // Negative sort orders
      expect(() => createSetSchema.parse({
        attributeSetName: "Test",
        sortOrder: -1,
      })).toThrow();

      expect(() => updateSetSchema.parse({
        attributeSetId: 1,
        sortOrder: -1,
      })).toThrow();
    });
  });

  describe("Type Coercion and Validation", () => {
    test("should not coerce invalid types", () => {
      const createSetSchema = z.object(createAttributeSetInputSchema);
      const createGroupSchema = z.object(createAttributeGroupInputSchema);
      const assignSchema = z.object(assignAttributeToSetGroupInputSchema);

      // Numbers as strings where numbers are expected
      expect(() => createSetSchema.parse({
        attributeSetName: "Test",
        sortOrder: "10",
      })).toThrow();

      expect(() => createGroupSchema.parse({
        attributeSetId: "1",
        attributeGroupName: "Test",
      })).toThrow();

      expect(() => assignSchema.parse({
        attributeSetId: "1",
        attributeGroupId: "1",
        attributeCode: "test",
        sortOrder: "10",
      })).toThrow();
    });
  });

  describe("Security and AI Agent Safety", () => {
    test("should reject empty strings in critical fields", () => {
      const createSetSchema = z.object(createAttributeSetInputSchema);
      const createGroupSchema = z.object(createAttributeGroupInputSchema);
      const deleteAttrSchema = z.object(deleteAttributeFromSetInputSchema);

      console.log("✅ SECURITY: Empty string validations properly reject invalid inputs");

      // Empty attribute set names
      expect(() => createSetSchema.parse({
        attributeSetName: "",
      })).toThrow();

      // Empty attribute group names
      expect(() => createGroupSchema.parse({
        attributeSetId: 1,
        attributeGroupName: "",
      })).toThrow();

      // Empty attribute codes
      expect(() => deleteAttrSchema.parse({
        attributeSetId: 1,
        attributeCode: "",
      })).toThrow();
    });

    test("should validate attribute codes consistently", () => {
      const deleteAttrSchema = z.object(deleteAttributeFromSetInputSchema);
      const assignSchema = z.object(assignAttributeToSetGroupInputSchema);

      // Test that attributeCodeSchema is used consistently
      expect(() => deleteAttrSchema.parse({
        attributeSetId: 1,
        attributeCode: "test@invalid",
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() => deleteAttrSchema.parse({
        attributeSetId: 1,
        attributeCode: "test-invalid",
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() => assignSchema.parse({
        attributeSetId: 1,
        attributeGroupId: 1,
        attributeCode: "test@invalid",
        sortOrder: 1,
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");

      expect(() => assignSchema.parse({
        attributeSetId: 1,
        attributeGroupId: 1,
        attributeCode: "test-invalid",
        sortOrder: 1,
      })).toThrow("Attribute code can only contain letters, numbers, and underscores");
    });

    test("should prevent zero or negative IDs where inappropriate", () => {
      const updateSetSchema = z.object(updateAttributeSetInputSchema);
      const deleteSetSchema = z.object(deleteAttributeSetInputSchema);

             // Zero IDs should be rejected for updates/deletes
       expect(() => updateSetSchema.parse({
         attributeSetId: 0,
       })).toThrow("Entity ID must be a positive number");

       expect(() => deleteSetSchema.parse({
         attributeSetId: 0,
       })).toThrow("Entity ID must be a positive number");
    });
  });
}); 