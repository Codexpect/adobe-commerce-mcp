/**
 * Store management type definitions for Adobe Commerce
 */

export interface Store {
  id: number;
  code: string;
  name: string;
  website_id: number;
  store_group_id: number;
  is_active: number;
  extension_attributes?: Record<string, any>;
}

export interface Website {
  id: number;
  code: string;
  name: string;
  default_group_id: number;
  extension_attributes?: Record<string, any>;
}

export interface StoreGroup {
  id: number;
  website_id: number;
  root_category_id: number;
  default_store_id: number;
  name: string;
  code: string;
  extension_attributes?: Record<string, any>;
}

export interface StoreConfig {
  id: number;
  code: string;
  website_id: number;
  locale: string;
  base_currency_code: string;
  default_display_currency_code: string;
  timezone: string;
  weight_unit: string;
  base_url: string;
  base_link_url: string;
  base_static_url: string;
  base_media_url: string;
  secure_base_url: string;
  secure_base_link_url: string;
  secure_base_static_url: string;
  secure_base_media_url: string;
  extension_attributes?: Record<string, any>;
}

 