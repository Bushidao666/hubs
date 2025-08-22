import React from 'react';
import {
  Wrench,
  Ghost,
  Flame,
  Radar,
  Lock,
  Database,
  Shield,
  Zap,
  MessageSquare,
  Code2,
  Brain,
  Clock,
  Bot,
  Search,
  Activity,
  HardDrive,
  ShieldCheck,
  Terminal,
  Network,
  Timer,
  Cpu,
  User,
  Settings,
  LogOut,
  HelpCircle,
  TrendingUp,
  Server,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  Play,
  Pause,
  RefreshCw,
  GitBranch,
  Layers,
  type LucideIcon
} from 'lucide-react';

export interface AppIcon {
  icon: LucideIcon;
  color?: string;
}

// Mapeamento de ícones para cada aplicação SaaS
export const appIcons: Record<string, AppIcon> = {
  'sider-tools': {
    icon: Wrench,
    color: '#00ff00'
  },
  'protocolo-fantasma': {
    icon: Ghost,
    color: '#8b00ff'
  },
  'hidra': {
    icon: Flame,
    color: '#ff4500'
  },
  'radar-blacksider': {
    icon: Radar,
    color: '#00ffff'
  },
  'cybervault': {
    icon: Lock,
    color: '#ffd700'
  }
};

// Ícones para ações e status
export const actionIcons = {
  search: Search,
  activity: Activity,
  user: User,
  settings: Settings,
  logout: LogOut,
  help: HelpCircle,
  trending: TrendingUp,
  server: Server,
  wifiOn: Wifi,
  wifiOff: WifiOff,
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  upload: Upload,
  download: Download,
  play: Play,
  pause: Pause,
  refresh: RefreshCw,
  branch: GitBranch,
  layers: Layers,
  cpu: Cpu,
  network: Network,
  hardDrive: HardDrive,
  code: Code2,
  timer: Timer
};

// Componente wrapper para aplicar estilos cyberpunk aos ícones
interface CyberpunkIconProps {
  Icon: LucideIcon;
  size?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

export const CyberpunkIcon: React.FC<CyberpunkIconProps> = ({ 
  Icon, 
  size = 24, 
  color = '#00ff00',
  className = '',
  animate = false 
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${animate ? 'animate-pulse' : ''} ${className}`}>
      <Icon 
        size={size} 
        color={color}
        className="drop-shadow-[0_0_8px_currentColor]"
        strokeWidth={1.5}
      />
    </div>
  );
};

// Função helper para obter o ícone de uma aplicação
export const getAppIcon = (appId: string): AppIcon => {
  return appIcons[appId] || { icon: Layers, color: '#00ff00' };
};