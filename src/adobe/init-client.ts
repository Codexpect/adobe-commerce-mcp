import { AdobeImsParams, CommerceParams } from "./types/commerce.js";
import { AdobeCommerceClient } from "./adobe-commerce-client.js";

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
