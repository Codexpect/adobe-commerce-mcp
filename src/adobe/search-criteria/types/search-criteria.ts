export type SearchCriteriaFilter = {
  field: string;
  value: string | number;
  conditionType?: ConditionType;
};

export type SortOrder = {
  field: string;
  direction: "ASC" | "DESC";
};

export interface SearchCriteria {
  page?: number;
  pageSize?: number;
  filters?: SearchCriteriaFilter[];
  sortOrders?: SortOrder[];
}

export enum ConditionType {
  EQ = "eq",
  FINSET = "finset",
  FROM = "from",
  GT = "gt",
  GTEQ = "gteq",
  IN = "in",
  LIKE = "like",
  LT = "lt",
  LTEQ = "lteq",
  MOREQ = "moreq",
  NEQ = "neq",
  NFINSET = "nfinset",
  NIN = "nin",
  NLIKE = "nlike",
  NOTNULL = "notnull",
  NULL = "null",
  TO = "to",
}
