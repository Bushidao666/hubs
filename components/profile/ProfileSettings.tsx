"use client";

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Avatar } from '@heroui/avatar';
import { Card, CardBody } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Progress } from '@heroui/progress';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, 
  Camera, 
  Save, 
  X,
  Upload,
  Loader,
  Check
} from 'lucide-react';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate?: () => void;
}

export function ProfileSettings({ isOpen, onClose, user, onUpdate }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas imagens.');
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setUploadProgress(0);
    setSuccess(false);

    try {
      let newAvatarUrl = avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        setUploadProgress(20);
        
        // Generate unique filename
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Delete old avatars
        try {
          const { data: oldFiles } = await supabase.storage
            .from('avatars')
            .list(user.id);
          
          if (oldFiles && oldFiles.length > 0) {
            const filesToDelete = oldFiles.map(f => `${user.id}/${f.name}`);
            await supabase.storage
              .from('avatars')
              .remove(filesToDelete);
          }
        } catch (err) {
          console.log('No old avatars to delete');
        }

        setUploadProgress(40);

        // Upload new avatar
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { 
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        setUploadProgress(60);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        newAvatarUrl = publicUrl;
        setUploadProgress(80);
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: newAvatarUrl,
          full_name: name
        }
      });

      if (updateError) throw updateError;

      setUploadProgress(100);
      setSuccess(true);
      
      // Refresh after a short delay
      setTimeout(() => {
        if (onUpdate) {
          onUpdate();
        } else {
          window.location.reload();
        }
      }, 1500);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl('');
    setAvatarFile(null);
    setName(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
    setAvatarUrl(user?.user_metadata?.avatar_url || '');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel}
      size="lg"
      backdrop="blur"
      isDismissable={!loading}
      hideCloseButton={loading}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Configurações do Perfil</h3>
          <p className="text-sm text-default-500">Atualize sua foto e informações</p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar
                  src={previewUrl || avatarUrl || `https://i.pravatar.cc/150?u=${user?.email}`}
                  className="w-32 h-32 ring-4 ring-primary/20"
                  isBordered
                />
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors"
                >
                  <Camera className="w-5 h-5 text-black" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
              
              {avatarFile && (
                <div className="text-center">
                  <p className="text-sm text-default-500">Nova foto selecionada</p>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => {
                      setAvatarFile(null);
                      setPreviewUrl('');
                    }}
                    startContent={<X className="w-4 h-4" />}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>

            <Divider />

            {/* Name Input */}
            <div className="space-y-2">
              <Input
                label="Nome"
                placeholder="Digite seu nome"
                value={name}
                onValueChange={setName}
                startContent={<User className="w-4 h-4 text-default-400" />}
                variant="bordered"
                isDisabled={loading}
                description="Este nome será exibido no seu perfil"
              />
            </div>

            {/* Email Display */}
            <div className="space-y-2">
              <Input
                label="Email"
                value={user?.email || ''}
                isReadOnly
                variant="flat"
                description="O email não pode ser alterado"
              />
            </div>

            {/* Upload Progress */}
            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-500">
                    {uploadProgress < 40 ? 'Preparando...' :
                     uploadProgress < 80 ? 'Enviando imagem...' :
                     'Salvando alterações...'}
                  </span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <Progress 
                  value={uploadProgress} 
                  color="primary"
                  size="sm"
                />
              </div>
            )}

            {/* Success Message */}
            {success && (
              <Card className="bg-success/10 border border-success/20">
                <CardBody className="py-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span className="text-sm text-success">
                      Perfil atualizado com sucesso!
                    </span>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={handleCancel}
            isDisabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            color="primary" 
            onPress={handleSave}
            isLoading={loading}
            startContent={!loading && <Save className="w-4 h-4" />}
          >
            Salvar Alterações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}