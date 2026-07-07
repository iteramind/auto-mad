import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Autodiagnóstico de Fortalecimiento Institucional",
  description:
    "Herramienta de autodiagnóstico de madurez institucional para organizaciones de la sociedad civil.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
