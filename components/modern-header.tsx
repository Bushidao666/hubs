"use client";

import React from 'react';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Button } from '@heroui/button';
import { Badge } from '@heroui/badge';
import { Tabs, Tab } from '@heroui/tabs';
import { useRouter, usePathname } from 'next/navigation';
import { fetchUserProfile } from '@/lib/userProfile';
import { supabase } from '@/lib/supabaseClient';
import { 
  Bell, Settings, Search, Menu, Home, Grid3X3, BarChart3, Users,
  Shield, Database, Upload, Image as ImageIcon, Activity
} from 'lucide-react';

export function ModernHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [displayName, setDisplayName] = React.useState<string>('Usuário');
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('dashboard');

  React.useEffect(() => {
    // Set selected tab based on current path
    if (pathname === '/admin') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      setSelectedTab(tab || 'overview');
    } else {
      setSelectedTab('dashboard');
    }
  }, [pathname]);

  React.useEffect(()=>{
    (async ()=>{
      const profile = await fetchUserProfile();
      if (profile) {
        setAvatarUrl(profile.avatarUrl);
        setDisplayName(profile.name || 'Usuário');
      }
      
      // Check if user is admin
      const { data: adminFlag } = await supabase.rpc('hub_is_admin');
      setIsAdmin(!!adminFlag);
    })();
  },[]);

  const handleTabChange = (key: React.Key) => {
    const tabKey = key.toString();
    if (tabKey === 'dashboard') {
      router.push('/');
    } else {
      router.push(`/admin?tab=${tabKey}`);
    }
  };

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
          
          {/* Admin Navigation Tabs */}
          {isAdmin && (
            <Tabs 
              selectedKey={selectedTab}
              onSelectionChange={handleTabChange}
              aria-label="Admin navigation"
              color="primary"
              variant="underlined"
              size="sm"
              classNames={{
                tabList: "gap-4",
                cursor: "bg-primary",
                tab: "h-12",
                tabContent: "group-data-[selected=true]:text-primary"
              }}
            >
              <Tab
                key="dashboard"
                title={
                  <div className="flex items-center space-x-1">
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                }
              />
              <Tab
                key="overview"
                title={
                  <div className="flex items-center space-x-1">
                    <Activity className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                }
              />
              <Tab
                key="apps"
                title={
                  <div className="flex items-center space-x-1">
                    <Database className="w-4 h-4" />
                    <span>Apps</span>
                  </div>
                }
              />
              <Tab
                key="users"
                title={
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>Usuários</span>
                  </div>
                }
              />
              <Tab
                key="notices"
                title={
                  <div className="flex items-center space-x-1">
                    <Bell className="w-4 h-4" />
                    <span>Avisos</span>
                  </div>
                }
              />
              <Tab
                key="banners"
                title={
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="w-4 h-4" />
                    <span>Banners</span>
                  </div>
                }
              />
              <Tab
                key="import"
                title={
                  <div className="flex items-center space-x-1">
                    <Upload className="w-4 h-4" />
                    <span>Importar</span>
                  </div>
                }
              />
              <Tab
                key="admins"
                title={
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Admins</span>
                  </div>
                }
              />
            </Tabs>
          )}
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
              {isAdmin ? (
                <DropdownItem 
                  key="admin" 
                  startContent={<Shield size={16} />}
                  onPress={() => router.push('/admin')}
                >
                  Painel Admin
                </DropdownItem>
              ) : null}
              <DropdownItem 
                key="settings" 
                startContent={<Settings size={16} />}
                onPress={() => router.push('/settings')}
              >
                Configurações
              </DropdownItem>
              <DropdownItem key="team">Configurações da Equipe</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="help">Ajuda & Feedback</DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger"
                onPress={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
              >
                Sair
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}