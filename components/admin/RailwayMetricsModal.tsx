import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Progress } from '@heroui/progress';
import { CircularProgress } from '@heroui/progress';
import { Badge } from '@heroui/badge';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Tabs, Tab } from '@heroui/tabs';
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Wifi, 
  Activity,
  Server,
  Cloud,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
  RefreshCcw
} from 'lucide-react';

interface RailwayMetrics {
  projectId: string;
  projectName: string;
  status: string;
  deployment: {
    id: string;
    createdAt: string;
    url: string;
  };
  metrics: {
    cpu: { usage: number; unit: string };
    memory: { usage: number; limit: number; usagePercent: number; unit: string };
    disk: { usage: number; limit: number; usagePercent: number; unit: string };
    network: { rx: number; tx: number; unit: string };
  };
  services: Array<{ id: string; name: string; icon: string }>;
  environments: Array<{ id: string; name: string; status: string }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appSlug: string;
  metrics?: RailwayMetrics;
  onRefresh?: () => void;
}

export const RailwayMetricsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  appSlug,
  metrics,
  onRefresh
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'success';
      case 'building':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'building':
        return <AlertCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const MetricCard = ({ icon: Icon, label, value, limit, unit, percent, color }: any) => (
    <Card className="bg-black/60 border border-subtle">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 text-${color || 'primary'}`} />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <Badge color={color || 'primary'} variant="flat" size="sm">
            {value}{unit}
          </Badge>
        </div>
        {percent !== undefined && (
          <Progress 
            value={percent} 
            color={percent > 80 ? 'danger' : percent > 60 ? 'warning' : 'success'}
            size="sm"
            showValueLabel={true}
          />
        )}
        {limit && (
          <p className="text-xs text-default-500 mt-2">
            Limite: {limit}{unit}
          </p>
        )}
      </CardBody>
    </Card>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      backdrop="blur"
      className="bg-black/90 border border-primary/20"
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Métricas Railway</h3>
              <p className="text-sm text-default-500">{appSlug}</p>
            </div>
          </div>
          {metrics && (
            <Chip
              variant="dot"
              color={getStatusColor(metrics.status)}
              startContent={getStatusIcon(metrics.status)}
            >
              {metrics.status}
            </Chip>
          )}
        </ModalHeader>
        
        <ModalBody>
          {metrics ? (
            <Tabs 
              aria-label="Railway metrics tabs"
              color="primary"
              variant="underlined"
              className="w-full"
            >
              <Tab key="overview" title="Visão Geral">
                <div className="space-y-4 mt-4">
                  {/* Deployment Info */}
                  <Card className="bg-black/60 border border-subtle">
                    <CardBody className="p-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        Deployment Atual
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-default-500">ID:</span>
                          <span className="font-mono text-xs">{metrics.deployment.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-default-500">Criado em:</span>
                          <span>{new Date(metrics.deployment.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        {metrics.deployment.url && (
                          <div className="flex justify-between items-center">
                            <span className="text-default-500">URL:</span>
                            <a 
                              href={metrics.deployment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              Ver Deploy <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Resource Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard
                      icon={Cpu}
                      label="CPU"
                      value={metrics.metrics.cpu.usage}
                      unit="%"
                      percent={metrics.metrics.cpu.usage}
                      color="primary"
                    />
                    <MetricCard
                      icon={MemoryStick}
                      label="Memória"
                      value={metrics.metrics.memory.usage}
                      limit={metrics.metrics.memory.limit}
                      unit=" MB"
                      percent={metrics.metrics.memory.usagePercent}
                      color="warning"
                    />
                    <MetricCard
                      icon={HardDrive}
                      label="Disco"
                      value={metrics.metrics.disk.usage}
                      limit={metrics.metrics.disk.limit}
                      unit=" MB"
                      percent={metrics.metrics.disk.usagePercent}
                      color="secondary"
                    />
                    <MetricCard
                      icon={Wifi}
                      label="Rede"
                      value={`↓${metrics.metrics.network.rx} ↑${metrics.metrics.network.tx}`}
                      unit=" MB"
                      color="success"
                    />
                  </div>
                </div>
              </Tab>

              <Tab key="services" title="Serviços">
                <div className="space-y-3 mt-4">
                  {metrics.services.length > 0 ? (
                    metrics.services.map((service) => (
                      <Card key={service.id} className="bg-black/60 border border-subtle">
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{service.icon}</span>
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-xs text-default-500">ID: {service.id}</p>
                              </div>
                            </div>
                            <Badge color="success" variant="flat">Ativo</Badge>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-default-500">
                      <Server className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum serviço configurado</p>
                    </div>
                  )}
                </div>
              </Tab>

              <Tab key="environments" title="Ambientes">
                <div className="space-y-3 mt-4">
                  {metrics.environments.length > 0 ? (
                    metrics.environments.map((env) => (
                      <Card key={env.id} className="bg-black/60 border border-subtle">
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-medium capitalize">{env.name}</p>
                                <p className="text-xs text-default-500">ID: {env.id}</p>
                              </div>
                            </div>
                            <Chip
                              size="sm"
                              variant="dot"
                              color={getStatusColor(env.status)}
                            >
                              {env.status}
                            </Chip>
                          </div>
                        </CardBody>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-default-500">
                      <Cloud className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum ambiente configurado</p>
                    </div>
                  )}
                </div>
              </Tab>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <Cloud className="w-16 h-16 mx-auto mb-4 text-default-400" />
              <p className="text-default-500 mb-4">Métricas Railway não disponíveis</p>
              <p className="text-xs text-default-400">
                Esta aplicação pode não estar deployada no Railway
              </p>
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          {onRefresh && (
            <Button 
              color="primary" 
              variant="flat" 
              size="sm"
              startContent={<RefreshCcw className="w-4 h-4" />}
              onPress={onRefresh}
            >
              Atualizar
            </Button>
          )}
          <Button color="default" variant="light" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};