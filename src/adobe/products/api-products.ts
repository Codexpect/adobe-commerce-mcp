import { AdobeCommerceClient } from "../adobe-commerce-client.js";
import { buildSearchCriteriaQuery } from "../search-criteria/index.js";
import type { SearchCriteria } from "../search-criteria/types/search-criteria.js";
import type { Product } from "./types/product.js";

export async function getProducts(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<{ items: Product[]; endpoint: string } | null> {
  const searchCriteria = buildSearchCriteriaQuery(options);
  const endpoint = `/products?${searchCriteria}`;
  const data = await client.get<{ items: Product[] }>(endpoint);

  if (!data || !data.items) {
    return null;
  }

  return { items: data.items, endpoint };
}
