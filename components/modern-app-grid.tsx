"use client";

import React, { useState } from 'react';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { ModernAppCard } from './modern-app-card';
import { ModernLoadingModal } from './modern-loading-modal';
import { SaaSApp } from '@/types/saas';
import { saasApps } from '@/config/saas-apps';
import { supabase } from '@/lib/supabaseClient';
import { Search, Filter, Grid3X3, List } from 'lucide-react';

export function ModernAppGrid() {
  const [apps] = useState<SaaSApp[]>(saasApps);
  const [selectedApp, setSelectedApp] = useState<SaaSApp | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const resolveSlug = (app: SaaSApp) => {
    // Prefer explicit property if existir no objeto
    const anyApp = app as any;
    if (anyApp.slug && typeof anyApp.slug === 'string') return anyApp.slug;
    const txt = `${app.id} ${app.name}`.toLowerCase();
    // Mapas heurísticos para o Protocolo Fantasma (BS Cloaker)
    if (
      txt.includes('bs-cloaker') ||
      txt.includes('cloaker') ||
      txt.includes('protocolo') ||
      txt.includes('fantasma')
    ) {
      return 'bs-cloaker';
    }
    return app.id;
  };

  const handleAppClick = async (app: SaaSApp) => {
    setSelectedApp(app);
    setIsLoading(true);
    try {
      const slug = resolveSlug(app);
      // Chama via API route para garantir cookie de sessão no SSR
      const resp = await fetch('/api/sso/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_slug: slug, redir: '/' })
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || 'sso link failed');
      }
      const json = await resp.json();
      window.location.assign(json.url as string);
    } catch (e: any) {
      console.error('SSO error', e?.message || e);
      setIsLoading(false);
      setSelectedApp(null);
    }
  };

  const categories = ['all', ...Array.from(new Set(apps.map(app => app.category)))];

  const tCategory = (c: string) => {
    switch (c) {
      case 'Development': return 'Desenvolvimento';
      case 'Security': return 'Segurança';
      case 'Hardware': return 'Hardware';
      case 'Monitoring': return 'Monitoramento';
      case 'Templates': return 'Modelos';
      case 'Integration': return 'Integração';
      case 'Performance': return 'Desempenho';
      default: return c;
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Aplicativos</h1>
              <p className="text-default-500 mt-1">
                Gerencie e acesse seus aplicativos integrados
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                isIconOnly
                variant={viewMode === 'grid' ? 'flat' : 'light'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 size={16} />
              </Button>
              <Button
                isIconOnly
                variant={viewMode === 'list' ? 'flat' : 'light'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Buscar aplicativos..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search size={16} />}
              className="flex-1"
              classNames={{
                inputWrapper: "bg-black/30 backdrop-blur-xl border-primary/20 hover:border-primary/40 focus-within:border-primary data-[hover=true]:bg-white/5"
              }}
            />
            <Select
              placeholder="Categoria"
              selectedKeys={[categoryFilter]}
              onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] as string)}
              startContent={<Filter size={16} />}
              className="w-full sm:w-48"
              classNames={{
                trigger: "bg-black/30 backdrop-blur-xl border-primary/20 hover:border-primary/40 data-[hover=true]:bg-white/5"
              }}
            >
              {categories.map((category) => (
                <SelectItem key={category}>
                  {category === 'all' ? 'Todas as categorias' : tCategory(category)}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredApps.map((app) => {
              const comingSoonIds = new Set([
                'hidra',
                'radar-blacksider',
                'hyper',
                'siderlink',
                'cybervault',
                'sider-tools',
              ]);
              const comingSoon = comingSoonIds.has(app.id);
              return (
                <ModernAppCard 
                  key={app.id} 
                  app={app}
                  comingSoon={comingSoon}
                  onClick={handleAppClick}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-default-300 mb-4">
              <Search size={48} />
            </div>
            <p className="text-default-500">Nenhum aplicativo encontrado</p>
            <p className="text-sm text-default-400 mt-1">
              Tente ajustar sua busca ou filtros
            </p>
          </div>
        )}
      </div>

      {/* Loading Modal */}
      {isLoading && selectedApp && (
        <ModernLoadingModal 
          app={selectedApp}
          onClose={() => {
            setIsLoading(false);
            setSelectedApp(null);
          }}
        />
      )}
    </>
  );
}