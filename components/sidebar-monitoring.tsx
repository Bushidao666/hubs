"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { CircularProgress } from '@heroui/progress';
import { Chip } from '@heroui/chip';
import { Switch } from '@heroui/switch';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { NetworkNode, SystemMetrics } from '@/types/saas';
import { networkNodes } from '@/config/saas-apps';
import { CyberpunkIcon, getAppIcon } from '@/config/icons';

export function SidebarMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 42,
    memoryUsage: 67,
    activeSessions: 1247,
    networkStatus: 'excellent',
    bandwidth: 45,
    dataTransfer: 234.5,
    responseTime: 12
  });

  const [recentAccess, setRecentAccess] = useState([
    { id: '1', appId: 'neural-analytics', name: 'Neural Analytics', time: '2 min ago' },
    { id: '2', appId: 'quantum-storage', name: 'Quantum Storage', time: '5 min ago' },
    { id: '3', appId: 'cyber-shield', name: 'Cyber Shield', time: '12 min ago' },
    { id: '4', appId: 'data-forge', name: 'Data Forge', time: '1 hour ago' },
    { id: '5', appId: 'neural-chat', name: 'Neural Chat', time: '2 hours ago' }
  ]);

  const [controls, setControls] = useState({
    audioFeedback: true,
    animations: true,
    autoSync: true
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.min(100, Math.max(20, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.min(100, Math.max(40, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeSessions: Math.max(500, prev.activeSessions + Math.floor((Math.random() - 0.5) * 100)),
        dataTransfer: prev.dataTransfer + Math.random() * 2,
        responseTime: Math.max(5, Math.min(50, prev.responseTime + (Math.random() - 0.5) * 5))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getNetworkStatusColor = (status: string) => {
    switch(status) {
      case 'excellent': return 'success';
      case 'good': return 'warning';
      case 'poor': return 'danger';
      default: return 'default';
    }
  };

  const getPingColor = (ping: number) => {
    if (ping === 0) return 'text-danger';
    if (ping < 20) return 'text-success';
    if (ping < 50) return 'text-warning';
    return 'text-danger';
  };

  return (
    <aside className="w-full h-full bg-black/20 backdrop-blur-xl border-l border-primary/10 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* System Monitor */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-4 space-y-4">
            <h3 className="text-sm font-orbitron font-semibold text-primary">
              SYSTEM MONITOR
            </h3>
            
            <div className="flex justify-center">
              <div className="relative">
                <CircularProgress
                  aria-label="System Load"
                  size="lg"
                  value={metrics.cpuUsage}
                  color="primary"
                  strokeWidth={3}
                  showValueLabel={true}
                  classNames={{
                    svg: "w-36 h-36",
                    indicator: "stroke-primary",
                    track: "stroke-primary/10",
                    value: "text-2xl font-orbitron text-primary"
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center mt-10">
                    <p className="text-xs font-mono text-primary/60">SYSTEM</p>
                    <p className="text-xs font-mono text-primary/60">LOAD</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-primary/60">Active Sessions:</span>
                <span className="text-primary">{metrics.activeSessions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/60">Data Transfer:</span>
                <span className="text-primary">{metrics.dataTransfer.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/60">Response Time:</span>
                <span className="text-secondary">{metrics.responseTime.toFixed(0)} ms</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recent Access */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-4 space-y-3">
            <h3 className="text-sm font-orbitron font-semibold text-primary">
              RECENT ACCESS
            </h3>
            
            <ScrollShadow className="h-[150px]">
              <div className="space-y-2">
                {recentAccess.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <CyberpunkIcon 
                        Icon={getAppIcon(item.appId).icon}
                        size={18}
                        color={getAppIcon(item.appId).color}
                      />
                      <span className="text-xs font-mono text-primary/80">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono text-primary/40">{item.time}</span>
                  </div>
                ))}
              </div>
            </ScrollShadow>
          </CardBody>
        </Card>

        {/* Network Status */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-4 space-y-3">
            <h3 className="text-sm font-orbitron font-semibold text-primary">
              NETWORK STATUS
            </h3>
            
            <ScrollShadow className="h-[180px]">
              <div className="space-y-2">
                {networkNodes.map((node: NetworkNode) => (
                  <div key={node.id} className="p-2 border border-primary/10 rounded-xl bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                        <span className="text-xs font-mono text-primary/80">{node.name}</span>
                      </div>
                      <Chip size="sm" variant="flat" color={node.status === 'online' ? 'success' : 'danger'}>
                        {node.status}
                      </Chip>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-primary/40">{node.location}</span>
                      <span className={getPingColor(node.ping)}>
                        {node.ping > 0 ? `${node.ping}ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollShadow>
          </CardBody>
        </Card>

        {/* Quick Controls */}
        <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl">
          <CardBody className="p-4 space-y-3">
            <h3 className="text-sm font-orbitron font-semibold text-primary">
              QUICK CONTROLS
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary/60">Audio Feedback</span>
                <Switch
                  size="sm"
                  color="primary"
                  isSelected={controls.audioFeedback}
                  onValueChange={(value) => setControls(prev => ({ ...prev, audioFeedback: value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary/60">UI Animations</span>
                <Switch
                  size="sm"
                  color="secondary"
                  isSelected={controls.animations}
                  onValueChange={(value) => setControls(prev => ({ ...prev, animations: value }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary/60">Auto Sync</span>
                <Switch
                  size="sm"
                  color="warning"
                  isSelected={controls.autoSync}
                  onValueChange={(value) => setControls(prev => ({ ...prev, autoSync: value }))}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </aside>
  );
}