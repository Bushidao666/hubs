"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Badge } from '@heroui/badge';
import { Button } from '@heroui/button';
import { SaaSApp } from '@/types/saas';
import { getAppIcon } from '@/config/icons';
import { ArrowUpRight, Users, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ModernAppCardProps {
  app: SaaSApp;
  onClick: (app: SaaSApp) => void;
  comingSoon?: boolean;
}

export function ModernAppCard({ app, onClick, comingSoon = false }: ModernAppCardProps) {
  const [available, setAvailable] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('online');
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc('hub_apps_catalog');
      if (error) return;
      const row = (data as any[])?.find(r => r.slug === (app.id === 'bs-cloaker' || app.name.toLowerCase().includes('cloaker') ? 'bs-cloaker' : app.id));
      if (row) {
        setAvailable(!!row.available);
        setStatus(row.status);
        setEnabled(row.enabled);
      }
    })();
  }, [app.id, app.name]);
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'success';
      case 'maintenance': return 'warning';
      case 'offline': return 'danger';
      default: return 'default';
    }
  };

  const { icon: AppIcon, color } = getAppIcon(app.id);

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

  return (
    <Card 
      className="relative bg-glass backdrop-blur-md border border-subtle hover:bg-glass-hover hover:border-subtle-hover hover:-translate-y-1 transition-all duration-200"
    >
      <CardBody className="p-6">
        {/* App Icon and Status */}
        <div className="flex items-start justify-between mb-4">
          {app.image ? (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-content2 ring-2 ring-primary ring-offset-2 ring-offset-background">
              <img 
                src={app.image} 
                alt={app.name} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="p-3 rounded-full bg-content2">
              <AppIcon size={24} className="text-primary" />
            </div>
          )}
          <Badge
            content=""
            color={getStatusColor(app.status)}
            placement="top-right"
          >
            <Chip
              size="sm"
              variant="flat"
              color={getStatusColor(status)}
            >
              {status}
            </Chip>
          </Badge>
        </div>

        {/* App Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{app.name}</h3>
          <p className="text-sm text-default-500 line-clamp-2">
            {app.description}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-divider">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-default-400" />
            <span className="text-xs text-default-500">
              {app.activeUsers.toLocaleString('en-US')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-default-400" />
            <span className="text-xs text-default-500">
              {app.uptime}% uptime
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter className="px-6 py-3 border-t border-divider">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-default-400">
            {tCategory(app.category)}
          </span>
          <Button 
            size="sm" 
            variant={comingSoon ? 'flat' : (available && enabled ? 'light' : 'flat')}
            isDisabled={comingSoon || !available || !enabled || status !== 'online'}
            endContent={<ArrowUpRight size={14} />}
            className="text-primary"
            onClick={() => !comingSoon && available && enabled && status === 'online' && onClick(app)}
          >
            {comingSoon ? 'Em Breve' : (available && enabled && status === 'online' ? 'Abrir' : 'Indisponível')}
          </Button>
        </div>
      </CardFooter>

      {comingSoon && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-large bg-black/60 backdrop-blur-sm">
          <span className="px-4 py-2 rounded-md border border-primary/50 text-primary font-semibold uppercase tracking-widest bg-black/40">
            Em Breve
          </span>
        </div>
      )}
    </Card>
  );
}