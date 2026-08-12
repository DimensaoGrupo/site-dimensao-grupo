"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

type Category = { id: number; name: string };

export default function PostFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", search);
        }}
        className="flex-1"
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => updateParam("q", search)}
          placeholder="Buscar por título..."
          className="w-full rounded-lg border border-gray-light bg-white px-3.5 py-2 text-sm outline-none focus:border-primary"
        />
      </form>
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        className="rounded-lg border border-gray-light bg-white px-3.5 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">Todos os status</option>
        <option value="draft">Rascunhos</option>
        <option value="scheduled">Agendados</option>
        <option value="published">Publicados</option>
        <option value="unpublished">Despublicados</option>
      </select>
      <select
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="rounded-lg border border-gray-light bg-white px-3.5 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
