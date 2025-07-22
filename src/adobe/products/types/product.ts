export interface Product {
  id?: number;
  sku: string;
  name?: string;
  price?: number;
  attribute_set_id?: number;
  status?: number;
  visibility?: number;
  type_id?: string;
  created_at?: string;
  updated_at?: string;
  weight?: number;
  description?: string;
  short_description?: string;
  meta_title?: string;
  meta_keyword?: string;
  meta_description?: string;
  extension_attributes?: {
    website_ids?: number[];
    category_links?: Array<{
      position?: number;
      category_id: string;
    }>;
  };
  product_links?: Array<{
    link_type?: string;
    linked_product_sku?: string;
    linked_product_type?: string;
    position?: number;
    sku?: string;
  }>;
  options?: Array<{
    product_sku?: string;
    option_id?: number;
    title?: string;
    type?: string;
    sort_order?: number;
    is_require?: boolean;
    price?: number;
    price_type?: string;
    sku?: string;
    file_extension?: string;
    max_characters?: number;
    image_size_x?: number;
    image_size_y?: number;
    values?: Array<{
      title?: string;
      sort_order?: number;
      price?: number;
      price_type?: string;
      sku?: string;
      option_type_id?: number;
    }>;
  }>;
  media_gallery_entries?: Array<{
    id?: number;
    media_type?: string;
    label?: string;
    position?: number;
    disabled?: boolean;
    types?: string[];
    file?: string;
    content?: {
      base64_encoded_data?: string;
      type?: string;
      name?: string;
    };
    extension_attributes?: {
      video_content?: {
        media_type?: string;
        video_provider?: string;
        video_url?: string;
        video_title?: string;
        video_description?: string;
        video_metadata?: string;
      };
    };
  }>;
  tier_prices?: Array<{
    customer_group_id?: number;
    qty?: number;
    value?: number;
    extension_attributes?: {
      website_id?: number;
      percentage_value?: number;
    };
  }>;
  custom_attributes?: Array<{
    attribute_code: string;
    value: string | number | boolean;
  }>;
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
