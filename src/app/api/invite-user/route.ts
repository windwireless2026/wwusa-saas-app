import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, role, first_name, last_name, address } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Invite the user via Supabase Auth
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: `${first_name} ${last_name}`.trim(),
          role: role,
        },
      });

    if (inviteError) throw inviteError;

    // 2. The profile is usually created by a trigger on auth.users (on_auth_user_created)
    // However, we want to update the profile with the extra info immediately if the trigger didn't handle everything
    // Or we can just wait for the trigger and update it.
    // Let's assume the trigger exists but we want to ensure first_name and last_name are there.

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`.trim(),
        role,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inviteData.user.id);

    if (profileError) {
      console.error('Error updating profile after invite:', profileError);
      // We don't necessarily want to fail the whole request if the profile update fails,
      // since the user was invited, but it's good to log.
    }

    return NextResponse.json({ success: true, user: inviteData.user });
  } catch (error: any) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
