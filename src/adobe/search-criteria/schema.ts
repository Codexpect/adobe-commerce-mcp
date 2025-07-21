import { z } from "zod";
import { ConditionType } from "./types/search-criteria";

const conditionTypeDescriptions: Record<ConditionType, string> = {
  [ConditionType.EQ]: "Equals - exact match",
  [ConditionType.FINSET]: "A value within a set of values",
  [ConditionType.FROM]: "The beginning of a range. Must be used with 'to' condition",
  [ConditionType.GT]: "Greater than",
  [ConditionType.GTEQ]: "Greater than or equal",
  [ConditionType.IN]: "In - the value can contain a comma-separated list of values",
  [ConditionType.LIKE]: "Like - the value can contain SQL wildcard characters (% and _)",
  [ConditionType.LT]: "Less than",
  [ConditionType.LTEQ]: "Less than or equal",
  [ConditionType.MOREQ]: "More or equal",
  [ConditionType.NEQ]: "Not equal",
  [ConditionType.NFINSET]: "A value that is not within a set of values",
  [ConditionType.NIN]: "Not in - the value can contain a comma-separated list of values",
  [ConditionType.NLIKE]: "Not like - the value can contain SQL wildcard characters",
  [ConditionType.NOTNULL]: "Not null",
  [ConditionType.NULL]: "Null",
  [ConditionType.TO]: "The end of a range. Must be used with 'from' condition",
};

const conditionTypeValues = Object.values(ConditionType) as [string, ...string[]];

const filterSchema = z.object({
  field: z.string().min(1, "Field name cannot be empty").describe("Product field to filter by (e.g., 'name', 'sku', 'price', etc.)"),
  value: z
    .union([
      z
        .string()
        .describe("Value to search for. For 'like' conditions, the value will be automatically wrapped with % wildcards unless already present."),
      z.number(),
    ])
    .describe("Value to search for"),
  conditionType: z
    .enum(conditionTypeValues)
    .optional()
    .describe(
      `Condition type. Available options: ${Object.entries(conditionTypeDescriptions)
        .map(([key, desc]) => `${key} (${desc})`)
        .join(", ")}. Default is 'eq'.`
    ),
});

const sortOrderSchema = z.object({
  field: z.string().min(1, "Sorting field cannot be empty").describe("Sorting field."),
  direction: z.enum(["ASC", "DESC"]).describe("Sorting direction."),
});

export const searchCriteriaInputSchema = {
  page: z.number().int().min(1).default(1).describe("Page number to retrieve. Default 1."),
  pageSize: z.number().int().min(1).max(10).default(10).describe("Number of results to retrieve per page. Max 10."),
  filters: z.array(filterSchema).optional().describe("Array of filters to apply to the search."),
  sortOrders: z
    .array(sortOrderSchema)
    .optional()
    .describe("Array of sort orders to apply. Each object must specify a field and direction (ASC or DESC)."),
};

export type SearchCriteriaInput = z.infer<ReturnType<typeof z.object<typeof searchCriteriaInputSchema>>>;
