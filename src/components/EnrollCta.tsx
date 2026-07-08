"use client";

import { useState } from "react";

export default function EnrollCta({
  submissionId,
  program,
  alreadyEnrolled,
}: {
  submissionId: string;
  program: string;
  alreadyEnrolled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(alreadyEnrolled);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo registrar tu interés.");
      }
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-green-50 p-5 text-center ring-1 ring-green-200">
        <p className="font-semibold text-green-800">¡Gracias! 🎉</p>
        <p className="mt-1 text-sm text-green-700">
          Registramos tu interés en recibir más información sobre el{" "}
          <strong>{program}</strong>. Nos pondremos en contacto contigo pronto.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
      >
        Quiero más información sobre este programa
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl bg-gray-50 p-5 ring-1 ring-gray-200">
      <p className="text-sm font-medium text-gray-700">
        Déjanos tus datos y te enviamos más información sobre el{" "}
        <strong>{program}</strong>.
      </p>
      <input
        type="text"
        required
        placeholder="Nombre de contacto"
        value={form.contactName}
        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <input
        type="email"
        required
        placeholder="Correo electrónico"
        value={form.contactEmail}
        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <input
        type="tel"
        placeholder="Teléfono (opcional)"
        value={form.contactPhone}
        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Enviando…" : "Enviar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
