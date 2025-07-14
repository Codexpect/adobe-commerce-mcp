export interface Order {
  entity_id: number;
  increment_id: string;
  status?: string;
  customer_id?: number;
  grand_total?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
} 