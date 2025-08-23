"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
    const params = new URLSearchParams(window.location.search);
    const to = params.get('redirectedFrom') || '/';
    console.log('[LOGIN] redirect to', to);
    router.replace(to);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
        </CardBody>
      </Card>
    </div>
  );
}


