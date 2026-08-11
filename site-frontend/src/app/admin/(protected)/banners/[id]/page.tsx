import { notFound } from "next/navigation";
import { getBannerById } from "@/lib/banners/queries";
import BannerForm from "../BannerForm";

export const metadata = { title: "Editar banner — Painel Grupo Dimensão" };

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bannerId = Number(id);
  if (!Number.isInteger(bannerId)) notFound();

  const banner = await getBannerById(bannerId);
  if (!banner) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Editar banner</h1>
      <div className="mt-6">
        <BannerForm banner={banner} />
      </div>
    </div>
  );
}
