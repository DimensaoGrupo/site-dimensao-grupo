import { requireSessionOrRedirect } from "@/lib/auth/session";
import { getNotificationCounts } from "@/lib/posts/queries";
import AdminNav from "./AdminNav";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSessionOrRedirect();
  const counts = await getNotificationCounts();

  return (
    <div className="min-h-screen bg-[#f7f6f6]">
      <AdminNav counts={counts} />
      <main className="px-4 py-8 lg:ml-60 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
