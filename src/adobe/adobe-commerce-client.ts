import { getImsAccessToken, ImsAuthParams } from "@adobe/commerce-sdk-auth";
import axios, { AxiosResponse } from "axios";
import crypto from "crypto";
import https from "https";
import Oauth1a from "oauth-1.0a";
import { AdobeImsParams, CommerceParams, RequestData } from "./types/params";

export interface OAuth1aConfig {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface ImsConfig {
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  host?: string;
}

export interface AdobeCommerceClientOptions {
  url: string;
  version?: string;
  auth:
    | {
        type: "oauth1a";
        oauth1a: OAuth1aConfig;
      }
    | {
        type: "ims";
        ims: ImsConfig;
      };
}

export class AdobeCommerceClient {
  private serverUrl: string;
  private apiVersion: string;
  private oauth?: Oauth1a;
  private token?: { key: string; secret: string };
  private authConfig: AdobeCommerceClientOptions["auth"];
  private imsToken?: string;
  private imsTokenExpiry?: Date;

  constructor(options: AdobeCommerceClientOptions) {
    this.serverUrl = options.url;
    this.apiVersion = options.version || "V1";
    this.authConfig = options.auth;

    if (this.authConfig.type === "oauth1a") {
      this.initializeOAuth1a();
    }
  }

  private initializeOAuth1a(): void {
    if (this.authConfig.type !== "oauth1a") {
      throw new Error("OAuth 1.0a configuration is required when auth type is oauth1a");
    }

    this.oauth = new Oauth1a({
      consumer: {
        key: this.authConfig.oauth1a.consumerKey,
        secret: this.authConfig.oauth1a.consumerSecret,
      },
      signature_method: "HMAC-SHA256",
      hash_function: this.hashFunctionSha256,
    });
    this.token = {
      key: this.authConfig.oauth1a.accessToken,
      secret: this.authConfig.oauth1a.accessTokenSecret,
    };
  }

  /**
   * Creates an AdobeCommerceClient instance with automatic authentication method detection
   *
   * @param params - CommerceParams (for OAuth 1.0a) or AdobeImsParams (for IMS)
   * @returns AdobeCommerceClient instance
   */
  public static create(params: CommerceParams | AdobeImsParams): AdobeCommerceClient {
    // Detect authentication type based on parameter structure
    if ("COMMERCE_CONSUMER_KEY" in params) {
      // OAuth 1.0a authentication (has Commerce-specific fields)
      const commerceParams = params as CommerceParams;
      return this.createWithOAuth1a(commerceParams);
    } else {
      // IMS authentication (has OAUTH_CLIENT_ID but not Commerce fields)
      const adobeImsParams = params as AdobeImsParams;
      return this.createWithIms(adobeImsParams);
    }
  }

  private static createWithIms(adobeImsParams: AdobeImsParams): AdobeCommerceClient {
    const clientOptions: AdobeCommerceClientOptions = {
      url: `${adobeImsParams.COMMERCE_BASE_URL}rest/`,
      version: "V1",
      auth: {
        type: "ims",
        ims: {
          clientId: adobeImsParams.OAUTH_CLIENT_ID,
          clientSecret: adobeImsParams.OAUTH_CLIENT_SECRET,
          scopes: adobeImsParams.OAUTH_SCOPES || ["AdobeID", "read_organizations", "openid"],
          host: adobeImsParams.OAUTH_HOST,
        },
      },
    };

    return new AdobeCommerceClient(clientOptions);
  }

  private static createWithOAuth1a(commerceParams: CommerceParams): AdobeCommerceClient {
    const clientOptions: AdobeCommerceClientOptions = {
      url: `${commerceParams.COMMERCE_BASE_URL}rest/`,
      version: "V1",
      auth: {
        type: "oauth1a",
        oauth1a: {
          consumerKey: commerceParams.COMMERCE_CONSUMER_KEY,
          consumerSecret: commerceParams.COMMERCE_CONSUMER_SECRET,
          accessToken: commerceParams.COMMERCE_ACCESS_TOKEN,
          accessTokenSecret: commerceParams.COMMERCE_ACCESS_TOKEN_SECRET,
        },
      },
    };
    return new AdobeCommerceClient(clientOptions);
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (this.authConfig.type === "ims") {
      // Check if token is expired or doesn't exist
      if (!this.imsToken || (this.imsTokenExpiry && new Date() >= this.imsTokenExpiry)) {
        const imsParams: ImsAuthParams = {
          clientId: this.authConfig.ims.clientId,
          clientSecret: this.authConfig.ims.clientSecret,
          scopes: this.authConfig.ims.scopes || ["AdobeID", "read_organizations", "openid"],
          host: this.authConfig.ims.host,
        };

        const tokenResponse = await getImsAccessToken(imsParams);
        this.imsToken = tokenResponse.access_token;
        // Set expiry time slightly before actual expiry for safety
        this.imsTokenExpiry = new Date(Date.now() + (tokenResponse.expires_in - 60) * 1000);
      }

      return {
        Authorization: `Bearer ${this.imsToken}`,
      };
    } else {
      if (!this.oauth || !this.token) {
        throw new Error("OAuth 1.0a is not properly initialized");
      }

      const requestData: RequestData = {
        url: "", // Will be set by caller
        method: "GET", // Will be set by caller
      };

      const oauthHeader = this.oauth.toHeader(this.oauth.authorize(requestData, this.token));
      return oauthHeader as unknown as Record<string, string>;
    }
  }

  public async get<T = unknown>(resourceUrl: string, requestToken = "", storeCode?: string): Promise<T> {
    const requestData: RequestData = {
      url: this.createUrl(resourceUrl, storeCode),
      method: "GET",
    };
    return this.apiCall(requestData, requestToken) as Promise<T>;
  }

  public async post(
    resourceUrl: string,
    data: unknown,
    requestToken = "",
    customHeaders: Record<string, string> = {},
    storeCode?: string
  ): Promise<unknown> {
    const requestData: RequestData = {
      url: this.createUrl(resourceUrl, storeCode),
      method: "POST",
      body: data,
    };
    return this.apiCall(requestData, requestToken, customHeaders);
  }

  public async put(
    resourceUrl: string,
    data: Record<string, unknown>,
    requestToken = "",
    customHeaders: Record<string, string> = {},
    storeCode?: string
  ): Promise<unknown> {
    const requestData: RequestData = {
      url: this.createUrl(resourceUrl, storeCode),
      method: "PUT",
      body: data,
    };
    return this.apiCall(requestData, requestToken, customHeaders);
  }

  public async delete(resourceUrl: string, requestToken = "", storeCode?: string): Promise<unknown> {
    const requestData: RequestData = {
      url: this.createUrl(resourceUrl, storeCode),
      method: "DELETE",
    };
    return this.apiCall(requestData, requestToken);
  }

  private hashFunctionSha256(baseString: string, key: string): string {
    return crypto.createHmac("sha256", key).update(baseString).digest("base64");
  }

  private createUrl(resourceUrl: string, storeCode?: string): string {
    if (storeCode) {
      return `${this.serverUrl}${storeCode}/${this.apiVersion}${resourceUrl}`;
    }
    return `${this.serverUrl}${this.apiVersion}${resourceUrl}`;
  }

  private async apiCall(requestData: RequestData, requestToken = "", customHeaders: Record<string, string> = {}): Promise<unknown> {
    try {
      let authHeaders: Record<string, string> = {};

      if (requestToken) {
        // Use provided request token (Bearer token)
        authHeaders = { Authorization: `Bearer ${requestToken}` };
      } else {
        // Use configured authentication method
        if (this.authConfig.type === "ims") {
          authHeaders = await this.getAuthHeaders();
        } else {
          // For OAuth 1.0a, we need to authorize the specific request
          if (!this.oauth || !this.token) {
            throw new Error("OAuth 1.0a is not properly initialized");
          }
          const oauthHeader = this.oauth.toHeader(this.oauth.authorize(requestData, this.token));
          authHeaders = oauthHeader as unknown as Record<string, string>;
        }
      }

      const headers = {
        ...authHeaders,
        ...customHeaders,
      };

      const response: AxiosResponse = await axios({
        url: requestData.url,
        method: requestData.method,
        headers,
        data: requestData.body,
        responseType: "json",
        // Handle SSL certificate issues for development/testing environments
        httpsAgent: new https.Agent({
          rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
        }),
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error && (error as { response?: { data?: unknown } }).response?.data) {
        console.error(`Error body ${requestData.url}: ${JSON.stringify((error as { response: { data: unknown } }).response.data)}`);
      }
      throw error;
    }
  }
}

/**
 * Initializes and returns an AdobeCommerceClient using environment variables.
 *
 * For OAuth1a, set:
 *   COMMERCE_BASE_URL, COMMERCE_CONSUMER_KEY, COMMERCE_CONSUMER_SECRET, COMMERCE_ACCESS_TOKEN, COMMERCE_ACCESS_TOKEN_SECRET, COMMERCE_STORE_CODES
 *
 * For IMS, set:
 *   COMMERCE_BASE_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, [OAUTH_SCOPES], [OAUTH_HOST], [COMMERCE_STORE_CODES]
 */
export function initAdobeCommerceClient(): AdobeCommerceClient {
  const params: AdobeImsParams | CommerceParams = {
    COMMERCE_BASE_URL: process.env.COMMERCE_BASE_URL!,

    OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID!,
    OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET!,
    OAUTH_SCOPES: process.env.OAUTH_SCOPES ? process.env.OAUTH_SCOPES.split(",") : [],
    OAUTH_HOST: process.env.OAUTH_HOST,

    COMMERCE_CONSUMER_KEY: process.env.COMMERCE_CONSUMER_KEY,
    COMMERCE_CONSUMER_SECRET: process.env.COMMERCE_CONSUMER_SECRET,
    COMMERCE_ACCESS_TOKEN: process.env.COMMERCE_ACCESS_TOKEN,
    COMMERCE_ACCESS_TOKEN_SECRET: process.env.COMMERCE_ACCESS_TOKEN_SECRET,
  };

  return AdobeCommerceClient.create(params);
}
