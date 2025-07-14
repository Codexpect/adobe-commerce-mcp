import { AdobeCommerceClient } from "./adobe-commerce-client.js";
import type { Product } from "./types/product.js";
import type { SearchCriteria } from "./types/search-criteria.js";

export async function getProducts(client: AdobeCommerceClient, options: SearchCriteria = {}): Promise<{ items: Product[]; endpoint: string } | null> {
  const { page = 1, pageSize = 20, filters = [] } = options;

  let searchCriteria = `searchCriteria[currentPage]=${page}&searchCriteria[pageSize]=${pageSize}`;

  if (filters.length > 0) {
    filters.forEach((filter, i) => {
      const { field, value, conditionType = "eq" } = filter;
      searchCriteria += `&searchCriteria[filter_groups][${i}][filters][0][field]=${encodeURIComponent(field)}`;
      searchCriteria += `&searchCriteria[filter_groups][${i}][filters][0][value]=${encodeURIComponent(String(value))}`;
      searchCriteria += `&searchCriteria[filter_groups][${i}][filters][0][condition_type]=${encodeURIComponent(conditionType)}`;
    });
  }

  const endpoint = `/products?${searchCriteria}`;
  const data = await client.get<{ items: Product[] }>(endpoint);
  if (!data || !data.items) {
    return null;
  }
  return { items: data.items, endpoint };
}
