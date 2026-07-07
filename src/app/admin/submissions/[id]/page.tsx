import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { QUESTIONS, getBlock } from "@/lib/questionnaire";
import { computeResult, type Answers } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function SubmissionDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;

  const s = await prisma.submission.findUnique({ where: { id } });
  if (!s) notFound();

  const answers = s.answers as Answers;
  const result = computeResult(answers);
  const fmt = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/admin/submissions"
        className="text-sm font-medium text-brand-600 hover:text-brand-800"
      >
        ← Volver a diagnósticos
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-gray-900">{s.orgName}</h1>
      <p className="text-sm text-gray-500">{fmt.format(s.createdAt)}</p>

      {/* Datos de la organización */}
      <section className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:grid-cols-4">
        <Info label="Años" value={String(s.yearsFounded)} />
        <Info label="Donataria" value={s.hasDonataria ? "Sí" : "No"} />
        <Info label="Puesto" value={s.respondentRole} />
        <Info label="Puntaje" value={`${s.totalScore}/40`} />
      </section>

      {/* Resultado */}
      <section
        className="mt-4 rounded-xl p-5 text-white"
        style={{ backgroundColor: result.color }}
      >
        <p className="text-sm opacity-90">Nivel · Madurez global {result.globalPct}%</p>
        <p className="text-lg font-bold">{result.levelName}</p>
        <p className="mt-1 text-sm opacity-90">Recomendado: {result.program}</p>
      </section>

      {/* Contacto de inscripción */}
      {s.wantsToEnroll && (
        <section className="mt-4 rounded-xl bg-green-50 p-5 ring-1 ring-green-200">
          <p className="text-sm font-semibold text-green-800">
            Solicitó sumarse al programa
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-green-900 sm:grid-cols-3">
            <Info label="Contacto" value={s.contactName ?? "—"} />
            <Info label="Correo" value={s.contactEmail ?? "—"} />
            <Info label="Teléfono" value={s.contactPhone ?? "—"} />
          </div>
        </section>
      )}

      {/* Madurez por área */}
      <section className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 font-bold text-gray-900">Madurez por área</h2>
        <table className="w-full text-sm">
          <tbody>
            {result.blocks.map((b) => (
              <tr key={b.blockId} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{b.name}</td>
                <td className="py-2 text-right font-semibold text-gray-900">
                  {b.pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Respuestas */}
      <section className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-3 font-bold text-gray-900">Respuestas</h2>
        <ol className="space-y-4">
          {QUESTIONS.map((q, i) => {
            const chosen = q.options.find((o) => o.score === answers[q.id]);
            return (
              <li key={q.id} className="text-sm">
                <p className="font-medium text-gray-500">
                  {getBlock(q.blockId)?.name}
                </p>
                <p className="font-semibold text-gray-900">
                  {i + 1}. {q.title}
                </p>
                <p className="mt-1 text-gray-700">
                  <span className="mr-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                    {answers[q.id]} pts
                  </span>
                  {chosen?.text ?? "—"}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
