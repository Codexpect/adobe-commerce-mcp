# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4] - 2025-01-27

### Added

- **Comprehensive Inventory Management**: Complete Multi-Source Inventory (MSI) and Single Stock System support

  #### MSI Source Items Management

  - `search-msi-source-items` tool: Search for source items with flexible filters and pagination
  - `create-msi-source-item` tool: Create a new source item with product SKU, source code, and quantity
  - `delete-msi-source-item` tool: Delete a source item by SKU and source code
  - `are-products-salable-msi` tool: Check if multiple products are salable for given SKUs and stock ID
  - `are-products-salable-for-requested-qty-msi` tool: Check if products are salable for specific requested quantities
  - `is-product-salable-msi` tool: Check if a specific product is salable for a given stock
  - `is-product-salable-for-requested-qty-msi` tool: Check if a product is salable for a specific requested quantity
  - `get-product-salable-quantity-msi` tool: Get the salable quantity for a specific product and stock

  #### MSI Stocks Management

  - `search-msi-stocks` tool: Search for stocks with flexible filters and pagination
  - `get-msi-stock-by-id` tool: Get stock data by given stockId
  - `create-msi-stock` tool: Save Stock data
  - `update-msi-stock` tool: Save Stock data
  - `delete-msi-stock` tool: Delete the Stock data by stockId
  - `resolve-msi-stock` tool: Resolve Stock by Sales Channel type and code

  #### MSI Sources Management

  - `search-msi-sources` tool: Find Sources by SearchCriteria
  - `get-msi-source-by-code` tool: Get Source data by given code
  - `create-msi-source` tool: Save Source data
  - `update-msi-source` tool: Save Source data

  #### MSI Stock-Source Links Management

  - `search-msi-stock-source-links` tool: Find StockSourceLink list by given SearchCriteria
  - `create-msi-stock-source-links` tool: Save StockSourceLink list data
  - `delete-msi-stock-source-links` tool: Remove StockSourceLink list

  #### MSI Source Selection

  - `get-msi-source-selection-algorithms` tool: Get list of available source selection algorithms
  - `run-msi-source-selection-algorithm` tool: Get source selection algorithm result

  #### Single Stock System Management

  - `get-single-stock-item` tool: Get stock information for a specific product by SKU (single stock system)
  - `update-single-stock-item` tool: Update stock item information (quantity, status, etc.) for a product (single stock system)
  - `get-single-low-stock-items` tool: Get products with low inventory quantity below specified threshold (single stock system)
  - `get-single-stock-status` tool: Get stock status information for a specific product by SKU (single stock system)

- **Advanced Pricing Management**: Comprehensive pricing tools for bulk operations

  - `set-base-prices` tool: Set base prices for multiple products efficiently
  - `get-base-prices` tool: Retrieve base prices for multiple products
  - `set-special-prices` tool: Set special prices with date ranges for multiple products
  - `delete-special-prices` tool: Delete special prices for multiple products
  - `get-special-prices` tool: Retrieve special prices for multiple products
  - `set-tier-prices` tool: Set tier prices for quantity-based discounts on multiple products
  - `replace-tier-prices` tool: Replace all existing tier prices with new ones for multiple products
  - `delete-tier-prices` tool: Delete specific tier prices for multiple products
  - `get-tier-prices` tool: Retrieve tier prices for multiple products
  - `set-costs` tool: Set cost values for multiple products
  - `delete-costs` tool: Delete cost values for multiple products
  - `get-costs` tool: Retrieve cost values for multiple products

## [0.0.3] - 2025-01-27

### Added

- **Configurable Products Management**: Comprehensive tools for managing configurable products and their variants

  - `add-configurable-product-option` tool: Define which attribute and options are used in a configurable product, creating framework for product variants
  - `link-configurable-child` tool: Link a child product to a configurable product by SKU, making it a variant of the parent
  - `unlink-configurable-child` tool: Unlink a child product from a configurable product by SKU, removing it as a variant
  - `get-configurable-product-children` tool: Retrieve all child products for a configurable product by SKU
  - `get-configurable-product-options-all` tool: Retrieve all configurable options for a configurable product by SKU
  - `get-configurable-product-option-by-id` tool: Retrieve a specific configurable option for a configurable product by SKU and option ID
  - `update-configurable-product-option` tool: Update an existing configurable option for a configurable product by SKU and option ID
  - `delete-configurable-product-option` tool: Remove a configurable option from a configurable product by SKU and option ID
  - New configurable product interfaces: `ConfigurableProductOption` with properties for managing product variants
  - New validation schemas for configurable product operations including option management and child product linking
  - Comprehensive test coverage for all configurable product operations including functional tests and schema validation

### Changed

- **Validation Schemas**: Enhanced validation for entityId, productSku, sortDirection, storeId, websiteId, and storeGroupId with positive integer validation and regex patterns
- **API Function Signatures**: Standardized quotation marks and added type annotations for optionId parameters across product API functions
- **Tool Response Messages**: Enhanced all tool responses to include context messages for better user feedback on success/failure operations

## [0.0.2] - 25.07.2025

### Added

- **Product Website Assignment**: New functionality to manage product visibility across websites

  - `assign-product-to-website` tool: Assign products to specific websites by SKU and website ID
  - `remove-product-from-website` tool: Remove products from specific websites by SKU and website ID

- **Store Information Retrieval**: Read-only store configuration and structure tools

  - `get-store-configs` tool: Retrieve store configurations with optional store code filtering
  - `get-store-views` tool: Get all store views in Adobe Commerce
  - `get-store-groups` tool: Get all store groups in Adobe Commerce
  - `get-websites` tool: Get all websites in Adobe Commerce
  - New store-related interfaces: `Store`, `Website`, `StoreGroup`, `StoreConfig`
  - New validation schemas for store codes, website codes, and store group codes

### Changed

- **Product Custom Attributes**: Comprehensive support for all attribute types with full testing coverage

  - **Boolean Attributes**: Support for true/false values using 0 (false) or 1 (true)

    - Tested in function tests with proper value validation
    - Example: `{ attribute_code: "is_featured", value: 1 }`

  - **Text Attributes**: Simple text fields for product properties

    - Tested with various text values including colors, sizes, brands
    - Example: `{ attribute_code: "color", value: "blue" }`

  - **Numeric Attributes**: Integer and decimal values for ratings, quantities, etc.

    - Tested with integers, decimals, and large numbers
    - Example: `{ attribute_code: "rating", value: 4.5 }`

  - **Date Attributes**: Date fields in YYYY-MM-DD format

    - Tested with proper date formatting and validation
    - Example: `{ attribute_code: "release_date", value: "2024-03-15" }`

  - **Datetime Attributes**: Date and time fields in YYYY-MM-DD HH:mm:ss format

    - Tested with full datetime precision
    - Example: `{ attribute_code: "last_modified", value: "2024-01-25 09:15:00" }`

  - **Price Attributes**: Monetary values stored as strings

    - Tested with MSRP, cost, special prices, and tier pricing
    - Example: `{ attribute_code: "msrp", value: "149.99" }`

  - **Weight Attributes**: Weight values stored as strings

    - Tested with various weight formats and precision
    - Example: `{ attribute_code: "shipping_weight", value: "1.5" }`

  - **Single Select Attributes**: Dropdown selections using option IDs

    - Tested with option creation and proper ID mapping
    - Example: `{ attribute_code: "primary_category", value: 3 }`

  - **Multi Select Attributes**: Multiple selections using comma-separated option IDs

    - Tested with multiple option selection and proper string formatting
    - Example: `{ attribute_code: "tags", value: "1,2,3" }`

  - **Complex Attribute Combinations**: Full testing of mixed attribute types
    - Comprehensive tests combining multiple attribute types in single products
    - Validates proper handling of different data types and formats
    - Ensures compatibility with website assignments and category links

## [0.0.1] - 23.07.2025

### 🏗️ Project Structure

- Initial structure for project established
- Functional tests implemented
- TypeScript-based MCP server architecture

### 🛠️ Available Tools

#### Product Attributes, Sets & Groups

- Complete attribute management (create, update, delete, search)
- Attribute sets management with full CRUD operations
- Attribute groups management within sets
- Attribute options handling

#### Categories

- Full category tree operations
- Category CRUD operations
- Product-category assignments
- Category attributes details

#### Products (Basic)

- Simple product creation with limited number of attributes
- Product search and retrieval by SKU
- Basic product update and delete operations

#### Other Tools

- **Customers:** Search functionality
- **Orders:** Search functionality
- **CMS:** Search for blocks and pages
