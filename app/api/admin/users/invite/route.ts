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
    const { email, full_name } = body || {};
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const reqUrl = new URL(req.url);
    const proto = (req.headers.get('x-forwarded-proto') || reqUrl.protocol.replace(':','')) as string;
    const host = (req.headers.get('x-forwarded-host') || reqUrl.host) as string;
    const envBase = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined);
    const base = `${proto}://${host}` || envBase || 'https://hub.blacksiderhub.com';
    const { data, error } = await supa.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${base}/auth/callback?next=/set-password`,
      data: full_name ? { full_name } : undefined,
    } as any);
    if (error) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ ok: true, user: data?.user ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'invite failed' }, { status: 500 });
  }
}


