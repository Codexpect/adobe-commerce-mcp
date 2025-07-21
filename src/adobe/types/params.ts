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

