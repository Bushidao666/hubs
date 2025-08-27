import { supabase } from './supabaseClient';

export type UserProfileData = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

async function tryFetchFromTable(userId: string, table: string) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('id, full_name, display_name, name, username, avatar_url, photo_url, picture, email')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data as any;
  } catch {
    return null;
  }
}

async function getPublicAvatarFromStorage(userId: string): Promise<string | null> {
  try {
    const list = await supabase.storage.from('avatars').list(userId, { limit: 1 });
    const file = list.data?.[0]?.name;
    if (file) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/${file}`);
      return data.publicUrl || null;
    }
  } catch {}
  return null;
}

export async function fetchUserProfile(): Promise<UserProfileData | null> {
  const { data: session } = await supabase.auth.getSession();
  const user = session.session?.user;
  if (!user) return null;

  // Start with auth user metadata
  const meta: any = user.user_metadata || {};
  const metaName = meta.name || meta.full_name || meta.display_name || meta.username || meta.user_name || '';
  const metaAvatar = meta.avatar_url || meta.avatar || meta.picture || meta.photo_url || null;

  // Try common profile tables
  const tables = ['hub_profiles', 'profiles', 'hub_users', 'users', 'members'];
  let row: any = null;
  for (const t of tables) {
    // eslint-disable-next-line no-await-in-loop
    const r = await tryFetchFromTable(user.id, t);
    if (r) { row = r; break; }
  }

  const dbName = row?.display_name || row?.full_name || row?.name || row?.username || '';
  const dbEmail = row?.email || user.email || '';
  const dbAvatar = row?.avatar_url || row?.photo_url || row?.picture || null;

  // Fallback to storage if no avatar
  const storageAvatar = (!dbAvatar && !metaAvatar) ? await getPublicAvatarFromStorage(user.id) : null;

  const name = (dbName || metaName || (user.email ? user.email.split('@')[0] : '') || 'Usuário').toString();
  const avatarUrl = (dbAvatar || metaAvatar || storageAvatar) ?? null;
  const email = (dbEmail || user.email || '').toString();

  return {
    id: user.id,
    email,
    name,
    avatarUrl,
  };
}


