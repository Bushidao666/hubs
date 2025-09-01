"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { addToast } from "@heroui/toast";
import { motion } from "framer-motion";

// usando o browser client com cookies para garantir sessão acessível no middleware

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('[LOGIN] start', { email });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log('[LOGIN] result', { error, session: data?.session });
    if (error) {
      setLoading(false);
      setError(error.message);
      addToast({ title: "Falha no login", description: error.message, severity: "danger" });
      return;
    }
    try {
      // Grava cookies via API para middleware SSR enxergar a sessão
      const resp = await fetch('/api/auth/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
        }),
      });
      console.log('[LOGIN] set cookies status', resp.status);
    } catch (e) {
      console.warn('[LOGIN] set cookies error', e);
    }
    setLoading(false);
    addToast({ title: "Login realizado", description: "Redirecionando...", severity: "success" });
    const params = new URLSearchParams(window.location.search);
    const to = params.get('redirectedFrom') || '/';
    console.log('[LOGIN] redirect to', to);
    router.replace(to);
  };

  const sendMagicLink = async () => {
    setLoading(true);
    setError(null);
    const base = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${base}/auth/callback?next=/` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      addToast({ title: "Não foi possível enviar o Magic Link", description: error.message, severity: "danger" });
    } else {
      addToast({ title: "Magic Link enviado", description: "Verifique seu e-mail", severity: "success" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <Card className="w-full">
          <CardBody className="space-y-6 p-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold">Entrar no Blacksider Hub</h1>
            <p className="text-sm text-default-500">Use seu email e senha</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={email}
              onValueChange={setEmail}
              isRequired
            />
            <Input
              type="password"
              label="Senha"
              value={password}
              onValueChange={setPassword}
              isRequired
            />
            {error && (
              <p className="text-sm text-danger">{error}</p>
            )}
            <Button type="submit" color="primary" isLoading={loading} className="w-full">
              Entrar
            </Button>
          </form>
          <div className="text-center">
            <button
              className="text-sm text-primary"
              onClick={() => router.push("/forgot-password")}
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="text-center">
            <Button variant="light" onPress={sendMagicLink} isLoading={loading}>
              Enviar Magic Link
            </Button>
          </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}


