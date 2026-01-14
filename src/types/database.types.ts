// Database specific types matching Supabase schema

import type { Database as DatabaseGenerated } from './supabase.js';

export type Database = DatabaseGenerated;

// Table types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Specific table types (for convenience)
export type DbProfile = Tables<'profiles'>;
export type DbInventory = Tables<'inventory'>;
export type DbProductCatalog = Tables<'product_catalog'>;
export type DbManufacturer = Tables<'manufacturers'>;
export type DbProductType = Tables<'product_types'>;
export type DbAgent = Tables<'agents'>;
export type DbStockLocation = Tables<'stock_locations'>;
export type DbCompanySettings = Tables<'company_settings'>;

// Insert types
export type InsertProfile = Inserts<'profiles'>;
export type InsertInventory = Inserts<'inventory'>;
export type InsertProductCatalog = Inserts<'product_catalog'>;

// Update types
export type UpdateProfile = Updates<'profiles'>;
export type UpdateInventory = Updates<'inventory'>;
export type UpdateProductCatalog = Updates<'product_catalog'>;

// Enums
export type UserRole = Database['public']['Enums']['user_role'];
export type InventoryStatus = Database['public']['Enums']['inventory_status'];
export type TrackingMethod = Database['public']['Enums']['tracking_method'];
