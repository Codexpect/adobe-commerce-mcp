import { ConditionType, SearchCriteria, SearchCriteriaFilter } from "./types/search-criteria.js";

export function buildSearchCriteriaQuery(options: SearchCriteria): string {
  const { page = 1, pageSize = 20, filters = [], sortOrders = [] } = options;

  let searchCriteria = `searchCriteria[currentPage]=${page}&searchCriteria[pageSize]=${pageSize}`;

  if (filters.length > 0) {
    filters.forEach((filter: SearchCriteriaFilter, i: number) => {
      const { field, value, conditionType = "eq" } = filter;
      searchCriteria += `&searchCriteria[filter_groups][${i}][filters][0][field]=${encodeURIComponent(field)}`;
      searchCriteria += `&searchCriteria[filter_groups][${i}][filters][0][value]=${encodeURIComponent(String(value))}`;
      searchCriteria += `&searchCriteria[filter_groups][${i}][filters][0][condition_type]=${encodeURIComponent(conditionType)}`;
    });
  }

  if (sortOrders.length > 0) {
    sortOrders.forEach((sort, i) => {
      searchCriteria += `&searchCriteria[sortOrders][${i}][field]=${encodeURIComponent(sort.field)}`;
      searchCriteria += `&searchCriteria[sortOrders][${i}][direction]=${encodeURIComponent(sort.direction)}`;
    });
  }

  return searchCriteria;
}

export function mapFiltersToConditionType(filters: { field: string; value: string | number; conditionType?: string }[]): SearchCriteriaFilter[] {
  return filters.map((f) => ({
    ...f,
    conditionType: toConditionType(f.conditionType),
  }));
}

function toConditionType(value?: string): ConditionType | undefined {
  if (!value) return undefined;
  const key = value.toUpperCase() as keyof typeof ConditionType;
  return ConditionType[key];
}
