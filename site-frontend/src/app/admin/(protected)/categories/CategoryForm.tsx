"use client";

import { useActionState } from "react";
import { createCategory, type CategoryActionState } from "@/lib/categories/actions";

export default function CategoryForm() {
  const [state, action, pending] = useActionState<CategoryActionState, FormData>(createCategory, undefined);

  return (
    <form action={action}>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nova categoria
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Ex.: Segurança preventiva"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Criando..." : "Criar"}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-primary">{state.error}</p>}
    </form>
  );
}
