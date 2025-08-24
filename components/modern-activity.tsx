"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Avatar } from '@heroui/avatar';
import { Activity } from '@/types/saas';
import { mockActivities } from '@/config/saas-apps';
import { Clock, TrendingUp, Upload, Settings, Shield, Users } from 'lucide-react';

export function ModernActivity() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: `${Date.now()}`,
        timestamp: new Date(),
        userId: `usr_${Math.floor(Math.random() * 100)}`,
        userName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'][Math.floor(Math.random() * 4)],
        action: ['accessed', 'uploaded', 'deployed', 'configured'][Math.floor(Math.random() * 4)],
        appName: ['SiderTools', 'CyberVault', 'Protocolo Fantasma', 'Hidra', 'Radar BlackSider'][Math.floor(Math.random() * 5)],
        details: ['Code generation', 'Template download', 'Security scan', 'Hardware optimization', 'System monitoring'][Math.floor(Math.random() * 5)]
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 8));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'accessed': return TrendingUp;
      case 'uploaded': return Upload;
      case 'deployed': return Shield;
      case 'configured': return Settings;
      default: return Clock;
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'accessed': return 'primary';
      case 'uploaded': return 'secondary';
      case 'deployed': return 'success';
      case 'configured': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card className="bg-glass backdrop-blur-md border border-subtle">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Chip size="sm" variant="flat" color="success">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Live
            </span>
          </Chip>
        </div>
      </CardHeader>
      <CardBody className="px-6 py-4">
        <div className="space-y-4">
          {activities.map((activity) => {
            const ActionIcon = getActionIcon(activity.action);
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-content2 transition-colors">
                <div className={`p-2 rounded-lg bg-${getActionColor(activity.action)}/10`}>
                  <ActionIcon size={16} className={`text-${getActionColor(activity.action)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{activity.userName}</span>
                    <Chip 
                      size="sm" 
                      variant="flat"
                      color={getActionColor(activity.action)}
                    >
                      {activity.action}
                    </Chip>
                    <span className="text-xs text-default-400">
                      {activity.appName}
                    </span>
                  </div>
                  <p className="text-xs text-default-500">{activity.details}</p>
                </div>
                <span className="text-xs text-default-400 whitespace-nowrap">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}