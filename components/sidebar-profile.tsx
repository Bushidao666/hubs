"use client";

import React from 'react';
import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Progress } from '@heroui/progress';
import { Card, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import { UserProfile } from '@/types/saas';

interface SidebarProfileProps {
  user?: UserProfile;
}

export function SidebarProfile({ user }: SidebarProfileProps) {
  const defaultUser: UserProfile = {
    id: 'usr_001',
    name: 'Neural User',
    neuralId: 'NX-2077',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    joinDate: new Date('2024-01-15'),
    tier: 'pro',
    accessLevel: 95,
    syncLevel: 87,
    securityLevel: 100,
    bandwidthUsage: 45
  };

  const currentUser = user || defaultUser;

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'enterprise': return 'danger';
      case 'pro': return 'secondary';
      default: return 'success';
    }
  };

  return (
    <aside className="w-full h-full bg-black/20 backdrop-blur-xl border-r border-primary/10 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Profile Section */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                <Avatar
                  src={currentUser.avatarUrl}
                  className="w-24 h-24 text-large ring-2 ring-primary/30 ring-offset-4 ring-offset-black/50"
                />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-xl font-orbitron font-bold text-primary">
                  {currentUser.name}
                </h2>
                <p className="text-sm font-mono text-primary/60">
                  ID: {currentUser.neuralId}
                </p>
                <p className="text-xs text-primary/40 font-mono">
                  Joined: {formatJoinDate(currentUser.joinDate)}
                </p>
                <Chip 
                  color={getTierColor(currentUser.tier)}
                  variant="flat"
                  size="sm"
                  className="mt-2 bg-black/30 backdrop-blur-xl"
                >
                  {currentUser.tier.toUpperCase()} TIER
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Neural Statistics */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-4 space-y-4">
            <h3 className="text-sm font-orbitron font-semibold text-primary">
              NEURAL STATISTICS
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-primary/60">System Access</span>
                  <span className="text-xs font-mono text-primary">{currentUser.accessLevel}%</span>
                </div>
                <Progress 
                  value={currentUser.accessLevel} 
                  color="success"
                  size="sm"
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-primary/60">Data Sync</span>
                  <span className="text-xs font-mono text-secondary">{currentUser.syncLevel}%</span>
                </div>
                <Progress 
                  value={currentUser.syncLevel} 
                  color="secondary"
                  size="sm"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-primary/60">Security Level</span>
                  <span className="text-xs font-mono text-warning">{currentUser.securityLevel}%</span>
                </div>
                <Progress 
                  value={currentUser.securityLevel} 
                  color="warning"
                  size="sm"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-primary/60">Bandwidth</span>
                  <span className="text-xs font-mono text-danger">{currentUser.bandwidthUsage}%</span>
                </div>
                <Progress 
                  value={currentUser.bandwidthUsage} 
                  color="danger"
                  size="sm"
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* System Diagnostics */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-4 space-y-3">
            <h3 className="text-sm font-orbitron font-semibold text-primary">
              SYSTEM DIAGNOSTICS
            </h3>
            
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-primary/60">CPU Usage:</span>
                <span className="text-primary">42.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/60">Memory:</span>
                <span className="text-primary">8.2 GB / 16 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/60">Sessions:</span>
                <span className="text-primary">127 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/60">Network:</span>
                <span className="text-secondary">Excellent</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-4 space-y-3">
            <h3 className="text-sm font-orbitron font-semibold text-primary">
              QUICK ACTIONS
            </h3>
            
            <div className="space-y-2">
              <Button 
                variant="flat" 
                color="primary"
                size="sm"
                className="w-full font-mono bg-black/30 backdrop-blur-xl border border-primary/20"
              >
                Run Diagnostics
              </Button>
              <Button 
                variant="flat" 
                color="secondary"
                size="sm"
                className="w-full font-mono bg-black/30 backdrop-blur-xl border border-secondary/20"
              >
                Neural Config
              </Button>
              <Button 
                variant="flat" 
                color="warning"
                size="sm"
                className="w-full font-mono bg-black/30 backdrop-blur-xl border border-warning/20"
              >
                Access History
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </aside>
  );
}