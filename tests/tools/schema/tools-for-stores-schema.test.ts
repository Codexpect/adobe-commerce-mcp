import { describe, expect, it } from "@jest/globals";
import { z } from "zod";
import { getStoreConfigsInputSchema } from "../../../src/adobe/stores/schemas";

describe("Store Schemas", () => {
  describe("getStoreConfigsInputSchema", () => {
    const schema = z.object(getStoreConfigsInputSchema);

    it("should validate empty input", () => {
      const result = schema.parse({});
      expect(result).toEqual({});
    });

    it("should validate with store codes", () => {
      const input = {
        store_codes: ["default", "admin"],
      };
      const result = schema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate single store code", () => {
      const input = {
        store_codes: ["default"],
      };
      const result = schema.parse(input);
      expect(result).toEqual(input);
    });

    it("should reject invalid store codes", () => {
      expect(() => {
        schema.parse({
          store_codes: ["INVALID-CODE"],
        });
      }).toThrow();

      expect(() => {
        schema.parse({
          store_codes: [""],
        });
      }).toThrow();
    });
  });
});
