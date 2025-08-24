"use client";
import React from 'react';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';

export function BugFab({ apps }: { apps: { slug: string; name: string }[] }) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<'bug'|'feature'>('bug');
  const [app, setApp] = React.useState<string>('');
  const [severity, setSeverity] = React.useState<'low'|'med'|'high'>('low');
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string|null>(null);

  const send = async () => {
    setLoading(true);
    setMsg(null);
    const payload = {
      type,
      app_slug: app || null,
      severity: type==='bug'? severity : null,
      title,
      description: desc,
      metadata: {
        url: typeof window!=='undefined'? window.location.href : '',
        user_agent: typeof navigator!=='undefined'? navigator.userAgent : ''
      }
    };
    const resp = await fetch('/api/feedback/report', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    const data = await resp.json();
    setLoading(false);
    if (resp.ok) {
      setMsg(`Enviado! Ticket: ${data.ticket || '—'}`);
      setTitle(''); setDesc('');
    } else {
      setMsg(data.error || 'Erro ao enviar');
    }
  };

  return (
    <>
      <button onClick={()=>setOpen(true)} className="fixed bottom-6 right-6 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3">
        Reportar
      </button>
      <Modal isOpen={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>Feedback</ModalHeader>
          <ModalBody>
            <Select label="Tipo" selectedKeys={[type]} onSelectionChange={(k)=> setType(Array.from(k)[0] as any)}>
              <SelectItem key="bug">Bug</SelectItem>
              <SelectItem key="feature">Melhoria</SelectItem>
            </Select>
            <Select label="SaaS (opcional)" selectedKeys={[app]} onSelectionChange={(k)=> setApp(Array.from(k)[0] as string)}>
              {apps.map(a=> <SelectItem key={a.slug}>{a.name}</SelectItem>)}
            </Select>
            {type==='bug' && (
              <Select label="Severidade" selectedKeys={[severity]} onSelectionChange={(k)=> setSeverity(Array.from(k)[0] as any)}>
                <SelectItem key="low">Baixa</SelectItem>
                <SelectItem key="med">Média</SelectItem>
                <SelectItem key="high">Alta</SelectItem>
              </Select>
            )}
            <Input label="Título" value={title} onValueChange={setTitle}/>
            <Textarea label="Descrição" value={desc} onValueChange={setDesc}/>
            {msg && <div className="text-sm">{msg}</div>}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={()=>setOpen(false)}>Fechar</Button>
            <Button onPress={send} isDisabled={!title || !desc || loading}>{loading? 'Enviando...' : 'Enviar'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
