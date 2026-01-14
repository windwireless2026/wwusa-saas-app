// Global type definitions for the WindWireless SaaS application

// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  job_title: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// INVENTORY
// ============================================

export interface InventoryItem {
  id: string;
  model_id: string;
  imei: string | null;
  serial_number: string | null;
  capacity: string | null;
  color: string | null;
  grade: string | null;
  price: number;
  status: InventoryStatus;
  stock_location_id: string | null;
  supplier_id: string | null;
  purchase_invoice: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type InventoryStatus = 'available' | 'reserved' | 'sold' | 'defective';

export interface InventoryItemWithDetails extends InventoryItem {
  product_catalog: ProductCatalog;
  stock_location: StockLocation | null;
  supplier: Agent | null;
  creator: Profile | null;
}

// ============================================
// PRODUCT CATALOG
// ============================================

export interface ProductCatalog {
  id: string;
  product_type_id: string;
  manufacturer_id: string;
  model: string;
  release_year: number | null;
  created_at: string;
  deleted_at: string | null;
}

export interface ProductCatalogWithDetails extends ProductCatalog {
  product_type: ProductType;
  manufacturer: Manufacturer;
}

export interface Manufacturer {
  id: string;
  name: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ProductType {
  id: string;
  name: string;
  tracking_method: TrackingMethod;
  created_at: string;
  deleted_at: string | null;
}

export type TrackingMethod = 'imei' | 'serial' | 'none';

// ============================================
// AGENTS (Suppliers, Customers, Partners)
// ============================================

export interface Agent {
  id: string;
  name: string;
  legal_name?: string;
  person_type: PersonType;
  tax_id?: string;
  state_registration?: string;
  country: string | null;
  email: string | null;
  phone: string | null;
  website?: string;
  contact_person?: string;

  // Roles (stored as array in DB)
  roles: string[];

  // Legacy / Helper flags (should be derived from roles in UI, but kept for compatibility)
  is_supplier?: boolean;
  is_customer?: boolean;
  is_service_provider?: boolean;

  // Address
  address_line1?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;

  // Documents
  regulatory_doc_status?: 'pending' | 'received' | 'waived';
  resale_certificate_status?: 'pending' | 'received' | 'waived' | 'na';
  regulatory_doc_url?: string;
  resale_certificate_url?: string;
  resale_certificate?: string;
  resale_certificate_expiry_year?: number;

  // Commercial / Financial
  default_commission_percent?: number;
  credit_limit?: number;
  payment_terms?: string;
  default_financial_class_id?: string;

  // Banking (Joined from AgentBanking or flattened in agents table)
  bank_name?: string;
  bank_routing_number?: string;
  bank_account_number?: string;
  bank_account_type?: string;
  bank_holder_name?: string;
  pix_key?: string;
  zelle_email?: string;
  paypal_email?: string;
  crypto_wallet?: string;
  crypto_network?: string;
  iban?: string;
  swift_code?: string;
  intermediary_bank?: string;
  intermediary_routing?: string;

  created_at: string;
  updated_at?: string;
  deleted_at: string | null;
}

export type PersonType = 'individual' | 'entity';

export interface AgentBanking {
  id: string;
  agent_id: string;
  bank_name: string;
  account_number: string;
  routing_number: string | null;
  swift_code: string | null;
  created_at: string;
}

// ============================================
// STOCK LOCATIONS
// ============================================

export interface StockLocation {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  created_at: string;
  deleted_at: string | null;
}

// ============================================
// COMPANY SETTINGS
// ============================================

export interface CompanySettings {
  id: string;
  company_name: string;
  tax_id: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// COMMON TYPES
// ============================================

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export type FormField<T> = {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
};

// ============================================
// UI TYPES
// ============================================

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

export interface SidebarState {
  isCollapsed: boolean;
  activeModule: string | null;
  expandedModules: string[];
}

// ============================================
// TABLE TYPES
// ============================================

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'primary' | 'danger' | 'secondary';
  show?: (row: T) => boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Re-export commonly used React types
export type { ReactNode, ReactElement, FC, ComponentProps, CSSProperties } from 'react';
