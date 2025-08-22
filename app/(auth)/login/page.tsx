"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string
);

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
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


