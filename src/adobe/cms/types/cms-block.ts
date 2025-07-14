export interface CmsBlock {
  id: number;
  title: string;
  identifier: string;
  content?: string;
  is_active?: boolean;
  creation_time?: string;
  update_time?: string;
  [key: string]: unknown;
} 