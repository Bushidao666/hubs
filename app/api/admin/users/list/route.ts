import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string;

export async function GET(req: Request) {
  try {
    if (!HUB_URL || !HUB_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing HUB_URL or HUB_SERVICE_ROLE_KEY' }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || '1');
    const perPage = Number(searchParams.get('perPage') || '50');
    const q = (searchParams.get('q') || '').toLowerCase();

    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    let users = data.users || [];

    // IDs para buscar perfis/acessos
    const ids = users.map(u => u.id);

    // Enriquecer com hub_profiles
    let profiles: any[] = [];
    try {
      const { data: prof, error: e } = await supa
        .from('hub.hub_profiles')
        .select('id, full_name, plan, role, email')
        .in('id', ids);
      if (!e && prof) profiles = prof;
    } catch {}
    const map: Record<string, any> = Object.fromEntries((profiles||[]).map(p => [p.id, p]));

    // Primeiro: tentar hub.user_access (fonte canônica)
    let accessByUser: Record<string, any> = {};
    try {
      const { data: ua, error: eua } = await supa
        .from('hub.user_access')
        .select('user_id, app_id, subscription_tier, status')
        .in('user_id', ids);
      if (!eua && Array.isArray(ua)) {
        for (const r of ua) {
          const uid = r.user_id;
          if (!accessByUser[uid]) accessByUser[uid] = { total: 0, active: 0, tiers: {}, items: [] as any[] };
          accessByUser[uid].total += 1;
          if ((r.status || 'active') === 'active') accessByUser[uid].active += 1;
          const t = r.subscription_tier || 'unknown';
          accessByUser[uid].tiers[t] = (accessByUser[uid].tiers[t] || 0) + 1;
          if (accessByUser[uid].items.length < 10) {
            accessByUser[uid].items.push({ app_id: r.app_id, tier: r.subscription_tier, status: r.status });
          }
        }
      }
    } catch {}

    // Fallback: view hub.v_user_app_access (se existir)
    if (Object.keys(accessByUser).length === 0) {
      try {
        let res = await supa.from('hub.v_user_app_access').select('*').in('user_id', ids);
        if (res.error) { res = await supa.from('hub.v_user_app_access').select('*').in('id', ids); }
        if (!res.error && Array.isArray(res.data)) {
          for (const r of res.data as any[]) {
            const uid = r.user_id || r.id;
            if (!uid) continue;
            if (!accessByUser[uid]) accessByUser[uid] = { total: 0, active: 0, tiers: {}, items: [] as any[] };
            accessByUser[uid].total = r.total_apps || accessByUser[uid].total || 0;
            accessByUser[uid].active = r.active_apps || accessByUser[uid].active || 0;
            // tiers podem não estar na view; manter vazio
          }
        }
      } catch {}
    }

    users = users.map(u => ({ ...u, profile: map[u.id] || null, access: accessByUser[u.id] || null }));

    if (q) {
      users = users.filter(u =>
        (u.email?.toLowerCase().includes(q)) ||
        ((u.user_metadata?.full_name || '').toLowerCase().includes(q)) ||
        ((u.profile?.full_name || '').toLowerCase().includes(q))
      );
    }
    return NextResponse.json({ users, page, perPage });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'list failed' }, { status: 500 });
  }
}


