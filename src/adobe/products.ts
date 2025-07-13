import { AdobeCommerceClient } from "./adobe-commerce-client.js";
import { CommerceParams } from "../types/commerce.js";

const params: CommerceParams = {
  COMMERCE_BASE_URL: process.env.COMMERCE_BASE_URL!,
  COMMERCE_CONSUMER_KEY: process.env.COMMERCE_CONSUMER_KEY!,
  COMMERCE_CONSUMER_SECRET: process.env.COMMERCE_CONSUMER_SECRET!,
  COMMERCE_ACCESS_TOKEN: process.env.COMMERCE_ACCESS_TOKEN!,
  COMMERCE_ACCESS_TOKEN_SECRET: process.env.COMMERCE_ACCESS_TOKEN_SECRET!,
  COMMERCE_STORE_CODES: process.env.COMMERCE_STORE_CODES!,
};

const client = AdobeCommerceClient.create(params, params.COMMERCE_STORE_CODES);

export async function getProducts(page: number = 1, pageSize: number = 20): Promise<any[] | null> {
  const searchCriteria = `searchCriteria[currentPage]=${page}&searchCriteria[pageSize]=${pageSize}`;
  const endpoint = `/products?${searchCriteria}`;
  const data = await client.get<any>(endpoint);
  if (!data || !data.items) {
    return null;
  }
  return data.items;
} 