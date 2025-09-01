"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { supabase } from "@/lib/supabaseClient";
import { addToast } from "@heroui/toast";
import { motion } from "framer-motion";

// usando o browser client com cookies

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const resp = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const { error } = resp.ok ? { error: null } : { error: new Error(await resp.text()) } as any;
    setLoading(false);
    if (error) {
      setError(error.message);
      addToast({ title: "Falha ao enviar link", description: error.message, severity: "danger" });
      return;
    }
    addToast({ title: "Email enviado", description: "Verifique sua caixa de entrada", severity: "success" });
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <Card className="w-full">
          <CardBody className="space-y-6 p-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold">Recuperar senha</h1>
            <p className="text-sm text-default-500">Enviaremos um link para seu email</p>
          </div>
          {done ? (
            <p className="text-sm text-success text-center">Verifique seu email para redefinir a senha.</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={email}
                onValueChange={setEmail}
                isRequired
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" color="primary" isLoading={loading} className="w-full">
                Enviar link
              </Button>
            </form>
          )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}


