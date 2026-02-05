/**
 * Extrai mensagem de erro de forma type-safe (error: unknown).
 * Suporta Error, Supabase/PostgREST (message, details, hint) e objetos genéricos.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const o = error as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message) return o.message;
    if (typeof o.error_description === 'string' && o.error_description) return o.error_description;
    if (typeof o.details === 'string' && o.details) return o.details;
    if (typeof o.hint === 'string' && o.hint) return o.hint;
    // Supabase: montar mensagem a partir de code + details se message estiver vazio
    const code = o.code != null ? String(o.code) : '';
    const details = typeof o.details === 'string' ? o.details : '';
    if (code || details) return [code, details].filter(Boolean).join(': ') || 'Erro desconhecido';
  }
  const s = String(error);
  return s === '[object Object]' ? 'Erro desconhecido' : s;
}
