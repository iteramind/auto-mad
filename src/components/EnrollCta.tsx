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
  const [done, setDone] = useState(alreadyEnrolled);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enroll() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/enroll`, {
        method: "POST",
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
          La Fundación del Empresariado Coahuilense estará comunicándose para
          brindar información sobre las convocatorias y becas que hemos preparado
          para ustedes. Espera nuestra comunicación a partir del 16 de julio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Registra tu interés en el <strong>{program}</strong> y la Fundación del
        Empresariado Coahuilense se comunicará contigo con más información.
      </p>
      <button
        onClick={enroll}
        disabled={submitting}
        className="w-full rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {submitting ? "Enviando…" : "Me interesa este programa"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
