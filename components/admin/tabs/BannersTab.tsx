"use client";

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { Select, SelectItem } from '@heroui/select';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Chip } from '@heroui/chip';
import { Badge } from '@heroui/badge';
import { 
  Image as ImageIcon, 
  Upload, 
  Link, 
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  ExternalLink,
  Save
} from 'lucide-react';

function useDnD<T>(items: T[], setItems: (v:T[])=>void) {
  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };
  const onDragOver = (e: React.DragEvent) => { 
    e.preventDefault(); 
  };
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

export function BannersTab() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [placement, setPlacement] = React.useState<'home_top'|'home_footer'>('home_top');
  const [form, setForm] = React.useState({ 
    title: '', 
    image_url: '', 
    link_url: '', 
    enabled: true 
  });
  const [filePreview, setFilePreview] = React.useState<string>('');

  const fetchBanners = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('hub_admin_list_banners');
    const list = (data || [])
      .filter((b:any) => b.placement === placement)
      .sort((a:any, b:any) => a.position - b.position);
    setItems(list);
    setLoading(false);
  };

  React.useEffect(() => { 
    fetchBanners(); 
  }, [placement]);

  const handleFile = async (f?: File|null) => {
    if (!f) { 
      setFilePreview(''); 
      return; 
    }
    const url = URL.createObjectURL(f);
    setFilePreview(url);
    
    const fd = new FormData();
    fd.append('file', f);
    const resp = await fetch('/api/admin/banners/upload', { 
      method: 'POST', 
      body: fd 
    });
    const data = await resp.json();
    if (resp.ok && data.public_url) {
      setForm((prev) => ({...prev, image_url: data.public_url}));
    }
  };

  const save = async () => {
    setLoading(true);
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
    setForm({ title: '', image_url: '', link_url: '', enabled: true });
    setFilePreview('');
    await fetchBanners();
    setLoading(false);
  };

  const persistOrder = async () => {
    setLoading(true);
    for (let i = 0; i < items.length; i++) {
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
    <div className="mt-6 space-y-6">
      {/* Header & Form Card */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gerenciar Banners</h3>
              <p className="text-sm text-default-500">Total: {items.length} banners</p>
            </div>
          </div>
          <Button 
            variant="flat"
            color="primary" 
            onPress={persistOrder} 
            isDisabled={loading || !items.length}
            startContent={<Save className="w-4 h-4" />}
            size="sm"
          >
            Salvar Ordem
          </Button>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select 
              selectedKeys={[placement]} 
              onSelectionChange={(k) => setPlacement(Array.from(k)[0] as any)} 
              label="Posição na Home"
              classNames={{
                trigger: "bg-content1 border-subtle"
              }}
            >
              <SelectItem key="home_top">Topo da Home</SelectItem>
              <SelectItem key="home_footer">Rodapé da Home</SelectItem>
            </Select>
            
            <Input 
              label="Título" 
              value={form.title} 
              onValueChange={(v) => setForm({...form, title: v})}
              placeholder="Título do banner"
              classNames={{
                inputWrapper: "bg-content1 border-subtle"
              }}
            />
            
            <Input 
              label="Link (opcional)" 
              value={form.link_url} 
              onValueChange={(v) => setForm({...form, link_url: v})}
              placeholder="https://exemplo.com"
              startContent={<Link className="w-4 h-4 text-default-400" />}
              classNames={{
                inputWrapper: "bg-content1 border-subtle"
              }}
            />

            <div className="flex items-center gap-4">
              <Switch 
                isSelected={form.enabled} 
                onValueChange={(v) => setForm({...form, enabled: v})}
                size="sm"
              >
                {form.enabled ? 'Ativo' : 'Inativo'}
              </Switch>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
                id="banner-upload"
              />
              <label htmlFor="banner-upload">
                <Button 
                  as="span"
                  variant="flat"
                  size="sm"
                  startContent={<Upload className="w-4 h-4" />}
                >
                  Upload Imagem
                </Button>
              </label>
            </div>

            <div className="lg:col-span-2">
              <div className="text-xs text-default-500 mb-2">Preview (16:9)</div>
              <div className="aspect-video rounded-lg overflow-hidden border border-subtle bg-content1">
                {(filePreview || form.image_url) ? (
                  <img 
                    src={filePreview || form.image_url} 
                    alt="preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-default-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 flex justify-end">
              <Button 
                color="primary" 
                onPress={save} 
                isDisabled={!form.title || !form.image_url || loading}
                startContent={<Plus className="w-4 h-4" />}
              >
                {loading ? 'Salvando...' : 'Adicionar Banner'}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Banners Grid */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Banners - {placement === 'home_top' ? 'Topo da Home' : 'Rodapé da Home'}
          </h3>
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
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum banner cadastrado</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((b, idx) => (
                <div 
                  key={b.id} 
                  draggable 
                  onDragStart={(e) => dnd.onDragStart(e, idx)} 
                  onDragOver={dnd.onDragOver} 
                  onDrop={(e) => dnd.onDrop(e, idx)}
                  className="group"
                >
                  <Card className="bg-black/40 border border-subtle hover:border-primary/30 transition-all overflow-hidden cursor-move">
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="p-1.5 bg-black/60 rounded-lg backdrop-blur-sm">
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 z-10">
                      <Badge 
                        color="primary" 
                        variant="flat"
                        size="sm"
                      >
                        #{idx + 1}
                      </Badge>
                    </div>

                    <div className="aspect-video bg-content1">
                      {b.image_url && (
                        <img 
                          src={b.image_url} 
                          alt={b.title} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    
                    <CardBody className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {b.title}
                          </p>
                        </div>
                        <Chip 
                          size="sm" 
                          color={b.enabled ? "success" : "default"}
                          variant="flat"
                          startContent={b.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        >
                          {b.enabled ? 'Ativo' : 'Inativo'}
                        </Chip>
                      </div>
                      
                      {b.link_url && (
                        <a 
                          href={b.link_url} 
                          target="_blank" 
                          className="inline-flex items-center gap-1 text-primary text-xs hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver link
                        </a>
                      )}
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  );
}