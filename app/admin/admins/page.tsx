"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';

export default function AdminAdminsPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string|null>(null);

  const fetchAdmins = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.rpc('hub_admin_list_admins');
    setLoading(false);
    if (error) setError(error.message);
    setItems(data || []);
  };

  React.useEffect(()=>{ fetchAdmins(); },[]);

  const addAdmin = async () => {
    setLoading(true); setError(null);
    const { error } = await supabase.rpc('admin_add', { p_email: email.trim().toLowerCase() });
    setLoading(false);
    if (error) setError(error.message);
    setEmail('');
    await fetchAdmins();
  };

  const removeAdmin = async (mail: string) => {
    if (!confirm(`Remover administrador: ${mail}?`)) return;
    setLoading(true); setError(null);
    const { error } = await supabase.rpc('admin_remove', { p_email: mail });
    setLoading(false);
    if (error) setError(error.message);
    await fetchAdmins();
  };

  const fmt = (d?: string) => d ? new Date(d).toLocaleString() : '—';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Admin • Administradores</h1>

      <Card className="bg-content1 border border-default-100">
        <CardBody className="flex flex-col md:flex-row gap-3 items-end">
          <Input type="email" label="Email" value={email} onValueChange={setEmail} className="flex-1"/>
          <Button color="primary" onPress={addAdmin} isDisabled={!email || loading}>{loading? 'Salvando...' : 'Adicionar'}</Button>
        </CardBody>
      </Card>

      {error && <div className="text-danger text-sm">{error}</div>}

      <div className="border border-default-100 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-content2">
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">User ID</th>
              <th className="text-left p-2">Confirmado em</th>
              <th className="text-left p-2">Último login</th>
              <th className="text-left p-2">Desde</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-2" colSpan={6}>Carregando...</td></tr>
            )}
            {!loading && items.map((a)=> (
              <tr key={a.user_id} className="border-t border-default-100">
                <td className="p-2">{a.email}</td>
                <td className="p-2 font-mono text-xs">{a.user_id}</td>
                <td className="p-2 text-xs text-default-500">{fmt(a.email_confirmed_at)}</td>
                <td className="p-2 text-xs text-default-500">{fmt(a.last_sign_in_at)}</td>
                <td className="p-2 text-xs text-default-500">{fmt(a.created_at)}</td>
                <td className="p-2">
                  <Button size="sm" variant="flat" color="danger" onPress={()=> removeAdmin(a.email)}>Remover</Button>
                </td>
              </tr>
            ))}
            {!loading && !items.length && (
              <tr><td className="p-2" colSpan={6}>Nenhum administrador.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
