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
    const { users } = body || {};
    if (!Array.isArray(users)) return NextResponse.json({ error: 'users[] required' }, { status: 400 });
    const supa = createClient(HUB_URL, HUB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    let created = 0; let skipped = 0; let errors = 0;
    for (const u of users) {
      const email = (u?.email || '').trim();
      const full_name = (u?.full_name || '').trim();
      if (!email) { skipped++; continue; }
      const { error } = await supa.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name, imported_by: 'admin_panel' },
        app_metadata: { role: 'user' }
      });
      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('exists')) skipped++; else errors++;
      } else {
        created++;
      }
    }
    return NextResponse.json({ created, skipped, errors });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'import failed' }, { status: 500 });
  }
}


