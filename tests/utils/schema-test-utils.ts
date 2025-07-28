import { z } from "zod";

/**
 * Helper function to test Zod schemas with valid and invalid inputs
 */
export const testSchema = (schema: Record<string, z.ZodTypeAny>, validInputs: unknown[], invalidInputs: unknown[], schemaName: string) => {
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
export const getInputDescription = (input: unknown): string => {
  if (typeof input === "object" && input !== null) {
    const obj = input as Record<string, unknown>;
    const entries = Object.entries(obj).map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.join(", ")}]`;
      }
      return `${key}: ${value}`;
    });
    return `{ ${entries.join(", ")} }`;
  }
  return String(input);
};
