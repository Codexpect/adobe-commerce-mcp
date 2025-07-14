export enum ConditionType {
  EQ = "eq", // Equals
  FINSET = "finset", // A value within a set of values
  FROM = "from", // The beginning of a range. Must be used with to.
  GT = "gt", // Greater than
  GTEQ = "gteq", // Greater than or equal
  IN = "in", // In. The value can contain a comma-separated list of values.
  LIKE = "like", // Like. The value can contain the SQL wildcard characters when like is specified.
  LT = "lt", // Less than
  LTEQ = "lteq", // Less than or equal
  MOREQ = "moreq", // More or equal
  NEQ = "neq", // Not equal
  NFINSET = "nfinset", // A value that is not within a set of values.
  NIN = "nin", // Not in. The value can contain a comma-separated list of values.
  NLIKE = "nlike", // Not like
  NOTNULL = "notnull", // Not null
  NULL = "null", // Null
  TO = "to", // The end of a range. Must be used with from.
}

export type SearchCriteriaFilter = {
  field: string;
  value: string | number;
  conditionType?: ConditionType;
};

export interface SearchCriteria {
  page?: number;
  pageSize?: number;
  filters?: SearchCriteriaFilter[];
}
