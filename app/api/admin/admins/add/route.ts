import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string;

export async function POST(req: Request) {
  try {
    if (!HUB_URL || !HUB_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const body = await req.json();
    const inputEmail = (body?.email || '').trim().toLowerCase();
    if (!inputEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // Buscar usuário por email paginando todas as páginas
    let foundUser: any = null;
    let page = 1; const perPage = 1000;
    for (;;) {
      const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const batch = data.users || [];
      foundUser = batch.find(u => (u.email || '').toLowerCase() === inputEmail);
      if (foundUser || batch.length < perPage) break;
      page++;
    }

    // Se não encontrado, criar usuário automaticamente e prosseguir
    if (!foundUser) {
      const { data: created, error: createErr } = await supa.auth.admin.createUser({
        email: inputEmail,
        email_confirm: false,
        user_metadata: { created_by: 'admin_panel' },
        app_metadata: { role: 'admin' }
      });
      if (createErr) {
        return NextResponse.json({ error: 'Usuário não encontrado e não foi possível criar.' }, { status: 404 });
      }
      foundUser = created?.user;
    }

    // Usar RPC segura para inserir admin no schema hub
    try {
      await supa.rpc('hub_admins_insert', { p_user_id: foundUser.id });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Falha ao inserir admin' }, { status: 500 });
    }

    // Importante para fallback: refletir papel também no Auth (app_metadata)
    try {
      await supa.auth.admin.updateUserById(foundUser.id, {
        app_metadata: { ...(foundUser.app_metadata || {}), role: 'admin' }
      });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add admin' }, { status: 500 });
  }
}