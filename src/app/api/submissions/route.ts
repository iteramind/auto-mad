import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { submissionSchema } from "@/lib/validation";
import { computeResult } from "@/lib/scoring";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // El puntaje se calcula en el servidor para que el resultado guardado sea confiable.
  const result = computeResult(input.answers);

  const submission = await prisma.submission.create({
    data: {
      orgName: input.orgName,
      yearsFounded: input.yearsFounded,
      hasDonataria: input.hasDonataria,
      respondentRole: input.respondentRole,
      answers: input.answers as Prisma.InputJsonValue,
      totalScore: result.totalScore,
      level: result.level,
      levelName: result.levelName,
      blockScores: result.blocks as unknown as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
