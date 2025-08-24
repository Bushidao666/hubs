"use client";
import React from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Bell, Upload, LayoutDashboard, PlusCircle, RefreshCcw, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Chip } from '@heroui/chip';

export default function AdminHomePage() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string|null>(null);
  const [apps, setApps] = React.useState<any[]>([]);
  const [notices, setNotices] = React.useState<any[]>([]);

  React.useEffect(()=>{
    (async ()=>{
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        window.location.href = '/login';
        return;
      }
      const { data: adminFlag } = await supabase.rpc('hub_is_admin');
      if (!adminFlag) {
        setError('Acesso negado (somente Admin).');
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      const [{ data: appsData }, { data: noticesData }] = await Promise.all([
        supabase.rpc('hub_admin_list_apps'),
        supabase.rpc('hub_admin_list_notices')
      ]);
      setApps((appsData as any[]) || []);
      setNotices((noticesData as any[]) || []);
      setLoading(false);
    })();
  },[]);

  const appsCount = apps.length;
  const noticesCount = notices.length;
  const maintCount = apps.filter((a)=> a.status === 'maintenance').length;

  const statusColor = (s: string) => {
    switch (s) {
      case 'online': return 'success';
      case 'maintenance': return 'warning';
      case 'offline': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6 bg-background text-foreground">
      {/* Hero */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold">Admin • Dashboard</h1>
          </div>
          <p className="text-sm text-default-500">Gerencie apps, avisos e importações em um só lugar.</p>
        </div>
        <Button size="sm" variant="flat" color="primary" onPress={()=>window.location.reload()} isDisabled={loading} startContent={<RefreshCcw className="w-4 h-4"/>}>
          {loading? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-danger">{error}</div>
      )}

      {isAdmin && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-content1 border border-default-100"><CardBody className="space-y-2">
              <div className="text-sm text-default-500">Aplicativos</div>
              <div className="text-2xl font-semibold text-primary">{appsCount}</div>
              <div className="text-xs text-default-500">{maintCount} em manutenção</div>
            </CardBody></Card>
            <Card className="bg-content1 border border-default-100"><CardBody className="space-y-2">
              <div className="text-sm text-default-500">Avisos</div>
              <div className="text-2xl font-semibold text-primary">{noticesCount}</div>
              <div className="text-xs text-default-500">Último: {notices[0]?.title ? notices[0].title : '—'}</div>
            </CardBody></Card>
            <Card className="bg-content1 border border-default-100"><CardBody className="space-y-2">
              <div className="text-sm text-default-500">Ações Rápidas</div>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/apps"><Button size="sm" variant="flat" color="primary" startContent={<Settings className="w-4 h-4"/>}>Gerenciar Apps</Button></Link>
                <Link href="/admin/notices"><Button size="sm" variant="flat" color="primary" startContent={<Bell className="w-4 h-4"/>}>Gerenciar Avisos</Button></Link>
                <Link href="/admin/import"><Button size="sm" variant="flat" color="primary" startContent={<Upload className="w-4 h-4"/>}>Importar CSV</Button></Link>
              </div>
            </CardBody></Card>
          </div>

          {/* Quick create */}
          <Card className="bg-content1 border border-default-100">
            <CardBody className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-default-500">Criar rapidamente:</span>
              <Link href="/admin/notices"><Button size="sm" color="primary" startContent={<PlusCircle className="w-4 h-4"/>}>Novo Aviso</Button></Link>
              <Link href="/admin/apps"><Button size="sm" color="primary" startContent={<PlusCircle className="w-4 h-4"/>}>Novo App</Button></Link>
              <Link href="/admin/import"><Button size="sm" color="primary" startContent={<Upload className="w-4 h-4"/>}>Importar CSV</Button></Link>
            </CardBody>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status dos Apps */}
            <Card className="bg-content1 border border-default-100">
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-primary"/><h2 className="font-medium">Status dos Apps</h2></div>
                <div className="space-y-2">
                  {(apps.slice(0,6)).map((a)=> (
                    <div key={a.slug} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-default-500">{a.slug}</div>
                      </div>
                      <Chip size="sm" color={statusColor(a.status)} variant="flat">{a.status}</Chip>
                    </div>
                  ))}
                  {!apps.length && <div className="text-sm text-default-500">Nenhum app cadastrado.</div>}
                </div>
              </CardBody>
            </Card>

            {/* Avisos Recentes */}
            <Card className="bg-content1 border border-default-100">
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2"><Bell className="w-4 h-4 text-primary"/><h2 className="font-medium">Avisos Recentes</h2></div>
                <div className="space-y-2">
                  {(notices.slice(0,6)).map((n)=> (
                    <div key={n.id} className="text-sm">
                      <div className="font-medium">{n.title}</div>
                      <div className="text-xs text-default-500">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                  {!notices.length && <div className="text-sm text-default-500">Nenhum aviso.</div>}
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
