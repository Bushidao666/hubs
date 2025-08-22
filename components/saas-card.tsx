"use client";

import React from 'react';
import { Card, CardBody, CardFooter } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Badge } from '@heroui/badge';
import { Progress } from '@heroui/progress';
import { SaaSApp } from '@/types/saas';
import { CyberpunkIcon, getAppIcon } from '@/config/icons';

interface SaaSCardProps {
  app: SaaSApp;
  onClick: (app: SaaSApp) => void;
}

export function SaaSCard({ app, onClick }: SaaSCardProps) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'online': return 'success';
      case 'maintenance': return 'warning';
      case 'offline': return 'danger';
      default: return 'default';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch(tier) {
      case 'enterprise': return 'danger';
      case 'pro': return 'secondary';
      default: return 'success';
    }
  };

  return (
    <Card 
      isPressable
      isHoverable
      onClick={() => onClick(app)}
      className="bg-white/5 backdrop-blur-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 group cursor-pointer rounded-2xl hover:bg-white/10 hover:transform hover:scale-[1.02]"
    >
      <CardBody className="p-6 space-y-4">
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="transition-all duration-300 group-hover:transform group-hover:scale-110">
              <CyberpunkIcon 
                Icon={getAppIcon(app.id).icon}
                size={40}
                color={app.color || '#00ff00'}
                animate={false}
              />
            </div>
            <div>
              <h3 className="text-lg font-orbitron font-bold text-primary transition-all">
                {app.name}
              </h3>
              <p className="text-xs font-mono text-primary/40">v{app.version}</p>
            </div>
          </div>
          <Badge
            content=""
            color={getStatusColor(app.status)}
            variant="dot"
            placement="top-right"
            className="animate-pulse"
          >
            <Chip
              size="sm"
              variant="flat"
              color={getStatusColor(app.status)}
              className="font-mono text-xs"
            >
              {app.status.toUpperCase()}
            </Chip>
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-primary/60 font-mono line-clamp-2">
          {app.description}
        </p>

        {/* Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-primary/40">Uptime</span>
            <div className="flex items-center gap-2">
              <Progress 
                value={app.uptime} 
                color="success"
                size="sm"
                className="w-20"
              />
              <span className="text-xs font-mono text-primary">{app.uptime}%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-primary/40">Active Users</span>
            <span className="text-xs font-mono text-secondary">
              {app.activeUsers.toLocaleString()}
            </span>
          </div>
        </div>
      </CardBody>

      <CardFooter className="border-t border-primary/10 px-6 py-3 bg-black/20 rounded-b-2xl">
        <div className="flex justify-between items-center w-full">
          <Chip
            size="sm"
            variant="flat"
            color={getTierBadgeColor(app.requiredTier)}
            className="font-mono text-xs"
          >
            {app.requiredTier.toUpperCase()}
          </Chip>
          <span className="text-xs font-mono text-primary/40">
            {app.category}
          </span>
        </div>
      </CardFooter>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
    </Card>
  );
}