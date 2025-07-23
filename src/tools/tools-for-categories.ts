import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import { AdobeCommerceClient } from "../adobe/adobe-commerce-client";
import {
  assignProductToCategory,
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryAttributeByCode,
  getCategoryAttributeOptions,
  getCategoryAttributes,
  getCategoryById,
  getCategoryProducts,
  getCategoryTree,
  moveCategory,
  removeProductFromCategory,
  updateCategory,
  updateProductInCategory,
} from "../adobe/categories/api-categories";
import {
  mapCreateCategoryInputToApiPayload,
  mapUpdateCategoryInputToApiPayload,
  mapMoveCategoryInputToApiPayload,
  mapAssignProductToCategoryInputToApiPayload,
  mapUpdateProductInCategoryInputToApiPayload,
} from "../adobe/categories/mapping/category-mapping";
import {
  createCategoryInputSchema,
  getCategoryByIdInputSchema,
  getCategoryTreeInputSchema,
  updateCategoryInputSchema,
  deleteCategoryInputSchema,
  moveCategoryInputSchema,
  getCategoryAttributeByCodeInputSchema,
  getCategoryAttributeOptionsInputSchema,
  getCategoryProductsInputSchema,
  assignProductToCategoryInputSchema,
  updateProductInCategoryInputSchema,
  removeProductFromCategoryInputSchema,
} from "../adobe/categories/schemas";
import { Category, CategoryAttribute, CategoryProductLink } from "../adobe/categories/types/category";
import { buildSearchCriteriaFromInput } from "../adobe/search-criteria/index";
import { searchCriteriaInputSchema } from "../adobe/search-criteria/schema";
import { toolTextResponse } from "./tool-response";

// @TODO define fields that can be searched for in the search tools
export function registerCategoriesTools(server: McpServer, client: AdobeCommerceClient) {
  registerSearchCategoryTool(server, client);
  registerGetCategoryTreeTool(server, client);
  registerGetCategoryByIdTool(server, client);
  registerCreateCategoryTool(server, client);
  registerUpdateCategoryTool(server, client);
  registerDeleteCategoryTool(server, client);
  registerMoveCategoryTool(server, client);
  registerGetCategoryAttributesTool(server, client);
  registerGetCategoryAttributeByCodeTool(server, client);
  registerGetCategoryAttributeOptionsTool(server, client);
  registerGetCategoryProductsTool(server, client);
  registerAssignProductToCategoryTool(server, client);
  registerUpdateProductInCategoryTool(server, client);
  registerRemoveProductFromCategoryTool(server, client);
}

function registerSearchCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "search-categories",
    {
      title: "Search Categories",
      description: "Search for categories in Adobe Commerce with flexible search filters.",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getCategories(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Categories</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item: Category) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerGetCategoryTreeTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-category-tree",
    {
      title: "Get Category Tree",
      description: "Retrieve the category tree structure with optional root category and depth parameters.",
      inputSchema: getCategoryTreeInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getCategoryTreeInputSchema).parse(args);

      const result = await getCategoryTree(client, parsed.rootCategoryId, parsed.depth);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Category Tree</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerGetCategoryByIdTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-category-by-id",
    {
      title: "Get Category by ID",
      description: "Retrieve a specific category by its ID.",
      inputSchema: getCategoryByIdInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(getCategoryByIdInputSchema).parse(args);

      const result = await getCategoryById(client, parsed.categoryId, parsed.storeId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerCreateCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "create-category",
    {
      title: "Create Category",
      description: "Create a new category in Adobe Commerce.",
      inputSchema: createCategoryInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args: unknown) => {
      const parsed = z.object(createCategoryInputSchema).parse(args);
      const categoryPayload = mapCreateCategoryInputToApiPayload(parsed);

      const result = await createCategory(client, categoryPayload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Created Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerUpdateCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-category",
    {
      title: "Update Category",
      description: "Update an existing category in Adobe Commerce.",
      inputSchema: updateCategoryInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(updateCategoryInputSchema).parse(args);

      const categoryPayload = mapUpdateCategoryInputToApiPayload(parsed);
      const result = await updateCategory(client, parsed.categoryId, categoryPayload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Updated Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerDeleteCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "delete-category",
    {
      title: "Delete Category",
      description: "Delete a category by its ID.",
      inputSchema: deleteCategoryInputSchema,
      annotations: {
        readOnlyHint: false,
      },
    },
    async (args) => {
      const parsed = z.object(deleteCategoryInputSchema).parse(args);

      const result = await deleteCategory(client, parsed.categoryId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data ? `Category with ID ${parsed.categoryId} has been successfully deleted.` : `Failed to delete category with ID ${parsed.categoryId}.`;
        return `
        <meta>
          <name>Delete Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${successMessage}
        </data>
      `;
      });
    }
  );
}

function registerMoveCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "move-category",
    {
      title: "Move Category",
      description: "Move a category to a new parent category.",
      inputSchema: moveCategoryInputSchema,
    },
    async (args) => {
      const parsed = z.object(moveCategoryInputSchema).parse(args);

      const movePayload = mapMoveCategoryInputToApiPayload(parsed);
      const result = await moveCategory(client, parsed.categoryId, movePayload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data ? `Category with ID ${parsed.categoryId} has been successfully moved to parent category with ID ${parsed.parentId}.` : `Failed to move category with ID ${parsed.categoryId} to parent category with ID ${parsed.parentId}.`;
        return `
        <meta>
          <name>Move Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${successMessage}
        </data>
      `;
      });
    }
  );
}

function registerGetCategoryAttributesTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-category-attributes",
    {
      title: "Get Category Attributes",
      description: "Retrieve category attributes with optional search criteria.",
      inputSchema: searchCriteriaInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z.object(searchCriteriaInputSchema).parse(args);
      const searchCriteria = buildSearchCriteriaFromInput(parsed);
      const result = await getCategoryAttributes(client, searchCriteria);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Category Attributes</name>
          <page>${searchCriteria.page}</page>
          <pageSize>${searchCriteria.pageSize}</pageSize>
          <endpoint>${endpoint}</endpoint>
          <totalItems>${data?.length}</totalItems>
        </meta>

        <data>
          ${data?.map((item: CategoryAttribute) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerGetCategoryAttributeByCodeTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-category-attribute-by-code",
    {
      title: "Get Category Attribute by Code",
      description: "Retrieve a specific category attribute by its code.",
      inputSchema: getCategoryAttributeByCodeInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z
        .object({
          attributeCode: z.string(),
        })
        .parse(args);

      const result = await getCategoryAttributeByCode(client, parsed.attributeCode);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Category Attribute</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerGetCategoryAttributeOptionsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-category-attribute-options",
    {
      title: "Get Category Attribute Options",
      description: "Retrieve options for a specific category attribute.",
      inputSchema: getCategoryAttributeOptionsInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z.object(getCategoryAttributeOptionsInputSchema).parse(args);

      const result = await getCategoryAttributeOptions(client, parsed.attributeCode);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Category Attribute Options</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${JSON.stringify(data)}
        </data>
      `;
      });
    }
  );
}

function registerGetCategoryProductsTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "get-category-products",
    {
      title: "Get Category Products",
      description: "Retrieve products assigned to a specific category.",
      inputSchema: getCategoryProductsInputSchema,
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args) => {
      const parsed = z.object(getCategoryProductsInputSchema).parse(args);

      const result = await getCategoryProducts(client, parsed.categoryId);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        return `
        <meta>
          <name>Category Products</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${data?.map((item: CategoryProductLink) => JSON.stringify(item)).join("\n")}
        </data>
      `;
      });
    }
  );
}

function registerAssignProductToCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "assign-product-to-category",
    {
      title: "Assign Product to Category",
      description: "Assign a product to a specific category.",
      inputSchema: assignProductToCategoryInputSchema,
    },
    async (args) => {
      const parsed = z.object(assignProductToCategoryInputSchema).parse(args);

      const productLinkPayload = mapAssignProductToCategoryInputToApiPayload(parsed);
      const result = await assignProductToCategory(client, parsed.categoryId, productLinkPayload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data ? `Product with SKU ${parsed.productLink.sku} has been successfully assigned to category with ID ${parsed.categoryId}.` : `Failed to assign product with SKU ${parsed.productLink.sku} to category with ID ${parsed.categoryId}.`;
        return `
        <meta>
          <name>Assign Product to Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${successMessage}
        </data>
      `;
      });
    }
  );
}

function registerUpdateProductInCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "update-product-in-category",
    {
      title: "Update Product in Category",
      description: "Update a product's assignment in a category.",
      inputSchema: updateProductInCategoryInputSchema,
    },
    async (args) => {
      const parsed = z.object(updateProductInCategoryInputSchema).parse(args);

      const productLinkPayload = mapUpdateProductInCategoryInputToApiPayload(parsed);
      const result = await updateProductInCategory(client, parsed.categoryId, productLinkPayload);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data ? `Product with SKU ${parsed.productLink.sku} has been successfully updated in category with ID ${parsed.categoryId}.` : `Failed to update product with SKU ${parsed.productLink.sku} in category with ID ${parsed.categoryId}.`;
        return `
        <meta>
          <name>Update Product in Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${successMessage}
        </data>
      `;
      });
    }
  );
}

function registerRemoveProductFromCategoryTool(server: McpServer, client: AdobeCommerceClient) {
  server.registerTool(
    "remove-product-from-category",
    {
      title: "Remove Product from Category",
      description: "Remove a product from a specific category.",
      inputSchema: removeProductFromCategoryInputSchema,
    },
    async (args) => {
      const parsed = z.object(removeProductFromCategoryInputSchema).parse(args);

      const result = await removeProductFromCategory(client, parsed.categoryId, parsed.sku);

      return toolTextResponse(result, (resp) => {
        const { data, endpoint } = resp;
        const successMessage = data ? `Product with SKU ${parsed.sku} has been successfully removed from category with ID ${parsed.categoryId}.` : `Failed to remove product with SKU ${parsed.sku} from category with ID ${parsed.categoryId}.`;
        return `
        <meta>
          <name>Remove Product from Category</name>
          <endpoint>${endpoint}</endpoint>
        </meta>

        <data>
          ${successMessage}
        </data>
      `;
      });
    }
  );
}
