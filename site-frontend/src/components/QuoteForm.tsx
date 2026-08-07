"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";

type Status = "idle" | "loading" | "success" | "error";

export default function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("loading");
    try {
      const res = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const fieldClasses =
    "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-colors focus:border-primary focus:bg-white/10";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <input
        type="text"
        name="nome"
        required
        placeholder="Nome"
        aria-label="Nome"
        className={fieldClasses}
      />
      <input
        type="email"
        name="email"
        required
        placeholder="E-mail"
        aria-label="E-mail"
        className={fieldClasses}
      />
      <input
        type="tel"
        name="telefone"
        required
        placeholder="Telefone"
        aria-label="Telefone"
        className={fieldClasses}
      />
      <textarea
        name="mensagem"
        rows={3}
        placeholder="Mensagem"
        aria-label="Mensagem"
        className={`${fieldClasses} resize-none`}
      />

      <motion.button
        type="submit"
        disabled={status === "loading"}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="mt-1 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {status === "loading" ? "Enviando..." : "Solicitar Agora"}
      </motion.button>

      <p role="status" aria-live="polite" className="min-h-[1.25rem] text-xs">
        {status === "success" && (
          <span className="text-white/80">
            Solicitação enviada! Em breve entraremos em contato.
          </span>
        )}
        {status === "error" && (
          <span className="text-[#ffb3b3]">
            Não foi possível enviar agora. Tente novamente em instantes.
          </span>
        )}
      </p>
    </form>
  );
}
