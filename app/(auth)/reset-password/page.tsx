"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// usando o browser client com cookies

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenHash = params.get("token_hash");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"verify" | "update">("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!tokenHash) return;
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setStep("update");
    })();
  }, [tokenHash]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("Senhas não coincidem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(error.message);
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-6 p-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold">Redefinir senha</h1>
            <p className="text-sm text-default-500">{step === "verify" ? "Validando link..." : "Defina sua nova senha"}</p>
          </div>
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          {step === "update" && (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                type="password"
                label="Nova senha"
                value={password}
                onValueChange={setPassword}
                isRequired
              />
              <Input
                type="password"
                label="Confirmar senha"
                value={confirm}
                onValueChange={setConfirm}
                isRequired
              />
              <Button type="submit" color="primary" isLoading={loading} className="w-full">
                Salvar
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}