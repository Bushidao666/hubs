"use client";

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Tooltip } from '@heroui/tooltip';
import { 
  Shield, 
  UserPlus, 
  Mail, 
  Clock,
  LogIn,
  Calendar,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export function AdminsTab() {
  const [items, setItems] = React.useState<any[]>([]);
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true); 
    setError(null);
    const { data, error } = await supabase.rpc('hub_admin_list_admins');
    setLoading(false);
    if (error) setError(error.message);
    setItems(data || []);
  };

  React.useEffect(() => { 
    fetchAdmins(); 
  }, []);

  const addAdmin = async () => {
    setLoading(true); 
    setError(null);
    const { error } = await supabase.rpc('admin_add', { 
      p_email: email.trim().toLowerCase() 
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setEmail('');
      await fetchAdmins();
    }
  };

  const removeAdmin = async (mail: string) => {
    if (!confirm(`Remover administrador: ${mail}?`)) return;
    setLoading(true); 
    setError(null);
    const { error } = await supabase.rpc('admin_remove', { p_email: mail });
    setLoading(false);
    if (error) setError(error.message);
    await fetchAdmins();
  };

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header & Add Admin Card */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gerenciar Administradores</h3>
              <p className="text-sm text-default-500">Total: {items.length} administradores</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <Input 
              type="email" 
              label="Adicionar Novo Administrador" 
              placeholder="admin@exemplo.com"
              value={email} 
              onValueChange={setEmail}
              startContent={<Mail className="w-4 h-4 text-default-400" />}
              className="flex-1"
              classNames={{
                inputWrapper: "bg-content1 border-subtle"
              }}
            />
            <Button 
              color="primary" 
              onPress={addAdmin} 
              isDisabled={!email || loading}
              isLoading={loading}
              startContent={!loading && <UserPlus className="w-4 h-4" />}
            >
              {loading ? 'Adicionando...' : 'Adicionar Admin'}
            </Button>
          </div>
          
          {error && (
            <div className="mt-3 p-3 bg-danger/10 border border-danger/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-danger" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Admins Table */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader>
          <h3 className="text-lg font-semibold">Lista de Administradores</h3>
        </CardHeader>
        <CardBody>
          <ScrollShadow className="h-[500px]">
            {loading && (
              <div className="text-center py-8 text-default-500">
                Carregando...
              </div>
            )}
            
            {!loading && items.length === 0 && (
              <div className="text-center py-8 text-default-500">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum administrador cadastrado</p>
              </div>
            )}

            {!loading && items.length > 0 && (
              <Table 
                removeWrapper
                aria-label="Administradores"
                classNames={{
                  th: "bg-transparent text-default-500 border-b border-divider",
                  td: "py-3",
                }}
              >
                <TableHeader>
                  <TableColumn>USUÁRIO</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ÚLTIMO LOGIN</TableColumn>
                  <TableColumn>DESDE</TableColumn>
                  <TableColumn>AÇÕES</TableColumn>
                </TableHeader>
                <TableBody>
                  {items.map((admin) => (
                    <TableRow key={admin.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar 
                            size="sm" 
                            name={admin.email?.charAt(0).toUpperCase()}
                            className="bg-danger/20 text-danger"
                          />
                          <div>
                            <p className="font-medium">{admin.email}</p>
                            <p className="text-xs text-default-500 font-mono">
                              ID: {admin.user_id?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {admin.email_confirmed_at ? (
                            <Chip 
                              size="sm" 
                              color="success" 
                              variant="flat"
                              startContent={<CheckCircle className="w-3 h-3" />}
                            >
                              Confirmado
                            </Chip>
                          ) : (
                            <Chip 
                              size="sm" 
                              color="warning" 
                              variant="flat"
                              startContent={<AlertCircle className="w-3 h-3" />}
                            >
                              Pendente
                            </Chip>
                          )}
                          {admin.email_confirmed_at && (
                            <span className="text-xs text-default-500">
                              {formatDate(admin.email_confirmed_at)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-default-500">
                          <LogIn className="w-3 h-3" />
                          {formatDate(admin.last_sign_in_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-default-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(admin.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip content="Remover administrador" color="danger">
                          <Button 
                            isIconOnly
                            size="sm" 
                            variant="light" 
                            color="danger" 
                            onPress={() => removeAdmin(admin.email)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollShadow>
        </CardBody>
      </Card>

      {/* Admin Info Card */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardBody>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-warning">Informações Importantes</p>
              <ul className="list-disc list-inside text-default-500 space-y-1">
                <li>Administradores têm acesso total ao painel de controle</li>
                <li>Podem gerenciar usuários, aplicações, banners e avisos</li>
                <li>Tenha cuidado ao adicionar novos administradores</li>
                <li>Remover um administrador não exclui a conta do usuário</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}