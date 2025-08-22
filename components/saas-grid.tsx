"use client";

import React, { useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Input } from '@heroui/input';
import { SaaSCard } from './saas-card';
import { LoadingTransition } from './loading-transition';
import { SaaSApp } from '@/types/saas';
import { saasApps } from '@/config/saas-apps';
import { Search } from 'lucide-react';

export function SaaSGrid() {
  const [apps] = useState<SaaSApp[]>(saasApps);
  const [selectedApp, setSelectedApp] = useState<SaaSApp | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAppClick = (app: SaaSApp) => {
    setSelectedApp(app);
    setIsLoading(true);
    
    // Simulate loading and redirect
    setTimeout(() => {
      console.log(`Redirecting to ${app.url} with auth token...`);
      // In production, this would handle actual authentication and redirect
      setIsLoading(false);
      setSelectedApp(null);
    }, 3000);
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = apps.filter(app => app.status === 'online').length;
  const totalUsers = apps.reduce((sum, app) => sum + app.activeUsers, 0);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 mb-6 rounded-2xl">
          <CardBody className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-3xl font-orbitron font-bold text-primary mb-2">
                  NEURAL INTERFACE
                </h2>
                <p className="text-sm font-mono text-primary/60">
                  Select application to establish neural link
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Chip 
                  variant="flat" 
                  color="success"
                  className="font-mono text-xs"
                >
                  {onlineCount} Systems Online
                </Chip>
                <Chip 
                  variant="flat" 
                  color="secondary"
                  className="font-mono text-xs"
                >
                  {totalUsers.toLocaleString()} Active Users
                </Chip>
                <Chip 
                  variant="flat" 
                  color="warning"
                  className="font-mono text-xs"
                >
                  Load: 67%
                </Chip>
              </div>

              {/* Search Bar */}
              <Input
                placeholder="Search neural applications..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                classNames={{
                  base: "max-w-md mx-auto",
                  inputWrapper: "bg-black/30 backdrop-blur-xl border-primary/20 hover:border-primary/40 focus-within:border-primary data-[hover=true]:bg-white/5 rounded-xl",
                  input: "text-primary placeholder:text-primary/30 font-mono text-sm"
                }}
                startContent={
                  <Search size={18} className="text-primary/50" />
                }
              />
            </div>
          </CardBody>
        </Card>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-y-auto pr-2">
          {filteredApps.map((app) => (
            <SaaSCard 
              key={app.id} 
              app={app} 
              onClick={handleAppClick}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-orbitron text-primary/30 mb-2">NO APPLICATIONS FOUND</p>
              <p className="text-sm font-mono text-primary/20">Try adjusting your search parameters</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Transition Overlay */}
      {isLoading && selectedApp && (
        <LoadingTransition 
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