import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { email, password } = body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPlain = process.env.ADMIN_PASSWORD; // alternativa a ADMIN_PASSWORD_HASH

  if (!adminEmail || (!adminHash && !adminPlain)) {
    return NextResponse.json(
      { error: "El acceso admin no está configurado en el servidor." },
      { status: 500 },
    );
  }

  const emailOk =
    typeof email === "string" &&
    email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
  // Preferimos el hash bcrypt; si no está, comparamos la contraseña en texto plano.
  const passwordOk =
    typeof password === "string" &&
    (adminHash
      ? await bcrypt.compare(password, adminHash)
      : password === adminPlain);

  if (!emailOk || !passwordOk) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.isAdmin = true;
  session.email = adminEmail;
  await session.save();

  return NextResponse.json({ ok: true });
}
