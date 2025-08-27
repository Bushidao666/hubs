"use client";

import React from 'react';
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Progress } from '@heroui/progress';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users,
  Download,
  PlayCircle
} from 'lucide-react';

export function ImportTab() {
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
    const resp = await fetch('/api/admin/import-csv', { 
      method: 'POST', 
      body: fd 
    });
    const data = await resp.json();
    setResult(data);
    setLoading(false);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header & Upload Card */}
      <Card className="bg-glass backdrop-blur-md border border-subtle">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Importar Membros</h3>
              <p className="text-sm text-default-500">Importe usuários via arquivo CSV</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {/* Instructions */}
            <div className="p-4 bg-content1 rounded-lg border border-subtle">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-warning">Formato esperado do CSV:</p>
                  <ul className="list-disc list-inside text-default-500 space-y-1">
                    <li>Primeira linha: cabeçalhos (email, full_name, etc)</li>
                    <li>Colunas suportadas: email (obrigatório), full_name, grants</li>
                    <li>Exemplo: email,full_name,grants</li>
                    <li>Use vírgula como separador</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <label className="relative cursor-pointer block">
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                    className="hidden"
                    id="csv-import"
                  />
                  <div className="border-2 border-dashed border-subtle rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-default-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-default-400" />
                        <p className="text-sm text-default-500">
                          Clique para selecionar ou arraste o arquivo CSV aqui
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-content1 rounded-lg">
                  <Switch 
                    isSelected={dry} 
                    onValueChange={setDry} 
                    color="primary"
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium">Modo Dry-run</p>
                    <p className="text-xs text-default-500">
                      {dry ? 'Simular importação' : 'Importação real'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  color="primary" 
                  onPress={submit} 
                  isDisabled={!file || loading}
                  isLoading={loading}
                  startContent={!loading && <PlayCircle className="w-4 h-4" />}
                >
                  {loading ? 'Processando...' : 'Importar'}
                </Button>
                
                {file && !loading && (
                  <Button 
                    variant="light"
                    size="sm"
                    onPress={reset}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results Card */}
      {result && (
        <Card className="bg-glass backdrop-blur-md border border-subtle">
          <CardHeader>
            <h3 className="text-lg font-semibold">Resultado da Importação</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-content1">
                <CardBody className="text-center py-4">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{result.total}</p>
                  <p className="text-xs text-default-500">Total</p>
                </CardBody>
              </Card>
              
              <Card className="bg-content1">
                <CardBody className="text-center py-4">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold text-success">{result.success}</p>
                  <p className="text-xs text-default-500">Sucesso</p>
                </CardBody>
              </Card>
              
              <Card className="bg-content1">
                <CardBody className="text-center py-4">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
                  <p className="text-2xl font-bold text-danger">{result.failed}</p>
                  <p className="text-xs text-default-500">Falhas</p>
                </CardBody>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Sucesso</span>
                <span className="text-primary">
                  {result.total > 0 ? Math.round((result.success / result.total) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={result.total > 0 ? (result.success / result.total) * 100 : 0}
                color="success"
                size="sm"
              />
            </div>

            {/* Detailed Results Table */}
            {result.results?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Detalhes da Importação</h4>
                <ScrollShadow className="h-[300px]">
                  <Table 
                    removeWrapper
                    aria-label="Resultados da importação"
                    classNames={{
                      th: "bg-content1 text-default-500 border-b border-divider",
                      td: "py-2",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>EMAIL</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                      <TableColumn>GRANTS</TableColumn>
                      <TableColumn>ERRO</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {result.results.map((r: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {r.created ? (
                                <CheckCircle className="w-4 h-4 text-success" />
                              ) : r.error ? (
                                <XCircle className="w-4 h-4 text-danger" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-warning" />
                              )}
                              <span className="text-sm">{r.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="sm" 
                              color={r.created ? 'success' : r.error ? 'danger' : 'default'} 
                              variant="flat"
                            >
                              {r.created ? 'Criado' : r.error ? 'Erro' : 'Existente'}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-default-500">
                              {r.grants || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {r.error && (
                              <span className="text-xs text-danger">
                                {r.error}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollShadow>
              </div>
            )}

            {/* Mode Indicator */}
            {dry && (
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <p className="text-sm text-warning">
                    Modo Dry-run: Nenhuma alteração foi salva no banco de dados
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}