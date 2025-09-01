import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Compute absolute base URL using forwarded headers (avoids localhost in reverse proxies)
  const reqUrl = new URL(request.url);
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const computedBase = `${forwardedProto || reqUrl.protocol.replace(':','')}://${forwardedHost || reqUrl.host}`;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  let next = searchParams.get('next') ?? '/';
  if (!next.startsWith('/')) next = '/';

  // Prepare a response we can set cookies on
  let response = NextResponse.redirect(`${computedBase}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return [] as any;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      return response;
    }
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as any });
      if (error) throw error;
      return response;
    }
  } catch (e) {
    // fallback to login on error
    response = NextResponse.redirect(`${computedBase}/login`);
  }

  return response;
}


