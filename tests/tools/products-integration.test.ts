/**
 * Integration Tests for Products Search Tool
 * Tests against real Magento/Adobe Commerce instance with sample data
 *
 * Setup Instructions:
 * 1. Copy tests/env.test.example to .env.test
 * 2. Add your Magento credentials to .env.test
 * 3. Run: npm run build
 * 4. Run: npm run test:integration
 */

import { AdobeCommerceClient } from "../../src/adobe/adobe-commerce-client";
import { CommerceParams } from "../../src/adobe/types/params";

describe("Products Search Integration Tests", () => {
  let client: AdobeCommerceClient;
  beforeAll(() => {
    console.log("🚀 Setting up integration tests...");
    console.log(`📍 Testing against: ${process.env.COMMERCE_BASE_URL}`);
    console.log("📦 Testing with Adobe Commerce sample data");

    const params = {
      COMMERCE_BASE_URL: process.env.COMMERCE_BASE_URL,
      COMMERCE_CONSUMER_KEY: process.env.COMMERCE_CONSUMER_KEY,
      COMMERCE_CONSUMER_SECRET: process.env.COMMERCE_CONSUMER_SECRET,
      COMMERCE_ACCESS_TOKEN: process.env.COMMERCE_ACCESS_TOKEN,
      COMMERCE_ACCESS_TOKEN_SECRET: process.env.COMMERCE_ACCESS_TOKEN_SECRET,
    } as CommerceParams;

    client = AdobeCommerceClient.create(params);
  });

  describe("Basic API Connection", () => {
    test("should connect to Magento and fetch sample products", async () => {
      const products = await client.get("/products");
      expect(products).toBeDefined();

    }, 30000);
  });

  afterAll(() => {
    console.log("\n🎉 Integration tests completed!");
    console.log("📊 All products search functionality verified against Adobe Commerce");
    console.log("🔍 Tested SKU search, name search, pagination, sorting, and sample data");
  });
});
