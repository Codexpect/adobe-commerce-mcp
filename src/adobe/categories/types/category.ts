export interface Category {
  id: number;
  parent_id?: number;
  name: string;
  is_active?: boolean;
  position?: number;
  level?: number;
  children_data?: Category[];
  [key: string]: unknown;
}
