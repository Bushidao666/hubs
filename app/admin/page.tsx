"use client";

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Progress } from '@heroui/progress';
import { CircularProgress } from '@heroui/progress';
import { Skeleton } from '@heroui/skeleton';
import { Chip } from '@heroui/chip';
import { Tabs, Tab } from '@heroui/tabs';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Tooltip } from '@heroui/tooltip';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Divider } from '@heroui/divider';
import { Badge } from '@heroui/badge';
import { Avatar } from '@heroui/avatar';
import { supabase } from '@/lib/supabaseClient';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import { RailwayMetricsModal } from '@/components/admin/RailwayMetricsModal';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  Server,
  Shield,
  Zap,
  Database,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  ExternalLink,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const {
    stats,
    realtimeMetrics,
    activity,
    railwayMetrics,
    loading,
    error,
    refreshAll,
    totalUsers,
    activeUsers,
    onlineApps,
    totalApps,
    currentOnlineUsers,
    requestsToday
  } = useAdminMetrics();

  const [selectedApp, setSelectedApp] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [showMetricsModal, setShowMetricsModal] = React.useState(false);

  React.useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      window.location.href = '/login';
      return;
    }
    
    const { data: adminFlag } = await supabase.rpc('hub_is_admin');
    if (!adminFlag) {
      window.location.href = '/';
      return;
    }
    setIsAdmin(true);
  };

  const StatCard = ({ title, value, change, icon: Icon, color, progress }: any) => (
    <Card className="bg-glass backdrop-blur-md border border-subtle hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,0,0.1)]">
      <CardBody className="overflow-visible py-4">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className={`w-5 h-5 text-${color || 'primary'}`} />
          </div>
          {change && (
            <Chip
              size="sm"
              variant="flat"
              color={change > 0 ? "success" : "danger"}
              startContent={change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            >
              {Math.abs(change)}%
            </Chip>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-default-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-primary">{value}</p>
        </div>

        {progress !== undefined && (
          <Progress 
            value={progress} 
            className="mt-3"
            color={color || "primary"}
            size="sm"
          />
        )}
      </CardBody>
    </Card>
  );

  const SystemMetric = ({ label, value, max, color }: any) => (
    <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-subtle">
      <div className="flex items-center gap-3">
        <CircularProgress
          size="lg"
          value={value}
          color={value > 80 ? "danger" : value > 60 ? "warning" : "success"}
          formatOptions={{ style: "percent" }}
          showValueLabel={true}
          classNames={{
            svg: "w-12 h-12",
            value: "text-xs font-bold",
          }}
        />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-default-500">{value}% usado</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-glass backdrop-blur-md border border-subtle">
                <CardBody className="space-y-3">
                  <Skeleton className="rounded-lg">
                    <div className="h-8 rounded-lg bg-default-300"></div>
                  </Skeleton>
                  <Skeleton className="rounded-lg">
                    <div className="h-12 rounded-lg bg-default-200"></div>
                  </Skeleton>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Dashboard Administrativo
            </h1>
            <p className="text-default-500 mt-1">Visão geral do sistema e métricas em tempo real</p>
          </div>
          <Button 
            color="primary" 
            variant="flat"
            startContent={<RefreshCcw className="w-4 h-4" />}
            onPress={refreshAll}
            isLoading={loading}
          >
            Atualizar
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total de Aplicações" 
            value={totalApps}
            icon={Database}
            progress={totalApps > 0 ? (onlineApps / totalApps) * 100 : 0}
            change={stats?.online_apps > 0 ? Math.round((onlineApps / totalApps) * 100) : 0}
          />
          <StatCard 
            title="Usuários Ativos" 
            value={activeUsers}
            icon={Users}
            color="success"
            change={stats?.new_users_today || 0}
          />
          <StatCard 
            title="Online Agora" 
            value={currentOnlineUsers}
            icon={Activity}
            color="warning"
            change={realtimeMetrics?.requests_last_hour || 0}
          />
          <StatCard 
            title="Requisições Hoje" 
            value={requestsToday}
            icon={Server}
            color="secondary"
            change={24}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs 
          aria-label="Dashboard sections"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary"
          }}
        >
          {/* Overview Tab */}
          <Tab
            key="overview"
            title={
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Visão Geral</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Apps Status */}
              <Card className="lg:col-span-2 bg-glass backdrop-blur-md border border-subtle">
                <CardHeader className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Status das Aplicações
                  </h3>
                  <Link href="/admin/apps">
                    <Button size="sm" variant="light" endContent={<ExternalLink className="w-3 h-3" />}>
                      Ver Todas
                    </Button>
                  </Link>
                </CardHeader>
                <CardBody>
                  <ScrollShadow className="h-[300px]">
                    <Table 
                      removeWrapper
                      aria-label="Apps status table"
                      classNames={{
                        th: "bg-transparent text-default-500 border-b border-divider",
                        td: "py-3",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>APLICAÇÃO</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>UPTIME</TableColumn>
                        <TableColumn>AÇÕES</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {realtimeMetrics?.apps_health && Object.entries(realtimeMetrics.apps_health).slice(0, 5).map(([slug, app]: [string, any]) => {
                          const railway = railwayMetrics[slug];
                          return (
                            <TableRow key={slug}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar 
                                    size="sm" 
                                    name={slug.charAt(0).toUpperCase()}
                                    className="bg-primary/20 text-primary"
                                  />
                                  <div>
                                    <p className="font-medium">{slug}</p>
                                    <p className="text-xs text-default-500">
                                      {railway ? `Railway: ${railway.status}` : 'Local'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="sm"
                                  variant="dot"
                                  color={
                                    app.status === 'online' ? 'success' :
                                    app.status === 'maintenance' ? 'warning' : 'danger'
                                  }
                                >
                                  {app.enabled ? 'Ativo' : 'Inativo'}
                                </Chip>
                              </TableCell>
                              <TableCell>
                                {railway ? (
                                  <div className="flex items-center gap-2 text-xs">
                                    <Cpu className="w-3 h-3" />
                                    <span>{railway.metrics.cpu.usage}%</span>
                                    <MemoryStick className="w-3 h-3 ml-2" />
                                    <span>{railway.metrics.memory.usagePercent.toFixed(0)}%</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-default-500">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Tooltip content="Ver métricas">
                                  <Button 
                                    isIconOnly 
                                    size="sm" 
                                    variant="light"
                                    onPress={() => {
                                      setSelectedApp(slug);
                                      setShowMetricsModal(true);
                                    }}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollShadow>
                </CardBody>
              </Card>

              {/* System Health & Metrics */}
              <Card className="bg-glass backdrop-blur-md border border-subtle">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Métricas do Sistema
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-black/40 rounded-lg">
                      <span className="text-sm">Total de Usuários</span>
                      <Badge color="primary" variant="flat" size="lg">{totalUsers}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-black/40 rounded-lg">
                      <span className="text-sm">Novos Hoje</span>
                      <Badge color="success" variant="flat" size="lg">{stats?.new_users_today || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-black/40 rounded-lg">
                      <span className="text-sm">Nova Semana</span>
                      <Badge color="warning" variant="flat" size="lg">{stats?.new_users_week || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-black/40 rounded-lg">
                      <span className="text-sm">Assinaturas Ativas</span>
                      <Badge color="secondary" variant="flat" size="lg">{stats?.active_subscriptions || 0}</Badge>
                    </div>
                  </div>
                  
                  <Divider className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-500">Requisições/hora</span>
                      <Badge color="success" variant="flat">{realtimeMetrics?.requests_last_hour || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-500">Requisições Hoje</span>
                      <Badge color="primary" variant="flat">{requestsToday}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-default-500">Apps em Manutenção</span>
                      <Badge color="warning" variant="flat">{stats?.maintenance_apps || 0}</Badge>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Activity Tab */}
          <Tab
            key="activity"
            title={
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Atividade Recente</span>
                <Badge color="danger" content="4" size="sm" />
              </div>
            }
          >
            <div className="mt-6">
              <Card className="bg-glass backdrop-blur-md border border-subtle">
                <CardBody>
                  <ScrollShadow className="h-[400px]">
                    <div className="space-y-3">
                      {/* Recent Signups */}
                      {activity?.recent_signups?.map((signup, idx) => (
                        <div 
                          key={`signup-${idx}`}
                          className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-subtle hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-success/20">
                              <Users className="w-5 h-5 text-success" />
                            </div>
                            <div>
                              <p className="font-medium">Novo usuário cadastrado</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Chip size="sm" variant="flat">{signup.email}</Chip>
                                <span className="text-xs text-default-500">{new Date(signup.timestamp).toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                          <Badge color="success" variant="flat" size="sm">
                            {signup.metadata.provider}
                          </Badge>
                        </div>
                      ))}
                      
                      {/* Recent Logins */}
                      {activity?.recent_logins?.map((login, idx) => (
                        <div 
                          key={`login-${idx}`}
                          className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-subtle hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/20">
                              <Activity className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Login realizado</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Chip size="sm" variant="flat">{login.email}</Chip>
                                <span className="text-xs text-default-500">{new Date(login.timestamp).toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                          <Badge color="primary" variant="flat" size="sm">
                            IP: {login.metadata.ip}
                          </Badge>
                        </div>
                      ))}
                      
                      {/* Recent SSO Tickets */}
                      {activity?.recent_sso_tickets?.map((ticket, idx) => (
                        <div 
                          key={`ticket-${idx}`}
                          className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-subtle hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-warning/20">
                              <Shield className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium">SSO Ticket criado</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Chip size="sm" variant="flat">{ticket.app_name}</Chip>
                                <span className="text-xs text-default-500">{ticket.user_email}</span>
                              </div>
                            </div>
                          </div>
                          <Badge color="warning" variant="flat" size="sm">
                            {ticket.metadata.ticket_id.slice(0, 8)}...
                          </Badge>
                        </div>
                      ))}
                      
                      {/* No activity message */}
                      {(!activity || (!activity.recent_signups?.length && !activity.recent_logins?.length && !activity.recent_sso_tickets?.length)) && (
                        <div className="text-center py-8 text-default-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhuma atividade recente</p>
                        </div>
                      )}
                    </div>
                  </ScrollShadow>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* Analytics Tab */}
          <Tab
            key="analytics"
            title={
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="bg-glass backdrop-blur-md border border-subtle">
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-default-500 uppercase">Novos Usuários Hoje</p>
                      <p className="text-2xl font-bold text-primary">{stats?.new_users_today || 0}</p>
                    </div>
                    <Chip color="success" variant="flat" size="sm">Novo</Chip>
                  </div>
                  <Progress value={Math.min((stats?.new_users_today || 0) * 10, 100)} color="success" size="sm" />
                </CardBody>
              </Card>

              <Card className="bg-glass backdrop-blur-md border border-subtle">
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-default-500 uppercase">Novos Esta Semana</p>
                      <p className="text-2xl font-bold text-primary">{stats?.new_users_week || 0}</p>
                    </div>
                    <Chip color="warning" variant="flat" size="sm">Semana</Chip>
                  </div>
                  <Progress value={Math.min((stats?.new_users_week || 0) * 2, 100)} color="warning" size="sm" />
                </CardBody>
              </Card>

              <Card className="bg-glass backdrop-blur-md border border-subtle">
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-default-500 uppercase">Total de Acessos</p>
                      <p className="text-2xl font-bold text-primary">{stats?.total_user_access || 0}</p>
                    </div>
                    <Chip color="danger" variant="flat" size="sm">Total</Chip>
                  </div>
                  <Progress value={Math.min((stats?.total_user_access || 0) / 10, 100)} color="danger" size="sm" />
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>

        {/* Railway Metrics Modal */}
        {selectedApp && (
          <RailwayMetricsModal
            isOpen={showMetricsModal}
            onClose={() => {
              setShowMetricsModal(false);
              setSelectedApp(null);
            }}
            appSlug={selectedApp}
            metrics={railwayMetrics[selectedApp]}
            onRefresh={() => refreshAll()}
          />
        )}
      </div>
    </AdminLayout>
  );
}