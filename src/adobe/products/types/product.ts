export interface Product {
  sku: string;
  name?: string;
  price?: number;
  // Add more fields as needed
}

export const PRODUCT_ENTITY_TYPE_ID = 4;
export const DEFAULT_ATTRIBUTE_SET_ID = 4;

export interface ProductAttribute {
  attribute_id?: number;
  attribute_code: string;
  entity_type_id: number;
  default_frontend_label?: string;
  frontend_labels?: Array<{ store_id: number; label: string }>;
  is_required?: boolean;
  default_value?: string;
  frontend_input?: string;
  is_visible_on_front?: boolean;
  is_searchable?: boolean;
  is_visible_in_advanced_search?: boolean;
  is_filterable?: boolean;
  is_filterable_in_search?: boolean;
  options?: Array<{
    label: string;
    value?: string;
    sort_order?: number;
    is_default?: boolean;
    store_labels?: Array<{ store_id: number; label: string }>;
  }>;
  is_wysiwyg_enabled?: boolean;
  is_html_allowed_on_front?: boolean;
  used_for_sort_by?: boolean;
  is_filterable_in_grid?: boolean;
  is_used_in_grid?: boolean;
  is_visible_in_grid?: boolean;
  position?: number;
  apply_to?: string[];
  is_used_for_promo_rules?: boolean;
  is_visible?: boolean;
  scope?: string;
  is_user_defined?: boolean;
  backend_type?: string;
  is_unique?: boolean;
  frontend_class?: string;
  validation_rules?: unknown[];
}

export interface AttributeSet {
  attribute_set_id?: number;
  attribute_set_name?: string;
  entity_type_id: number;
  sort_order?: number;
  skeleton_id?: number;
}

export interface AttributeGroup {
  attribute_group_id?: number;
  attribute_group_name: string;
  attribute_set_id: number;
}
