import { AdobeCommerceClient } from "./adobe-commerce-client.js";

export async function getProducts(client: AdobeCommerceClient, page: number = 1, pageSize: number = 20): Promise<any[] | null> {
  const searchCriteria = `searchCriteria[currentPage]=${page}&searchCriteria[pageSize]=${pageSize}`;
  const endpoint = `/products?${searchCriteria}`;
  const data = await client.get<any>(endpoint);
  if (!data || !data.items) {
    return null;
  }
  return data.items;
}
