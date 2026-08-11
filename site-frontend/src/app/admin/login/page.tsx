import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Entrar — Painel Grupo Dimensão",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f6f6] px-6">
      <LoginForm />
    </div>
  );
}
