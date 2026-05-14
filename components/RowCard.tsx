"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ComparisonItem, SheetRow } from "@/lib/types"

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return true
  const s = String(v).trim()
  return s === "" || s === "/ /" || s === "/  /"
}

function formatValue(v: unknown): string {
  if (v instanceof Date) return v.toLocaleDateString("es-AR")
  const s = String(v)
  return s.length > 50 ? s.slice(0, 47) + "…" : s
}

function formatKey(k: string): string {
  return k.length > 22 ? k.slice(0, 19) + "…" : k
}

function RowFields({
  row,
  accentColor,
  labelColor,
}: {
  row: SheetRow
  accentColor: string
  labelColor: string
}) {
  const entries = Object.entries(row).filter(([, v]) => !isEmptyValue(v))
  if (entries.length === 0)
    return <span className="text-xs text-muted-foreground">Sin datos</span>
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="text-[11px] bg-secondary px-2 py-0.5 rounded"
          style={{ color: accentColor }}
        >
          <span style={{ color: labelColor, opacity: 0.6 }}>{formatKey(k)}: </span>
          {formatValue(v)}
        </span>
      ))}
    </div>
  )
}

interface RowCardProps {
  item: ComparisonItem
}

export function RowCard({ item }: RowCardProps) {
  const [open, setOpen] = useState(false)

  const hasBoth = !!item.patrimonio && !!item.logistica
  const onlyP = !!item.patrimonio && !item.logistica

  const pillStyle = hasBoth
    ? { border: "1px solid var(--border)", color: "var(--muted-foreground)" }
    : onlyP
      ? { backgroundColor: "#FAEEDA", color: "#BA7517" }
      : { backgroundColor: "#E6F1FB", color: "#185FA5" }

  const pillText = hasBoth ? "ambos inventarios" : onlyP ? "solo patrimonio" : "solo logística"

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-mono text-sm font-medium">{item.id}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={pillStyle}>
            {pillText}
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {open && (
        <div className="border-t px-3 py-3 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium mb-2" style={{ color: "#BA7517" }}>
              Patrimonio
            </div>
            {item.patrimonio ? (
              <RowFields
                row={item.patrimonio}
                accentColor="#BA7517"
                labelColor="#BA7517"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No registrado</span>
            )}
          </div>
          <div>
            <div className="text-xs font-medium mb-2" style={{ color: "#185FA5" }}>
              Logística
            </div>
            {item.logistica ? (
              <RowFields
                row={item.logistica}
                accentColor="#185FA5"
                labelColor="#185FA5"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No registrado</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
