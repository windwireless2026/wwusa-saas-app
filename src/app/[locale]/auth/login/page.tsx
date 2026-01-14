'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.session) {
        // Login successful
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
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
      {/* Background Decor */}
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
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Bem-vindo de volta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Entre para acessar seu painel WindWireless.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
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
              className="glass-panel"
              style={{
                width: '100%',
                padding: '12px 16px',
                color: 'white',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                outline: 'none',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              placeholder="seu@email.com"
            />
          </div>

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
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="glass-panel"
              style={{
                width: '100%',
                padding: '12px 16px',
                color: 'white',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                outline: 'none',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            disabled={loading}
          >
            {loading ? 'Acessando...' : 'Entrar na Plataforma'}
          </button>

          {error && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '14px',
              marginTop: '16px'
            }}>
              ⚠️ {error}
            </div>
          )}
        </form>

        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
          }}
        >
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Ainda não é parceiro?{' '}
            <Link href="/auth/register" style={{ color: 'var(--color-accent)', fontWeight: '600' }}>
              Solicitar acesso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
