"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { SheetRow } from "@/lib/types"

interface SearchSectionProps {
  data: Record<string, SheetRow[]> | null
}

interface SearchResult {
  sheetName: string
  rowIndex: number
  row: SheetRow
}

function getSheetBadgeClass(sheetName: string): string {
  const upper = sheetName.toUpperCase()
  if (upper.includes("VIGENTE") || upper.includes("BAJA")) {
    return "bg-amber-100 text-amber-800 border border-amber-200"
  }
  if (upper.includes("INVENTARIO") || upper.includes("LOGIST")) {
    return "bg-blue-100 text-blue-800 border border-blue-200"
  }
  return "bg-gray-100 text-gray-700 border border-gray-200"
}

function valueMatchesQuery(value: string | number | Date | null, query: string): boolean {
  if (value === null || value === "" || value === undefined) return false
  return String(value).toLowerCase().includes(query.toLowerCase())
}

export function SearchSection({ data }: SearchSectionProps) {
  const [query, setQuery] = useState("")

  const trimmedQuery = query.trim()
  const shouldSearch = trimmedQuery.length >= 2

  let results: SearchResult[] = []

  if (shouldSearch && data) {
    outer: for (const [sheetName, rows] of Object.entries(data)) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const matches = Object.values(row).some((v) => valueMatchesQuery(v, trimmedQuery))
        if (matches) {
          results.push({ sheetName, rowIndex: i + 2, row })
          if (results.length >= 100) break outer
        }
      }
    }
  }

  const sheetsWithResults = shouldSearch
    ? [...new Set(results.map((r) => r.sheetName))]
    : []

  return (
    <div className="mt-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={data === null}
          placeholder={
            data === null
              ? "Cargá un archivo para poder buscar"
              : "Buscá por número patrimonial, serie, modelo u otro campo…"
          }
          className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {shouldSearch && (
        <div className="mt-3 space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin resultados para &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-medium">
                {results.length} resultado{results.length !== 1 ? "s" : ""} en{" "}
                {sheetsWithResults.length} hoja{sheetsWithResults.length !== 1 ? "s" : ""}
                {results.length === 100 ? " (límite 100)" : ""}
              </p>
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <ResultCard
                    key={idx}
                    result={result}
                    query={trimmedQuery}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface ResultCardProps {
  result: SearchResult
  query: string
}

function ResultCard({ result, query }: ResultCardProps) {
  const { sheetName, rowIndex, row } = result
  const badgeClass = getSheetBadgeClass(sheetName)
  const lowerQuery = query.toLowerCase()

  const entries = Object.entries(row).filter(
    ([, v]) => v !== null && v !== "" && v !== undefined
  )

  return (
    <div className="border rounded-lg p-3 bg-secondary/40">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
          {sheetName}
        </span>
        <span className="text-xs text-muted-foreground">fila {rowIndex}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([key, value]) => {
          const strVal = String(value)
          const isMatch = strVal.toLowerCase().includes(lowerQuery)
          return (
            <span
              key={key}
              className={`text-xs rounded px-2 py-0.5 ${
                isMatch
                  ? "bg-amber-100 text-amber-900"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="font-medium">{key}:</span> {strVal}
            </span>
          )
        })}
      </div>
    </div>
  )
}
