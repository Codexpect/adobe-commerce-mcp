export interface Product {
  sku: string;
  name?: string;
  price?: number;
  // Add more fields as needed
}

export interface ProductAttribute {
  attribute_code: string;
  attribute_id: number;
  // Add more fields as needed
}
