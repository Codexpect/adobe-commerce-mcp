import { z } from "zod";
import {
  // Stock Items schemas
  getStockItemInputSchema,
  updateStockItemInputSchema,
  getLowStockItemsInputSchema,
  // Salability schemas
  areProductsSalableInputSchema,
  areProductsSalableForRequestedQtyInputSchema,
  isProductSalableInputSchema,
  isProductSalableForRequestedQtyInputSchema,
  getProductSalableQuantityInputSchema,
  // Stocks schemas
  createStockInputSchema,
  updateStockInputSchema,
  getStockByIdInputSchema,
  deleteStockInputSchema,
  resolveStockInputSchema,
  // Sources schemas
  createSourceInputSchema,
  updateSourceInputSchema,
  getSourceByCodeInputSchema,
  // Stock-Source Links schemas
  createStockSourceLinksInputSchema,
  deleteStockSourceLinksInputSchema,
  // Source Selection schemas
  sourceSelectionAlgorithmInputSchema,
} from "../../../src/adobe/inventory/schemas";
import { searchCriteriaInputSchema } from "../../../src/adobe/search-criteria/schema";
import { testSchema } from "../../utils/schema-test-utils";

describe("Inventory Tools - Schema Validation Tests", () => {
  describe("Search Inventory Schema", () => {
    const validInputs = [
      {}, // Empty object should work
      { page: 1, pageSize: 10 },
      { sortOrders: [{ field: "name", direction: "ASC" }] },
      {
        filters: [
          { field: "stock_id", value: "1", conditionType: "eq" },
          { field: "source_code", value: "warehouse_us", conditionType: "eq" },
        ],
      },
      {
        page: 2,
        pageSize: 5,
        filters: [{ field: "name", value: "Main Stock", conditionType: "like" }],
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

    testSchema(searchCriteriaInputSchema, validInputs, invalidInputs, "Search Inventory");
  });

  describe("Stock Items Schema", () => {
    describe("Get Stock Item Schema", () => {
      const validInputs = [
        { productSku: "PROD-001" },
        { productSku: "product_123", scopeId: 1 },
        { productSku: "configurable-product", scopeId: 2 },
      ];

      const invalidInputs = [
        {}, // Missing required productSku
        { scopeId: 1 }, // Missing productSku
        { productSku: "" }, // Empty SKU
        { productSku: "   ", scopeId: 1 }, // Whitespace-only SKU
        { productSku: "PROD-001", scopeId: -1 }, // Negative scopeId
        { productSku: "PROD-001", scopeId: 0.5 }, // Non-integer scopeId
        { productSku: "PROD-001", scopeId: "invalid" }, // Invalid scopeId type
      ];

      testSchema(getStockItemInputSchema, validInputs, invalidInputs, "Get Stock Item");
    });

    describe("Update Stock Item Schema", () => {
      const validInputs = [
        {
          productSku: "PROD-001",
          itemId: 1,
          qty: 100,
        },
        {
          productSku: "product_123",
          itemId: 2,
          isInStock: true,
          manageStock: true,
          minQty: 10,
          maxSaleQty: 50,
        },
        {
          productSku: "configurable-product",
          itemId: 3,
          qty: 50,
          isInStock: false,
          backorders: 0,
          notifyStockQty: 5,
        },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { productSku: "PROD-001" }, // Missing itemId
        { itemId: 1 }, // Missing productSku
        { productSku: "", itemId: 1 }, // Empty SKU
        { productSku: "PROD-001", itemId: -1 }, // Negative itemId
        { productSku: "PROD-001", itemId: 0 }, // Zero itemId
        { productSku: "PROD-001", itemId: 1, qty: -1 }, // Negative quantity
        { productSku: "PROD-001", itemId: 1, minQty: -5 }, // Negative minQty
        { productSku: "PROD-001", itemId: 1, maxSaleQty: -10 }, // Negative maxSaleQty
        { productSku: "PROD-001", itemId: 1, backorders: "invalid" }, // Invalid backorders
      ];

      testSchema(updateStockItemInputSchema, validInputs, invalidInputs, "Update Stock Item");
    });

    describe("Get Low Stock Items Schema", () => {
      const validInputs = [
        { scopeId: 1, qty: 10 },
        { scopeId: 2, qty: 5, currentPage: 1, pageSize: 10 },
        { scopeId: 1, qty: 20, currentPage: 2, pageSize: 5 },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { qty: 10 }, // Missing scopeId
        { scopeId: 1 }, // Missing qty
        { scopeId: -1, qty: 10 }, // Negative scopeId
        { scopeId: 1, qty: -1 }, // Negative qty
        { scopeId: 1, qty: 10, currentPage: 0 }, // Invalid currentPage
        { scopeId: 1, qty: 10, pageSize: 0 }, // Invalid pageSize
        { scopeId: 1, qty: 10, pageSize: 101 }, // Invalid pageSize (max is 100)
      ];

      testSchema(getLowStockItemsInputSchema, validInputs, invalidInputs, "Get Low Stock Items");
    });
  });

  describe("Salability Schema", () => {
    describe("Are Products Salable Schema", () => {
      const validInputs = [
        { skus: ["PROD-001"], stockId: 1 },
        { skus: ["product_123", "configurable-product"], stockId: 2 },
        { skus: ["SKU1", "SKU2", "SKU3"], stockId: 3 },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { stockId: 1 }, // Missing skus
        { skus: ["PROD-001"] }, // Missing stockId
        { skus: [], stockId: 1 }, // Empty skus array
        { skus: [""], stockId: 1 }, // Empty SKU
        { skus: ["PROD-001"], stockId: -1 }, // Negative stockId
        { skus: ["PROD-001"], stockId: 0 }, // Zero stockId
        { skus: [1, 2, 3], stockId: 1 }, // Invalid SKU types
        { skus: "PROD-001", stockId: 1 }, // SKUs must be array
      ];

      testSchema(areProductsSalableInputSchema, validInputs, invalidInputs, "Are Products Salable");
    });

    describe("Are Products Salable For Requested Quantity Schema", () => {
      const validInputs = [
        {
          skuRequests: [{ sku: "PROD-001", qty: 10 }],
          stockId: 1,
        },
        {
          skuRequests: [
            { sku: "product_123", qty: 5 },
            { sku: "configurable-product", qty: 2 },
          ],
          stockId: 2,
        },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { stockId: 1 }, // Missing skuRequests
        { skuRequests: [{ sku: "PROD-001", qty: 10 }] }, // Missing stockId
        { skuRequests: [], stockId: 1 }, // Empty skuRequests
        { skuRequests: [{ sku: "PROD-001" }], stockId: 1 }, // Missing qty
        { skuRequests: [{ qty: 10 }], stockId: 1 }, // Missing sku
        { skuRequests: [{ sku: "", qty: 10 }], stockId: 1 }, // Empty sku
        { skuRequests: [{ sku: "PROD-001", qty: -1 }], stockId: 1 }, // Negative qty
        { skuRequests: [{ sku: "PROD-001", qty: -1 }], stockId: 1 }, // Negative qty
        { skuRequests: [{ sku: "PROD-001", qty: 10 }], stockId: -1 }, // Negative stockId
      ];

      testSchema(areProductsSalableForRequestedQtyInputSchema, validInputs, invalidInputs, "Are Products Salable For Requested Quantity");
    });

    describe("Is Product Salable Schema", () => {
      const validInputs = [
        { sku: "PROD-001", stockId: 1 },
        { sku: "product_123", stockId: 2 },
        { sku: "configurable-product", stockId: 3 },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { stockId: 1 }, // Missing sku
        { sku: "PROD-001" }, // Missing stockId
        { sku: "", stockId: 1 }, // Empty sku
        { sku: "PROD-001", stockId: -1 }, // Negative stockId
        { sku: "PROD-001", stockId: 0 }, // Zero stockId
        { sku: 123, stockId: 1 }, // Invalid sku type
        { sku: "PROD-001", stockId: "invalid" }, // Invalid stockId type
      ];

      testSchema(isProductSalableInputSchema, validInputs, invalidInputs, "Is Product Salable");
    });

    describe("Is Product Salable For Requested Quantity Schema", () => {
      const validInputs = [
        { sku: "PROD-001", stockId: 1, requestedQty: 10 },
        { sku: "product_123", stockId: 2, requestedQty: 5 },
        { sku: "configurable-product", stockId: 3, requestedQty: 1 },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { stockId: 1, requestedQty: 10 }, // Missing sku
        { sku: "PROD-001", requestedQty: 10 }, // Missing stockId
        { sku: "PROD-001", stockId: 1 }, // Missing requestedQty
        { sku: "", stockId: 1, requestedQty: 10 }, // Empty sku
        { sku: "PROD-001", stockId: -1, requestedQty: 10 }, // Negative stockId
        { sku: "PROD-001", stockId: 1, requestedQty: -1 }, // Negative requestedQty
        { sku: "PROD-001", stockId: 1, requestedQty: 0 }, // Zero requestedQty
        { sku: 123, stockId: 1, requestedQty: 10 }, // Invalid sku type
        { sku: "PROD-001", stockId: "invalid", requestedQty: 10 }, // Invalid stockId type
        { sku: "PROD-001", stockId: 1, requestedQty: "invalid" }, // Invalid requestedQty type
      ];

      testSchema(isProductSalableForRequestedQtyInputSchema, validInputs, invalidInputs, "Is Product Salable For Requested Quantity");
    });

    describe("Get Product Salable Quantity Schema", () => {
      const validInputs = [
        { sku: "PROD-001", stockId: 1 },
        { sku: "product_123", stockId: 2 },
        { sku: "configurable-product", stockId: 3 },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { stockId: 1 }, // Missing sku
        { sku: "PROD-001" }, // Missing stockId
        { sku: "", stockId: 1 }, // Empty sku
        { sku: "PROD-001", stockId: -1 }, // Negative stockId
        { sku: "PROD-001", stockId: 0 }, // Zero stockId
        { sku: 123, stockId: 1 }, // Invalid sku type
        { sku: "PROD-001", stockId: "invalid" }, // Invalid stockId type
      ];

      testSchema(getProductSalableQuantityInputSchema, validInputs, invalidInputs, "Get Product Salable Quantity");
    });
  });

  describe("Stocks Schema", () => {
    describe("Create Stock Schema", () => {
      const validInputs = [
        { name: "Main Stock" },
        { name: "EU Warehouse Stock", sales_channels: [{ type: "website", code: "base" }] },
        { name: "US Store Stock", sales_channels: [{ type: "website", code: "store_1" }] },
      ];

      const invalidInputs = [
        {}, // Missing required name
        { name: "" }, // Empty name
        { name: "" }, // Empty name
        { sales_channels: [{ type: "website", code: "base" }] }, // Missing name
        { name: "Main Stock", sales_channels: [{ type: "invalid", code: "base" }] }, // Invalid sales channel type
        { name: "Main Stock", sales_channels: [{ type: "website", code: "" }] }, // Empty sales channel code
        { name: "Main Stock", sales_channels: "invalid" }, // Invalid sales_channels type
      ];

      testSchema(createStockInputSchema, validInputs, invalidInputs, "Create Stock");
    });

    describe("Update Stock Schema", () => {
      const validInputs = [
        { stock_id: 1, name: "Updated Stock" },
        { stock_id: 2, sales_channels: [{ type: "website", code: "base" }] },
        { stock_id: 3, name: "New Name", sales_channels: [{ type: "website", code: "store_1" }] },
      ];

      const invalidInputs = [
        {}, // Missing required stock_id
        { name: "Updated Stock" }, // Missing stock_id
        { stock_id: -1, name: "Updated Stock" }, // Negative stock_id
        { stock_id: 0, name: "Updated Stock" }, // Zero stock_id
        { stock_id: 1, name: "" }, // Empty name
        { stock_id: 1, sales_channels: [{ type: "invalid", code: "base" }] }, // Invalid sales channel type
        { stock_id: 1, sales_channels: [{ type: "website", code: "" }] }, // Empty sales channel code
        { stock_id: "invalid", name: "Updated Stock" }, // Invalid stock_id type
      ];

      testSchema(updateStockInputSchema, validInputs, invalidInputs, "Update Stock");
    });

    describe("Get Stock By ID Schema", () => {
      const validInputs = [
        { stock_id: 1 },
        { stock_id: 2 },
        { stock_id: 100 },
      ];

      const invalidInputs = [
        {}, // Missing required stock_id
        { stock_id: -1 }, // Negative stock_id
        { stock_id: 0 }, // Zero stock_id
        { stock_id: "invalid" }, // Invalid stock_id type
        { stock_id: 1.5 }, // Non-integer stock_id
      ];

      testSchema(getStockByIdInputSchema, validInputs, invalidInputs, "Get Stock By ID");
    });

    describe("Delete Stock Schema", () => {
      const validInputs = [
        { stock_id: 1 },
        { stock_id: 2 },
        { stock_id: 100 },
      ];

      const invalidInputs = [
        {}, // Missing required stock_id
        { stock_id: -1 }, // Negative stock_id
        { stock_id: 0 }, // Zero stock_id
        { stock_id: "invalid" }, // Invalid stock_id type
        { stock_id: 1.5 }, // Non-integer stock_id
      ];

      testSchema(deleteStockInputSchema, validInputs, invalidInputs, "Delete Stock");
    });

    describe("Resolve Stock Schema", () => {
      const validInputs = [
        { type: "website", code: "base" },
        { type: "website", code: "store_1" },
        { type: "website", code: "eu_store" },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { code: "base" }, // Missing type
        { type: "website" }, // Missing code
        { type: "", code: "base" }, // Empty type
        { type: "website", code: "" }, // Empty code
        { type: "invalid", code: "base" }, // Invalid type
        { type: 123, code: "base" }, // Invalid type type
        { type: "website", code: 123 }, // Invalid code type
      ];

      testSchema(resolveStockInputSchema, validInputs, invalidInputs, "Resolve Stock");
    });
  });

  describe("Sources Schema", () => {
    describe("Create Source Schema", () => {
      const validInputs = [
        {
          source_code: "warehouse_us",
          name: "US Warehouse",
          enabled: true,
          country_id: "US",
          postcode: "10001",
        },
        {
          source_code: "store_nyc",
          name: "NYC Store",
          enabled: false,
          country_id: "US",
          email: "store@example.com",
          contact_name: "John Doe",
          description: "New York City store location",
          latitude: 40.7128,
          longitude: -74.0060,
          region_id: 12,
          city: "New York",
          street: "123 Main St",
          postcode: "10001",
          phone: "+1-555-123-4567",
        },
        {
          source_code: "warehouse_eu",
          name: "EU Warehouse",
          enabled: true,
          country_id: "DE",
          postcode: "80331",
          region: "Bavaria",
          city: "Munich",
          use_default_carrier_config: true,
          carrier_links: [
            { carrier_code: "ups", position: 1 },
            { carrier_code: "fedex", position: 2 },
          ],
        },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001" }, // Missing source_code
        { source_code: "warehouse_us", enabled: true, country_id: "US", postcode: "10001" }, // Missing name
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, postcode: "10001" }, // Missing country_id
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US" }, // Missing postcode
        { source_code: "", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001" }, // Empty source_code
        { source_code: "warehouse_us", name: "", enabled: true, country_id: "US", postcode: "10001" }, // Empty name
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "", postcode: "10001" }, // Empty country_id
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "" }, // Empty postcode
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "USA", postcode: "10001" }, // Invalid country_id length
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001", email: "invalid-email" }, // Invalid email
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001", latitude: 100 }, // Invalid latitude
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001", longitude: 200 }, // Invalid longitude
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001", region_id: -1 }, // Negative region_id
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001", carrier_links: [{ carrier_code: "ups" }] }, // Missing position
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001", carrier_links: [{ position: 1 }] }, // Missing carrier_code
        { source_code: "warehouse_us", name: "US Warehouse", enabled: true, country_id: "US", postcode: "10001", carrier_links: [{ carrier_code: "ups", position: -1 }] }, // Negative position
      ];

      testSchema(createSourceInputSchema, validInputs, invalidInputs, "Create Source");
    });

    describe("Update Source Schema", () => {
      const validInputs = [
        { source_code: "warehouse_us", name: "Updated US Warehouse", country_id: "US", postcode: "10001" },
        { source_code: "store_nyc", enabled: false, country_id: "US", postcode: "10001" },
        { source_code: "warehouse_eu", email: "new@example.com", contact_name: "Jane Doe", country_id: "DE", postcode: "80331" },
        { source_code: "warehouse_us", latitude: 40.7128, longitude: -74.0060, country_id: "US", postcode: "10001" },
      ];

      const invalidInputs = [
        {}, // Missing required source_code
        { name: "Updated US Warehouse", country_id: "US", postcode: "10001" }, // Missing source_code
        { source_code: "", name: "Updated US Warehouse", country_id: "US", postcode: "10001" }, // Empty source_code
        { source_code: "warehouse_us", name: "", country_id: "US", postcode: "10001" }, // Empty name
        { source_code: "warehouse_us" }, // Missing country_id and postcode
        { source_code: "warehouse_us", country_id: "US" }, // Missing postcode
        { source_code: "warehouse_us", postcode: "10001" }, // Missing country_id
        { source_code: "warehouse_us", email: "invalid-email", country_id: "US", postcode: "10001" }, // Invalid email
        { source_code: "warehouse_us", latitude: 100, country_id: "US", postcode: "10001" }, // Invalid latitude
        { source_code: "warehouse_us", longitude: 200, country_id: "US", postcode: "10001" }, // Invalid longitude
        { source_code: "warehouse_us", region_id: -1, country_id: "US", postcode: "10001" }, // Negative region_id
        { source_code: "warehouse_us", country_id: "USA", postcode: "10001" }, // Invalid country_id length
        { source_code: "warehouse_us", country_id: "US", postcode: "" }, // Empty postcode
        { source_code: "warehouse_us", carrier_links: [{ carrier_code: "ups" }], country_id: "US", postcode: "10001" }, // Missing position
        { source_code: "warehouse_us", carrier_links: [{ position: 1 }], country_id: "US", postcode: "10001" }, // Missing carrier_code
        { source_code: "warehouse_us", carrier_links: [{ carrier_code: "ups", position: -1 }], country_id: "US", postcode: "10001" }, // Negative position
      ];

      testSchema(updateSourceInputSchema, validInputs, invalidInputs, "Update Source");
    });

    describe("Get Source By Code Schema", () => {
      const validInputs = [
        { source_code: "warehouse_us" },
        { source_code: "store_nyc" },
        { source_code: "warehouse_eu" },
      ];

      const invalidInputs = [
        {}, // Missing required source_code
        { source_code: "" }, // Empty source_code
        { source_code: "   " }, // Whitespace-only source_code
        { source_code: 123 }, // Invalid source_code type
      ];

      testSchema(getSourceByCodeInputSchema, validInputs, invalidInputs, "Get Source By Code");
    });
  });

  describe("Stock-Source Links Schema", () => {
    describe("Create Stock-Source Links Schema", () => {
      const validInputs = [
        {
          links: [{ stock_id: 1, source_code: "warehouse_us", priority: 1 }],
        },
        {
          links: [
            { stock_id: 1, source_code: "warehouse_us", priority: 1 },
            { stock_id: 2, source_code: "store_nyc", priority: 2 },
          ],
        },
      ];

      const invalidInputs = [
        {}, // Missing required links
        { links: [] }, // Empty links array
        { links: [{ stock_id: 1, source_code: "warehouse_us" }] }, // Missing priority
        { links: [{ source_code: "warehouse_us", priority: 1 }] }, // Missing stock_id
        { links: [{ stock_id: 1, priority: 1 }] }, // Missing source_code
        { links: [{ stock_id: -1, source_code: "warehouse_us", priority: 1 }] }, // Negative stock_id
        { links: [{ stock_id: 1, source_code: "", priority: 1 }] }, // Empty source_code
        { links: [{ stock_id: 1, source_code: "warehouse_us", priority: -1 }] }, // Negative priority
        { links: [{ stock_id: 1, source_code: "warehouse_us", priority: 0.5 }] }, // Non-integer priority
        { links: "invalid" }, // Invalid links type
      ];

      testSchema(createStockSourceLinksInputSchema, validInputs, invalidInputs, "Create Stock-Source Links");
    });

    describe("Delete Stock-Source Links Schema", () => {
      const validInputs = [
        {
          links: [{ stock_id: 1, source_code: "warehouse_us", priority: 1 }],
        },
        {
          links: [
            { stock_id: 1, source_code: "warehouse_us", priority: 1 },
            { stock_id: 2, source_code: "store_nyc", priority: 2 },
          ],
        },
      ];

      const invalidInputs = [
        {}, // Missing required links
        { links: [] }, // Empty links array
        { links: [{ stock_id: 1, source_code: "warehouse_us" }] }, // Missing priority
        { links: [{ source_code: "warehouse_us", priority: 1 }] }, // Missing stock_id
        { links: [{ stock_id: 1, priority: 1 }] }, // Missing source_code
        { links: [{ stock_id: -1, source_code: "warehouse_us", priority: 1 }] }, // Negative stock_id
        { links: [{ stock_id: 1, source_code: "", priority: 1 }] }, // Empty source_code
        { links: [{ stock_id: 1, source_code: "warehouse_us", priority: -1 }] }, // Negative priority
        { links: [{ stock_id: 1, source_code: "warehouse_us", priority: 0.5 }] }, // Non-integer priority
        { links: "invalid" }, // Invalid links type
      ];

      testSchema(deleteStockSourceLinksInputSchema, validInputs, invalidInputs, "Delete Stock-Source Links");
    });
  });

  describe("Source Selection Schema", () => {
    describe("Source Selection Algorithm Schema", () => {
      const validInputs = [
        {
          inventory_request: {
            stock_id: 1,
            items: [{ sku: "PROD-001", qty: 10 }],
          },
          algorithm_code: "priority",
        },
        {
          inventory_request: {
            stock_id: 2,
            items: [
              { sku: "product_123", qty: 5 },
              { sku: "configurable-product", qty: 2 },
            ],
          },
          algorithm_code: "distance",
        },
      ];

      const invalidInputs = [
        {}, // Missing required fields
        { algorithm_code: "priority" }, // Missing inventory_request
        { inventory_request: { stock_id: 1, items: [{ sku: "PROD-001", qty: 10 }] } }, // Missing algorithm_code
        { inventory_request: { items: [{ sku: "PROD-001", qty: 10 }], algorithm_code: "priority" }, algorithm_code: "priority" }, // Missing stock_id
        { inventory_request: { stock_id: 1, algorithm_code: "priority" }, algorithm_code: "priority" }, // Missing items
        { inventory_request: { stock_id: 1, items: [], algorithm_code: "priority" }, algorithm_code: "priority" }, // Empty items
        { inventory_request: { stock_id: 1, items: [{ sku: "PROD-001" }], algorithm_code: "priority" }, algorithm_code: "priority" }, // Missing qty
        { inventory_request: { stock_id: 1, items: [{ qty: 10 }], algorithm_code: "priority" }, algorithm_code: "priority" }, // Missing sku
        { inventory_request: { stock_id: 1, items: [{ sku: "", qty: 10 }], algorithm_code: "priority" }, algorithm_code: "priority" }, // Empty sku
        { inventory_request: { stock_id: 1, items: [{ sku: "PROD-001", qty: -1 }], algorithm_code: "priority" }, algorithm_code: "priority" }, // Negative qty
        { inventory_request: { stock_id: 1, items: [{ sku: "PROD-001", qty: 10 }], algorithm_code: "priority" }, algorithm_code: "" }, // Empty algorithm_code
        { inventory_request: { stock_id: -1, items: [{ sku: "PROD-001", qty: 10 }], algorithm_code: "priority" }, algorithm_code: "priority" }, // Negative stock_id
        { inventory_request: { stock_id: 1, items: [{ sku: "PROD-001", qty: 10 }], algorithm_code: "priority" }, algorithm_code: 123 }, // Invalid algorithm_code type
      ];

      testSchema(sourceSelectionAlgorithmInputSchema, validInputs, invalidInputs, "Source Selection Algorithm");
    });
  });

  describe("Security and Edge Cases", () => {
    test("SECURITY: Empty strings properly rejected for AI agent safety", () => {
      console.log("✅ SECURITY: Empty string validations properly reject invalid inputs");

      // Test stock schemas
      const createStockSchema = z.object(createStockInputSchema);
      const updateStockSchema = z.object(updateStockInputSchema);
      const getStockSchema = z.object(getStockByIdInputSchema);

      expect(() =>
        createStockSchema.parse({
          name: "", // AI agents must not create empty stock names
        })
      ).toThrow("Stock name is required");

      expect(() =>
        updateStockSchema.parse({
          stock_id: 1,
          name: "", // AI agents must not update with empty names
        })
      ).toThrow("Stock name cannot be empty");

      expect(() =>
        getStockSchema.parse({
          stock_id: -1, // AI agents must not use negative IDs
        })
      ).toThrow("Entity ID must be a positive integer");

      // Test source schemas
      const createSourceSchema = z.object(createSourceInputSchema);
      const updateSourceSchema = z.object(updateSourceInputSchema);
      const getSourceSchema = z.object(getSourceByCodeInputSchema);

      expect(() =>
        createSourceSchema.parse({
          source_code: "", // AI agents must not create empty source codes
          name: "Test Source",
          enabled: true,
          country_id: "US",
          postcode: "10001",
        })
      ).toThrow("Source code is required");

      expect(() =>
        updateSourceSchema.parse({
          source_code: "", // AI agents must not update with empty source codes
          name: "Updated Source",
          country_id: "US",
          postcode: "10001",
        })
      ).toThrow("Source code is required");

      expect(() =>
        getSourceSchema.parse({
          source_code: "", // AI agents must not query with empty source codes
        })
      ).toThrow("Source code is required");

      // Test stock item schemas
      const getStockItemSchema = z.object(getStockItemInputSchema);
      const updateStockItemSchema = z.object(updateStockItemInputSchema);

      expect(() =>
        getStockItemSchema.parse({
          productSku: "", // AI agents must not query with empty SKUs
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        updateStockItemSchema.parse({
          productSku: "", // AI agents must not update with empty SKUs
          itemId: 1,
        })
      ).toThrow("SKU cannot be empty");

      // Test salability schemas
      const areProductsSalableSchema = z.object(areProductsSalableInputSchema);
      const isProductSalableSchema = z.object(isProductSalableInputSchema);

      expect(() =>
        areProductsSalableSchema.parse({
          skus: [""], // AI agents must not check empty SKUs
          stockId: 1,
        })
      ).toThrow("SKU cannot be empty");

      expect(() =>
        isProductSalableSchema.parse({
          sku: "", // AI agents must not check empty SKUs
          stockId: 1,
        })
      ).toThrow("SKU cannot be empty");
    });

    test("BOUNDARY: Edge cases properly handled", () => {
      console.log("✅ BOUNDARY: Edge cases properly handled");

      // Test maximum values
      const createStockSchema = z.object(createStockInputSchema);
      const createSourceSchema = z.object(createSourceInputSchema);

      // Very long names should be accepted (within reasonable limits)
      expect(() =>
        createStockSchema.parse({
          name: "A".repeat(255), // Long but valid name
        })
      ).not.toThrow();

      expect(() =>
        createSourceSchema.parse({
          source_code: "a".repeat(64), // Long but valid source code
          name: "Test Source",
          enabled: true,
          country_id: "US",
          postcode: "10001",
        })
      ).not.toThrow();

      // Test coordinate boundaries
      expect(() =>
        createSourceSchema.parse({
          source_code: "test",
          name: "Test Source",
          enabled: true,
          country_id: "US",
          postcode: "10001",
          latitude: 90, // Maximum valid latitude
          longitude: 180, // Maximum valid longitude
        })
      ).not.toThrow();

      expect(() =>
        createSourceSchema.parse({
          source_code: "test",
          name: "Test Source",
          enabled: true,
          country_id: "US",
          postcode: "10001",
          latitude: -90, // Minimum valid latitude
          longitude: -180, // Minimum valid longitude
        })
      ).not.toThrow();

      // Test invalid coordinates
      expect(() =>
        createSourceSchema.parse({
          source_code: "test",
          name: "Test Source",
          enabled: true,
          country_id: "US",
          postcode: "10001",
          latitude: 91, // Invalid latitude
        })
      ).toThrow("Number must be less than or equal to 90");

      expect(() =>
        createSourceSchema.parse({
          source_code: "test",
          name: "Test Source",
          enabled: true,
          country_id: "US",
          postcode: "10001",
          longitude: 181, // Invalid longitude
        })
      ).toThrow("Number must be less than or equal to 180");
    });
  });
}); 