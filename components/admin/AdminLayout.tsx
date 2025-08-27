"use client";

import React from 'react';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Badge } from '@heroui/badge';
import { Divider } from '@heroui/divider';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/breadcrumbs';
import { 
  Settings, 
  LogOut,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Card, CardBody } from '@heroui/card';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { ModernHeader } from '@/components/modern-header';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);
  const [showProfileSettings, setShowProfileSettings] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        setUser(session.session.user);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none animate-grid-move" />
      
      {/* Modern Header with Admin Tabs */}
      <ModernHeader />

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-65px)] bg-black border-r border-divider">
          <div className="p-6">
            {/* User Profile Card */}
            <Card className="bg-glass backdrop-blur-md border border-subtle">
              <CardBody className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => setShowProfileSettings(true)}
                  >
                    <Avatar
                      src={user?.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user?.email}`}
                      className="w-20 h-20 ring-2 ring-primary/30"
                      isBordered
                      color="primary"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-primary">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
                    </h3>
                    <p className="text-xs text-default-500">
                      {user?.email}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Badge 
                        content="ADMIN" 
                        color="danger" 
                        variant="flat"
                        className="px-2"
                      >
                        <Shield className="w-4 h-4 text-danger" />
                      </Badge>
                    </div>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="space-y-2">
                  <Button 
                    fullWidth 
                    color="primary"
                    variant="flat"
                    size="sm"
                    startContent={<Settings className="w-4 h-4" />}
                    onPress={() => setShowProfileSettings(true)}
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    fullWidth 
                    variant="light"
                    size="sm"
                    color="danger"
                    startContent={<LogOut className="w-4 h-4" />}
                    onPress={handleLogout}
                  >
                    Sair do Admin
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <Breadcrumbs 
              className="mb-6"
              separator={<ChevronRight className="w-4 h-4" />}
              itemClasses={{
                item: "text-default-500",
                separator: "text-default-500",
              }}
            >
              <BreadcrumbItem href="/admin">Admin</BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <BreadcrumbItem 
                  key={index} 
                  href={crumb.href}
                  className={index === breadcrumbs.length - 1 ? "text-primary" : ""}
                >
                  {crumb.label}
                </BreadcrumbItem>
              ))}
            </Breadcrumbs>
          )}

          {/* Page Content */}
          {children}
        </main>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettings 
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        user={user}
        onUpdate={() => {
          // Reload user data
          (async () => {
            const { data: session } = await supabase.auth.getSession();
            if (session.session) {
              setUser(session.session.user);
            }
          })();
          setShowProfileSettings(false);
        }}
      />
    </div>
  );
}