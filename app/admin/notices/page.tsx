"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';

export default function AdminNoticesPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '', message: '', level: 'info', enabled: true,
  });

  const fetchNotices = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('hub_admin_list_notices');
    setLoading(false);
    if (!error) setItems(data || []);
  };

  React.useEffect(() => { fetchNotices(); }, []);

  const save = async () => {
    setLoading(true);
    await supabase.rpc('hub_admin_upsert_notice', {
      p_title: form.title,
      p_message: form.message,
      p_level: form.level,
      p_enabled: form.enabled,
    });
    setForm({ title: '', message: '', level: 'info', enabled: true });
    await fetchNotices();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Admin • Avisos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Título" value={form.title} onValueChange={(v)=>setForm({...form,title:v})}/>
        <Select label="Nível" selectedKeys={[form.level]} onSelectionChange={(k)=>setForm({...form,level:Array.from(k)[0] as string})}>
          {['info','warning','critical'].map(l=> <SelectItem key={l}>{l}</SelectItem>)}
        </Select>
        <Textarea label="Mensagem" value={form.message} onValueChange={(v)=>setForm({...form,message:v})}/>
        <div className="flex items-end"><Button onPress={save} isDisabled={loading || !form.title || !form.message}>Salvar</Button></div>
      </div>

      <div className="space-y-2">
        {loading && <div>Carregando...</div>}
        {items.map((n)=> (
          <div key={n.id} className="border rounded-md p-3">
            <div className="text-sm text-default-500">{n.level.toUpperCase()} • {new Date(n.created_at).toLocaleString()}</div>
            <div className="font-medium">{n.title}</div>
            <div className="text-sm">{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
