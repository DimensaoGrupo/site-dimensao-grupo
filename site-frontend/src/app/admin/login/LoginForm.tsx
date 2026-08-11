"use client";

import { useActionState } from "react";
import Logo from "@/components/Logo";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-light/70 bg-white p-8 shadow-[0_20px_50px_rgba(32,26,26,0.08)]">
      <div className="flex justify-center">
        <Logo height={36} />
      </div>
      <h1 className="mt-6 text-center text-lg font-bold text-foreground">
        Painel administrativo
      </h1>
      <p className="mt-1 text-center text-sm text-gray-medium">
        Entre para gerenciar o conteúdo do site.
      </p>

      <form action={action} className="mt-8 space-y-4">
        <div>
          <label htmlFor="username" className="text-sm font-medium text-foreground">
            Usuário
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-primary">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
