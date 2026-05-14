import { Info } from "lucide-react"

interface SinSerieWarningProps {
  pCount: number
  lCount: number
}

export function SinSerieWarning({ pCount, lCount }: SinSerieWarningProps) {
  if (pCount === 0 && lCount === 0) return null

  const parts: string[] = []
  if (pCount > 0) parts.push(`${pCount} bien${pCount !== 1 ? "es" : ""} de patrimonio`)
  if (lCount > 0) parts.push(`${lCount} bien${lCount !== 1 ? "es" : ""} de logística`)

  return (
    <div
      className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm mb-4"
      style={{ backgroundColor: "#F1EFE8", borderColor: "#5F5E5A", color: "#5F5E5A" }}
    >
      <Info className="shrink-0 mt-0.5" size={16} />
      <span>
        {parts.join(" y ")} quedaron excluidos de la comparación por no tener número de
        serie.
      </span>
    </div>
  )
}
