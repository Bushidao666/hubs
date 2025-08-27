import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string;

export async function POST(req: Request) {
  try {
    if (!HUB_URL || !HUB_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const { email, user_id } = await req.json();
    if (!email && !user_id) {
      return NextResponse.json({ error: 'Email or user_id is required' }, { status: 400 });
    }

    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { 
      auth: { persistSession: false } 
    });

    let targetUserId = user_id;

    // Se apenas email foi fornecido, buscar o user_id
    if (!targetUserId && email) {
      const { data: authData, error: authError } = await supa.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });
      const user = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
      targetUserId = user.id;
    }

    // Usar RPC segura para remover admin no schema hub (com proteção de último admin)
    try {
      await supa.rpc('hub_admins_delete', { p_user_id: targetUserId });
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('cannot remove the last admin')) {
        return NextResponse.json({ error: 'Não é possível remover o último administrador do sistema.' }, { status: 400 });
      }
      return NextResponse.json({ error: msg || 'Falha ao remover admin' }, { status: 500 });
    }

    // Opcional: atualizar o role no hub_profiles
    await supa
      .schema('hub')
      .from('hub_profiles')
      .update({ role: 'user', updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    // Importante para fallback: refletir papel também no Auth (app_metadata)
    try {
      // Buscar usuário para manter outros campos do app_metadata
      const { data: list } = await supa.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users?.find(u => u.id === targetUserId);
      await supa.auth.admin.updateUserById(targetUserId!, {
        app_metadata: { ...(found?.app_metadata || {}), role: 'user' }
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to remove admin' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string;

export async function POST(req: Request) {
  try {
    if (!HUB_URL || !HUB_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const { email, user_id } = await req.json();
    
    if (!email && !user_id) {
      return NextResponse.json({ error: 'Email or user_id is required' }, { status: 400 });
    }

    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { 
      auth: { persistSession: false } 
    });

    let targetUserId = user_id;

    // Se apenas email foi fornecido, buscar o user_id
    if (!targetUserId && email) {
      const { data: authData, error: authError } = await supa.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }

      const user = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return NextResponse.json({ 
          error: 'Usuário não encontrado.' 
        }, { status: 404 });
      }

      targetUserId = user.id;
    }

    // Verificar se é admin antes de remover
    const { data: existingAdmin, error: checkError } = await supa
      .schema('hub')
      .from('admins')
      .select('user_id')
      .eq('user_id', targetUserId)
      .single();

    if (checkError || !existingAdmin) {
      return NextResponse.json({ 
        error: 'Este usuário não é um administrador.' 
      }, { status: 400 });
    }

    // Verificar se não é o último admin
    const { count, error: countError } = await supa
      .schema('hub')
      .from('admins')
      .select('user_id', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count && count <= 1) {
      return NextResponse.json({ 
        error: 'Não é possível remover o último administrador do sistema.' 
      }, { status: 400 });
    }

    // Remover da tabela hub.admins
    const { error } = await supa
      .schema('hub')
      .from('admins')
      .delete()
      .eq('user_id', targetUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Opcionalmente, atualizar o role no hub_profiles
    await supa
      .schema('hub')
      .from('hub_profiles')
      .update({
        role: 'user',
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId);

    return NextResponse.json({ 
      success: true,
      message: 'Administrador removido com sucesso.'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error?.message || 'Failed to remove admin' 
    }, { status: 500 });
  }
}