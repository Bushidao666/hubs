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
  MoreVertical
} from 'lucide-react';

export function UsersTab() {
  const [q, setQ] = React.useState('');
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [createEmail, setCreateEmail] = React.useState('');
  const [createName, setCreateName] = React.useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const resp = await fetch(`/api/admin/users/list?q=${encodeURIComponent(q)}`);
    const data = await resp.json();
    setRows(data.users || []);
    setLoading(false);
  };

  React.useEffect(() => { fetchUsers(); }, []);

  const createUser = async () => {
    const resp = await fetch('/api/admin/users/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: createEmail, full_name: createName, sendInvite: true })
    });
    if (resp.ok) {
      setOpenCreate(false);
      setCreateEmail(''); setCreateName('');
      await fetchUsers();
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm('Remover este usuário?')) return;
    const resp = await fetch('/api/admin/users/delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id })
    });
    if (resp.ok) await fetchUsers();
  };

  const inviteUser = async (email: string) => {
    await fetch('/api/admin/users/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    });
    await fetchUsers();
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
              <p className="text-sm text-default-500">Total: {rows.length} usuários</p>
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
                startContent={<Search className="w-4 h-4 text-default-400" />}
                className="max-w-xs"
                size="sm"
              />
              <Button 
                onPress={fetchUsers} 
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
                          className="bg-primary/20 text-primary"
                        />
                        <div>
                          <p className="font-medium">{u.email}</p>
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
                        content={u.profile?.role || u.app_metadata?.role || 'user'} 
                        color={u.profile?.role === 'admin' ? 'danger' : 'default'}
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
                        <Tooltip content="Remover usuário" color="danger">
                          <Button 
                            isIconOnly
                            size="sm" 
                            color="danger" 
                            variant="light" 
                            onPress={() => removeUser(u.id)}
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