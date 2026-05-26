"use client"

import { useState } from "react"
import { Download, Search, CheckCircle } from "lucide-react"
import * as XLSX from "xlsx"
import { CaprichoResult, CaprichoMatch } from "@/lib/types"
import { extractExportRow } from "@/lib/capricho"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CaprichoMatchCard } from "./CaprichoMatchCard"

function exportCapricho(matches: CaprichoMatch[], filename: string) {
  const rows = matches.map((m) => extractExportRow(m))

  const ws =
    rows.length > 0 ? XLSX.utils.json_to_sheet(rows) : XLSX.utils.aoa_to_sheet([[]])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Resultados")
  XLSX.writeFile(wb, filename)
}

function MatchList({ matches }: { matches: CaprichoMatch[] }) {
  const [search, setSearch] = useState("")

  if (matches.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <CheckCircle size={14} />
        <span>Sin resultados en esta categoría</span>
      </div>
    )
  }

  const filtered = search
    ? matches.filter(
        (m) =>
          m.id.toLowerCase().includes(search.toLowerCase()) ||
          JSON.stringify(m.patrimonioRow).toLowerCase().includes(search.toLowerCase()) ||
          (m.logisticaRow &&
            JSON.stringify(m.logisticaRow).toLowerCase().includes(search.toLowerCase()))
      )
    : matches

  return (
    <div className="space-y-3">
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
          {filtered.map((m, i) => (
            <CaprichoMatchCard key={`${m.id}-${i}`} match={m} />
          ))}
        </div>
      )}
    </div>
  )
}

interface SubTabContentProps {
  label: string
  matches: CaprichoMatch[]
  exportFilename: string
}

function SubTabContent({ label, matches, exportFilename }: SubTabContentProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-muted-foreground text-sm">
            ({matches.length} bien{matches.length !== 1 ? "es" : ""})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportCapricho(matches, exportFilename)}
        >
          <Download size={14} className="mr-1.5" />
          Exportar
        </Button>
      </div>
      <MatchList matches={matches} />
    </div>
  )
}

interface CaprichoTabProps {
  result: CaprichoResult
}

export function CaprichoTab({ result }: CaprichoTabProps) {
  const [sub, setSub] = useState("alta")

  const total =
    result.alta.length + result.media.length + result.baja.length + result.noCoinciden.length

  return (
    <div className="space-y-5">
      <div className="text-sm text-muted-foreground">
        Comparación avanzada de <strong>todos los bienes de Patrimonio</strong>{" "}
        (vigentes y bajas) contra <strong>todo el Inventario</strong>, usando N° serie,
        orden de compra, ID patrimonial, proveedor y descripción. Cada bien indica si
        proviene de{" "}
        <span className="font-medium" style={{ color: "#185FA5" }}>VIGENTE</span> o{" "}
        <span className="font-medium" style={{ color: "#BA7517" }}>BAJA</span>.
        {total > 0 && (
          <span className="ml-1">
            Se analizaron <strong>{total}</strong> bienes de patrimonio.
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          className="border rounded-md px-3 py-3 text-center"
          style={{ backgroundColor: "#B9F6CA40", borderColor: "#43A047" }}
        >
          <div className="text-2xl font-bold" style={{ color: "#2E7D32" }}>
            {result.alta.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Alta coincidencia</div>
          <div className="text-[10px] text-muted-foreground">4+ params</div>
        </div>
        <div
          className="border rounded-md px-3 py-3 text-center"
          style={{ backgroundColor: "#E8F5E940", borderColor: "#A5D6A7" }}
        >
          <div className="text-2xl font-bold" style={{ color: "#388E3C" }}>
            {result.media.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Media coincidencia</div>
          <div className="text-[10px] text-muted-foreground">2–3 params</div>
        </div>
        <div
          className="border rounded-md px-3 py-3 text-center"
          style={{ backgroundColor: "#FFFDE740", borderColor: "#F9A825" }}
        >
          <div className="text-2xl font-bold" style={{ color: "#856404" }}>
            {result.baja.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Baja coincidencia</div>
          <div className="text-[10px] text-muted-foreground">1 param</div>
        </div>
        <div
          className="border rounded-md px-3 py-3 text-center"
          style={{ backgroundColor: "#FCE4EC40", borderColor: "#F48FB1" }}
        >
          <div className="text-2xl font-bold" style={{ color: "#880E4F" }}>
            {result.noCoinciden.length}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Sin coincidencia</div>
          <div className="text-[10px] text-muted-foreground">0 params</div>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-3">
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-sm border"
            style={{ backgroundColor: "#CCFF00", borderColor: "#7CB800" }}
          />
          Todo coincide (fluor)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-sm border"
            style={{ backgroundColor: "#B9F6CA", borderColor: "#43A047" }}
          />
          4+ params (verde fuerte)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-sm border"
            style={{ backgroundColor: "#C8E6C9", borderColor: "#66BB6A" }}
          />
          3 params (verde medio)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-sm border"
            style={{ backgroundColor: "#E8F5E9", borderColor: "#A5D6A7" }}
          />
          2 params (verde claro)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-3 h-3 rounded-sm border"
            style={{ backgroundColor: "#FCE4EC", borderColor: "#F48FB1" }}
          />
          Desc. débil (rosa)
        </span>
      </div>

      <Tabs value={sub} onValueChange={setSub}>
        <TabsList className="h-auto flex-wrap gap-1">
          <TabsTrigger value="alta">
            Alta Coincidencia ({result.alta.length})
          </TabsTrigger>
          <TabsTrigger value="media">
            Media Coincidencia ({result.media.length})
          </TabsTrigger>
          <TabsTrigger value="baja">
            Baja Coincidencia ({result.baja.length})
          </TabsTrigger>
          <TabsTrigger value="ninguna">
            No Coinciden ({result.noCoinciden.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alta">
          <SubTabContent
            label="Alta Coincidencia — prácticamente el mismo bien"
            matches={result.alta}
            exportFilename="capricho-alta.xlsx"
          />
        </TabsContent>
        <TabsContent value="media">
          <SubTabContent
            label="Media Coincidencia — coinciden en 2 o 3 parámetros"
            matches={result.media}
            exportFilename="capricho-media.xlsx"
          />
        </TabsContent>
        <TabsContent value="baja">
          <SubTabContent
            label="Baja Coincidencia — coinciden en 1 parámetro"
            matches={result.baja}
            exportFilename="capricho-baja.xlsx"
          />
        </TabsContent>
        <TabsContent value="ninguna">
          <SubTabContent
            label="Sin Coincidencia — ningún parámetro coincide"
            matches={result.noCoinciden}
            exportFilename="capricho-ninguna.xlsx"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
