import Link from "next/link";
import { listBannersAdmin } from "@/lib/banners/queries";
import BannerList from "./BannerList";

export const metadata = { title: "Banners — Painel Grupo Dimensão" };

export default async function AdminBannersPage() {
  const banners = await listBannersAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners do Carousel</h1>
          <p className="mt-1 text-sm text-gray-medium">
            Controlam as imagens e textos do carousel na Home. Arraste pelo{" "}
            <span aria-hidden="true">⠿</span> para reordenar. {banners.length} banner(s).
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Novo banner
        </Link>
      </div>

      <div className="mt-6">
        {banners.length === 0 ? (
          <p className="rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
            Nenhum banner cadastrado.
          </p>
        ) : (
          <BannerList
            banners={banners.map((b) => ({
              id: b.id,
              eyebrow: b.eyebrow,
              title: b.title,
              image: b.image,
              active: b.active,
            }))}
          />
        )}
      </div>
    </div>
  );
}
