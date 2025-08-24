"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';

export default function AdminBannersPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ title:'', image_url:'', link_url:'', enabled:true, position:0 });

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('hub_admin_list_banners');
    setItems(data || []);
    setLoading(false);
  };

  React.useEffect(()=>{ fetchBanners(); },[]);

  const save = async () => {
    setLoading(true);
    await supabase.rpc('hub_admin_upsert_banner', {
      p_title: form.title,
      p_image_url: form.image_url,
      p_link_url: form.link_url || null,
      p_enabled: form.enabled,
      p_position: form.position,
      p_id: null
    });
    setForm({ title:'', image_url:'', link_url:'', enabled:true, position:0 });
    await fetchBanners();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Admin • Banners</h1>

      <Card className="bg-content1 border border-default-100">
        <CardBody className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input label="Título" value={form.title} onValueChange={(v)=> setForm({...form,title:v})} />
          <Input label="Imagem (URL 16:9)" value={form.image_url} onValueChange={(v)=> setForm({...form,image_url:v})} />
          <Input label="Link (opcional)" value={form.link_url} onValueChange={(v)=> setForm({...form,link_url:v})} />
          <Input type="number" label="Posição" value={String(form.position)} onValueChange={(v)=> setForm({...form,position: Number(v)||0})} />
          <div className="flex items-end gap-2">
            <Switch isSelected={form.enabled} onValueChange={(v)=> setForm({...form,enabled:v})}>Ativo</Switch>
            <Button color="primary" onPress={save} isDisabled={!form.title || !form.image_url || loading}>{loading? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((b)=> (
          <Card key={b.id} className="bg-content1 border border-default-100 overflow-hidden">
            <div className="aspect-video bg-default-100">
              {b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />}
            </div>
            <CardBody className="space-y-1">
              <div className="font-medium">{b.title}</div>
              <div className="text-xs text-default-500">Posição {b.position} • {b.enabled? 'Ativo':'Inativo'}</div>
              {b.link_url && <a href={b.link_url} target="_blank" className="text-primary text-xs">Abrir link</a>}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
