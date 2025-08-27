import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string;
const HUB_ANON_KEY = process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string;

export async function GET() {
  try {
    if (!HUB_URL) {
      return NextResponse.json({ error: 'Missing HUB_URL' }, { status: 500 });
    }

    const elevated = !!HUB_SERVICE_ROLE_KEY;
    const supa = createClient(HUB_URL, elevated ? HUB_SERVICE_ROLE_KEY : HUB_ANON_KEY, { auth: { persistSession: false } });

    let total_users = 0;
    let new_users_today = 0;
    let new_users_week = 0;
    let active_users = 0;
    let online_now = 0;
    let recent_users: any[] = [];

    if (elevated) {
      const allUsers: any[] = [];
      let page = 1; const perPage = 1000;
      for (;;) {
        const { data, error } = await supa.auth.admin.listUsers({ page, perPage });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        const batch = data.users || [];
        allUsers.push(...batch);
        if (batch.length < perPage) break;
        page++;
      }

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

      total_users = allUsers.length;
      new_users_today = allUsers.filter(u => u.created_at && new Date(u.created_at) >= startOfToday).length;
      new_users_week = allUsers.filter(u => u.created_at && new Date(u.created_at) >= weekAgo).length;
      active_users = allUsers.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= monthAgo).length;
      online_now = allUsers.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= fiveMinAgo).length;

      recent_users = allUsers
        .slice()
        .sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
        .slice(0, 20)
        .map((u) => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in: u.last_sign_in_at }));
    } else {
      // Fallback via tabelas hub: aproximações para evitar 500
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgoISO = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const todayISO = startOfToday.toISOString();
      // total_users via hub_profiles (ou user_access distinct)
      try {
        let { count } = await supa.from('hub.hub_profiles').select('id', { count: 'exact', head: true });
        if (!count) {
          const r2 = await supa.from('hub.user_access').select('user_id', { count: 'exact', head: true });
          count = r2.count || 0;
        }
        total_users = count || 0;
      } catch {}
      try {
        const { count } = await supa
          .from('hub.hub_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', todayISO);
        new_users_today = count || 0;
      } catch {}
      try {
        const { count } = await supa
          .from('hub.hub_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekAgoISO);
        new_users_week = count || 0;
      } catch {}
      try {
        const { count } = await supa
          .from('hub.user_access')
          .select('user_id', { count: 'exact', head: true })
          .eq('status', 'active');
        // aprox.: usuários ativos = usuários com acesso ativo
        active_users = count || 0;
      } catch {}
      try {
        const fiveMinAgoISO = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        const { count } = await supa
          .from('hub.sso_tickets')
          .select('user_id', { count: 'exact', head: true })
          .gte('issued_at', fiveMinAgoISO);
        online_now = count || 0;
      } catch {}
      try {
        const { data } = await supa
          .from('hub.hub_profiles')
          .select('id, email, created_at')
          .order('created_at', { ascending: false })
          .limit(20);
        recent_users = (data || []).map((u:any)=> ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in: null }));
      } catch {}
    }

    

    // Assinaturas ativas
    let active_subscriptions = 0;
    try {
      const { count } = await supa
        .from('hub.user_access')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      active_subscriptions = count || 0;
    } catch {}

    return NextResponse.json({ total_users, new_users_today, new_users_week, active_users, online_now, active_subscriptions, recent_users });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'auth-stats failed' }, { status: 500 });
  }
}


