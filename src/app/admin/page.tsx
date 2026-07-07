import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (await isAdmin()) redirect("/admin/submissions");
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <AdminLogin />
    </main>
  );
}
