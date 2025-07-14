export interface Customer {
  id: number;
  email: string;
  firstname?: string;
  lastname?: string;
  group_id?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
} 