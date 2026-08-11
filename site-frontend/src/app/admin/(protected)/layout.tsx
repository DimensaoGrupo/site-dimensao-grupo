import { requireSessionOrRedirect } from "@/lib/auth/session";
import AdminNav from "./AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSessionOrRedirect();

  return (
    <div className="min-h-screen bg-[#f7f6f6]">
      <AdminNav />
      <main className="px-4 py-8 lg:ml-60 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
