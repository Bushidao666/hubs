import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/set-password', '/auth', '/api/auth', '/api/public', '/public', '/favicon.ico'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p) || pathname === p);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          const v = req.cookies.get(name)?.value;
          // Debug leve (em produção não logar valores)
          // console.log('[MW] cookie get', name, v ? 'present' : 'missing');
          return v;
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
  // console.log('[MW] pathname', pathname, 'isPublic', isPublic, 'hasSession', !!session);

  if (!session && !isPublic && !pathname.startsWith('/_next')) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


