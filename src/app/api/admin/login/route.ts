import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasAdminConfig, verifyAdmin } from "@/lib/admins";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { email, password } = body;

  if (!hasAdminConfig()) {
    return NextResponse.json(
      { error: "El acceso admin no está configurado en el servidor." },
      { status: 500 },
    );
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const matchedEmail = await verifyAdmin(email, password);
  if (!matchedEmail) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.isAdmin = true;
  session.email = matchedEmail;
  await session.save();

  return NextResponse.json({ ok: true });
}
