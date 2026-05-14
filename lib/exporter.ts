import * as XLSX from "xlsx"
import { ComparisonResult, SheetRow } from "./types"

function makeWorksheet(rows: SheetRow[]): XLSX.WorkSheet {
  if (rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([[]])
  }
  return XLSX.utils.json_to_sheet(rows)
}

export function exportComparison(comp: ComparisonResult, filename: string): void {
  const wb = XLSX.utils.book_new()

  const soloPatrimonioRows: SheetRow[] = comp.soloPatrimonio.map((item) => ({
    "N° Serie": item.id,
    ...item.patrimonio,
  }))

  const soloLogisticaRows: SheetRow[] = comp.soloLogistica.map((item) => ({
    "N° Serie": item.id,
    ...item.logistica,
  }))

  const coincidenRows: SheetRow[] = comp.coinciden.map((item) => ({
    "N° Serie": item.id,
    ...item.patrimonio,
  }))

  XLSX.utils.book_append_sheet(wb, makeWorksheet(soloPatrimonioRows), "Solo Patrimonio")
  XLSX.utils.book_append_sheet(wb, makeWorksheet(soloLogisticaRows), "Solo Logística")
  XLSX.utils.book_append_sheet(wb, makeWorksheet(coincidenRows), "Coinciden")

  XLSX.writeFile(wb, filename)
}

function buildCombinedRows(comp: ComparisonResult): SheetRow[] {
  const rows: SheetRow[] = []

  for (const item of comp.soloPatrimonio) {
    rows.push({ Estado: "Solo Patrimonio", "N° Serie": item.id, ...item.patrimonio })
  }

  for (const item of comp.soloLogistica) {
    rows.push({ Estado: "Solo Logística", "N° Serie": item.id, ...item.logistica })
  }

  for (const item of comp.coinciden) {
    rows.push({ Estado: "Coincide", "N° Serie": item.id, ...item.patrimonio })
  }

  return rows
}

export function exportAll(
  totalComp: ComparisonResult,
  vigComp: ComparisonResult,
  bajComp: ComparisonResult
): void {
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, makeWorksheet(buildCombinedRows(totalComp)), "Totales")
  XLSX.utils.book_append_sheet(wb, makeWorksheet(buildCombinedRows(vigComp)), "Vigentes")
  XLSX.utils.book_append_sheet(wb, makeWorksheet(buildCombinedRows(bajComp)), "Bajas")

  XLSX.writeFile(wb, "inventario-completo.xlsx")
}
