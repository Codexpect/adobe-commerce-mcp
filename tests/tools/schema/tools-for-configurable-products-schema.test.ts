import { z } from "zod";
import {
  addConfigurableProductOptionInputSchema,
  deleteConfigurableProductOptionInputSchema,
  getConfigurableProductChildrenInputSchema,
  getConfigurableProductOptionByIdInputSchema,
  getConfigurableProductOptionsAllInputSchema,
  linkConfigurableChildInputSchema,
  unlinkConfigurableChildInputSchema,
  updateConfigurableProductOptionInputSchema,
} from "../../../src/adobe/products/schemas/products/configurable-products";

/**
 * Helper function to test Zod schemas with valid and invalid inputs
 */
const testSchema = (schema: Record<string, z.ZodTypeAny>, validInputs: unknown[], invalidInputs: unknown[], schemaName: string) => {
  const zodSchema = z.object(schema);

  describe(`${schemaName} Schema`, () => {
    test("should accept valid inputs", () => {
      validInputs.forEach((input) => {
        expect(() => zodSchema.parse(input)).not.toThrow();
      });
    });

    describe("should reject invalid inputs", () => {
      invalidInputs.forEach((input, index) => {
        const description = getInputDescription(input);
        test(`case ${index + 1}: ${description}`, () => {
          expect(() => zodSchema.parse(input)).toThrow();
        });
      });
    });
  });
};

/**
 * Helper function to create a readable description of an input object
 */
const getInputDescription = (input: unknown): string => {
  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>;
    const entries = Object.entries(obj).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.join(', ')}]`;
      }
      return `${key}: ${value}`;
    });
    return `{ ${entries.join(', ')} }`;
  }
  return String(input);
};

describe("Configurable Products Tools - Schema Validation Tests", () => {
  describe("Add Configurable Product Option Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
        attributeId: 1,
        optionIds: [1, 2, 3],
      },
      {
        sku: "tshirt_config",
        attributeId: 5,
        optionIds: [10, 20],
        label: "Color",
        position: 1,
        isUseDefault: true,
      },
      {
        sku: "shoes_config",
        attributeId: 10,
        optionIds: [100],
        label: "Size",
        position: 2,
        isUseDefault: false,
      },
      {
        sku: "product_123",
        attributeId: 15,
        optionIds: [1, 2, 3, 4, 5],
        label: "Material",
      },
      {
        sku: "configurable_product",
        attributeId: 20,
        optionIds: [50],
        position: 0,
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "CONFIG-001" }, // Missing attributeId and optionIds
      { attributeId: 1, optionIds: [1, 2, 3] }, // Missing sku
      { sku: "CONFIG-001", attributeId: 1 }, // Missing optionIds
      { sku: "CONFIG-001", optionIds: [1, 2, 3] }, // Missing attributeId
      { sku: "", attributeId: 1, optionIds: [1, 2, 3] }, // Empty sku
      { sku: "CONFIG@001", attributeId: 1, optionIds: [1, 2, 3] }, // Invalid sku pattern
      { sku: "CONFIG 001", attributeId: 1, optionIds: [1, 2, 3] }, // Spaces in sku
      { sku: "CONFIG-001", attributeId: 0, optionIds: [1, 2, 3] }, // Zero attributeId
      { sku: "CONFIG-001", attributeId: -1, optionIds: [1, 2, 3] }, // Negative attributeId
      { sku: "CONFIG-001", attributeId: 1, optionIds: [] }, // Empty optionIds array (now invalid)
      { sku: "CONFIG-001", attributeId: 1, optionIds: [0, 1, 2] }, // Zero optionId
      { sku: "CONFIG-001", attributeId: 1, optionIds: [-1, 1, 2] }, // Negative optionId
      { sku: "CONFIG-001", attributeId: 1, optionIds: ["1", 2, 3] }, // Wrong type for optionId
      { sku: "CONFIG-001", attributeId: 1, optionIds: "invalid" }, // Wrong type for optionIds

      { sku: "CONFIG-001", attributeId: 1, optionIds: [1, 2, 3], position: 1.5 }, // Non-integer position
      { sku: "CONFIG-001", attributeId: 1, optionIds: [1, 2, 3], position: "1" }, // Wrong type for position
      { sku: "CONFIG-001", attributeId: 1, optionIds: [1, 2, 3], isUseDefault: "true" }, // Wrong type for isUseDefault
      { sku: "CONFIG-001", attributeId: 1, optionIds: [1, 2, 3], label: 123 }, // Wrong type for label
      { sku: 123, attributeId: 1, optionIds: [1, 2, 3] }, // Wrong type for sku
      { sku: "CONFIG-001", attributeId: "1", optionIds: [1, 2, 3] }, // Wrong type for attributeId
    ];

    testSchema(addConfigurableProductOptionInputSchema, validInputs, invalidInputs, "Add Configurable Product Option");
  });

  describe("Link Configurable Child Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
        childSku: "CHILD-001",
      },
      {
        sku: "tshirt_config",
        childSku: "tshirt_red_small",
      },
      {
        sku: "product_123",
        childSku: "variant_456",
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "CONFIG-001" }, // Missing childSku
      { childSku: "CHILD-001" }, // Missing sku
      { sku: "", childSku: "CHILD-001" }, // Empty sku
      { sku: "CONFIG-001", childSku: "" }, // Empty childSku
      { sku: "CONFIG@001", childSku: "CHILD-001" }, // Invalid sku pattern
      { sku: "CONFIG-001", childSku: "CHILD@001" }, // Invalid childSku pattern
      { sku: "CONFIG 001", childSku: "CHILD-001" }, // Spaces in sku
      { sku: "CONFIG-001", childSku: "CHILD 001" }, // Spaces in childSku
      { sku: 123, childSku: "CHILD-001" }, // Wrong type for sku
      { sku: "CONFIG-001", childSku: 123 }, // Wrong type for childSku
    ];

    testSchema(linkConfigurableChildInputSchema, validInputs, invalidInputs, "Link Configurable Child");
  });

  describe("Unlink Configurable Child Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
        childSku: "CHILD-001",
      },
      {
        sku: "tshirt_config",
        childSku: "tshirt_red_small",
      },
      {
        sku: "product_123",
        childSku: "variant_456",
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "CONFIG-001" }, // Missing childSku
      { childSku: "CHILD-001" }, // Missing sku
      { sku: "", childSku: "CHILD-001" }, // Empty sku
      { sku: "CONFIG-001", childSku: "" }, // Empty childSku
      { sku: "CONFIG@001", childSku: "CHILD-001" }, // Invalid sku pattern
      { sku: "CONFIG-001", childSku: "CHILD@001" }, // Invalid childSku pattern
      { sku: "CONFIG 001", childSku: "CHILD-001" }, // Spaces in sku
      { sku: "CONFIG-001", childSku: "CHILD 001" }, // Spaces in childSku
      { sku: 123, childSku: "CHILD-001" }, // Wrong type for sku
      { sku: "CONFIG-001", childSku: 123 }, // Wrong type for childSku
    ];

    testSchema(unlinkConfigurableChildInputSchema, validInputs, invalidInputs, "Unlink Configurable Child");
  });

  describe("Get Configurable Product Children Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
      },
      {
        sku: "tshirt_config",
      },
      {
        sku: "product_123",
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "" }, // Empty sku
      { sku: "CONFIG@001" }, // Invalid sku pattern
      { sku: "CONFIG 001" }, // Spaces in sku
      { sku: 123 }, // Wrong type for sku
    ];

    testSchema(getConfigurableProductChildrenInputSchema, validInputs, invalidInputs, "Get Configurable Product Children");
  });

  describe("Get Configurable Product Options All Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
      },
      {
        sku: "tshirt_config",
      },
      {
        sku: "product_123",
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "" }, // Empty sku
      { sku: "CONFIG@001" }, // Invalid sku pattern
      { sku: "CONFIG 001" }, // Spaces in sku
      { sku: 123 }, // Wrong type for sku
    ];

    testSchema(getConfigurableProductOptionsAllInputSchema, validInputs, invalidInputs, "Get Configurable Product Options All");
  });

  describe("Get Configurable Product Option By ID Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
        id: 1,
      },
      {
        sku: "tshirt_config",
        id: 10,
      },
      {
        sku: "product_123",
        id: 100,
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "CONFIG-001" }, // Missing id
      { id: 1 }, // Missing sku
      { sku: "", id: 1 }, // Empty sku
      { sku: "CONFIG-001", id: 0 }, // Zero id
      { sku: "CONFIG-001", id: -1 }, // Negative id
      { sku: "CONFIG@001", id: 1 }, // Invalid sku pattern
      { sku: "CONFIG 001", id: 1 }, // Spaces in sku
      { sku: 123, id: 1 }, // Wrong type for sku
      { sku: "CONFIG-001", id: "1" }, // Wrong type for id
    ];

    testSchema(getConfigurableProductOptionByIdInputSchema, validInputs, invalidInputs, "Get Configurable Product Option By ID");
  });

  describe("Update Configurable Product Option Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
        id: 1,
        attributeId: 5,
        optionIds: [1, 2, 3],
      },
      {
        sku: "tshirt_config",
        id: 10,
        attributeId: 15,
        optionIds: [10, 20],
        label: "Color",
        position: 1,
        isUseDefault: true,
      },
      {
        sku: "shoes_config",
        id: 20,
        attributeId: 25,
        optionIds: [100],
        label: "Size",
        position: 2,
        isUseDefault: false,
      },
      {
        sku: "product_123",
        id: 30,
        attributeId: 35,
        optionIds: [1, 2, 3, 4, 5],
        label: "Material",
      },
      {
        sku: "configurable_product",
        id: 40,
        attributeId: 45,
        optionIds: [50],
        position: 0,
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "CONFIG-001", id: 1, attributeId: 5 }, // Missing optionIds
      { sku: "CONFIG-001", id: 1, optionIds: [1, 2, 3] }, // Missing attributeId
      { sku: "CONFIG-001", attributeId: 5, optionIds: [1, 2, 3] }, // Missing id
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: [] }, // Empty optionIds array (now invalid)
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: [0, 1, 2] }, // Zero optionId
      { sku: "", id: 1, attributeId: 5, optionIds: [1, 2, 3] }, // Empty sku
      { sku: "CONFIG-001", id: 0, attributeId: 5, optionIds: [1, 2, 3] }, // Zero id
      { sku: "CONFIG-001", id: -1, attributeId: 5, optionIds: [1, 2, 3] }, // Negative id
      { sku: "CONFIG-001", id: 1, attributeId: 0, optionIds: [1, 2, 3] }, // Zero attributeId
      { sku: "CONFIG-001", id: 1, attributeId: -1, optionIds: [1, 2, 3] }, // Negative attributeId
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: [-1, 1, 2] }, // Negative optionId
      { sku: "CONFIG@001", id: 1, attributeId: 5, optionIds: [1, 2, 3] }, // Invalid sku pattern
      { sku: "CONFIG 001", id: 1, attributeId: 5, optionIds: [1, 2, 3] }, // Spaces in sku
      { sku: 123, id: 1, attributeId: 5, optionIds: [1, 2, 3] }, // Wrong type for sku
      { sku: "CONFIG-001", id: "1", attributeId: 5, optionIds: [1, 2, 3] }, // Wrong type for id
      { sku: "CONFIG-001", id: 1, attributeId: "5", optionIds: [1, 2, 3] }, // Wrong type for attributeId
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: ["1", 2, 3] }, // Wrong type for optionId
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: "invalid" }, // Wrong type for optionIds

      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: [1, 2, 3], position: 1.5 }, // Non-integer position
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: [1, 2, 3], position: "1" }, // Wrong type for position
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: [1, 2, 3], isUseDefault: "true" }, // Wrong type for isUseDefault
      { sku: "CONFIG-001", id: 1, attributeId: 5, optionIds: [1, 2, 3], label: 123 }, // Wrong type for label
    ];

    testSchema(updateConfigurableProductOptionInputSchema, validInputs, invalidInputs, "Update Configurable Product Option");
  });

  describe("Delete Configurable Product Option Schema", () => {
    const validInputs = [
      {
        sku: "CONFIG-001",
        id: 1,
      },
      {
        sku: "tshirt_config",
        id: 10,
      },
      {
        sku: "product_123",
        id: 100,
      },
    ];

    const invalidInputs = [
      {}, // Missing required fields
      { sku: "CONFIG-001" }, // Missing id
      { id: 1 }, // Missing sku
      { sku: "", id: 1 }, // Empty sku
      { sku: "CONFIG-001", id: 0 }, // Zero id
      { sku: "CONFIG-001", id: -1 }, // Negative id
      { sku: "CONFIG@001", id: 1 }, // Invalid sku pattern
      { sku: "CONFIG 001", id: 1 }, // Spaces in sku
      { sku: 123, id: 1 }, // Wrong type for sku
      { sku: "CONFIG-001", id: "1" }, // Wrong type for id
    ];

    testSchema(deleteConfigurableProductOptionInputSchema, validInputs, invalidInputs, "Delete Configurable Product Option");
  });
}); 