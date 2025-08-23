import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string;
const anon = process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string;

// Browser: usa storage padrão. Cookies de sessão serão setados via rota /api/auth/set após login.
export const supabase = createBrowserClient(url, anon);


