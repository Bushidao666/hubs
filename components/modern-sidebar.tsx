"use client";

import React from 'react';
import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { UserProfile } from '@/types/saas';
import { Shield, Zap, TrendingUp, Cpu } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ModernSidebarProps {
  user?: UserProfile;
}

export function ModernSidebar({ user }: ModernSidebarProps) {
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string>('');
  const [name, setName] = React.useState<string>('User');
  const [tier, setTier] = React.useState<string>('pro');

  React.useEffect(() => {
    const load = async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      const uemail = session.session?.user.email || '';
      setEmail(uemail || 'user@blacksider.hub');
      setName(uemail?.split('@')[0] || 'User');
      if (!uid) return;
      try {
        const list = await supabase.storage.from('avatars').list(uid, { limit: 1 });
        const file = list.data?.[0]?.name;
        if (file) {
          const { data: url } = supabase.storage.from('avatars').getPublicUrl(`${uid}/${file}`);
          setAvatarUrl(url.publicUrl);
        }
      } catch {}
    };
    load();
  }, []);

  const onUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) return;
    const path = `${uid}/${Date.now()}_${file.name}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
  };

  const currentUser: UserProfile = user || {
    id: 'usr_001',
    name: name,
    neuralId: 'USR-HUB',
    avatarUrl: avatarUrl || 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    joinDate: new Date(),
    tier: tier as any,
    accessLevel: 95,
    syncLevel: 87,
    securityLevel: 100,
    bandwidthUsage: 45
  };

  return (
    <aside className="w-full h-full bg-content1 border-r border-divider overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* User Profile Card */}
        <Card className="bg-glass backdrop-blur-md border border-subtle">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src={currentUser.avatarUrl}
                  className="w-16 h-16"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUploadAvatar}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Trocar avatar"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{currentUser.name}</h2>
                <p className="text-xs text-default-500">{email}</p>
                <div className="mt-2">
                  <Chip 
                    size="sm"
                    color={currentUser.tier === 'pro' ? 'primary' : 'default'}
                    variant="flat"
                  >
                    {currentUser.tier.toUpperCase()} PLAN
                  </Chip>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button 
                fullWidth 
                color="primary"
                variant="flat"
                size="sm"
              >
                Account Settings
              </Button>
              <Button 
                fullWidth 
                variant="light"
                size="sm"
              >
                Upgrade Plan
              </Button>
            </div>
          </CardBody>
        </Card>

      </div>
    </aside>
  );
}

// Import Settings icon
import { Settings } from 'lucide-react';