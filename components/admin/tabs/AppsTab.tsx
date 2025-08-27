"use client";

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Badge } from '@heroui/badge';
import { Tooltip } from '@heroui/tooltip';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Textarea } from '@heroui/input';
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Power, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  ExternalLink
} from 'lucide-react';

type AdminApp = {
  slug: string;
  name: string;
  enabled: boolean;
  status: "online" | "maintenance" | "offline";
  sso_login_url?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function AppsTab() {
  const [apps, setApps] = React.useState<AdminApp[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedApp, setSelectedApp] = React.useState<AdminApp | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("hub_admin_list_apps");
    if (!error && data) {
      setApps(data as AdminApp[]);
    }
    setLoading(false);
  };

  const updateApp = async () => {
    if (!selectedApp) return;
    setSaving(true);
    await supabase.rpc('hub_admin_update_app', {
      p_slug: selectedApp.slug,
      p_name: selectedApp.name,
      p_enabled: selectedApp.enabled,
      p_status: selectedApp.status,
      p_sso_login_url: selectedApp.sso_login_url || null,
      p_description: selectedApp.description || null
    });
    await fetchApps();
    setSaving(false);
    onClose();
  };

  const deleteApp = async (slug: string) => {
    if (!confirm(`Tem certeza que deseja deletar ${slug}?`)) return;
    setSaving(true);
    await supabase.from('hub_apps').delete().eq('slug', slug);
    await fetchApps();
    setSaving(false);
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    app.slug.toLowerCase().includes(searchValue.toLowerCase())
  );

  const statusColorMap = {
    online: "success",
    maintenance: "warning",
    offline: "danger",
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'online': return <CheckCircle className="w-3 h-3" />;
      case 'maintenance': return <AlertCircle className="w-3 h-3" />;
      case 'offline': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const openEditModal = (app: AdminApp) => {
    setSelectedApp({...app});
    onOpen();
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header & Stats */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gerenciar Aplicações</h3>
              <p className="text-sm text-default-500">Total: {apps.length} aplicações</p>
            </div>
          </div>
          <Button 
            color="primary" 
            startContent={<Plus className="w-4 h-4" />}
            size="sm"
          >
            Nova Aplicação
          </Button>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Card className="bg-content1">
              <CardBody className="text-center py-3">
                <p className="text-2xl font-bold text-success">
                  {apps.filter(a => a.status === 'online').length}
                </p>
                <p className="text-xs text-default-500">Online</p>
              </CardBody>
            </Card>
            <Card className="bg-content1">
              <CardBody className="text-center py-3">
                <p className="text-2xl font-bold text-warning">
                  {apps.filter(a => a.status === 'maintenance').length}
                </p>
                <p className="text-xs text-default-500">Manutenção</p>
              </CardBody>
            </Card>
            <Card className="bg-content1">
              <CardBody className="text-center py-3">
                <p className="text-2xl font-bold text-danger">
                  {apps.filter(a => a.status === 'offline').length}
                </p>
                <p className="text-xs text-default-500">Offline</p>
              </CardBody>
            </Card>
          </div>
          
          <Input 
            placeholder="Buscar aplicações..." 
            value={searchValue} 
            onValueChange={setSearchValue}
            startContent={<Search className="w-4 h-4 text-default-400" />}
            className="max-w-xs"
            size="sm"
          />
        </CardBody>
      </Card>

      {/* Apps Table */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardBody>
          <ScrollShadow className="h-[500px]">
            {loading && (
              <div className="text-center py-8 text-default-500">
                Carregando...
              </div>
            )}
            
            {!loading && filteredApps.length === 0 && (
              <div className="text-center py-8 text-default-500">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma aplicação encontrada</p>
              </div>
            )}

            {!loading && filteredApps.length > 0 && (
              <Table 
                removeWrapper
                aria-label="Aplicações"
                classNames={{
                  th: "bg-transparent text-default-500 border-b border-divider",
                  td: "py-3",
                }}
              >
                <TableHeader>
                  <TableColumn>APLICAÇÃO</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>SSO</TableColumn>
                  <TableColumn>AÇÕES</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.slug}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            app.status === 'online' ? 'bg-success/10' :
                            app.status === 'maintenance' ? 'bg-warning/10' : 'bg-danger/10'
                          }`}>
                            <Database className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{app.name}</p>
                            <p className="text-xs text-default-500">{app.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Chip
                            className="capitalize"
                            color={statusColorMap[app.status] as any}
                            size="sm"
                            variant="dot"
                            startContent={getStatusIcon(app.status)}
                          >
                            {app.status}
                          </Chip>
                          {app.enabled ? (
                            <Tooltip content="Ativo">
                              <Power className="w-4 h-4 text-success" />
                            </Tooltip>
                          ) : (
                            <Tooltip content="Desativado">
                              <Power className="w-4 h-4 text-danger opacity-50" />
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.sso_login_url ? (
                          <Tooltip content={app.sso_login_url}>
                            <Badge color="primary" variant="flat" className="cursor-pointer">
                              <Globe className="w-3 h-3 mr-1" />
                              SSO
                            </Badge>
                          </Tooltip>
                        ) : (
                          <span className="text-default-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="Editar">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => openEditModal(app)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Ver logs">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                            >
                              <Activity className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Deletar" color="danger">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => deleteApp(app.slug)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollShadow>
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {selectedApp && (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-primary" />
                Editar Aplicação
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Nome"
                    value={selectedApp.name}
                    onValueChange={(v) => setSelectedApp({...selectedApp, name: v})}
                  />
                  <Input
                    label="Slug"
                    value={selectedApp.slug}
                    isReadOnly
                    className="opacity-50"
                  />
                  <Select
                    label="Status"
                    selectedKeys={[selectedApp.status]}
                    onSelectionChange={(k) => setSelectedApp({
                      ...selectedApp, 
                      status: Array.from(k)[0] as any
                    })}
                  >
                    <SelectItem key="online" startContent={<CheckCircle className="w-4 h-4 text-success" />}>
                      Online
                    </SelectItem>
                    <SelectItem key="maintenance" startContent={<AlertCircle className="w-4 h-4 text-warning" />}>
                      Manutenção
                    </SelectItem>
                    <SelectItem key="offline" startContent={<XCircle className="w-4 h-4 text-danger" />}>
                      Offline
                    </SelectItem>
                  </Select>
                  <Input
                    label="SSO Login URL"
                    value={selectedApp.sso_login_url || ""}
                    onValueChange={(v) => setSelectedApp({...selectedApp, sso_login_url: v})}
                    placeholder="https://app.exemplo.com/login"
                    startContent={<Globe className="w-4 h-4 text-default-400" />}
                  />
                  <Textarea
                    label="Descrição"
                    value={selectedApp.description || ""}
                    onValueChange={(v) => setSelectedApp({...selectedApp, description: v})}
                    minRows={3}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={selectedApp.enabled}
                      onValueChange={(v) => setSelectedApp({...selectedApp, enabled: v})}
                    >
                      Aplicação Ativa
                    </Switch>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button 
                  color="primary" 
                  onPress={updateApp}
                  isLoading={saving}
                >
                  Salvar Alterações
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}