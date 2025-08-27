import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string;

export async function GET() {
  try {
    if (!HUB_URL || !HUB_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { 
      auth: { persistSession: false } 
    });

    // 1) Primeira tentativa: RPC seguro public.hub_list_admins (SECURITY DEFINER)
    try {
      const { data: rpcData, error: rpcError } = await supa.rpc('hub_list_admins');
      if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
        const admins = rpcData.map((r: any) => ({
          user_id: r.user_id,
          email: r.email,
          email_confirmed_at: r.email_confirmed_at,
          last_sign_in_at: r.last_sign_in_at,
          admin_since: r.admin_since,
        }));
        return NextResponse.json({ admins });
      }
    } catch {}

    // Buscar informações dos usuários via Auth Admin API (paginado)
    const users: any[] = [];
    let page = 1; const perPage = 1000;
    for (;;) {
      const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const batch = data.users || [];
      users.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }

    // 2) Fallback: filtrar por app_metadata.role = 'admin'
    const adminUsers = users.filter(u => (u.app_metadata?.role || '').toLowerCase() === 'admin');

    const enrichedAdmins = adminUsers.map(user => ({
      user_id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
      admin_since: null,
      user_metadata: user.user_metadata
    }));

    return NextResponse.json({ admins: enrichedAdmins });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error?.message || 'Failed to list admins' 
    }, { status: 500 });
  }
}