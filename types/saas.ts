export interface SaaSApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  url: string;
  category: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: number;
  activeUsers: number;
  version: string;
  requiredTier: 'free' | 'pro' | 'enterprise';
  color?: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeSessions: number;
  networkStatus: 'excellent' | 'good' | 'poor';
  bandwidth: number;
  dataTransfer: number;
  responseTime: number;
}

export interface UserProfile {
  id: string;
  name: string;
  neuralId: string;
  avatarUrl?: string;
  joinDate: Date;
  tier: 'free' | 'pro' | 'enterprise';
  accessLevel: number;
  syncLevel: number;
  securityLevel: number;
  bandwidthUsage: number;
}

export interface Activity {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  appId?: string;
  appName?: string;
  details?: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  ping: number;
  load: number;
}

export interface LoadingStep {
  id: string;
  text: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}