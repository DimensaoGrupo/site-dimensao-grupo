import Link from "next/link";
import { listCertificationsAdmin } from "@/lib/certifications/queries";
import CertificationList from "./CertificationList";

export const metadata = { title: "Certificações — Painel Grupo Dimensão" };

export default async function AdminCertificationsPage() {
  const certifications = await listCertificationsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificações</h1>
          <p className="mt-1 text-sm text-gray-medium">
            Selos de qualidade exibidos no site. Arraste pelo <span aria-hidden="true">⠿</span> para reordenar.{" "}
            {certifications.length} certificação(ões).
          </p>
        </div>
        <Link
          href="/admin/certifications/new"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Nova certificação
        </Link>
      </div>

      <div className="mt-6">
        {certifications.length === 0 ? (
          <p className="rounded-2xl border border-gray-light/70 bg-white p-8 text-center text-sm text-gray-medium">
            Nenhuma certificação cadastrada.
          </p>
        ) : (
          <CertificationList
            certifications={certifications.map((c) => ({
              id: c.id,
              name: c.name,
              logo: c.logo,
              active: c.active,
            }))}
          />
        )}
      </div>
    </div>
  );
}
