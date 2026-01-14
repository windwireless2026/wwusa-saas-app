// Supabase generated types placeholder
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          email: string;
          role: 'admin' | 'manager' | 'operator' | 'viewer';
          avatar_url: string | null;
          job_title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          email: string;
          role?: 'admin' | 'manager' | 'operator' | 'viewer';
          avatar_url?: string | null;
          job_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string;
          role?: 'admin' | 'manager' | 'operator' | 'viewer';
          avatar_url?: string | null;
          job_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other tables as needed - this is a placeholder
      inventory: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      product_catalog: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      manufacturers: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      product_types: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      agents: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      stock_locations: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      company_settings: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Enums: {
      user_role: 'admin' | 'manager' | 'operator' | 'viewer';
      inventory_status: 'available' | 'reserved' | 'sold' | 'defective';
      tracking_method: 'imei' | 'serial' | 'none';
    };
  };
}
