"use client";

import React from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Card, CardBody } from '@heroui/card';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';

export default function AdminUsersPage() {
  const [q, setQ] = React.useState('');
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [createEmail, setCreateEmail] = React.useState('');
  const [createName, setCreateName] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(50);
  const [totalUsers, setTotalUsers] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchUsers = async (targetPage?: number) => {
    setLoading(true);
    const currentPage = targetPage ?? page;
    const resp = await fetch(`/api/admin/users/list?page=${currentPage}&perPage=${perPage}&q=${encodeURIComponent(q)}`);
    const data = await resp.json();
    setRows(data.users || []);
    if (typeof data.totalUsers === 'number') setTotalUsers(data.totalUsers);
    if (typeof data.totalPages === 'number') setTotalPages(data.totalPages);
    setPage(currentPage);
    setLoading(false);
  };

  React.useEffect(() => { fetchUsers(1); }, []);

  const createUser = async () => {
    const resp = await fetch('/api/admin/users/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: createEmail, full_name: createName, sendInvite: true })
    });
    if (resp.ok) {
      setOpenCreate(false);
      setCreateEmail(''); setCreateName('');
      await fetchUsers(page);
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm('Remover este usuário?')) return;
    const resp = await fetch('/api/admin/users/delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: id })
    });
    if (resp.ok) await fetchUsers(page);
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
    // Espera CSV com cabeçalho "email,full_name"
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
    <div className="p-6 space-y-4">
      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Buscar por email ou nome" 
              value={q} 
              onValueChange={setQ} 
              onKeyDown={(e)=>{ if (e.key === 'Enter') fetchUsers(1); }}
              className="w-64" 
            />
            <Button onPress={()=>fetchUsers(1)} isLoading={loading}>Buscar</Button>
          </div>
          <div className="flex items-center gap-2">
            <input type="file" accept=".csv" onChange={(e)=>onImportCsv(e.target.files?.[0])} />
            <Button color="primary" onPress={()=>setOpenCreate(true)}>Novo Usuário</Button>
          </div>
        </CardBody>
      </Card>

      <Table aria-label="Usuários">
        <TableHeader>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>NOME</TableColumn>
          <TableColumn>PLANO</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>CRIADO EM</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent={loading ? 'Carregando...' : 'Nenhum usuário'}>
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.user_metadata?.full_name || u.profile?.full_name || u.profile?.name || ''}</TableCell>
              <TableCell>{u.profile?.plan || u.app_metadata?.plan || ''}</TableCell>
              <TableCell>{u.profile?.role || u.app_metadata?.role || ''}</TableCell>
              <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="light" onPress={()=>inviteUser(u.email)}>Enviar Magic Link</Button>
                <Button size="sm" color="danger" variant="flat" onPress={()=>removeUser(u.id)}>Remover</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-default-500">
          Página {page} de {Math.max(totalPages, 1)} • {totalUsers} usuários
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="flat" 
            isDisabled={loading || page <= 1}
            onPress={()=>fetchUsers(page - 1)}
          >
            Anterior
          </Button>
          <Button 
            size="sm" 
            color="primary" 
            variant="flat" 
            isDisabled={loading || page >= totalPages}
            onPress={()=>fetchUsers(page + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      <Modal isOpen={openCreate} onOpenChange={setOpenCreate}>
        <ModalContent>
          <ModalHeader>Novo Usuário</ModalHeader>
          <ModalBody>
            <Input label="Email" value={createEmail} onValueChange={setCreateEmail} />
            <Input label="Nome" value={createName} onValueChange={setCreateName} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={()=>setOpenCreate(false)}>Cancelar</Button>
            <Button color="primary" onPress={createUser}>Criar & Convidar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}


