"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      Cerrar sesión
    </button>
  );
}
