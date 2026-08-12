"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/media/upload";
import { IMAGE_SPECS, type ImageKind } from "@/lib/media/specs";

type CoverImageFieldProps = {
  label: string;
  kind: ImageKind;
  value: string | null;
  onChange: (url: string | null) => void;
};

type LocalPreview = { width: number; height: number; sizeLabel: string; ratioOk: boolean } | null;

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CoverImageField({ label, kind, value, onChange }: CoverImageFieldProps) {
  const spec = IMAGE_SPECS[kind];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<LocalPreview>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    // Instant client-side feedback (dimensions/ratio) before the upload
    // round-trip even completes — no dependency needed, just the native
    // Image/ObjectURL APIs.
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      setPreview({
        width: img.width,
        height: img.height,
        sizeLabel: formatBytes(file.size),
        ratioOk: Math.abs(ratio - spec.ratio) < 0.15,
      });
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    const result = await uploadImage(formData);
    setUploading(false);

    if (result.error || !result.url) {
      setError(result.error ?? "Não foi possível enviar a imagem.");
      setPreview(null);
      return;
    }
    onChange(result.url);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-60"
        >
          {uploading ? "Enviando..." : value ? "Trocar imagem" : "Enviar imagem"}
        </button>
      </div>

      <div className="mt-2 rounded-xl border border-dashed border-gray-light bg-[#f7f6f6] p-4">
        <p className="text-xs text-gray-medium">
          Recomendado: <strong>{spec.maxWidth} × {spec.maxHeight}px</strong> · Proporção{" "}
          <strong>{spec.ratioLabel}</strong> · JPG, PNG ou WebP · Máximo {(spec.maxBytes / (1024 * 1024)).toFixed(0)} MB
        </p>
      </div>

      {value && (
        // Tailwind can't pick up a dynamically-built arbitrary class (it only
        // scans static strings in source), so a kind-driven ratio has to be
        // an inline style rather than a computed `aspect-[W/H]` class.
        <div
          className="relative mt-3 w-full overflow-hidden rounded-xl bg-[#f7f6f6]"
          style={{ aspectRatio: spec.ratio }}
        >
          <Image src={value} alt="" fill sizes="600px" className="object-cover" />
        </div>
      )}

      {preview && (
        <p className="mt-2 text-xs text-gray-medium">
          {preview.width} × {preview.height} · {preview.sizeLabel}{" "}
          {preview.ratioOk ? (
            <span className="text-green-700">✅ Proporção adequada</span>
          ) : (
            <span className="text-amber-700">⚠️ Fora da proporção recomendada — a imagem será cortada para caber</span>
          )}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-primary">❌ {error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setPreview(null);
          }}
          className="mt-2 text-xs font-medium text-gray-medium hover:text-primary"
        >
          Remover imagem
        </button>
      )}
    </div>
  );
}
