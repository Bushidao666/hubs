"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { addToast } from "@heroui/toast";
import { motion } from "framer-motion";

function SetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tokenHash = params.get("token_hash");
  const type = (params.get("type") || "signup") as "signup" | "email" | "recovery";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"verify" | "update">("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!tokenHash) return;
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      setLoading(false);
      if (error) {
        setError(error.message);
        addToast({ title: "Link inválido", description: error.message, severity: "danger" });
        return;
      }
      setStep("update");
    })();
  }, [tokenHash, type]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("Senhas não coincidem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      addToast({ title: "Erro ao salvar", description: error.message, severity: "danger" });
      return;
    }
    addToast({ title: "Senha definida", description: "Bem-vindo(a) ao Hub", severity: "success" });
    router.replace("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <Card className="w-full">
          <CardBody className="space-y-6 p-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold">Definir senha</h1>
            <p className="text-sm text-default-500">{step === "verify" ? "Validando link..." : "Defina sua senha"}</p>
          </div>
          {error && <p className="text-sm text-danger text-center">{error}</p>}
          {step === "update" && (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input type="password" label="Senha" value={password} onValueChange={setPassword} isRequired />
              <Input type="password" label="Confirmar senha" value={confirm} onValueChange={setConfirm} isRequired />
              <Button type="submit" color="primary" isLoading={loading} className="w-full">
                Salvar
              </Button>
            </form>
          )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  );
}


