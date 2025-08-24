"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Select, SelectItem } from '@heroui/select';

function useDnD<T>(items: T[], setItems: (v:T[])=>void) {
  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent, idx: number) => {
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (Number.isNaN(from)) return;
    const copy = [...items];
    const [moved] = copy.splice(from, 1);
    copy.splice(idx, 0, moved);
    setItems(copy);
  };
  return { onDragStart, onDragOver, onDrop };
}

export default function AdminBannersPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [placement, setPlacement] = React.useState<'home_top'|'home_footer'>('home_top');

  const [form, setForm] = React.useState({ title:'', image_url:'', link_url:'', enabled:true });
  const [filePreview, setFilePreview] = React.useState<string>('');

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('hub_admin_list_banners');
    const list = (data||[]).filter((b:any)=> b.placement===placement).sort((a:any,b:any)=> a.position-b.position);
    setItems(list);
    setLoading(false);
  };

  React.useEffect(()=>{ fetchBanners(); },[placement]);

  const handleFile = async (f?: File|null) => {
    if (!f) { setFilePreview(''); return; }
    const url = URL.createObjectURL(f);
    setFilePreview(url);
    // Upload para Storage via API
    const fd = new FormData();
    fd.append('file', f);
    const resp = await fetch('/api/admin/banners/upload', { method: 'POST', body: fd });
    const data = await resp.json();
    if (resp.ok && data.public_url) {
      setForm((prev)=> ({...prev, image_url: data.public_url}));
    }
  };

  const save = async () => {
    setLoading(true);
    // posição = ao final
    const pos = (items[items.length-1]?.position ?? -1) + 1;
    await supabase.rpc('hub_admin_upsert_banner', {
      p_title: form.title,
      p_image_url: form.image_url,
      p_link_url: form.link_url || null,
      p_enabled: form.enabled,
      p_position: pos,
      p_placement: placement,
      p_id: null
    });
    setForm({ title:'', image_url:'', link_url:'', enabled:true });
    setFilePreview('');
    await fetchBanners();
    setLoading(false);
  };

  const persistOrder = async () => {
    setLoading(true);
    for (let i=0;i<items.length;i++) {
      const b = items[i];
      await supabase.rpc('hub_admin_upsert_banner', {
        p_title: b.title,
        p_image_url: b.image_url,
        p_link_url: b.link_url,
        p_enabled: b.enabled,
        p_position: i,
        p_placement: placement,
        p_id: b.id
      });
    }
    await fetchBanners();
    setLoading(false);
  };

  const dnd = useDnD(items, setItems);

  return (
    <div className="min-h-screen p-6 space-y-6 bg-background">
      {/* Grid background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      <h1 className="text-lg font-semibold text-foreground relative">Admin • <span className="text-primary">Banners</span></h1>

      <Card className="bg-black/40 backdrop-blur-md border border-white/10 relative">
        <CardBody className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Select selectedKeys={[placement]} onSelectionChange={(k)=> setPlacement(Array.from(k)[0] as any)} label="Posição na Home" classNames={{trigger: "bg-content1 border-subtle"}}>
            <SelectItem key="home_top">Topo da Home</SelectItem>
            <SelectItem key="home_footer">Rodapé da Home</SelectItem>
          </Select>
          <Input label="Título" value={form.title} onValueChange={(v)=> setForm({...form,title:v})} classNames={{inputWrapper: "bg-content1 border-subtle"}}/>
          <Input label="Link (opcional)" value={form.link_url} onValueChange={(v)=> setForm({...form,link_url:v})} classNames={{inputWrapper: "bg-content1 border-subtle"}}/>
          <div className="flex items-end gap-2">
            <Switch isSelected={form.enabled} onValueChange={(v)=> setForm({...form,enabled:v})}>Ativo</Switch>
            <label className="text-sm">
              <input type="file" accept="image/*" onChange={(e)=> handleFile(e.target.files?.[0])} />
            </label>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-default-500 mb-1">Preview 16:9</div>
            <div className="aspect-video rounded-md overflow-hidden border border-default-100 bg-default-100">
              {(filePreview || form.image_url) && <img src={filePreview || form.image_url} alt="preview" className="w-full h-full object-cover" />}
            </div>
          </div>
          <div className="md:col-span-6 flex items-center gap-2">
            <Button color="primary" onPress={save} isDisabled={!form.title || !form.image_url || loading}>{loading? 'Salvando...' : 'Salvar'}</Button>
            <Button variant="flat" color="primary" onPress={persistOrder} isDisabled={loading || !items.length}>Salvar ordem</Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((b, idx)=> (
          <div key={b.id} draggable onDragStart={(e)=> dnd.onDragStart(e, idx)} onDragOver={dnd.onDragOver} onDrop={(e)=> dnd.onDrop(e, idx)}>
            <Card className="bg-glass backdrop-blur-md border border-subtle hover:bg-glass-hover hover:border-subtle-hover transition-all duration-200 overflow-hidden cursor-move">
              <div className="aspect-video bg-default-100">
                {b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />}
              </div>
              <CardBody className="space-y-1">
                <div className="font-medium">{b.title}</div>
                <div className="text-xs text-default-500">Posição {idx} • {b.enabled? 'Ativo':'Inativo'}</div>
                {b.link_url && <a href={b.link_url} target="_blank" className="text-primary text-xs hover:text-primary/80 transition-colors">Abrir link</a>}
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
