import { SheetRow, ComparisonItem, ComparisonResult } from "./types"

export function normalizeSerial(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const str = String(val).trim().toUpperCase()
  if (!str || str === "NULL") return null
  return str
}

function getPatrimonioSerial(row: SheetRow): string | null {
  return normalizeSerial(Object.values(row)[1])
}

function getLogisticaSerial(row: SheetRow): string | null {
  return normalizeSerial(Object.values(row)[3])
}

export function isLogisticaBaja(row: SheetRow): boolean {
  const keys = Object.keys(row)
  const estadoKey = keys.find((k) => k.toLowerCase().includes("estado")) ?? keys[6]
  if (!estadoKey) return false
  const val = String(row[estadoKey] ?? "").toLowerCase()
  return val.includes("baja definitiva")
}

export function buildComparison(
  patrimonioRows: SheetRow[],
  logisticaRows: SheetRow[]
): ComparisonResult {
  const pSinSerie: SheetRow[] = []
  const lSinSerie: SheetRow[] = []

  const pMap = new Map<string, SheetRow>()
  for (const row of patrimonioRows) {
    const serial = getPatrimonioSerial(row)
    if (!serial) {
      pSinSerie.push(row)
      continue
    }
    pMap.set(serial, row)
  }

  const lMap = new Map<string, SheetRow>()
  for (const row of logisticaRows) {
    const serial = getLogisticaSerial(row)
    if (!serial) {
      lSinSerie.push(row)
      continue
    }
    lMap.set(serial, row)
  }

  const coinciden: ComparisonItem[] = []
  const soloPatrimonio: ComparisonItem[] = []
  const soloLogistica: ComparisonItem[] = []

  for (const [serial, pRow] of pMap) {
    if (lMap.has(serial)) {
      coinciden.push({ id: serial, patrimonio: pRow, logistica: lMap.get(serial) })
    } else {
      soloPatrimonio.push({ id: serial, patrimonio: pRow })
    }
  }

  for (const [serial, lRow] of lMap) {
    if (!pMap.has(serial)) {
      soloLogistica.push({ id: serial, logistica: lRow })
    }
  }

  return {
    coinciden,
    soloPatrimonio,
    soloLogistica,
    pSinSerie,
    lSinSerie,
    totalPatrimonio: patrimonioRows.length,
    totalLogistica: logisticaRows.length,
  }
}
