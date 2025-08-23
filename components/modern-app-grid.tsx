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

  const handleAppClick = async (app: SaaSApp) => {
    setSelectedApp(app);
    setIsLoading(true);
    try {
      // Mapeie o id visual para o slug do Hub
      const slug = app.id === 'bs-cloaker' || app.name.toLowerCase().includes('cloaker')
        ? 'bs-cloaker'
        : app.id;
      // Nome RPC exposto pelo PostgREST é snake_case: hub_create_sso_link
      const { data, error } = await supabase.rpc('hub_create_sso_link', { app_slug: slug, redir: '/' });
      if (error) throw error;
      window.location.href = data as string;
    } catch (e: any) {
      console.error('SSO error', e?.message || e);
      setIsLoading(false);
      setSelectedApp(null);
    }
  };

  const categories = ['all', ...Array.from(new Set(apps.map(app => app.category)))];

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
              <h1 className="text-2xl font-semibold">Applications</h1>
              <p className="text-default-500 mt-1">
                Manage and access your integrated applications
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
              placeholder="Search applications..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search size={16} />}
              className="flex-1"
              classNames={{
                inputWrapper: "bg-content1 border border-divider"
              }}
            />
            <Select
              placeholder="Category"
              selectedKeys={[categoryFilter]}
              onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] as string)}
              startContent={<Filter size={16} />}
              className="w-full sm:w-48"
              classNames={{
                trigger: "bg-content1 border border-divider"
              }}
            >
              {categories.map((category) => (
                <SelectItem key={category}>
                  {category === 'all' ? 'All Categories' : category}
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
            {filteredApps.map((app) => (
              <ModernAppCard 
                key={app.id} 
                app={app} 
                onClick={handleAppClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-default-300 mb-4">
              <Search size={48} />
            </div>
            <p className="text-default-500">No applications found</p>
            <p className="text-sm text-default-400 mt-1">
              Try adjusting your search or filters
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