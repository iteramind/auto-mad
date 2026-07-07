"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo iniciar sesión.");
      }
      router.replace("/admin/submissions");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
    >
      <h1 className="text-xl font-bold text-gray-900">Panel administrativo</h1>
      <p className="text-sm text-gray-500">
        Acceso restringido al equipo. Los diagnósticos no requieren cuenta.
      </p>
      <input
        type="email"
        required
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <input
        type="password"
        required
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
