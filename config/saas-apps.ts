import { SaaSApp } from '@/types/saas';

export const saasApps: SaaSApp[] = [
  {
    id: 'sider-tools',
    name: 'SiderTools',
    description: 'Complete development toolkit with AI-powered code generation and debugging',
    icon: 'sider-tools',
    image: '/Hyper.png',
    url: 'https://sidertools.blacksider.hub',
    category: 'Development',
    status: 'online',
    uptime: 99.99,
    activeUsers: 5420,
    version: '4.2.0',
    requiredTier: 'free',
    color: '#00ff00'
  },
  {
    id: 'protocolo-fantasma',
    name: 'Protocolo Fantasma',
    description: 'Advanced privacy and security protocol for anonymous operations',
    icon: 'protocolo-fantasma',
    image: '/Cloaker.png',
    url: 'https://fantasma.blacksider.hub',
    category: 'Security',
    status: 'online',
    uptime: 100,
    activeUsers: 2847,
    version: '2.0.1',
    requiredTier: 'pro',
    color: '#8b00ff'
  },
  {
    id: 'hidra',
    name: 'Hidra',
    description: 'Hardware optimization and chip overclocking management system',
    icon: 'hidra',
    image: '/Hidra.png',
    url: 'https://hidra.blacksider.hub',
    category: 'Hardware',
    status: 'online',
    uptime: 99.95,
    activeUsers: 1893,
    version: '3.7.4',
    requiredTier: 'pro',
    color: '#ff4500'
  },
  {
    id: 'radar-blacksider',
    name: 'Radar BlackSider',
    description: 'Real-time monitoring and threat detection with advanced analytics',
    icon: 'radar-blacksider',
    image: '/Radar Blacksider.png',
    url: 'https://radar.blacksider.hub',
    category: 'Monitoring',
    status: 'online',
    uptime: 99.98,
    activeUsers: 3672,
    version: '5.1.2',
    requiredTier: 'free',
    color: '#00ffff'
  },
  {
    id: 'cybervault',
    name: 'CyberVault',
    description: 'Access to 1000+ premium SaaS templates and boilerplates',
    icon: 'cybervault',
    image: '/CyberVault.png',
    url: 'https://vault.blacksider.hub',
    category: 'Templates',
    status: 'online',
    uptime: 99.97,
    activeUsers: 8934,
    version: '6.0.0',
    requiredTier: 'enterprise',
    color: '#ffd700'
  }
];

export const mockActivities = [
  {
    id: '1',
    timestamp: new Date(),
    userId: 'usr_001',
    userName: 'John Doe',
    action: 'accessed',
    appId: 'sider-tools',
    appName: 'SiderTools',
    appIcon: 'sider-tools',
    details: 'Code generation module'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 60000),
    userId: 'usr_002',
    userName: 'Jane Smith',
    action: 'uploaded',
    appId: 'cybervault',
    appName: 'CyberVault',
    appIcon: 'cybervault',
    details: 'New template uploaded'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 120000),
    userId: 'usr_003',
    userName: 'Mike Johnson',
    action: 'deployed',
    appId: 'protocolo-fantasma',
    appName: 'Protocolo Fantasma',
    appIcon: 'protocolo-fantasma',
    details: 'Security protocol v2.0'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 180000),
    userId: 'usr_004',
    userName: 'Sarah Williams',
    action: 'configured',
    appId: 'hidra',
    appName: 'Hidra',
    appIcon: 'hidra',
    details: 'Chip optimization profile'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 240000),
    userId: 'usr_005',
    userName: 'David Brown',
    action: 'started',
    appId: 'radar-blacksider',
    appName: 'Radar BlackSider',
    appIcon: 'radar-blacksider',
    details: 'System scan initiated'
  }
];

export const networkNodes = [
  { id: 'node_1', name: 'Tokyo-01', location: 'Asia Pacific', status: 'online' as const, ping: 12, load: 45 },
  { id: 'node_2', name: 'London-02', location: 'Europe West', status: 'online' as const, ping: 24, load: 67 },
  { id: 'node_3', name: 'NYC-03', location: 'US East', status: 'online' as const, ping: 8, load: 82 },
  { id: 'node_4', name: 'SF-04', location: 'US West', status: 'online' as const, ping: 15, load: 34 },
  { id: 'node_5', name: 'Sydney-05', location: 'Oceania', status: 'offline' as const, ping: 0, load: 0 }
];