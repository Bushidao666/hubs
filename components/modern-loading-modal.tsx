"use client";

import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalBody } from '@heroui/modal';
import { Progress } from '@heroui/progress';
import { SaaSApp } from '@/types/saas';
import { getAppIcon } from '@/config/icons';
import { CheckCircle } from 'lucide-react';

interface ModernLoadingModalProps {
  app: SaaSApp;
  onClose: () => void;
}

export function ModernLoadingModal({ app, onClose }: ModernLoadingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    'Authenticating user...',
    'Loading application data...',
    'Establishing connection...',
    'Finalizing setup...'
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 25;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const stepIndex = Math.floor(progress / 25);
    setCurrentStep(Math.min(stepIndex, steps.length - 1));
  }, [progress]);

  const { icon: AppIcon } = getAppIcon(app.id);

  return (
    <Modal 
      isOpen={true}
      onClose={onClose}
      backdrop="blur"
      size="md"
      classNames={{
        base: "bg-content1",
        backdrop: "bg-overlay/50",
      }}
      hideCloseButton
    >
      <ModalContent>
        <ModalBody className="py-8 px-6">
          <div className="text-center space-y-6">
            {/* App Icon */}
            <div className="flex justify-center">
              {app.image ? (
                <div className="w-24 h-24 rounded-full overflow-hidden bg-content2 ring-2 ring-primary ring-offset-4 ring-offset-background">
                  <img 
                    src={app.image} 
                    alt={app.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-full bg-content2">
                  <AppIcon size={32} className="text-primary" />
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Opening {app.name}
              </h2>
              <p className="text-sm text-default-500">
                {steps[currentStep]}
              </p>
            </div>

            {/* Progress */}
            <Progress 
              value={progress}
              color="primary"
              className="max-w-md mx-auto"
            />

            {/* Steps */}
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-2 text-sm ${
                    index <= currentStep ? 'text-default-700' : 'text-default-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : index === currentStep ? (
                    <div className="w-4 h-4 border-2 border-primary rounded-full animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-default-300 rounded-full" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}