"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Activity } from '@/types/saas';
import { mockActivities } from '@/config/saas-apps';

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  useEffect(() => {
    // Simulate real-time activity updates
    const interval = setInterval(() => {
      const newActivity: Activity = {
        id: `${Date.now()}`,
        timestamp: new Date(),
        userId: `usr_${Math.floor(Math.random() * 100)}`,
        userName: ['DataMiner', 'CyberPunk2077', 'NeonRunner', 'SystemArch', 'QuantumLeap'][Math.floor(Math.random() * 5)],
        action: ['accessed', 'uploaded', 'deployed', 'configured', 'started'][Math.floor(Math.random() * 5)],
        appName: ['Neural Analytics', 'Quantum Storage', 'Cyber Shield', 'Data Forge', 'Neural Chat'][Math.floor(Math.random() * 5)],
        details: ['Dashboard view', '2.3 GB data packet', 'Neural network v2.1', 'Firewall rules updated', 'ETL pipeline #42'][Math.floor(Math.random() * 5)]
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'accessed': return 'primary';
      case 'uploaded': return 'secondary';
      case 'deployed': return 'success';
      case 'configured': return 'warning';
      case 'started': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-primary/20 mt-6 rounded-2xl">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-orbitron font-semibold text-primary">
            LIVE ACTIVITY FEED
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-primary/60">Real-time</span>
          </div>
        </div>

        <ScrollShadow className="h-[250px]">
          <Table 
            removeWrapper
            aria-label="Activity feed table"
            classNames={{
              base: "max-h-full",
              table: "min-h-[200px]",
              th: "bg-black/20 backdrop-blur-sm text-primary/60 font-mono text-xs border-b border-primary/10 rounded-t-xl",
              td: "text-primary/80 font-mono text-xs py-2",
              tr: "hover:bg-white/5 transition-all duration-200 rounded-lg"
            }}
          >
            <TableHeader>
              <TableColumn>TIME</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>ACTION</TableColumn>
              <TableColumn>APPLICATION</TableColumn>
              <TableColumn>DETAILS</TableColumn>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="text-primary/40">
                    {formatTimestamp(activity.timestamp)}
                  </TableCell>
                  <TableCell>
                    <span className="text-secondary">{activity.userName}</span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getActionColor(activity.action)}
                      className="text-xs"
                    >
                      {activity.action}
                    </Chip>
                  </TableCell>
                  <TableCell>{activity.appName}</TableCell>
                  <TableCell className="text-primary/60">
                    {activity.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}