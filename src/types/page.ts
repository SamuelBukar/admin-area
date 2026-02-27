// Page types including API request/response types
import type { FormElement } from './builder';

export interface Page {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  status: 'published' | 'draft';
  elements: FormElement[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  publishedAt?: string;
  views?: number;
  isTemplate?: boolean;
  isNamed?: boolean;
  templateIds?: string[];
}

export interface PageCreateRequest {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  status?: 'published' | 'draft';
  elements?: FormElement[];
}

export interface PageUpdateRequest {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  status?: 'published' | 'draft';
  elements?: FormElement[];
}

export interface Template {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCreateRequest {
  title: string;
  description?: string;
  elements: FormElement[];
}

export interface LinkTemplatesToPageRequest {
  templateIds: string[];
  title: string;
  slug: string;
  description?: string;
  category?: string;
  status?: 'published' | 'draft';
}
