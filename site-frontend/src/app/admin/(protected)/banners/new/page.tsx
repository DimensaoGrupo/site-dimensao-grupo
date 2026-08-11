import BannerForm from "../BannerForm";

export const metadata = { title: "Novo banner — Painel Grupo Dimensão" };

export default function NewBannerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Novo banner</h1>
      <div className="mt-6">
        <BannerForm />
      </div>
    </div>
  );
}
