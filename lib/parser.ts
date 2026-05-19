import * as XLSX from "xlsx"
import { buildComparison, isLogisticaBaja } from "./comparator"
import { buildCaprichoAnalysis } from "./capricho"
import { SheetRow, AnalysisResult } from "./types"

export function parseExcel(buffer: ArrayBuffer): Record<string, SheetRow[]> {
  const wb = XLSX.read(buffer, { cellDates: true })
  const result: Record<string, SheetRow[]> = {}
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    result[name] = XLSX.utils.sheet_to_json<SheetRow>(ws, { defval: "" })
  }
  return result
}

export function buildAnalysis(data: Record<string, SheetRow[]>): AnalysisResult {
  const sheetNames = Object.keys(data)

  const findSheet = (keyword: string): SheetRow[] => {
    const key = sheetNames.find((n) => n.toUpperCase().includes(keyword.toUpperCase()))
    return key ? data[key] : []
  }

  const vigentes = findSheet("VIGENTE")
  const bajas = findSheet("BAJA")
  const inventario = findSheet("INVENTARIO")
  const ctrlRows = findSheet("CONTROL")

  const logVigentes = inventario.filter((r) => !isLogisticaBaja(r))
  const logBajas = inventario.filter((r) => isLogisticaBaja(r))

  const totalComp = buildComparison([...vigentes, ...bajas], inventario)
  const vigComp = buildComparison(vigentes, logVigentes)
  const bajComp = buildComparison(bajas, logBajas)
  const capricho = buildCaprichoAnalysis(bajas, logBajas)

  return {
    totalComp,
    vigComp,
    bajComp,
    ctrlRows,
    totales: {
      patrimonio: vigentes.length + bajas.length,
      logistica: inventario.length,
    },
    sheetNames,
    capricho,
  }
}
