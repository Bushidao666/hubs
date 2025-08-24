"use client";

import React from "react";
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from "@heroui/table";
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Pagination } from "@heroui/pagination";
import { Tooltip } from "@heroui/tooltip";
import { Badge } from "@heroui/badge";
import { Spinner } from "@heroui/spinner";
import { Tabs, Tab } from "@heroui/tabs";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { supabase } from "@/lib/supabaseClient";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Power,
  Settings,
  Database,
  Globe,
  Shield,
  Activity,
  RefreshCcw,
  Download,
  Upload,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle
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

export default function AdminAppsPage() {
  const [apps, setApps] = React.useState<AdminApp[]>([]);
  const [filteredApps, setFilteredApps] = React.useState<AdminApp[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set(["all"]));
  const [page, setPage] = React.useState(1);
  const [selectedApp, setSelectedApp] = React.useState<AdminApp | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = React.useState("overview");

  const rowsPerPage = 10;

  React.useEffect(() => {
    fetchApps();
  }, []);

  React.useEffect(() => {
    filterApps();
  }, [apps, searchValue, statusFilter]);

  const fetchApps = async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      window.location.href = "/login";
      return;
    }
    
    const { data: adminFlag } = await supabase.rpc('hub_is_admin');
    if (!adminFlag) {
      window.location.href = '/';
      return;
    }

    const { data, error } = await supabase.rpc("hub_admin_list_apps");
    if (!error && data) {
      setApps(data as AdminApp[]);
    }
    setLoading(false);
  };

  const filterApps = () => {
    let filtered = [...apps];

    // Search filter
    if (searchValue) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        app.slug.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Status filter
    if (!statusFilter.has("all")) {
      filtered = filtered.filter(app => statusFilter.has(app.status));
    }

    setFilteredApps(filtered);
    setPage(1);
  };

  const updateApp = async (app: AdminApp) => {
    setSaving(true);
    await supabase.rpc('hub_admin_update_app', {
      p_slug: app.slug,
      p_name: app.name,
      p_enabled: app.enabled,
      p_status: app.status,
      p_sso_login_url: app.sso_login_url || null,
      p_description: app.description || null
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

  const pages = Math.ceil(filteredApps.length / rowsPerPage);
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredApps.slice(start, end);
  }, [page, filteredApps]);

  const statusColorMap = {
    online: "success",
    maintenance: "warning",
    offline: "danger",
  };

  const openEditModal = (app: AdminApp) => {
    setSelectedApp({...app});
    onOpen();
  };

  const renderCell = React.useCallback((app: AdminApp, columnKey: React.Key) => {
    switch (columnKey) {
      case "name":
        return (
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
        );
      case "status":
        return (
          <div className="flex items-center gap-2">
            <Chip
              className="capitalize"
              color={statusColorMap[app.status] as any}
              size="sm"
              variant="dot"
            >
              {app.status}
            </Chip>
            {app.enabled ? (
              <Tooltip content="Ativo">
                <CheckCircle className="w-4 h-4 text-success" />
              </Tooltip>
            ) : (
              <Tooltip content="Desativado">
                <XCircle className="w-4 h-4 text-danger" />
              </Tooltip>
            )}
          </div>
        );
      case "sso":
        return app.sso_login_url ? (
          <Tooltip content={app.sso_login_url}>
            <Badge color="primary" variant="flat" className="cursor-pointer">
              <Globe className="w-3 h-3 mr-1" />
              SSO Configurado
            </Badge>
          </Tooltip>
        ) : (
          <span className="text-default-400 text-sm">—</span>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
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
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="App actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="w-4 h-4" />}
                >
                  Ver Detalhes
                </DropdownItem>
                <DropdownItem
                  key="copy"
                  startContent={<Copy className="w-4 h-4" />}
                >
                  Duplicar
                </DropdownItem>
                <DropdownItem
                  key="logs"
                  startContent={<Activity className="w-4 h-4" />}
                >
                  Ver Logs
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={() => deleteApp(app.slug)}
                >
                  Deletar
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return getKeyValue(app, columnKey);
    }
  }, []);

  return (
    <AdminLayout breadcrumbs={[{ label: "Aplicações" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Database className="w-6 h-6" />
              Gerenciar Aplicações
            </h1>
            <p className="text-default-500 mt-1">Gerencie todos os aplicativos do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button
              color="default"
              variant="flat"
              startContent={<Upload className="w-4 h-4" />}
            >
              Importar
            </Button>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
            >
              Nova Aplicação
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-glass backdrop-blur-md border border-subtle">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-default-500">TOTAL</p>
                  <p className="text-2xl font-bold text-primary">{apps.length}</p>
                </div>
                <Database className="w-8 h-8 text-primary/20" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-glass backdrop-blur-md border border-subtle">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-default-500">ONLINE</p>
                  <p className="text-2xl font-bold text-success">
                    {apps.filter(a => a.status === 'online').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success/20" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-glass backdrop-blur-md border border-subtle">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-default-500">MANUTENÇÃO</p>
                  <p className="text-2xl font-bold text-warning">
                    {apps.filter(a => a.status === 'maintenance').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-warning/20" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-glass backdrop-blur-md border border-subtle">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-default-500">OFFLINE</p>
                  <p className="text-2xl font-bold text-danger">
                    {apps.filter(a => a.status === 'offline').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-danger/20" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className="bg-glass backdrop-blur-md border border-subtle">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <Input
                isClearable
                className="w-full md:max-w-[300px]"
                placeholder="Buscar aplicações..."
                startContent={<Search className="w-4 h-4" />}
                value={searchValue}
                onClear={() => setSearchValue("")}
                onValueChange={setSearchValue}
              />
              <Select
                className="w-full md:max-w-[200px]"
                placeholder="Filtrar por status"
                selectedKeys={statusFilter}
                onSelectionChange={setStatusFilter as any}
                startContent={<Filter className="w-4 h-4" />}
              >
                <SelectItem key="all">Todos</SelectItem>
                <SelectItem key="online">Online</SelectItem>
                <SelectItem key="maintenance">Manutenção</SelectItem>
                <SelectItem key="offline">Offline</SelectItem>
              </Select>
              <div className="flex gap-2 ml-auto">
                <Button
                  isIconOnly
                  variant="flat"
                  onPress={fetchApps}
                  isLoading={loading}
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <>
                <Table
                  aria-label="Apps table"
                  bottomContent={
                    pages > 1 && (
                      <div className="flex w-full justify-center">
                        <Pagination
                          isCompact
                          showControls
                          showShadow
                          color="primary"
                          page={page}
                          total={pages}
                          onChange={setPage}
                        />
                      </div>
                    )
                  }
                  classNames={{
                    wrapper: "bg-transparent",
                    th: "bg-transparent text-default-500 border-b border-divider",
                    td: "py-3",
                  }}
                >
                  <TableHeader>
                    <TableColumn key="name">APLICAÇÃO</TableColumn>
                    <TableColumn key="status">STATUS</TableColumn>
                    <TableColumn key="sso">SSO</TableColumn>
                    <TableColumn key="actions">AÇÕES</TableColumn>
                  </TableHeader>
                  <TableBody
                    emptyContent="Nenhuma aplicação encontrada"
                    items={items}
                  >
                    {(item) => (
                      <TableRow key={item.slug}>
                        {(columnKey) => (
                          <TableCell>{renderCell(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardBody>
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          backdrop="blur"
          classNames={{
            body: "bg-background",
            header: "bg-background border-b border-divider",
            footer: "bg-background border-t border-divider",
            closeButton: "hover:bg-white/5 active:bg-white/10",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Editar Aplicação
                </ModalHeader>
                <ModalBody>
                  {selectedApp && (
                    <Tabs
                      aria-label="App settings"
                      color="primary"
                      variant="underlined"
                      selectedKey={activeTab}
                      onSelectionChange={setActiveTab as any}
                    >
                      <Tab key="overview" title="Geral">
                        <div className="space-y-4 mt-4">
                          <Input
                            label="Nome"
                            placeholder="Nome da aplicação"
                            value={selectedApp.name}
                            onValueChange={(v) => setSelectedApp({...selectedApp, name: v})}
                            startContent={<Database className="w-4 h-4 text-default-400" />}
                          />
                          <Input
                            label="Slug"
                            placeholder="app-slug"
                            value={selectedApp.slug}
                            isReadOnly
                            startContent={<Shield className="w-4 h-4 text-default-400" />}
                          />
                          <Select
                            label="Status"
                            placeholder="Selecione o status"
                            selectedKeys={[selectedApp.status]}
                            onSelectionChange={(keys) => {
                              const status = Array.from(keys)[0] as AdminApp["status"];
                              setSelectedApp({...selectedApp, status});
                            }}
                          >
                            <SelectItem key="online">Online</SelectItem>
                            <SelectItem key="maintenance">Manutenção</SelectItem>
                            <SelectItem key="offline">Offline</SelectItem>
                          </Select>
                          <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
                            <div>
                              <p className="font-medium">Aplicação Ativa</p>
                              <p className="text-xs text-default-500">
                                Permite que usuários acessem esta aplicação
                              </p>
                            </div>
                            <Switch
                              isSelected={selectedApp.enabled}
                              onValueChange={(v) => setSelectedApp({...selectedApp, enabled: v})}
                              color="success"
                            />
                          </div>
                        </div>
                      </Tab>
                      <Tab key="sso" title="SSO">
                        <div className="space-y-4 mt-4">
                          <Input
                            label="URL de SSO"
                            placeholder="https://app.example.com/sso"
                            value={selectedApp.sso_login_url || ''}
                            onValueChange={(v) => setSelectedApp({...selectedApp, sso_login_url: v})}
                            startContent={<Globe className="w-4 h-4 text-default-400" />}
                          />
                          <Textarea
                            label="Descrição"
                            placeholder="Descrição da aplicação..."
                            value={selectedApp.description || ''}
                            onValueChange={(v) => setSelectedApp({...selectedApp, description: v})}
                            minRows={3}
                          />
                        </div>
                      </Tab>
                    </Tabs>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => selectedApp && updateApp(selectedApp)}
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
    </AdminLayout>
  );
}