'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { getErrorMessage } from '@/lib/errors';

export default function ForgotPasswordPage() {
  const supabase = useSupabase();
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      const redirectTo = appUrl ? `${appUrl.replace(/\/$/, '')}/${locale}/auth/set-password` : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        ...(redirectTo && { redirectTo }),
      });

      if (resetError) throw resetError;

      setSuccess('Enviamos um email com o link para redefinir sua senha.');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erro ao solicitar redefinicao de senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #0A192F 0%, #050507 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,71,171,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0,224,255,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div
        className="glass-panel animate-fade-in"
        style={{ width: '100%', maxWidth: '420px', padding: '48px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #0047AB, #00E0FF)',
              borderRadius: '12px',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '20px',
            }}
          >
            W
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            Recuperar senha
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Informe seu email corporativo para receber o link de redefinicao.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Email Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                color: '#0f172a',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                outline: 'none',
                borderRadius: '8px',
                fontSize: '16px',
              }}
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinicao'}
          </button>

          {success && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#16a34a',
                fontSize: '14px',
              }}
            >
              {success}
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '14px',
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link
            href={`/${locale}/auth/login`}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#94a3b8',
              textDecoration: 'none',
            }}
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
