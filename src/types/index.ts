export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  pagination?: PaginationInfo;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: 'draft' | 'published';
  category_id: number | null;
  category?: Category | null;
  tags?: Tag[];
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePostDto {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  category_id?: number;
  tag_ids?: number[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  category_id?: number;
  tag_ids?: number[];
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
}

export interface CreateTagDto {
  name: string;
  slug: string;
}

export interface UpdateTagDto {
  name?: string;
  slug?: string;
}
