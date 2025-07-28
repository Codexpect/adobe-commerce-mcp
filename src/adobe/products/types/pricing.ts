export interface BasePrice {
  price: number;
  store_id: number;
  sku: string;
}

export interface SpecialPrice {
  price: number;
  store_id: number;
  sku: string;
  price_from?: string; // Y-m-d H:i:s format
  price_to?: string; // Y-m-d H:i:s format
}

export interface TierPrice {
  price: number;
  price_type: "fixed" | "discount";
  website_id: number;
  sku: string;
  customer_group: string;
  quantity: number;
}

export interface Cost {
  cost: number;
  store_id: number;
  sku: string;
}

export interface PriceUpdateResult {
  sku: string;
  message?: string;
  status: "success" | "failed";
}
