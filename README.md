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

| Tool ID                                             | Description                                 |
| --------------------------------------------------- | ------------------------------------------- |
| (Product search tools available - see source files) | Various product search and management tools |

### Product Attributes

| Tool ID                    | Description                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| search-products-attributes | Search for products attributes in Adobe Commerce with flexible search filters.  |
| create-product-attribute   | Create a new product attribute in Adobe Commerce. Supports all attribute types. |

### Attribute Sets

| Tool ID                       | Description                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| search-attribute-sets         | Search for attribute sets in Adobe Commerce with flexible search filters.                    |
| create-attribute-set          | Create a new attribute set in Adobe Commerce. Only attribute_set_name and sort_order needed. |
| get-attribute-set-by-id       | Get details of an attribute set by its ID.                                                   |
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

### Categories

| Tool ID           | Description                                                           |
| ----------------- | --------------------------------------------------------------------- |
| search-categories | Search for categories in Adobe Commerce with flexible search filters. |

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
