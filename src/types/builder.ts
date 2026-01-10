export type WidgetType = 
  | 'TITLE'
  | 'SUBTITLE'
  | 'PARAGRAPH'
  | 'INPUT'
  | 'TEXTAREA'
  | 'CHECKBOX'
  | 'RADIO'
  | 'SELECT'
  | 'DATE'
  | 'DIVIDER'
  | 'GRID'
  | 'CONTAINER'
  | 'SPACE'
  | 'IMAGE'
  | 'BUTTON';

export interface InputContent {
  label: string;
  placeholder: string;
  required?: boolean;
}

export interface SelectContent {
  label: string;
  options: string[];
  required?: boolean;
}

export interface RadioContent {
  label: string;
  options: string[];
  required?: boolean;
}

export interface CheckboxContent {
  label: string;
  checked?: boolean;
}

export interface GridContent {
  columns: number;
  children: FormElement[][];
}

export interface ContainerContent {
  title?: string;
  children: FormElement[];
}

export interface SpaceContent {
  height: number; // in pixels
}

export interface ImageContent {
  url: string;
  alt?: string;
  width?: string; // e.g., "100%", "300px", "auto"
  height?: string; // e.g., "auto", "200px"
  alignment?: 'left' | 'center' | 'right';
}

export interface ButtonContent {
  label: string;
  actionType: 'link' | 'api';
  link?: string; // URL for link action
  apiEndpoint?: string; // API endpoint for API action
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; // HTTP method
  apiBody?: string; // JSON string for request body (optional)
  openInNewTab?: boolean; // For links only
}

export type ElementContent = 
  | string 
  | InputContent 
  | SelectContent 
  | RadioContent 
  | CheckboxContent 
  | GridContent
  | ContainerContent
  | SpaceContent
  | ImageContent
  | ButtonContent;

export interface FormElement {
  id: string;
  type: WidgetType;
  content: ElementContent;
  styles?: Record<string, string>;
}

export interface WidgetConfig {
  type: WidgetType;
  label: string;
  icon: string;
  defaultContent: ElementContent;
  category: 'text' | 'input' | 'layout';
}

export interface DraftTemplate {
  elements: FormElement[];
  lastModified: string;
}
