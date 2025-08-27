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
    
    // Buscar TODOS os usuários primeiro para ter o total real
    let allUsers: any[] = [];
    let currentPage = 1;
    const batchSize = 1000; // Máximo permitido pela API do Supabase
    
    // Loop para buscar todos os usuários
    while (true) {
      const { data, error } = await supa.auth.admin.listUsers({ 
        page: currentPage, 
        perPage: batchSize 
      });
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      const batch = data.users || [];
      allUsers.push(...batch);
      
      // Se recebemos menos que o batch size, não há mais usuários
      if (batch.length < batchSize) {
        break;
      }
      
      currentPage++;
    }
    
    // Aplicar filtro de busca se houver
    if (q) {
      allUsers = allUsers.filter(u =>
        (u.email?.toLowerCase().includes(q)) ||
        ((u.user_metadata?.full_name || '').toLowerCase().includes(q))
      );
    }
    
    // Total de usuários após filtro
    const totalUsers = allUsers.length;
    const totalPages = Math.ceil(totalUsers / perPage);
    
    // Calcular índices para paginação
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    
    // Pegar apenas os usuários da página atual
    const pageUsers = allUsers.slice(startIndex, endIndex);
    
    // IDs dos usuários da página atual para buscar dados adicionais
    const ids = pageUsers.map(u => u.id);
    
    // Enriquecer com hub_profiles
    let profiles: any[] = [];
    if (ids.length > 0) {
      try {
        const { data: prof, error: e } = await supa
          .schema('hub')
          .from('hub_profiles')
          .select('id, full_name, plan, role, email')
          .in('id', ids);
        if (!e && prof) profiles = prof;
      } catch {}
    }
    const profileMap: Record<string, any> = Object.fromEntries((profiles || []).map(p => [p.id, p]));
    
    // Buscar informações de acesso dos usuários
    let accessByUser: Record<string, any> = {};
    if (ids.length > 0) {
      try {
        const { data: ua, error: eua } = await supa
          .schema('hub')
          .from('user_access')
          .select('user_id, app_id, subscription_tier, status')
          .in('user_id', ids);
          
        if (!eua && Array.isArray(ua)) {
          for (const r of ua) {
            const uid = r.user_id;
            if (!accessByUser[uid]) {
              accessByUser[uid] = { 
                total: 0, 
                active: 0, 
                tiers: {}, 
                items: [] as any[] 
              };
            }
            accessByUser[uid].total += 1;
            if ((r.status || 'active') === 'active') {
              accessByUser[uid].active += 1;
            }
            const tier = r.subscription_tier || 'unknown';
            accessByUser[uid].tiers[tier] = (accessByUser[uid].tiers[tier] || 0) + 1;
            if (accessByUser[uid].items.length < 10) {
              accessByUser[uid].items.push({ 
                app_id: r.app_id, 
                tier: r.subscription_tier, 
                status: r.status 
              });
            }
          }
        }
      } catch {}
    }
    
    // Verificar se são admins
    let adminIds: Set<string> = new Set();
    if (ids.length > 0) {
      try {
        const { data: admins, error: adminsError } = await supa
          .schema('hub')
          .from('admins')
          .select('user_id')
          .in('user_id', ids);
          
        if (!adminsError && admins) {
          admins.forEach(a => adminIds.add(a.user_id));
        }
      } catch {}
    }
    
    // Enriquecer usuários com todas as informações
    const enrichedUsers = pageUsers.map(u => ({
      ...u,
      profile: profileMap[u.id] || null,
      access: accessByUser[u.id] || null,
      isAdmin: adminIds.has(u.id)
    }));
    
    return NextResponse.json({ 
      users: enrichedUsers, 
      page, 
      perPage,
      totalUsers,
      totalPages,
      hasMore: page < totalPages
    });
    
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'list failed' }, { status: 500 });
  }
}