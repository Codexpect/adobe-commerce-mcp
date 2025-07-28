# Adobe Commerce / Magento MCP

A Model Context Protocol (MCP) tool for integrating with the Magento REST API. No direct SQL or server access required.

## Supported Editions

This MCP tool is compatible with:

- **Adobe Commerce (formerly Magento)**: Enterprise-grade eCommerce platform with advanced features and support.
- **Magento Open Source**: The free, open-source edition of Magento, suitable for small to medium businesses.

All features are implemented using the official Magento REST API, ensuring compatibility and security for both editions. No direct database or server access is required—just API credentials from your Magento instance.

## Available Tools

All registered MCP tools are organized by resource type below:

### Products

| Tool ID                     | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| search-products             | Search for products in Adobe Commerce with flexible search filters.   |
| create-product              | Create a new product in Adobe Commerce with the specified attributes. |
| update-product              | Update an existing product in Adobe Commerce with new attributes.     |
| get-product-by-sku          | Retrieve a specific product from Adobe Commerce by its SKU.           |
| delete-product              | Delete a product from Adobe Commerce by its SKU.                      |
| assign-product-to-website   | Assign a product to a website by SKU and website ID.                  |
| remove-product-from-website | Remove a product from a website by SKU and website ID.                |

### Product Attributes

| Tool ID                         | Description                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------- |
| search-products-attributes      | Search for products attributes in Adobe Commerce with flexible search filters.  |
| create-product-attribute        | Create a new product attribute in Adobe Commerce. Supports all attribute types. |
| get-product-attribute-by-code   | Get a single product attribute by its attribute code.                           |
| update-product-attribute        | Update an existing product attribute by its attribute code.                     |
| delete-product-attribute        | Delete a product attribute by its attribute code.                               |
| get-product-attribute-options   | Get all options for a specific product attribute.                               |
| add-product-attribute-option    | Add a new option to a product attribute.                                        |
| update-product-attribute-option | Update an existing option of a product attribute.                               |
| delete-product-attribute-option | Delete an option from a product attribute.                                      |

### Attribute Sets

| Tool ID                       | Description                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| search-attribute-sets         | Search for attribute sets in Adobe Commerce with flexible search filters.                    |
| create-attribute-set          | Create a new attribute set in Adobe Commerce. Only attribute_set_name and sort_order needed. |
| get-attribute-set-by-id       | Get details of an attribute set by its ID.                                                   |
| get-attributes-from-set       | Get all attributes from an attribute set by its ID.                                          |
| delete-attribute-set          | Delete an attribute set by its ID.                                                           |
| update-attribute-set          | Update an attribute set by its ID. Only provide fields you want to update.                   |
| delete-attribute-from-set     | Delete an attribute from an attribute set by set ID and attribute code.                      |
| assign-attribute-to-set-group | Assign an attribute to an attribute set and group in Adobe Commerce.                         |

### Attribute Groups

| Tool ID                 | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| search-attribute-groups | Search for attribute groups in an attribute set in Adobe Commerce.  |
| create-attribute-group  | Create a new attribute group in an attribute set in Adobe Commerce. |
| delete-attribute-group  | Delete an attribute group by its ID.                                |
| update-attribute-group  | Update an attribute group by its ID in a given attribute set.       |

### Configurable Products

| Tool ID                               | Description                                                                                                      |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| add-configurable-product-option       | Define which attribute and options are used in a configurable product. Creates framework for product variants.   |
| link-configurable-child               | Link a child product to a configurable product by SKU. The child product becomes a variant of the parent.        |
| unlink-configurable-child             | Unlink a child product from a configurable product by SKU. The child product remains but is no longer a variant. |
| get-configurable-product-children     | Retrieve all child products for a configurable product by SKU.                                                   |
| get-configurable-product-options-all  | Retrieve all configurable options for a configurable product by SKU.                                             |
| get-configurable-product-option-by-id | Retrieve a specific configurable option for a configurable product by SKU and option ID.                         |
| update-configurable-product-option    | Update an existing configurable option for a configurable product by SKU and option ID.                          |
| delete-configurable-product-option    | Remove a configurable option from a configurable product by SKU and option ID.                                   |

### Categories

| Tool ID                        | Description                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| search-categories              | Search for categories in Adobe Commerce with flexible search filters.                  |
| get-category-tree              | Retrieve the category tree structure with optional root category and depth parameters. |
| get-category-by-id             | Retrieve a specific category by its ID.                                                |
| create-category                | Create a new category in Adobe Commerce.                                               |
| update-category                | Update an existing category in Adobe Commerce.                                         |
| delete-category                | Delete a category by its ID.                                                           |
| move-category                  | Move a category to a new parent category.                                              |
| get-category-attributes        | Retrieve category attributes with optional search criteria.                            |
| get-category-attribute-by-code | Retrieve a specific category attribute by its code.                                    |
| get-category-attribute-options | Retrieve options for a specific category attribute.                                    |
| get-category-products          | Retrieve products assigned to a specific category.                                     |
| assign-product-to-category     | Assign a product to a specific category.                                               |
| update-product-in-category     | Update a product's assignment in a category.                                           |
| remove-product-from-category   | Remove a product from a specific category.                                             |

### Customers

| Tool ID          | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| search-customers | Search for customers in Adobe Commerce with flexible search filters. |

### Orders

| Tool ID       | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| search-orders | Search for orders in Adobe Commerce with flexible search filters. |

### CMS

| Tool ID           | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| search-cms-blocks | Search for CMS blocks in Adobe Commerce with flexible search filters. |
| search-cms-pages  | Search for CMS pages in Adobe Commerce with flexible search filters.  |

### Stores

| Tool ID           | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| get-store-configs | Retrieve store configurations with optional store code filtering. |
| get-store-views   | Get all store views in Adobe Commerce.                            |
| get-store-groups  | Get all store groups in Adobe Commerce.                           |
| get-websites      | Get all websites in Adobe Commerce.                               |

Each tool provides a set of MCP-compatible operations for its resource type. For a full list and detailed parameters, see the source files in `src/tools/`.

## Usage

### 1. Install

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure

Create or edit your `.cursor/mcp.json` file and provide your Magento/Adobe Commerce instance credentials:

```json
{
  "mcpServers": {
    "adobe-commerce-mcp": {
      "command": "node",
      "args": ["/path/to/adobe-commerce-mcp/build/index.js"],
      "env": {
        "COMMERCE_BASE_URL": "https://your-magento-instance/",
        "COMMERCE_CONSUMER_KEY": "your_consumer_key",
        "COMMERCE_CONSUMER_SECRET": "your_consumer_secret",
        "COMMERCE_ACCESS_TOKEN": "your_access_token",
        "COMMERCE_ACCESS_TOKEN_SECRET": "your_access_token_secret"
      }
    }
  }
}
```

### 4. Run

Start the MCP server as defined in your configuration. The tools will be available for use in any MCP-compatible client or workflow.

## Directory Structure

```
adobe-commerce-mcp/
├── src/
│   ├── adobe/
│   │   ├── categories/         # Category API and types
│   │   ├── cms/                # CMS blocks and pages API and types
│   │   ├── customers/          # Customer API and types
│   │   ├── orders/             # Order API and types
│   │   ├── products/           # Product API, attributes, sets, and types
│   │   ├── search-criteria/    # Search criteria schemas and types
│   │   ├── stores/             # Store API and types
│   │   └── types/              # Shared API response and parameter types
│   ├── tools/                  # MCP tool implementations for each resource
│   └── index.ts                # Main MCP server entry point
├── packages/
│   └── commerce-sdk-auth/      # Authentication SDK for Adobe Commerce
├── tests/                      # Test suites and mocks
├── package.json
├── tsconfig.json
└── README.md
```
