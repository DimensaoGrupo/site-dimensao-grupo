import { listMediaFiles } from "@/lib/media/queries";
import MediaGrid from "./MediaGrid";

export const metadata = { title: "Mídia — Painel Grupo Dimensão" };

export default async function AdminMediaPage() {
  const files = await listMediaFiles();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mídia</h1>
      <p className="mt-1 text-sm text-gray-medium">
        Imagens já enviadas por posts e banners ({files.length}). Novas imagens são adicionadas ao criar ou editar um
        post ou banner.
      </p>

      {files.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
          Nenhuma imagem enviada ainda.
        </div>
      ) : (
        <div className="mt-6">
          <MediaGrid files={files} />
        </div>
      )}
    </div>
  );
}
