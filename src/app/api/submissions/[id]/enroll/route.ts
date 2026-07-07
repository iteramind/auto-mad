import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrollSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.submission.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Diagnóstico no encontrado." },
      { status: 404 },
    );
  }

  await prisma.submission.update({
    where: { id },
    data: {
      wantsToEnroll: true,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone || null,
    },
  });

  return NextResponse.json({ ok: true });
}
