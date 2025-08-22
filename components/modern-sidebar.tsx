"use client";

import React from 'react';
import { Avatar } from '@heroui/avatar';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { UserProfile } from '@/types/saas';
import { Shield, Zap, TrendingUp, Cpu } from 'lucide-react';

interface ModernSidebarProps {
  user?: UserProfile;
}

export function ModernSidebar({ user }: ModernSidebarProps) {
  const defaultUser: UserProfile = {
    id: 'usr_001',
    name: 'John Doe',
    neuralId: 'USR-2025',
    avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    joinDate: new Date('2025-01-15'),
    tier: 'pro',
    accessLevel: 95,
    syncLevel: 87,
    securityLevel: 100,
    bandwidthUsage: 45
  };

  const currentUser = user || defaultUser;

  return (
    <aside className="w-full h-full bg-content1 border-r border-divider overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* User Profile Card */}
        <Card className="glass-card">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={currentUser.avatarUrl}
                className="w-16 h-16"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{currentUser.name}</h2>
                <p className="text-sm text-default-500">ID: {currentUser.neuralId}</p>
                <div className="mt-2">
                  <Chip 
                    size="sm"
                    color={currentUser.tier === 'pro' ? 'primary' : 'default'}
                    variant="flat"
                  >
                    {currentUser.tier.toUpperCase()} PLAN
                  </Chip>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button 
                fullWidth 
                color="primary"
                variant="flat"
                size="sm"
                startContent={<Settings size={16} />}
              >
                Account Settings
              </Button>
              <Button 
                fullWidth 
                variant="light"
                size="sm"
                startContent={<TrendingUp size={16} />}
              >
                Upgrade Plan
              </Button>
            </div>
          </CardBody>
        </Card>

      </div>
    </aside>
  );
}

// Import Settings icon
import { Settings } from 'lucide-react';