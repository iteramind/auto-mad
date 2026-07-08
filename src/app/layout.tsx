import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Autodiagnóstico de Fortalecimiento Institucional",
  description:
    "Herramienta de autodiagnóstico de madurez institucional para organizaciones de la sociedad civil. Centro para el Fortalecimiento de la Sociedad Civil.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        {/* Franja de acento institucional */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent" />

        {/* Encabezado con logo CFOSC */}
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/cfosc-logo.svg"
                alt="Centro para el Fortalecimiento de la Sociedad Civil"
                className="h-12 w-auto sm:h-14"
              />
            </Link>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/cfosc-20anos.svg"
              alt="20 años pensando en tu desarrollo"
              className="hidden h-9 w-auto sm:block"
            />
          </div>
        </header>

        <div className="flex-1">{children}</div>

        {/* Pie institucional */}
        <footer className="mt-12 border-t border-gray-100 bg-white">
          {/* Franja: financiado por la FEC */}
          <div className="bg-brand-700">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Con el financiamiento de
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/fec-logo-blanco.png"
                alt="Fundación del Empresariado Coahuilense AC"
                className="h-12 w-auto sm:h-14"
              />
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
            <p className="font-semibold text-brand-700">
              Centro para el Fortalecimiento de la Sociedad Civil
            </p>
            <p className="mt-1">Fortalecemos capacidades. Acompañamos personas.</p>
            <p className="mt-2">
              <a
                href="https://fortalecimiento.org/#contacto"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-600 hover:text-brand-800 hover:underline"
              >
                Contacto
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
