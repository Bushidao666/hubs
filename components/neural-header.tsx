"use client";

import React, { useEffect, useState } from 'react';
import { Avatar } from '@heroui/avatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { useRouter } from 'next/navigation';

export function NeuralHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('active');
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-2xl border-b border-primary/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      
      <div className="relative flex items-center justify-between px-8 py-5">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/40 backdrop-blur-xl border border-primary/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary text-glow-sm">B</span>
            </div>
            <div>
              <h1 className="text-xl font-orbitron font-bold text-primary">
                BLACKSIDER HUB
              </h1>
              <p className="text-xs text-primary/40 font-mono">NEURAL INTERFACE v2.0</p>
            </div>
          </div>
        </div>

        {/* Center Clock */}
        <div className="flex flex-col items-center px-6 py-2 rounded-2xl bg-black/20 backdrop-blur-xl border border-primary/10">
          <div className="text-2xl font-orbitron font-bold text-primary">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs font-mono text-primary/40 mt-1">
            {formatDate(currentTime)}
          </div>
        </div>

        {/* Right Section - Status & User */}
        <div className="flex items-center gap-6">
          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            <Chip
              size="sm"
              variant="flat"
              color="success"
              className="font-mono text-xs bg-black/30 backdrop-blur-xl border border-primary/20"
            >
              NEURAL: {connectionStatus.toUpperCase()}
            </Chip>
            <Badge 
              content="100ms" 
              color="primary" 
              variant="flat"
              size="sm"
              className="font-mono"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </Badge>
            <div className="text-xs font-mono text-primary/60 flex items-center gap-2">
              <span>UPTIME:</span>
              <span className="text-primary">99.99%</span>
            </div>
          </div>

          {/* User Avatar with Dropdown */}
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform border-2 border-primary/50 hover:border-primary"
                color="success"
                name="User"
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              />
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="User menu"
              className="bg-content1 border border-primary/20"
              itemClasses={{
                base: "text-primary/80 hover:text-primary hover:bg-primary/10"
              }}
            >
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold text-primary">Signed in as</p>
                <p className="font-mono text-xs">user@blacksider.hub</p>
              </DropdownItem>
              <DropdownItem key="settings" onClick={() => router.push('/settings')}>
                Neural Settings
              </DropdownItem>
              <DropdownItem key="diagnostics">System Diagnostics</DropdownItem>
              <DropdownItem key="analytics">Analytics</DropdownItem>
              <DropdownItem key="help">Help & Feedback</DropdownItem>
              <DropdownItem key="logout" color="danger" className="text-danger">
                Disconnect
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}