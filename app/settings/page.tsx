"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Switch } from '@heroui/switch';
import { Slider } from '@heroui/slider';
import { Divider } from '@heroui/divider';
import { Chip } from '@heroui/chip';
import { Badge } from '@heroui/badge';
import { Select, SelectItem } from '@heroui/select';
import { NeuralHeader } from '@/components/neural-header';
import { saasApps } from '@/config/saas-apps';

export default function Settings() {
  const router = useRouter();
  
  const [interfaceSettings, setInterfaceSettings] = useState({
    animations: true,
    glow: true,
    audio: false,
    particles: true,
    scanlines: true,
    gridBackground: true
  });

  const [performanceSettings, setPerformanceSettings] = useState({
    autoSync: true,
    cacheEnabled: true,
    dataPrefetch: false,
    refreshRate: 60
  });

  const [glowIntensity, setGlowIntensity] = useState(70);
  const [theme, setTheme] = useState('cyberpunk-dark');

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Neural Header */}
      <NeuralHeader />
      
      {/* Settings Content */}
      <div className="flex-1 pt-20 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="bordered"
              color="primary"
              size="sm"
              onClick={() => router.push('/')}
              className="mb-4 font-mono"
            >
              ← Back to Dashboard
            </Button>
            
            <h1 className="text-4xl font-orbitron font-bold text-primary text-glow mb-2">
              NEURAL SETTINGS
            </h1>
            <p className="text-sm font-mono text-primary/60">
              Configure your neural interface preferences
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interface Settings */}
            <Card className="bg-black/60 border border-primary/30 card-glow">
              <CardHeader className="pb-0">
                <h2 className="text-lg font-orbitron font-semibold text-primary text-glow-sm">
                  INTERFACE CONFIGURATION
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-primary">Neural Animations</p>
                      <p className="text-xs font-mono text-primary/40">Enable UI animations</p>
                    </div>
                    <Switch
                      color="primary"
                      isSelected={interfaceSettings.animations}
                      onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, animations: value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-primary">Glow Effects</p>
                      <p className="text-xs font-mono text-primary/40">Neon glow on elements</p>
                    </div>
                    <Switch
                      color="secondary"
                      isSelected={interfaceSettings.glow}
                      onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, glow: value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-primary">Audio Feedback</p>
                      <p className="text-xs font-mono text-primary/40">Sound effects on actions</p>
                    </div>
                    <Switch
                      color="warning"
                      isSelected={interfaceSettings.audio}
                      onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, audio: value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-primary">Background Particles</p>
                      <p className="text-xs font-mono text-primary/40">Floating particles effect</p>
                    </div>
                    <Switch
                      color="success"
                      isSelected={interfaceSettings.particles}
                      onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, particles: value }))}
                    />
                  </div>

                  <Divider className="bg-primary/20" />

                  <div className="space-y-2">
                    <p className="text-sm font-mono text-primary">Glow Intensity</p>
                    <Slider
                      size="sm"
                      step={10}
                      maxValue={100}
                      minValue={0}
                      value={glowIntensity}
                      onChange={(value) => setGlowIntensity(value as number)}
                      className="max-w-full"
                      color="primary"
                    />
                    <p className="text-xs font-mono text-primary/40 text-right">{glowIntensity}%</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Access Control */}
            <Card className="bg-black/60 border border-primary/30 card-glow">
              <CardHeader className="pb-0">
                <h2 className="text-lg font-orbitron font-semibold text-primary text-glow-sm">
                  ACCESS CONTROL
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {saasApps.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-2 border border-primary/20 rounded bg-black/30">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{app.icon}</span>
                        <span className="text-xs font-mono text-primary/80">{app.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          content={app.requiredTier.toUpperCase()}
                          color={app.requiredTier === 'enterprise' ? 'danger' : app.requiredTier === 'pro' ? 'secondary' : 'success'}
                          variant="flat"
                          size="sm"
                        >
                          <Chip
                            size="sm"
                            variant="flat"
                            color={app.status === 'online' ? 'success' : app.status === 'maintenance' ? 'warning' : 'danger'}
                          >
                            {app.status}
                          </Chip>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Performance Settings */}
            <Card className="bg-black/60 border border-primary/30 card-glow">
              <CardHeader className="pb-0">
                <h2 className="text-lg font-orbitron font-semibold text-primary text-glow-sm">
                  PERFORMANCE SETTINGS
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-primary">Auto Sync</p>
                    <p className="text-xs font-mono text-primary/40">Automatic data synchronization</p>
                  </div>
                  <Switch
                    color="primary"
                    isSelected={performanceSettings.autoSync}
                    onValueChange={(value) => setPerformanceSettings(prev => ({ ...prev, autoSync: value }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-primary">Cache</p>
                    <p className="text-xs font-mono text-primary/40">Enable local caching</p>
                  </div>
                  <Switch
                    color="secondary"
                    isSelected={performanceSettings.cacheEnabled}
                    onValueChange={(value) => setPerformanceSettings(prev => ({ ...prev, cacheEnabled: value }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-primary">Data Prefetch</p>
                    <p className="text-xs font-mono text-primary/40">Preload application data</p>
                  </div>
                  <Switch
                    color="warning"
                    isSelected={performanceSettings.dataPrefetch}
                    onValueChange={(value) => setPerformanceSettings(prev => ({ ...prev, dataPrefetch: value }))}
                  />
                </div>

                <Divider className="bg-primary/20" />

                <div className="space-y-2">
                  <p className="text-sm font-mono text-primary">Refresh Rate</p>
                  <Select
                    size="sm"
                    placeholder="Select refresh rate"
                    selectedKeys={[performanceSettings.refreshRate.toString()]}
                    className="max-w-full"
                    classNames={{
                      trigger: "bg-black border-primary/30",
                      value: "text-primary"
                    }}
                  >
                    <SelectItem key="30" value="30">30 FPS</SelectItem>
                    <SelectItem key="60" value="60">60 FPS</SelectItem>
                    <SelectItem key="120" value="120">120 FPS</SelectItem>
                    <SelectItem key="144" value="144">144 FPS</SelectItem>
                  </Select>
                </div>
              </CardBody>
            </Card>

            {/* Account Information */}
            <Card className="bg-black/60 border border-primary/30 card-glow">
              <CardHeader className="pb-0">
                <h2 className="text-lg font-orbitron font-semibold text-primary text-glow-sm">
                  ACCOUNT INFORMATION
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-primary/60">Neural ID:</span>
                    <span className="text-primary">NX-2077</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/60">Subscription:</span>
                    <Chip size="sm" color="secondary" variant="flat">PRO</Chip>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/60">Member Since:</span>
                    <span className="text-primary">Jan 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/60">Storage Used:</span>
                    <span className="text-primary">234.5 GB / 1 TB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/60">API Calls:</span>
                    <span className="text-primary">1,247,892 / month</span>
                  </div>
                </div>

                <Divider className="bg-primary/20" />

                <div className="space-y-2">
                  <Button 
                    variant="bordered" 
                    color="secondary"
                    size="sm"
                    className="w-full font-mono"
                  >
                    Upgrade to Enterprise
                  </Button>
                  <Button 
                    variant="bordered" 
                    color="warning"
                    size="sm"
                    className="w-full font-mono"
                  >
                    View Billing History
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              color="primary"
              variant="solid"
              size="lg"
              className="font-mono px-8"
            >
              SAVE CONFIGURATION
            </Button>
            <Button
              color="danger"
              variant="bordered"
              size="lg"
              className="font-mono px-8"
            >
              RESET TO DEFAULT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}