import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Los datos de contacto se capturan al inicio del diagnóstico, así que este
// endpoint solo marca el interés del usuario en el programa recomendado.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
    data: { wantsToEnroll: true },
  });

  return NextResponse.json({ ok: true });
}
