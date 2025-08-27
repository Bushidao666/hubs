"use client";

import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Badge } from '@heroui/badge';
import { 
  Bell, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Plus,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';

export function NoticesTab() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '', 
    message: '', 
    level: 'info', 
    enabled: true,
  });

  const fetchNotices = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('hub_admin_list_notices');
    setLoading(false);
    if (!error) setItems(data || []);
  };

  React.useEffect(() => { 
    fetchNotices(); 
  }, []);

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

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header Card */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gerenciar Avisos</h3>
              <p className="text-sm text-default-500">Total: {items.length} avisos</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Título" 
              value={form.title} 
              onValueChange={(v) => setForm({...form, title: v})} 
              placeholder="Título do aviso"
              startContent={<Edit className="w-4 h-4 text-default-400" />}
              classNames={{
                inputWrapper: "bg-content1 border-subtle"
              }}
            />
            <Select 
              label="Nível" 
              selectedKeys={[form.level]} 
              onSelectionChange={(k) => setForm({...form, level: Array.from(k)[0] as string})}
              startContent={getLevelIcon(form.level)}
              classNames={{
                trigger: "bg-content1 border-subtle"
              }}
            >
              <SelectItem key="info" startContent={<Info className="w-4 h-4" />}>
                Informação
              </SelectItem>
              <SelectItem key="warning" startContent={<AlertTriangle className="w-4 h-4" />}>
                Aviso
              </SelectItem>
              <SelectItem key="critical" startContent={<AlertCircle className="w-4 h-4" />}>
                Crítico
              </SelectItem>
            </Select>
            <div className="md:col-span-2">
              <Textarea 
                label="Mensagem" 
                value={form.message} 
                onValueChange={(v) => setForm({...form, message: v})}
                placeholder="Conteúdo do aviso..."
                minRows={3}
                classNames={{
                  inputWrapper: "bg-content1 border-subtle"
                }}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button 
                color="primary" 
                onPress={save} 
                isDisabled={loading || !form.title || !form.message}
                startContent={<Plus className="w-4 h-4" />}
              >
                Adicionar Aviso
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notices List */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader>
          <h3 className="text-lg font-semibold">Avisos Ativos</h3>
        </CardHeader>
        <CardBody>
          <ScrollShadow className="h-[400px]">
            <div className="space-y-3">
              {loading && (
                <div className="text-center py-8 text-default-500">
                  Carregando...
                </div>
              )}
              
              {!loading && items.length === 0 && (
                <div className="text-center py-8 text-default-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum aviso cadastrado</p>
                </div>
              )}

              {items.map((n) => {
                const levelColor = getLevelColor(n.level);
                const LevelIcon = getLevelIcon(n.level);
                
                return (
                  <Card 
                    key={n.id} 
                    className="bg-black/40 border border-subtle hover:border-primary/30 transition-all"
                  >
                    <CardBody className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-${levelColor}/20`}>
                            {React.cloneElement(LevelIcon as React.ReactElement, {
                              className: `w-4 h-4 text-${levelColor}`
                            })}
                          </div>
                          <Chip 
                            size="sm" 
                            color={levelColor as any}
                            variant="flat"
                          >
                            {n.level.toUpperCase()}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-default-500">
                          <Clock className="w-3 h-3" />
                          {new Date(n.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {n.title}
                        </h4>
                        <p className="text-sm text-default-500">
                          {n.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge 
                          color={n.enabled ? "success" : "default"} 
                          variant="flat"
                          size="sm"
                        >
                          {n.enabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  );
}