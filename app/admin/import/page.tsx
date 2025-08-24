"use client";
import React from 'react';
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';

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
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Admin • Importar Membros</h1>
      <div className="flex items-center gap-4">
        <input type="file" accept=".csv" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
        <div className="flex items-center gap-2">
          <span>Dry-run</span>
          <Switch isSelected={dry} onValueChange={setDry} />
        </div>
        <Button onPress={submit} isDisabled={!file || loading}>{loading? 'Importando...' : 'Enviar'}</Button>
      </div>

      {result && (
        <div className="text-sm">
          <div>Total: {result.total} • Sucesso: {result.success} • Falhas: {result.failed}</div>
          {result.results?.length ? (
            <div className="mt-3 border rounded-md max-h-80 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-default-100">
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Criado</th>
                    <th className="p-2 text-left">Grants</th>
                    <th className="p-2 text-left">Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r: any, idx: number)=> (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{r.email}</td>
                      <td className="p-2">{r.created? 'sim':'não'}</td>
                      <td className="p-2">{r.grants}</td>
                      <td className="p-2 text-danger">{r.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
