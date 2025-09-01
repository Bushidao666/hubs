import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const HUB_URL = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
    const HUB_ANON = process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string;
    if (!HUB_URL || !HUB_ANON) {
      return NextResponse.json({ error: 'Supabase envs missing' }, { status: 500 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const supa = createClient(HUB_URL, HUB_ANON, { auth: { persistSession: false } });

    // Compute absolute base URL from request headers (handles proxies)
    const url = new URL(req.url);
    const proto = (req.headers.get('x-forwarded-proto') || url.protocol.replace(':','')) as string;
    const host = (req.headers.get('x-forwarded-host') || url.host) as string;
    const envBase = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined);
    const base = `${proto}://${host}` || envBase || 'https://hub.blacksiderhub.com';

    const { error } = await supa.auth.resetPasswordForEmail(email, {
      redirectTo: `${base}/auth/callback?next=/reset-password`,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'reset failed' }, { status: 500 });
  }
}


