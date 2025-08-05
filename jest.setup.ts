import { afterAll, beforeAll } from "@jest/globals";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

beforeAll(() => {
  jest.setTimeout(30000);

  // jest.spyOn(console, "log").mockImplementation(() => {});
  // jest.spyOn(console, "error").mockImplementation(() => {});
  // jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
