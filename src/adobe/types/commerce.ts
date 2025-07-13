export interface CommerceParams {
  COMMERCE_BASE_URL: string;
  COMMERCE_CONSUMER_KEY: string;
  COMMERCE_CONSUMER_SECRET: string;
  COMMERCE_ACCESS_TOKEN: string;
  COMMERCE_ACCESS_TOKEN_SECRET: string;
}

export interface AdobeImsParams {
  COMMERCE_BASE_URL: string;
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
  OAUTH_SCOPES?: string[];
  OAUTH_HOST?: string;
}

export interface RequestData {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
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

export interface Product {
  sku: string;
  name?: string;
  price?: number;
  // Add more fields as needed
}
