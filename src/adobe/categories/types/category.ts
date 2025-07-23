export interface Category {
  id?: number;
  parent_id?: number;
  name?: string;
  is_active?: boolean;
  position?: number;
  level?: number;
  children?: string;
  created_at?: string;
  updated_at?: string;
  path?: string;
  available_sort_by?: string[];
  include_in_menu?: boolean;
  extension_attributes?: CategoryExtensionAttributes;
  custom_attributes?: CustomAttribute[];
  [key: string]: unknown;
}

export interface CategoryTree extends Omit<Category, 'children'> {
  product_count?: number;
  children_data?: CategoryTree[];
}

export interface CategoryAttribute {
  attribute_id?: number;
  attribute_code: string;
  frontend_input: string;
  entity_type_id: string;
  is_required: boolean;
  is_wysiwyg_enabled?: boolean;
  is_html_allowed_on_front?: boolean;
  used_for_sort_by?: boolean;
  is_filterable?: boolean;
  is_filterable_in_search?: boolean;
  is_used_in_grid?: boolean;
  is_visible_in_grid?: boolean;
  is_filterable_in_grid?: boolean;
  position?: number;
  apply_to?: string[];
  is_searchable?: string;
  is_visible_in_advanced_search?: string;
  is_comparable?: string;
  is_used_for_promo_rules?: string;
  is_visible_on_front?: string;
  used_in_product_listing?: string;
  is_visible?: boolean;
  scope?: string;
  extension_attributes?: CategoryAttributeExtensionAttributes;
  options?: AttributeOption[];
  is_user_defined?: boolean;
  default_frontend_label?: string;
  frontend_labels?: FrontendLabel[];
  note?: string;
  backend_type?: string;
  backend_model?: string;
  source_model?: string;
  default_value?: string;
  is_unique?: string;
  frontend_class?: string;
  validation_rules?: ValidationRule[];
  custom_attributes?: CustomAttribute[];
}

export interface CategoryProductLink {
  sku?: string;
  position?: number;
  category_id: number;
  extension_attributes?: CategoryProductLinkExtensionAttributes;
}

export interface CategoryExtensionAttributes {
  [key: string]: unknown;
}

export interface CategoryAttributeExtensionAttributes {
  [key: string]: unknown;
}

export interface CategoryProductLinkExtensionAttributes {
  [key: string]: unknown;
}

export interface AttributeOption {
  label?: string;
  value?: string;
  sort_order?: number;
  is_default?: boolean;
  store_labels?: StoreLabel[];
}

export interface FrontendLabel {
  store_id?: number;
  label?: string;
}

export interface StoreLabel {
  store_id?: number;
  label?: string;
}

export interface ValidationRule {
  key?: string;
  value?: string;
}

export interface CustomAttribute {
  attribute_code?: string;
  value?: unknown;
}

// Note: CategorySearchResults and CategoryAttributeSearchResults are now defined in api-categories.ts
// to use the centralized SearchCriteria type from search-criteria module

export interface CategoryMoveRequest {
  parentId: number;
  afterId?: number;
}
