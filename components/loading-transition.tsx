"use client";

import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalBody } from '@heroui/modal';
import { CircularProgress } from '@heroui/progress';
import { Chip } from '@heroui/chip';
import { SaaSApp, LoadingStep } from '@/types/saas';
import { CyberpunkIcon, getAppIcon } from '@/config/icons';

interface LoadingTransitionProps {
  app: SaaSApp;
  onClose: () => void;
}

export function LoadingTransition({ app, onClose }: LoadingTransitionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<LoadingStep[]>([
    { id: '1', text: 'Verificando autenticação...', status: 'processing' },
    { id: '2', text: 'Concedendo permissões...', status: 'pending' },
    { id: '3', text: 'Estabelecendo link neural...', status: 'pending' },
    { id: '4', text: 'Inicializando interface...', status: 'pending' },
    { id: '5', text: 'Sincronizando fluxos de dados...', status: 'pending' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onClose, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [steps.length, onClose]);

  useEffect(() => {
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      status: index < currentStep ? 'completed' : 
              index === currentStep ? 'processing' : 'pending'
    })));
  }, [currentStep]);

  const getStepIcon = (status: string) => {
    switch(status) {
      case 'completed': return '✓';
      case 'processing': return '→';
      case 'pending': return '○';
      default: return '○';
    }
  };

  const getStepColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-success';
      case 'processing': return 'text-primary animate-pulse';
      case 'pending': return 'text-primary/30';
      default: return 'text-primary/30';
    }
  };

  return (
    <Modal 
      isOpen={true}
      onClose={onClose}
      backdrop="blur"
      size="2xl"
      classNames={{
        base: "bg-black/80 backdrop-blur-2xl border border-primary/20 rounded-3xl",
        backdrop: "bg-black/60 backdrop-blur-md",
        body: "py-8"
      }}
      hideCloseButton
    >
      <ModalContent>
        <ModalBody className="text-center space-y-8">
          {/* Loading Circle with App Icon */}
          <div className="relative inline-block">
            <CircularProgress
              aria-label="Loading"
              size="lg"
              color="primary"
              strokeWidth={2}
              className="scale-150"
              classNames={{
                svg: "w-32 h-32 drop-shadow-[0_0_20px_rgba(0,255,0,0.8)]",
                indicator: "stroke-primary",
                track: "stroke-primary/10"
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <CyberpunkIcon 
                Icon={getAppIcon(app.id).icon}
                size={48}
                color={app.color || '#00ff00'}
                animate={true}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-orbitron font-bold text-primary">
              ESTABELECENDO LINK NEURAL
            </h2>
            <p className="text-lg font-mono text-secondary">
              {app.name}
            </p>
          </div>

          {/* Loading Steps */}
          <div className="space-y-3 text-left max-w-md mx-auto">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 font-mono text-sm transition-all duration-300 ${
                  step.status === 'processing' ? 'scale-105' : ''
                }`}
              >
                <span className={`text-lg ${getStepColor(step.status)}`}>
                  {getStepIcon(step.status)}
                </span>
                <span className={getStepColor(step.status)}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Info */}
          <div className="flex justify-center gap-4">
            <Chip
              size="sm"
              variant="flat"
              color="primary"
              className="font-mono text-xs bg-black/30 backdrop-blur-xl border border-primary/20"
            >
              Progresso: {Math.round((currentStep / steps.length) * 100)}%
            </Chip>
            <Chip
              size="sm"
              variant="flat"
              color="secondary"
              className="font-mono text-xs animate-pulse bg-black/30 backdrop-blur-xl border border-secondary/20"
            >
              Estabelecendo conexão...
            </Chip>
          </div>

          {/* Animated Grid Background */}
          <div className="absolute inset-0 grid-background-animated opacity-10 pointer-events-none" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}