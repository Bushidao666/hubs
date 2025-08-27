"use client";

import React from 'react';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { useRouter } from 'next/navigation';
import { fetchUserProfile } from '@/lib/userProfile';
import { Bell, Settings, Search, Menu, Home, Grid3X3, BarChart3, Users } from 'lucide-react';

export function ModernHeader() {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string>('Usuário');

  React.useEffect(()=>{
    (async ()=>{
      const profile = await fetchUserProfile();
      if (profile) {
        setAvatarUrl(profile.avatarUrl);
        setDisplayName(profile.name || 'Usuário');
      }
    })();
  },[]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-divider">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Left Section - Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <img 
              src="/BS Vertical branco SEM FUNDO.png" 
              alt="Blacksider Hub" 
              className="h-10 w-auto"
            />
            <h1 className="text-xl font-semibold">Hub</h1>
          </div>
          
          <nav className="hidden">
            <Button variant="light" size="sm" startContent={<Home size={16} />} className="text-default-600">
              Dashboard
            </Button>
            <Button variant="light" size="sm" startContent={<Grid3X3 size={16} />} className="text-default-600">
              Apps
            </Button>
            <Button variant="light" size="sm" startContent={<BarChart3 size={16} />} className="text-default-600">
              Analytics
            </Button>
            <Button variant="light" size="sm" startContent={<Users size={16} />} className="text-default-600">
              Team
            </Button>
          </nav>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-4">
          <Button isIconOnly variant="light" size="sm" className="text-default-600">
            <Search size={18} />
          </Button>
          
          <Badge content="3" color="danger" size="sm">
            <Button isIconOnly variant="light" size="sm" className="text-default-600">
              <Bell size={18} />
            </Button>
          </Badge>

          <Button isIconOnly variant="light" size="sm" className="text-default-600">
            <Settings size={18} />
          </Button>

          <div className="h-8 w-px bg-divider" />

          {/* User Avatar with Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                size="sm"
                src={avatarUrl || 'https://i.pravatar.cc/150?u=a042581f4e29026024d'}
                name={displayName}
              />
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Menu do usuário"
              className="w-56"
            >
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">{displayName}</p>
              </DropdownItem>
              <DropdownItem key="settings" startContent={<Settings size={16} />}>
                Configurações
              </DropdownItem>
              <DropdownItem key="team">Configurações da Equipe</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="help">Ajuda & Feedback</DropdownItem>
              <DropdownItem key="logout" color="danger">
                Sair
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}