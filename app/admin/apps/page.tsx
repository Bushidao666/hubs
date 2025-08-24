"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { supabase } from "@/lib/supabaseClient";

type AdminApp = {
  slug: string;
  name: string;
  enabled: boolean;
  status: "online" | "maintenance" | "offline";
  sso_login_url?: string;
  description?: string | null;
};

export default function AdminAppsPage() {
  const [apps, setApps] = React.useState<AdminApp[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc("hub_admin_list_apps");
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setApps((data as AdminApp[]) || []);
  };

  React.useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        window.location.href = "/login";
        return;
      }
      const { data: adminFlag } = await supabase.rpc('hub_is_admin');
      if (!adminFlag) {
        setError('Acesso negado (somente Admin).');
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      fetchApps();
    })();
  }, []);

  const updateApp = async (app: AdminApp) => {
    const { error } = await supabase.rpc("hub_admin_upsert_app", {
      p_slug: app.slug,
      p_name: app.name,
      p_sso_login_url: app.sso_login_url || '',
      p_enabled: app.enabled,
      p_description: app.description || '',
      p_status: app.status || 'online'
    });
    if (error) setError(error.message);
    await fetchApps();
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "online":
        return "success";
      case "maintenance":
        return "warning";
      case "offline":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen p-6">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Admin • Apps</h1>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="flat" onPress={fetchApps} isDisabled={loading}>
                {loading ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-danger">
              {error.includes("forbidden") ? "Acesso negado (somente Admin)." : error}
            </div>
          )}

          {isAdmin && (
          <Table aria-label="Apps admin table" removeWrapper>
            <TableHeader>
              <TableColumn>App</TableColumn>
              <TableColumn>Slug</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Enabled</TableColumn>
              <TableColumn>SSO URL</TableColumn>
              <TableColumn>Descrição</TableColumn>
              <TableColumn>Ações</TableColumn>
            </TableHeader>
            <TableBody emptyContent={loading ? "Carregando..." : "Nenhum app"}>
              {apps.map((app) => (
                <TableRow key={app.slug}>
                  <TableCell>
                    <Input size="sm" value={app.name} onValueChange={(v)=> setApps(prev=> prev.map(a=> a.slug===app.slug?{...a,name:v}:a))} />
                  </TableCell>
                  <TableCell className="text-default-500 font-mono text-xs">{app.slug}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" color={statusColor(app.status)} variant="flat">
                        {app.status}
                      </Chip>
                      <Select
                        aria-label="status"
                        size="sm"
                        selectedKeys={[app.status]}
                        onSelectionChange={(keys) => {
                          const val = Array.from(keys)[0] as AdminApp["status"];
                          setApps(prev=> prev.map(a=> a.slug===app.slug?{...a,status:val}:a))
                        }}
                        className="w-40"
                      >
                        {(["online", "maintenance", "offline"] as const).map((opt) => (
                          <SelectItem key={opt}>{opt}</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      size="sm"
                      isSelected={app.enabled}
                      onValueChange={(v) => setApps(prev=> prev.map(a=> a.slug===app.slug?{...a,enabled:v}:a))}
                    />
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <Input size="sm" value={app.sso_login_url || ''} onValueChange={(v)=> setApps(prev=> prev.map(a=> a.slug===app.slug?{...a,sso_login_url:v}:a))} />
                  </TableCell>
                  <TableCell className="max-w-md">
                    <Textarea size="sm" value={app.description || ''} onValueChange={(v)=> setApps(prev=> prev.map(a=> a.slug===app.slug?{...a,description:v}:a))} />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="flat" onPress={() => updateApp(app)}>
                      Salvar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}


