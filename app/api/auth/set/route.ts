import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json();
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'missing tokens' }, { status: 400 });
    }

    const res = NextResponse.json({ ok: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string,
      {
        cookies: {
          get: (name) => {
            return req.headers.get('cookie')?.split('; ').find(c => c.startsWith(name + '='))?.split('=')[1];
          },
          set: (name, value, options) => {
            const cookie = `${name}=${value}; Path=${options?.path ?? '/'}; Max-Age=${options?.maxAge ?? ''}; SameSite=${options?.sameSite ?? 'Lax'}; ${options?.httpOnly ? 'HttpOnly; ' : ''}${options?.secure ? 'Secure; ' : ''}`;
            res.headers.append('Set-Cookie', cookie);
          },
          remove: (name, options) => {
            const cookie = `${name}=; Path=${options?.path ?? '/'}; Max-Age=0; SameSite=${options?.sameSite ?? 'Lax'}; ${options?.httpOnly ? 'HttpOnly; ' : ''}${options?.secure ? 'Secure; ' : ''}`;
            res.headers.append('Set-Cookie', cookie);
          },
        },
      }
    );

    await supabase.auth.setSession({ access_token, refresh_token });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'error' }, { status: 500 });
  }
}


