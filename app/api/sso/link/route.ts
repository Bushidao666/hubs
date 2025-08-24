import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const { app_slug, redir } = await req.json();
    if (!app_slug) return NextResponse.json({ error: 'missing app_slug' }, { status: 400 });

    // Bridge cookies between req/res for SSR supabase client
    const res = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string,
      {
        cookies: {
          get(name: string) {
            // @ts-ignore
            const cookieHeader = req.headers.get('cookie') || '';
            const match = cookieHeader.split('; ').find(c => c.startsWith(name + '='));
            return match?.split('=')[1];
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            res.cookies.set({ name, value: '', maxAge: 0, ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data, error } = await supabase.rpc('hub_create_sso_link', { app_slug, redir: redir ?? '/' });
    if (error || !data) return NextResponse.json({ error: error?.message || 'no sso url' }, { status: 400 });

    return NextResponse.json({ url: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'error' }, { status: 500 });
  }
}


