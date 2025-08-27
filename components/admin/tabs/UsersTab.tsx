"use client";

import React from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { Badge } from '@heroui/badge';
import { Avatar } from '@heroui/avatar';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Pagination } from '@heroui/pagination';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Trash2, 
  Upload,
  UserPlus,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

export function UsersTab() {
  const [q, setQ] = React.useState('');
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [createEmail, setCreateEmail] = React.useState('');
  const [createName, setCreateName] = React.useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [perPage] = React.useState(50); // Usuários por página

  const fetchUsers = async (page: number = 1, searchQuery: string = q) => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/admin/users/list?page=${page}&perPage=${perPage}&q=${encodeURIComponent(searchQuery)}`);
      const data = await resp.json();
      
      if (resp.ok) {
        setRows(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalUsers || 0);
        setCurrentPage(page);
      } else {
        console.error('Error fetching users:', data.error);
        setRows([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { 
    fetchUsers(1, ''); 
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, q);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, q);
  };

  const createUser = async () => {
    const resp = await fetch('/api/admin/users/create', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: createEmail, full_name: createName, sendInvite: true })
    });
    if (resp.ok) {
      setOpenCreate(false);
      setCreateEmail(''); 
      setCreateName('');
      await fetchUsers(currentPage, q);
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm('Remover este usuário?')) return;
    const resp = await fetch('/api/admin/users/delete', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id })
    });
    if (resp.ok) {
      await fetchUsers(currentPage, q);
    }
  };

  const inviteUser = async (email: string) => {
    await fetch('/api/admin/users/invite', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  };

  const onImportCsv = async (file?: File | null) => {
    if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const header = (lines.shift() || '').toLowerCase();
    const idxEmail = header.split(',').findIndex(h => h.trim() === 'email');
    const idxName = header.split(',').findIndex(h => h.trim() === 'full_name');
    const users = lines.map(l => {
      const parts = l.split(',');
      return {
        email: (parts[idxEmail] || '').replace(/^"|"$/g,'').trim(),
        full_name: (parts[idxName] || '').replace(/^"|"$/g,'').trim(),
      };
    }).filter(u => u.email);
    await fetch('/api/admin/users/import', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    });
    await fetchUsers(currentPage, q);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header Card */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gerenciar Usuários</h3>
              <p className="text-sm text-default-500">
                Total: {totalUsers} usuários
                {q && ` (filtrado)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              color="primary" 
              variant="flat"
              startContent={<UserPlus className="w-4 h-4" />}
              onPress={() => setOpenCreate(true)}
            >
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Input 
                placeholder="Buscar por email ou nome" 
                value={q} 
                onValueChange={setQ}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                className="max-w-xs"
                size="sm"
              />
              <Button 
                onPress={handleSearch} 
                isLoading={loading}
                variant="flat"
                size="sm"
              >
                Buscar
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => onImportCsv(e.target.files?.[0])}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button 
                  as="span"
                  variant="light"
                  size="sm"
                  startContent={<Upload className="w-4 h-4" />}
                >
                  Importar CSV
                </Button>
              </label>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardBody>
          <ScrollShadow className="h-[500px]">
            <Table 
              aria-label="Usuários"
              removeWrapper
              classNames={{
                th: "bg-transparent text-default-500 border-b border-divider",
                td: "py-3",
              }}
            >
              <TableHeader>
                <TableColumn>USUÁRIO</TableColumn>
                <TableColumn>PLANO</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>CRIADO EM</TableColumn>
                <TableColumn>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody emptyContent={loading ? 'Carregando...' : 'Nenhum usuário'}>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          size="sm" 
                          name={u.email?.charAt(0).toUpperCase()}
                          className={u.isAdmin ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"}
                        />
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {u.email}
                            {u.isAdmin && (
                              <Badge color="danger" content="Admin" size="sm" />
                            )}
                          </p>
                          <p className="text-xs text-default-500">
                            {u.user_metadata?.full_name || u.profile?.full_name || u.profile?.name || 'Sem nome'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        variant="flat"
                        color={u.profile?.plan === 'pro' ? 'success' : 'default'}
                      >
                        {u.profile?.plan || u.app_metadata?.plan || 'Free'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        content={u.isAdmin ? 'admin' : (u.profile?.role || u.app_metadata?.role || 'user')} 
                        color={u.isAdmin ? 'danger' : 'default'}
                        variant="flat"
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-default-500">
                        <Clock className="w-3 h-3" />
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Tooltip content="Enviar Magic Link">
                          <Button 
                            isIconOnly
                            size="sm" 
                            variant="light" 
                            onPress={() => inviteUser(u.email)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        {u.isAdmin && (
                          <Tooltip content="Administrador">
                            <Button 
                              isIconOnly
                              size="sm" 
                              variant="light"
                              color="danger"
                              isDisabled
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip content="Remover usuário" color="danger">
                          <Button 
                            isIconOnly
                            size="sm" 
                            color="danger" 
                            variant="light" 
                            onPress={() => removeUser(u.id)}
                            isDisabled={u.isAdmin}
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
          </ScrollShadow>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <p className="text-sm text-default-500">
                Página {currentPage} de {totalPages} • {totalUsers} usuários no total
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  isIconOnly
                  onPress={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  size="sm"
                  color="primary"
                  variant="flat"
                  showControls={false}
                  classNames={{
                    wrapper: "gap-1",
                    item: "bg-transparent",
                    cursor: "bg-primary"
                  }}
                />
                
                <Button
                  size="sm"
                  variant="flat"
                  isIconOnly
                  onPress={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={openCreate} onOpenChange={setOpenCreate}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Novo Usuário
          </ModalHeader>
          <ModalBody>
            <Input 
              label="Email" 
              value={createEmail} 
              onValueChange={setCreateEmail}
              type="email"
              placeholder="usuario@exemplo.com"
            />
            <Input 
              label="Nome Completo" 
              value={createName} 
              onValueChange={setCreateName}
              placeholder="Nome do usuário"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button color="primary" onPress={createUser}>
              Criar & Convidar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}