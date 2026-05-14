import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Comparador de Inventario",
  description: "Poder Judicial — Comparación de inventarios Patrimonio vs Logística",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
