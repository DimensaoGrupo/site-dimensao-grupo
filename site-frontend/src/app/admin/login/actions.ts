"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "@/lib/auth/credentials";
import { createSession } from "@/lib/auth/session";

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Preencha usuário e senha." };
  }

  let ok: boolean;
  try {
    ok = await verifyCredentials(username, password);
  } catch {
    return { error: "Painel não configurado. Contate o desenvolvedor responsável." };
  }

  if (!ok) {
    return { error: "Usuário ou senha incorretos." };
  }

  await createSession(username);
  redirect("/admin");
}
