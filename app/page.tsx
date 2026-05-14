"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { parseExcel, buildAnalysis } from "@/lib/parser"
import { AnalysisResult, SheetRow } from "@/lib/types"
import { exportAll } from "@/lib/exporter"
import { DropZone } from "@/components/DropZone"
import { SearchSection } from "@/components/SearchSection"
import { CompareTab } from "@/components/CompareTab"
import { ResumenTab } from "@/components/ResumenTab"
import { ControlTab } from "@/components/ControlTab"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function diffCount(comp: { soloPatrimonio: unknown[]; soloLogistica: unknown[] }): number {
  return comp.soloPatrimonio.length + comp.soloLogistica.length
}

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [rawData, setRawData] = useState<Record<string, SheetRow[]> | null>(null)
  const [fileName, setFileName] = useState("")
  const [activeTab, setActiveTab] = useState("total")

  const handleFile = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      const data = parseExcel(buffer)
      const result = buildAnalysis(data)
      setRawData(data)
      setAnalysis(result)
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <main className="mx-auto max-w-5xl w-full px-4 py-8 flex-1">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Comparador de Inventario</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comparación por número de serie — col B en patrimonio · col D en logística
        </p>
      </div>

      <DropZone
        onFile={handleFile}
        fileName={fileName}
        sheets={analysis?.sheetNames ?? []}
      />

      <SearchSection data={rawData} />

      {analysis && (
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-start justify-between mb-6 gap-2 flex-wrap">
            <TabsList className="h-auto flex-wrap gap-1">
              <TabsTrigger value="total" className="gap-1.5">
                Total
                {diffCount(analysis.totalComp) > 0 && (
                  <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                    {diffCount(analysis.totalComp)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="vigentes" className="gap-1.5">
                Vigentes
                {diffCount(analysis.vigComp) > 0 && (
                  <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                    {diffCount(analysis.vigComp)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bajas" className="gap-1.5">
                Bajas
                {diffCount(analysis.bajComp) > 0 && (
                  <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                    {diffCount(analysis.bajComp)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="control">Control</TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAll(analysis.totalComp, analysis.vigComp, analysis.bajComp)}
            >
              <Download size={14} className="mr-1.5" />
              Exportar todo
            </Button>
            </div>

            <TabsContent value="total">
              <CompareTab
                comp={analysis.totalComp}
                labelA="Patrimonio (total)"
                labelB="Logística (todos)"
                exportFilename="totales.xlsx"
              />
            </TabsContent>
            <TabsContent value="vigentes">
              <CompareTab
                comp={analysis.vigComp}
                labelA="Patrimonio vigentes"
                labelB="Logística (sin baja definitiva)"
                exportFilename="vigentes.xlsx"
              />
            </TabsContent>
            <TabsContent value="bajas">
              <CompareTab
                comp={analysis.bajComp}
                labelA="Patrimonio bajas"
                labelB="Logística (baja definitiva)"
                exportFilename="bajas.xlsx"
              />
            </TabsContent>
            <TabsContent value="resumen">
              <ResumenTab
                totales={analysis.totales}
                vigComp={analysis.vigComp}
                bajComp={analysis.bajComp}
              />
            </TabsContent>
            <TabsContent value="control">
              <ControlTab rows={analysis.ctrlRows} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </main>
  )
}
