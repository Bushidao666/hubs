"use client";
import React from 'react';
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';

export default function AdminImportPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [dry, setDry] = React.useState(true);
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('dry_run', String(dry));
    const resp = await fetch('/api/admin/import-csv', { method: 'POST', body: fd });
    const data = await resp.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 space-y-6 bg-background">
      {/* Grid background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      <h1 className="text-lg font-semibold text-foreground relative">Admin • <span className="text-primary">Importar Membros</span></h1>
      <Card className="bg-glass backdrop-blur-md border border-subtle relative">
        <CardBody>
          <div className="flex items-center gap-4">
            <label className="relative cursor-pointer">
              <input type="file" accept=".csv" onChange={(e)=> setFile(e.target.files?.[0] || null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer" />
            </label>
            <div className="flex items-center gap-2">
              <span className="text-default-500">Dry-run</span>
              <Switch isSelected={dry} onValueChange={setDry} color="primary" />
            </div>
            <Button color="primary" onPress={submit} isDisabled={!file || loading}>{loading? 'Importando...' : 'Enviar'}</Button>
          </div>
        </CardBody>
      </Card>

      {result && (
        <Card className="bg-glass backdrop-blur-md border border-subtle relative">
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Chip size="sm" variant="flat">Total: {result.total}</Chip>
              <Chip size="sm" color="success" variant="flat">Sucesso: {result.success}</Chip>
              <Chip size="sm" color="danger" variant="flat">Falhas: {result.failed}</Chip>
            </div>
            {result.results?.length ? (
              <div className="border border-subtle rounded-lg max-h-80 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-content1 border-b border-subtle">
                      <th className="p-3 text-left text-primary font-medium">Email</th>
                      <th className="p-3 text-left text-primary font-medium">Criado</th>
                      <th className="p-3 text-left text-primary font-medium">Grants</th>
                      <th className="p-3 text-left text-primary font-medium">Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r: any, idx: number)=> (
                      <tr key={idx} className="border-t border-subtle hover:bg-content1/50 transition-colors">
                        <td className="p-3 text-default-500">{r.email}</td>
                        <td className="p-3">
                          <Chip size="sm" color={r.created? 'success':'default'} variant="flat">
                            {r.created? 'sim':'não'}
                          </Chip>
                        </td>
                        <td className="p-3 text-default-500">{r.grants}</td>
                        <td className="p-3 text-danger">{r.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : null}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
