"use client";

import React from 'react';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { Divider } from '@heroui/divider';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/breadcrumbs';
import { Sheet, SheetContent, SheetTrigger } from '@heroui/sheet';
import { 
  Settings, 
  LogOut,
  Shield,
  ChevronRight,
  Menu,
  User,
  Home,
  X
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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

  // Sidebar Content Component - reutilizável para desktop e mobile
  const SidebarContent = () => (
    <div className="h-full bg-black/95 backdrop-blur-xl">
      <div className="p-6 space-y-6">
        {/* User Profile Card */}
        <Card className="bg-glass backdrop-blur-md border border-subtle">
          <CardBody className="p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar com hover effect */}
              <div 
                className="relative group cursor-pointer"
                onClick={() => {
                  setShowProfileSettings(true);
                  setIsSidebarOpen(false);
                }}
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
              
              {/* User Info */}
              <div className="text-center space-y-2 w-full">
                <h3 className="text-lg font-semibold text-primary truncate max-w-full px-2">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
                </h3>
                <p className="text-xs text-default-500 truncate max-w-full px-2">
                  {user?.email}
                </p>
                
                {/* Admin Badge - melhorado */}
                <div className="flex justify-center items-center gap-2 pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-danger/20 border border-danger/30">
                    <Shield className="w-4 h-4 text-danger" />
                    <span className="text-xs font-semibold text-danger">ADMIN</span>
                  </div>
                </div>
              </div>
            </div>

            <Divider className="my-4" />

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                fullWidth 
                color="primary"
                variant="flat"
                size="sm"
                startContent={<Settings className="w-4 h-4" />}
                onPress={() => {
                  setShowProfileSettings(true);
                  setIsSidebarOpen(false);
                }}
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

        {/* Quick Stats - opcional para mobile */}
        <Card className="bg-glass backdrop-blur-md border border-subtle lg:hidden">
          <CardBody className="p-4">
            <h4 className="text-sm font-semibold text-primary mb-3">Status Rápido</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-default-500">Última Atividade</span>
                <span className="text-xs text-primary">Agora</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-default-500">Privilégios</span>
                <span className="text-xs text-danger">Total</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-default-500">Sessão</span>
                <span className="text-xs text-success">Ativa</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none animate-grid-move" />
      
      {/* Modern Header with Admin Tabs */}
      <ModernHeader />

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-64px)] border-r border-divider fixed left-0 top-16 overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Toggle Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Button
            isIconOnly
            color="primary"
            variant="shadow"
            size="lg"
            radius="full"
            onPress={() => setIsSidebarOpen(true)}
            className="shadow-lg shadow-primary/30"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Sidebar Sheet */}
        {isSidebarOpen && (
          <div className="lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed left-0 top-16 bottom-0 w-72 z-50 overflow-y-auto">
              <div className="relative h-full">
                {/* Close button */}
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="absolute top-2 right-2 z-10"
                  onPress={() => setIsSidebarOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        {/* Page Content - adjusted margin for desktop sidebar */}
        <main className="flex-1 lg:ml-64 w-full">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Breadcrumbs - responsive */}
            {breadcrumbs.length > 0 && (
              <Breadcrumbs 
                className="mb-6"
                separator={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />}
                itemClasses={{
                  item: "text-default-500 text-xs sm:text-sm",
                  separator: "text-default-500",
                }}
              >
                <BreadcrumbItem href="/admin">
                  <span className="hidden sm:inline">Admin</span>
                  <Home className="w-3 h-3 sm:hidden" />
                </BreadcrumbItem>
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
          </div>
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