import bcrypt from "bcryptjs";

// Cuentas de administrador. Soporta:
//  - Cuenta principal: ADMIN_EMAIL + (ADMIN_PASSWORD o ADMIN_PASSWORD_HASH)
//  - Cuentas adicionales: ADMIN_ACCOUNTS = JSON array, p. ej.
//      [{"email":"otro@dominio.org","password":"..."},
//       {"email":"x@dominio.org","passwordHash":"$2a$10$..."}]
// El respondiente del diagnóstico NO usa login; esto es solo para /admin.

interface AdminAccount {
  email: string;
  password?: string;
  passwordHash?: string;
}

function loadAccounts(): AdminAccount[] {
  const accounts: AdminAccount[] = [];

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (email && (password || passwordHash)) {
    accounts.push({ email, password, passwordHash });
  }

  const extra = process.env.ADMIN_ACCOUNTS;
  if (extra) {
    try {
      const parsed = JSON.parse(extra);
      if (Array.isArray(parsed)) {
        for (const a of parsed) {
          if (
            a &&
            typeof a.email === "string" &&
            (typeof a.password === "string" || typeof a.passwordHash === "string")
          ) {
            accounts.push({
              email: a.email,
              password: typeof a.password === "string" ? a.password : undefined,
              passwordHash:
                typeof a.passwordHash === "string" ? a.passwordHash : undefined,
            });
          }
        }
      }
    } catch {
      // ADMIN_ACCOUNTS malformado: se ignora (las demás cuentas siguen válidas).
    }
  }

  return accounts;
}

/** ¿Hay al menos una cuenta admin configurada en el servidor? */
export function hasAdminConfig(): boolean {
  return loadAccounts().length > 0;
}

/**
 * Verifica credenciales contra cualquier cuenta admin configurada.
 * Devuelve el correo normalizado si son válidas, o null si no.
 */
export async function verifyAdmin(
  email: string,
  password: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const account = loadAccounts().find(
    (a) => a.email.trim().toLowerCase() === normalized,
  );
  if (!account) return null;

  const ok = account.passwordHash
    ? await bcrypt.compare(password, account.passwordHash)
    : password === account.password;

  return ok ? account.email : null;
}
