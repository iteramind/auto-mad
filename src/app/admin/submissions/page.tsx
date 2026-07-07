import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { LEVELS } from "@/lib/scoring";
import LogoutButton from "@/components/LogoutButton";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; enroll?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const sp = await searchParams;
  const where: Prisma.SubmissionWhereInput = {};
  const levelFilter = sp.level ? Number(sp.level) : undefined;
  if (levelFilter && levelFilter >= 1 && levelFilter <= 4) {
    where.level = levelFilter;
  }
  if (sp.enroll === "1") where.wantsToEnroll = true;

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const total = await prisma.submission.count();
  const enrollCount = await prisma.submission.count({
    where: { wantsToEnroll: true },
  });

  const fmt = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diagnósticos</h1>
          <p className="text-sm text-gray-500">
            {total} en total · {enrollCount} solicitaron inscripción
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/submissions"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Exportar CSV
          </a>
          <LogoutButton />
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterLink href="/admin/submissions" active={!levelFilter && sp.enroll !== "1"}>
          Todos
        </FilterLink>
        {LEVELS.map((l) => (
          <FilterLink
            key={l.level}
            href={`/admin/submissions?level=${l.level}`}
            active={levelFilter === l.level}
          >
            {l.name}
          </FilterLink>
        ))}
        <FilterLink href="/admin/submissions?enroll=1" active={sp.enroll === "1"}>
          Solicitan inscripción
        </FilterLink>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Organización</th>
              <th className="px-4 py-3 font-medium">Puesto</th>
              <th className="px-4 py-3 font-medium">Nivel</th>
              <th className="px-4 py-3 text-right font-medium">Puntaje</th>
              <th className="px-4 py-3 text-center font-medium">Inscripción</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No hay diagnósticos que coincidan.
                </td>
              </tr>
            )}
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">
                  {fmt.format(s.createdAt)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {s.orgName}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.respondentRole}</td>
                <td className="px-4 py-3 text-gray-700">{s.levelName}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {s.totalScore}/40
                </td>
                <td className="px-4 py-3 text-center">
                  {s.wantsToEnroll ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Sí
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/submissions/${s.id}`}
                    className="font-medium text-brand-600 hover:text-brand-800"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}
