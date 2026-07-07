import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface SessionData {
  isAdmin?: boolean;
  email?: string;
}

const password = process.env.SESSION_SECRET;

export const sessionOptions: SessionOptions = {
  password: password ?? "dev-insecure-secret-change-me-please-32chars",
  cookieName: "automad_admin",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.isAdmin === true;
}
