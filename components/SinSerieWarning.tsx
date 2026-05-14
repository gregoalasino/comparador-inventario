"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info, Search } from "lucide-react"
import { SheetRow } from "@/lib/types"

interface SinSerieWarningProps {
  pSinSerie: SheetRow[]
  lSinSerie: SheetRow[]
}

function formatValue(v: unknown): string {
  if (v instanceof Date) return v.toLocaleDateString("es-AR")
  return String(v ?? "")
}

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined || v === "") return true
  const s = String(v).trim()
  return s === "" || s === "/ /" || s === "/  /"
}

interface RowCardSinSerieProps {
  row: SheetRow
  index: number
}

function RowCardSinSerie({ row, index }: RowCardSinSerieProps) {
  const entries = Object.entries(row).filter(([, v]) => !isEmptyValue(v))
  return (
    <div className="border rounded-md px-3 py-2 bg-background">
      <div className="text-[11px] text-muted-foreground mb-1.5">fila {index + 2}</div>
      <div className="flex flex-wrap gap-1">
        {entries.map(([k, v]) => (
          <span key={k} className="text-xs bg-muted px-2 py-0.5 rounded">
            <span className="font-medium">{k}:</span> {formatValue(v)}
          </span>
        ))}
      </div>
    </div>
  )
}

interface GroupProps {
  label: string
  rows: SheetRow[]
  accentBg: string
  accentText: string
}

function SinSerieGroup({ label, rows, accentBg, accentText }: GroupProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = search
    ? rows.filter((row) =>
        Object.values(row).some((v) =>
          String(v ?? "").toLowerCase().includes(search.toLowerCase())
        )
      )
    : rows

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: accentBg, color: accentText }}
        >
          {label}
        </span>
        <span className="text-xs font-medium">{rows.length}</span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {open ? "Ocultar" : "Ver bienes"}
        </button>
      </div>

      {open && (
        <div className="space-y-2 mt-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">Sin resultados.</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filtered.map((row, i) => (
                <RowCardSinSerie key={i} row={row} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SinSerieWarning({ pSinSerie, lSinSerie }: SinSerieWarningProps) {
  if (pSinSerie.length === 0 && lSinSerie.length === 0) return null

  const parts: string[] = []
  if (pSinSerie.length > 0)
    parts.push(`${pSinSerie.length} bien${pSinSerie.length !== 1 ? "es" : ""} de patrimonio`)
  if (lSinSerie.length > 0)
    parts.push(`${lSinSerie.length} bien${lSinSerie.length !== 1 ? "es" : ""} de logística`)

  return (
    <div
      className="rounded-md border px-3 py-2.5 text-sm mb-4"
      style={{ backgroundColor: "#F1EFE8", borderColor: "#5F5E5A", color: "#5F5E5A" }}
    >
      <div className="flex items-start gap-2">
        <Info className="shrink-0 mt-0.5" size={16} />
        <span>
          {parts.join(" y ")} quedaron excluidos de la comparación por no tener número de serie.
        </span>
      </div>

      <div className="mt-2 ml-6 space-y-1">
        {pSinSerie.length > 0 && (
          <SinSerieGroup
            label="Patrimonio sin serie"
            rows={pSinSerie}
            accentBg="#FAEEDA"
            accentText="#BA7517"
          />
        )}
        {lSinSerie.length > 0 && (
          <SinSerieGroup
            label="Logística sin serie"
            rows={lSinSerie}
            accentBg="#E6F1FB"
            accentText="#185FA5"
          />
        )}
      </div>
    </div>
  )
}
