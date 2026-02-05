'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import AgentForm from '@/components/dashboard/AgentForm';

export default function EditFinanceAgentPage() {
  const supabase = useSupabase();
  const params = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAgent(params.id as string);
    }
  }, [params.id]);

  const fetchAgent = async (id: string) => {
    const { data } = await supabase.from('agents').select('*').eq('id', id).single();
    if (data) setAgent(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        Carregando...
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        Agente não encontrado.
      </div>
    );
  }

  return <AgentForm initialData={agent} />;
}
