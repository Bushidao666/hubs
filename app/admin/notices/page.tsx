"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';

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
    <div className="min-h-screen p-6 space-y-6 bg-background">
      {/* Grid background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      <h1 className="text-lg font-semibold text-foreground relative">Admin • <span className="text-primary">Avisos</span></h1>

      <Card className="bg-glass backdrop-blur-md border border-subtle relative">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Título" value={form.title} onValueChange={(v)=>setForm({...form,title:v})} classNames={{inputWrapper: "bg-content1 border-subtle"}}/>
            <Select label="Nível" selectedKeys={[form.level]} onSelectionChange={(k)=>setForm({...form,level:Array.from(k)[0] as string})} classNames={{trigger: "bg-content1 border-subtle"}}>
              {['info','warning','critical'].map(l=> <SelectItem key={l}>{l}</SelectItem>)}
            </Select>
            <Textarea label="Mensagem" value={form.message} onValueChange={(v)=>setForm({...form,message:v})} classNames={{inputWrapper: "bg-content1 border-subtle"}}/>
            <div className="flex items-end"><Button color="primary" onPress={save} isDisabled={loading || !form.title || !form.message}>Salvar</Button></div>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-3 relative">
        {loading && <div className="text-default-500">Carregando...</div>}
        {items.map((n)=> {
          const levelColor = n.level === 'critical' ? 'danger' : n.level === 'warning' ? 'warning' : 'primary';
          return (
            <Card key={n.id} className="bg-glass backdrop-blur-md border border-subtle hover:bg-black/50 hover:border-white/15 transition-all duration-200">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between">
                  <Chip size="sm" color={levelColor} variant="flat">{n.level.toUpperCase()}</Chip>
                  <span className="text-xs text-default-500">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <div className="font-medium text-foreground">{n.title}</div>
                <div className="text-sm text-default-500">{n.message}</div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
