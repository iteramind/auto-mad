import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeResult, type Answers } from "@/lib/scoring";
import RadarChartClient from "@/components/RadarChartClient";
import EnrollCta from "@/components/EnrollCta";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) notFound();

  // Recalculamos desde las respuestas guardadas para garantizar consistencia.
  const result = computeResult(submission.answers as Answers);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="space-y-8">
        <header className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Reporte de Autodiagnóstico
          </p>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {submission.orgName}
          </h1>
          <p className="text-sm text-gray-500">
            {submission.yearsFounded} años de constitución ·{" "}
            {submission.hasDonataria ? "Con" : "Sin"} donataria autorizada ·{" "}
            {submission.respondentRole}
          </p>
        </header>

        {/* Resultado principal */}
        <section
          className="rounded-2xl p-6 text-white shadow-sm"
          style={{ backgroundColor: result.color }}
        >
          <p className="text-sm font-medium opacity-90">Nivel de madurez</p>
          <h2 className="mt-1 text-2xl font-bold">{result.levelName}</h2>
          <p className="mt-3 text-sm leading-relaxed opacity-95">
            {result.levelDescription}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">
              Madurez global: {result.globalPct}%
            </span>
            <span className="opacity-90">
              Puntaje: {result.totalScore}/40
            </span>
          </div>
        </section>

        {/* Araña + tabla */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Madurez por área
          </h3>
          <RadarChartClient blocks={result.blocks} color={result.color} />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 font-medium">Área</th>
                  <th className="pb-2 text-right font-medium">Madurez</th>
                </tr>
              </thead>
              <tbody>
                {result.blocks.map((b) => (
                  <tr key={b.blockId} className="border-b border-gray-100">
                    <td className="py-2.5 pr-4 text-gray-700">{b.name}</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">
                      {b.pct}%
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2.5 pr-4 font-semibold text-gray-900">
                    Madurez global
                  </td>
                  <td className="py-2.5 text-right font-bold text-gray-900">
                    {result.globalPct}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Programa recomendado + CTA */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Programa recomendado
          </p>
          <h3 className="mt-1 text-xl font-bold text-gray-900">
            {result.program}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {result.programDescription}
          </p>
          <div className="mt-5">
            <EnrollCta
              submissionId={submission.id}
              program={result.program}
              alreadyEnrolled={submission.wantsToEnroll}
            />
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-medium text-brand-600 hover:text-brand-800"
          >
            ← Realizar otro diagnóstico
          </Link>
        </div>
      </div>
    </main>
  );
}
