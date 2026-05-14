"use client"

import { useState } from "react"
import { CheckCircle, ChevronDown, ChevronUp, Search } from "lucide-react"
import { ComparisonItem } from "@/lib/types"
import { RowCard } from "./RowCard"

interface CollapseSectionProps {
  items: ComparisonItem[]
  emptyText?: string
}

export function CollapseSection({
  items,
  emptyText = "Sin diferencias",
}: CollapseSectionProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <CheckCircle size={14} style={{ color: "#3B6D11" }} />
        <span>{emptyText}</span>
      </div>
    )
  }

  const filtered = search
    ? items.filter(
        (item) =>
          item.id.toLowerCase().includes(search.toLowerCase()) ||
          JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <div>
      <button
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {open ? `Ocultar ${items.length} registros` : `Ver ${items.length} registros`}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Buscar por serie o datos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Sin resultados para &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((item) => (
                <RowCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
