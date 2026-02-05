'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

export type Grade = {
  id: string;
  code: string;
  name: string | null;
  display_order: number;
  is_active: boolean;
};

export function useGrades() {
  const supabase = useSupabase();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('grades')
        .select('id, code, name, display_order, is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('code', { ascending: true });

      if (err) {
        setError(err as unknown as Error);
        setGrades([]);
      } else {
        setGrades((data as Grade[]) || []);
      }
      setLoading(false);
    };

    fetchGrades();
  }, [supabase]);

  return { grades, loading, error };
}
