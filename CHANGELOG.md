# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
