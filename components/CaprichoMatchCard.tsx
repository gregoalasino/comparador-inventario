"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { CaprichoMatch } from "@/lib/types"

function cardColors(matchCount: number, weak: boolean): { bg: string; border: string } {
  if (matchCount >= 5) return { bg: "#CCFF00", border: "#7CB800" }
  if (matchCount >= 4) return { bg: "#B9F6CA", border: "#43A047" }
  if (matchCount === 3) return { bg: "#C8E6C9", border: "#66BB6A" }
  if (matchCount === 2) return { bg: "#E8F5E9", border: "#A5D6A7" }
  if (matchCount === 1) return { bg: "#FFFDE7", border: "#F9A825" }
  if (weak) return { bg: "#FCE4EC", border: "#F48FB1" }
  return { bg: "", border: "" }
}

function badgeStyle(matchCount: number): React.CSSProperties {
  if (matchCount >= 4) return { backgroundColor: "#43A047", color: "white" }
  if (matchCount === 3) return { backgroundColor: "#66BB6A", color: "white" }
  if (matchCount === 2) return { backgroundColor: "#A5D6A7", color: "#1B5E20" }
  if (matchCount === 1) return { backgroundColor: "#FFF176", color: "#856404" }
  return { backgroundColor: "#FFCDD2", color: "#B71C1C" }
}

function RowFieldsMini({ row, color }: { row: Record<string, unknown>; color: string }) {
  const entries = Object.entries(row).filter(
    ([, v]) => v !== null && v !== undefined && String(v).trim() !== ""
  )
  if (entries.length === 0)
    return <span className="text-xs text-muted-foreground">Sin datos</span>

  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([k, v]) => {
        const displayVal = v instanceof Date ? v.toLocaleDateString("es-AR") : String(v)
        const truncKey = k.length > 20 ? k.slice(0, 17) + "…" : k
        const truncVal = displayVal.length > 40 ? displayVal.slice(0, 37) + "…" : displayVal
        return (
          <span
            key={k}
            className="text-[11px] bg-secondary px-2 py-0.5 rounded"
            style={{ color }}
          >
            <span style={{ opacity: 0.6 }}>{truncKey}: </span>
            {truncVal}
          </span>
        )
      })}
    </div>
  )
}

export function CaprichoMatchCard({ match }: { match: CaprichoMatch }) {
  const [open, setOpen] = useState(false)
  const { id, patrimonioRow, logisticaRow, matchCount, matchedFields, weakDescription } = match
  const { bg, border } = cardColors(matchCount, weakDescription)

  return (
    <div
      className="border rounded-md overflow-hidden"
      style={{
        backgroundColor: bg || undefined,
        borderColor: border || undefined,
      }}
    >
      <button
        className="w-full flex items-center justify-between px-3 py-2 hover:opacity-80 transition-opacity text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
            style={
              match.source === "BAJA"
                ? { backgroundColor: "#FAEEDA", color: "#BA7517" }
                : { backgroundColor: "#E6F1FB", color: "#185FA5" }
            }
          >
            {match.source}
          </span>
          <span className="font-mono text-sm font-medium truncate">{id}</span>
          {weakDescription && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: "#F48FB1", color: "#880E4F" }}
            >
              desc. débil
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={badgeStyle(matchCount)}
          >
            {matchCount} param{matchCount !== 1 ? "s" : ""}
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {open && (
        <div
          className="border-t px-3 py-3 space-y-3"
          style={{ borderColor: border || undefined }}
        >
          {matchedFields.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-1.5" style={{ color: "#2E7D32" }}>
                Parámetros coincidentes
              </div>
              <div className="flex flex-wrap gap-1">
                {matchedFields.map((f) => (
                  <span
                    key={f.name}
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{ backgroundColor: "#C8E6C9", color: "#1B5E20" }}
                  >
                    <span className="font-medium">{f.name}: </span>
                    {f.pValue}
                    {f.pValue !== f.lValue && (
                      <span style={{ opacity: 0.6 }}> / {f.lValue}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: "#BA7517" }}>
                Patrimonio (BAJA)
              </div>
              <RowFieldsMini row={patrimonioRow} color="#BA7517" />
            </div>
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: "#185FA5" }}>
                Logística (baja definitiva)
              </div>
              {logisticaRow ? (
                <RowFieldsMini row={logisticaRow} color="#185FA5" />
              ) : (
                <span className="text-xs text-muted-foreground">
                  Sin coincidencia en logística
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
