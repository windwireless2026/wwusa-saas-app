import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  InventoryItem,
  ProductCatalog,
  Agent,
  Manufacturer,
  ProductType,
} from '@/types/global';

// ============================================
// INVENTORY QUERIES
// ============================================

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*, profiles:created_by(full_name, email)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryItem[];
    },
  });
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();

  const createItem = useMutation({
    mutationFn: async (item: Partial<InventoryItem>) => {
      const { data, error } = await supabase.from('inventory').insert(item).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  return { createItem, updateItem, deleteItem };
}

// ============================================
// PRODUCT CATALOG QUERIES
// ============================================

export function useProductCatalog() {
  return useQuery({
    queryKey: ['product-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_catalog')
        .select('*')
        .is('deleted_at', null)
        .order('release_year', { ascending: false });

      if (error) throw error;
      return data as ProductCatalog[];
    },
  });
}

// ============================================
// AGENTS QUERIES
// ============================================

export function useAgents(filters?: { is_supplier?: boolean; is_customer?: boolean }) {
  return useQuery({
    queryKey: ['agents', filters],
    queryFn: async () => {
      let query = supabase.from('agents').select('*').is('deleted_at', null);

      if (filters?.is_supplier !== undefined) {
        query = query.eq('is_supplier', filters.is_supplier);
      }

      if (filters?.is_customer !== undefined) {
        query = query.eq('is_customer', filters.is_customer);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data as Agent[];
    },
  });
}

// ============================================
// MANUFACTURERS QUERIES
// ============================================

export function useManufacturers() {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      return data as Manufacturer[];
    },
  });
}

// ============================================
// PRODUCT TYPES QUERIES
// ============================================

export function useProductTypes() {
  return useQuery({
    queryKey: ['product-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      return data as ProductType[];
    },
  });
}

// ============================================
// USERS/PROFILES QUERIES
// ============================================

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// ============================================
// GENERIC MUTATION HELPERS
// ============================================

export function useGenericMutation<T>(table: string, queryKeys: string[]) {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async (item: Partial<T>) => {
      const { data, error } = await supabase.from(table).insert(item).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });

  return { create, update, remove };
}
