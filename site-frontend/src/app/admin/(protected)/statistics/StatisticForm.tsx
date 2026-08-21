"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStatistic, updateStatistic, type StatisticInput } from "@/lib/statistics/actions";

const LABEL_MAX_LENGTH = 60;

type ExistingStatistic = {
  id: number;
  value: number;
  prefix: string | null;
  suffix: string | null;
  label: string;
};

export default function StatisticForm({ statistic }: { statistic?: ExistingStatistic }) {
  const router = useRouter();
  const [value, setValue] = useState(statistic ? String(statistic.value) : "");
  const [prefix, setPrefix] = useState(statistic?.prefix ?? "");
  const [suffix, setSuffix] = useState(statistic?.suffix ?? "");
  const [label, setLabel] = useState(statistic?.label ?? "");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const labelTooLong = label.length > LABEL_MAX_LENGTH;

  function handleSave() {
    setError(null);
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      setError("O valor precisa ser um número.");
      return;
    }

    const input: StatisticInput = {
      value: numericValue,
      prefix: prefix || null,
      suffix: suffix || null,
      label,
    };

    startTransition(async () => {
      const result = statistic ? await updateStatistic(statistic.id, input) : await createStatistic(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin/statistics");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="prefix" className="text-sm font-medium text-foreground">
              Prefixo
            </label>
            <input
              id="prefix"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Ex.: +"
              className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="value" className="text-sm font-medium text-foreground">
              Valor
            </label>
            <input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ex.: 400"
              className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="suffix" className="text-sm font-medium text-foreground">
              Sufixo
            </label>
            <input
              id="suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder="Ex.: %"
              className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="label" className="text-sm font-medium text-foreground">
              Rótulo
            </label>
            <span className={`text-xs ${labelTooLong ? "text-primary" : "text-gray-medium"}`}>
              {label.length}/{LABEL_MAX_LENGTH}
            </span>
          </div>
          <input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex.: Clientes Satisfeitos"
            className="mt-1.5 w-full rounded-lg border border-gray-light bg-white px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-2xl border border-gray-light/70 bg-[#f7f6f6] p-6 text-center">
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-medium uppercase">Prévia</p>
          <span className="block font-display text-3xl font-extrabold text-primary">
            {prefix}
            {value || "0"}
            {suffix}
          </span>
          <span className="mt-1 block text-sm text-gray-medium">{label || "Rótulo"}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-light/70 bg-white p-5">
          <span className="text-sm font-bold text-foreground">Status</span>
          <p className="mt-1 text-sm text-gray-medium">
            {statistic
              ? "Salvar atualiza esta estatística imediatamente na Home."
              : "A estatística é criada ativa — aparece na Home assim que salva."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {isPending ? "Salvando..." : statistic ? "Salvar alterações" : "Criar estatística"}
          </button>
          {error && <p className="mt-3 text-xs text-primary">{error}</p>}
        </div>
      </div>
    </div>
  );
}
