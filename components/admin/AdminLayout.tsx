"use client";

import React from 'react';
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem
} from '@heroui/navbar';
import { Button } from '@heroui/button';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Badge } from '@heroui/badge';
import { Divider } from '@heroui/divider';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/breadcrumbs';
import { Input } from '@heroui/input';
import { Kbd } from '@heroui/kbd';
import { 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Upload, 
  Image as ImageIcon,
  Users,
  LogOut,
  Search,
  Menu,
  Shield,
  Activity,
  Terminal,
  Zap,
  Database,
  ChevronRight
} from 'lucide-react';
import { Card, CardBody } from '@heroui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProfileSettings } from '@/components/profile/ProfileSettings';

interface AdminLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [notifications, setNotifications] = React.useState(3);
  const [showProfileSettings, setShowProfileSettings] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        setUser(session.session.user);
      }
    })();
  }, []);

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none animate-grid-move" />
      
      {/* Top Navbar */}
      <Navbar 
        isBordered 
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className="bg-black/80 backdrop-blur-md border-b border-primary/20"
        maxWidth="full"
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="lg:hidden"
          />
          <NavbarBrand>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-primary">ADMIN HUB</p>
                <p className="text-xs text-default-500">Control Panel</p>
              </div>
            </div>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden lg:flex gap-6" justify="center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <NavbarItem key={item.href} isActive={isActive}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,255,0,0.3)]' 
                      : 'text-default-500 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </NavbarItem>
            );
          })}
        </NavbarContent>

        <NavbarContent justify="end">
          {/* Search */}
          <NavbarItem className="hidden lg:flex">
            <Input
              classNames={{
                base: "max-w-full sm:max-w-[200px] h-10",
                mainWrapper: "h-full",
                input: "text-small",
                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder="Buscar..."
              size="sm"
              startContent={<Search className="w-4 h-4" />}
              endContent={<Kbd keys={["command"]}>K</Kbd>}
              type="search"
            />
          </NavbarItem>

          {/* Notifications */}
          <NavbarItem>
            <Badge content={notifications} color="danger" shape="circle" size="sm">
              <Button
                isIconOnly
                variant="light"
                className="text-default-500"
              >
                <Bell className="w-5 h-5" />
              </Button>
            </Badge>
          </NavbarItem>

          {/* User Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user?.email?.charAt(0).toUpperCase()}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="profile">
                <p className="font-semibold">Conectado como</p>
                <p className="font-semibold text-primary">{user?.email}</p>
              </DropdownItem>
              <DropdownItem 
                key="settings" 
                startContent={<Settings className="w-4 h-4" />}
                onPress={() => setShowProfileSettings(true)}
              >
                Editar Perfil
              </DropdownItem>
              <DropdownItem key="activity" startContent={<Activity className="w-4 h-4" />}>
                Atividade
              </DropdownItem>
              <DropdownItem 
                key="logout" 
                color="danger" 
                startContent={<LogOut className="w-4 h-4" />}
                onPress={handleLogout}
              >
                Sair
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="bg-black/95 backdrop-blur-md">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <NavbarMenuItem key={item.href}>
                <Link
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                    isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-default-500'
                  }`}
                  href={item.href}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </NavbarMenuItem>
            );
          })}
        </NavbarMenu>
      </Navbar>

      {/* Main Content */}
      <div className="flex">
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