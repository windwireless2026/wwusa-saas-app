'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import AgentForm from '@/components/dashboard/AgentForm';

export default function EditAgentPage() {
  const supabase = useSupabase(); // Hook com instância única
  const params = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAgent(params.id as string);
    }
  }, [params.id]);

  const fetchAgent = async (id: string) => {
    const { data, error } = await supabase.from('agents').select('*').eq('id', id).single();

    if (data) setAgent(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
        Carregando...
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
        Agente não encontrado.
      </div>
    );
  }

  return <AgentForm initialData={agent} />;
}
