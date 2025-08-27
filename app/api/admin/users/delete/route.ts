import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const HUB_SERVICE_ROLE_KEY = process.env.HUB_SERVICE_ROLE_KEY as string;

export async function POST(req: Request) {
  try {
    if (!HUB_URL || !HUB_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Missing HUB_URL or HUB_SERVICE_ROLE_KEY' }, { status: 500 });
    }
    const body = await req.json();
    const { user_id } = body || {};
    if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { error } = await supa.auth.admin.deleteUser(user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'delete failed' }, { status: 500 });
  }
}


