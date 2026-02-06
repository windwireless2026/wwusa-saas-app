'use client';

import { useState, useEffect } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter, useParams } from 'next/navigation';
import { getErrorMessage } from '@/lib/errors';

export default function SetPasswordPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'pt';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!supabase?.auth) {
      setSessionReady(true);
      return;
    }

    const goLogin = () => {
      setSessionReady(true);
      router.replace(`/${locale}/auth/login`);
    };

    const hasAuthParams = typeof window !== 'undefined' && (() => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      return (
        searchParams.has('code') ||
        searchParams.has('access_token') ||
        searchParams.has('refresh_token') ||
        searchParams.get('type') === 'invite' ||
        hashParams.has('access_token') ||
        hashParams.has('refresh_token') ||
        hashParams.get('type') === 'invite'
      );
    })();

    const hydrateSessionFromUrl = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const code = searchParams.get('code');
      const accessToken = hashParams.get('access_token') ?? searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') ?? searchParams.get('refresh_token');

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session?.user) {
          setHasSession(true);
          setSessionReady(true);
        }
        return;
      }

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data.session?.user) {
          setHasSession(true);
          setSessionReady(true);
        }
      }
    };

    // Dar tempo ao Supabase processar o token do convite (hash na URL) antes de redirecionar.
    // Nunca redirecionar antes de WAIT_MS; se onAuthStateChange disparar com sessão, mostramos o form na hora.
    const WAIT_MS = 3500;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const unsub = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        setHasSession(true);
        setSessionReady(true);
        unsub.data.subscription.unsubscribe();
      }
    });

    hydrateSessionFromUrl().catch(() => {
      setSessionReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        setHasSession(true);
        setSessionReady(true);
        return;
      }
      timeoutId = setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session: s2 } }: { data: { session: Session | null } }) => {
          if (s2?.user) {
            setHasSession(true);
            setSessionReady(true);
            return;
          }
          setSessionReady(true);
          if (!hasAuthParams) {
            goLogin();
          } else {
            setError('Convite expirado ou invalido. Solicite um novo convite.');
          }
        });
      }, WAIT_MS);
    });

    return () => {
      unsub.data.subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [locale, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!hasSession) {
      setError('Sessao expirada. Use o link do convite novamente.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!supabase?.auth) {
      setError('Erro de conexão. Recarregue a página.');
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace(`/${locale}/dashboard`);
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Erro ao definir senha.');
    } finally {
      setLoading(false);
    }
  };

  if (!supabase || !sessionReady) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 50%, #0A192F 0%, #050507 100%)',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Carregando...</span>
      </div>
    );
  }

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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
            Definir senha
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Você foi convidado. Crie uma senha para acessar a plataforma.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Nova senha *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="glass-panel"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 16px',
                  color: '#0f172a',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Confirmar senha *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="glass-panel"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 16px',
                  color: '#0f172a',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
                placeholder="Repita a senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
            {loading ? 'Salvando...' : 'Definir senha e entrar'}
          </button>

          {error && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '14px',
                marginTop: '16px',
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
