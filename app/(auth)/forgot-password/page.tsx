"use client";

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_HUB_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_HUB_SUPABASE_ANON_KEY as string
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
    </div>
  );
}


