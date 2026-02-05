import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/errors';

const VALID_ROLES = ['cliente', 'operacional', 'socio', 'administrador'] as const;
type ValidRole = typeof VALID_ROLES[number];

function isValidRole(role: unknown): role is ValidRole {
  return typeof role === 'string' && VALID_ROLES.includes(role as ValidRole);
}

/** Mapeia nome do perfil de acesso para role_v2 (user_role) */
function roleFromAccessProfileName(name: string | null): ValidRole {
  if (!name) return 'operacional';
  const n = name.toLowerCase();
  if (n.includes('administrador') || n.includes('acesso total')) return 'administrador';
  if (n.includes('diretoria') || n.includes('gestão executiva')) return 'socio';
  if (n.includes('cliente') || n.includes('visualização')) return 'cliente';
  if (n.includes('operacional') || n.includes('gestão')) return 'operacional';
  return 'operacional';
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Configuração do servidor incompleta: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local (ou nas variáveis de ambiente do deploy).'
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  try {
    const { email, role_v2: roleV2Param, access_profile_id, company_id: companyId, first_name, last_name, address, job_title, locale: localeParam } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    let role_v2: ValidRole;

    if (roleV2Param && isValidRole(roleV2Param)) {
      role_v2 = roleV2Param;
    } else if (access_profile_id) {
      const { data: profile } = await supabaseAdmin.from('access_profiles').select('name').eq('id', access_profile_id).single();
      role_v2 = roleFromAccessProfileName(profile?.name ?? null);
    } else {
      return NextResponse.json(
        { error: 'Informe o perfil de acesso ou a role (cliente, operacional, socio ou administrador).' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const locale = typeof localeParam === 'string' && localeParam ? localeParam : 'pt';
    const setPasswordPath = appUrl ? `${appUrl.replace(/\/$/, '')}/${locale}/auth/set-password` : undefined;

    // 1. Invite the user via Supabase Auth (redirectTo = tela para definir senha)
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: `${first_name} ${last_name}`.trim(),
          role_v2: role_v2,
        },
        ...(setPasswordPath && { redirectTo: setPasswordPath }),
      });

    if (inviteError) {
      console.error('[invite-user] inviteUserByEmail error:', JSON.stringify(inviteError, null, 2));
      throw inviteError;
    }

    // 2. Criar/atualizar perfil em public.profiles (o trigger no banco pode estar desativado ou falhando)
    const fullName = `${first_name} ${last_name}`.trim();
    const now = new Date().toISOString();
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
      {
        id: inviteData.user.id,
        email: inviteData.user.email ?? email,
        full_name: fullName || inviteData.user.email || email,
        first_name: first_name || null,
        last_name: last_name || null,
        role_v2: role_v2,
        company_id: companyId || null,
        access_profile_id: access_profile_id || null,
        address: address || null,
        job_title: job_title || null,
        updated_at: now,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error('[invite-user] profile upsert error:', JSON.stringify(profileError, null, 2));
      // Não falha o convite; o usuário já existe no Auth
    }

    return NextResponse.json({ success: true, user: inviteData.user });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    // Log completo no servidor (terminal onde roda npm run dev)
    console.error('[invite-user] caught error:', message);
    console.error('[invite-user] full error:', error instanceof Error ? error.stack : JSON.stringify(error, null, 2));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
