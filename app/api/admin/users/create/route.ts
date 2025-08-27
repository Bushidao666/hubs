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
    const { email, full_name, sendInvite } = body || {};
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const { data, error } = await supa.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name, created_by: 'admin_panel' },
      app_metadata: { role: 'user' }
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (sendInvite) {
      await supa.auth.signInWithOtp({ email });
    }

    return NextResponse.json({ user: data.user });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'create failed' }, { status: 500 });
  }
}


