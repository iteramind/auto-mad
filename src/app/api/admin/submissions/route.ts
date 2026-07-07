import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { QUESTION_IDS } from "@/lib/questionnaire";
import { computeResult, type Answers } from "@/lib/scoring";

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const blockIds = ["b1", "b2", "b3", "b4", "b5"];
  const header = [
    "id",
    "fecha",
    "organizacion",
    "anios_constitucion",
    "donataria",
    "puesto",
    "puntaje_total",
    "nivel",
    "nivel_nombre",
    "madurez_global_pct",
    ...blockIds.map((b) => `${b}_pct`),
    "solicita_inscripcion",
    "contacto_nombre",
    "contacto_email",
    "contacto_telefono",
    ...QUESTION_IDS,
  ];

  const rows = submissions.map((s) => {
    const result = computeResult(s.answers as Answers);
    const pctByBlock: Record<string, number> = {};
    for (const b of result.blocks) pctByBlock[b.blockId] = b.pct;
    const answers = s.answers as Answers;
    return [
      s.id,
      s.createdAt.toISOString(),
      s.orgName,
      s.yearsFounded,
      s.hasDonataria ? "Sí" : "No",
      s.respondentRole,
      s.totalScore,
      s.level,
      s.levelName,
      result.globalPct,
      ...blockIds.map((b) => pctByBlock[b] ?? ""),
      s.wantsToEnroll ? "Sí" : "No",
      s.contactName ?? "",
      s.contactEmail ?? "",
      s.contactPhone ?? "",
      ...QUESTION_IDS.map((q) => answers[q] ?? ""),
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

  // BOM para que Excel interprete UTF-8 (acentos) correctamente.
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="diagnosticos-sesfi.csv"`,
    },
  });
}
