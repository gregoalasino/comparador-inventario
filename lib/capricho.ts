import { SheetRow, MatchedField, CaprichoMatch, CaprichoResult } from "./types"

function normalize(val: unknown): string {
  if (val === null || val === undefined) return ""
  return String(val)
    .toLowerCase()
    .replace(/[\s\-_.,;:()]/g, "")
    .trim()
}

function normalizeWords(val: unknown): string[] {
  if (val === null || val === undefined) return []
  return String(val)
    .toLowerCase()
    .split(/[\s,./\-_;:()\[\]]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2)
}

function fuzzyContains(a: unknown, b: unknown): boolean {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return false
  return na.includes(nb) || nb.includes(na)
}

function wordOverlap(a: unknown, b: unknown): boolean {
  const wa = new Set(normalizeWords(a))
  const wb = normalizeWords(b)
  if (wa.size === 0 || wb.length === 0) return false
  return wb.some((w) => wa.has(w))
}

export function findField(row: SheetRow, ...keywords: string[]): string {
  const keys = Object.keys(row)
  for (const kw of keywords) {
    const key = keys.find((k) => k.toLowerCase().includes(kw.toLowerCase()))
    if (key !== undefined) {
      const val = row[key]
      if (val !== null && val !== undefined && String(val).trim() !== "") {
        return String(val).trim()
      }
    }
  }
  return ""
}

function getPatrimonioSerial(row: SheetRow): string {
  const val = Object.values(row)[1]
  return val ? String(val).trim().toUpperCase() : ""
}

function getLogisticaSerial(row: SheetRow): string {
  const val = Object.values(row)[3]
  return val ? String(val).trim().toUpperCase() : ""
}

function lastN(str: string, n: number): string {
  const clean = str.replace(/\s/g, "")
  return clean.length >= n ? clean.slice(-n) : clean
}

export function isWeakDescription(desc: string): boolean {
  const clean = desc.trim()
  if (clean.length === 0) return true
  if (clean.length < 6) return true
  const words = clean.split(/\s+/).filter((w) => w.length > 2)
  return words.length < 2
}

function scoreMatch(
  pRow: SheetRow,
  lRow: SheetRow
): { count: number; fields: MatchedField[] } {
  const matched: MatchedField[] = []

  // 1. N° Serie — mínimo últimos 4 caracteres idénticos
  const pSerial = getPatrimonioSerial(pRow)
  const lSerial = getLogisticaSerial(lRow)
  if (pSerial.length >= 4 && lSerial.length >= 4) {
    if (lastN(pSerial, 4) === lastN(lSerial, 4)) {
      matched.push({ name: "N° Serie", pValue: pSerial, lValue: lSerial })
    }
  }

  // 2. Orden de compra
  const pOC = findField(pRow, "orden de compra", "orden compra", "nro orden", "orden", " oc")
  const lOC = findField(lRow, "orden de compra", "orden compra", "nro orden", "orden", " oc")
  if (pOC && lOC && fuzzyContains(pOC, lOC)) {
    matched.push({ name: "Orden de Compra", pValue: pOC, lValue: lOC })
  }

  // 3. ID Patrimonial (ID Patrimonio y Nro Patrimonial Logistica)
  const pID = findField(
    pRow,
    "id patrimoni",
    "nro patrimonial",
    "numero patrimonial",
    "id bien",
    "cod bien",
    "codigo bien"
  )
  const lID = findField(
    lRow,
    "id patrimoni",
    "nro patrimonial",
    "numero patrimonial",
    "id bien",
    "cod bien",
    "codigo bien"
  )
  if (pID && lID && fuzzyContains(pID, lID)) {
    matched.push({ name: "ID Patrimonial", pValue: pID, lValue: lID })
  }

  // 4. Proveedor — coincidencia fuzzy y por palabras
  const pProv = findField(pRow, "proveedor", "prove", "vendor", "suministrador")
  const lProv = findField(lRow, "proveedor", "prove", "vendor", "suministrador")
  if (pProv && lProv && (fuzzyContains(pProv, lProv) || wordOverlap(pProv, lProv))) {
    matched.push({ name: "Proveedor", pValue: pProv, lValue: lProv })
  }

  // 5. Descripción (patrimonio) vs Tipo + Marca + Modelo (logística)
  const pDesc = findField(pRow, "descripcion", "descripción", "descr", "detalle")
  const lTipo = findField(lRow, "tipo")
  const lMarca = findField(lRow, "marca")
  const lModelo = findField(lRow, "modelo")
  const lComposed = [lTipo, lMarca, lModelo].filter(Boolean).join(" ")
  if (pDesc && lComposed && (wordOverlap(pDesc, lComposed) || wordOverlap(lComposed, pDesc))) {
    matched.push({ name: "Descripción/Tipo", pValue: pDesc, lValue: lComposed })
  }

  return { count: matched.length, fields: matched }
}

export function buildCaprichoAnalysis(
  bajaRows: SheetRow[],
  logBajaRows: SheetRow[]
): CaprichoResult {
  const alta: CaprichoMatch[] = []
  const media: CaprichoMatch[] = []
  const baja: CaprichoMatch[] = []
  const noCoinciden: CaprichoMatch[] = []

  bajaRows.forEach((pRow, idx) => {
    const pDesc = findField(pRow, "descripcion", "descripción", "descr", "detalle")
    const weak = isWeakDescription(pDesc)

    let bestScore = 0
    let bestLRow: SheetRow | null = null
    let bestFields: MatchedField[] = []

    for (const lRow of logBajaRows) {
      const { count, fields } = scoreMatch(pRow, lRow)
      if (count > bestScore) {
        bestScore = count
        bestLRow = lRow
        bestFields = fields
      }
    }

    const pSerial = getPatrimonioSerial(pRow)
    const id = pSerial || pDesc.slice(0, 20) || `baja-${idx}`

    const match: CaprichoMatch = {
      id,
      patrimonioRow: pRow,
      logisticaRow: bestLRow,
      matchCount: bestScore,
      matchedFields: bestFields,
      weakDescription: weak,
    }

    if (bestScore === 0) {
      noCoinciden.push(match)
    } else if (bestScore === 1) {
      baja.push(match)
    } else if (bestScore <= 3) {
      media.push(match)
    } else {
      alta.push(match)
    }
  })

  return { alta, media, baja, noCoinciden }
}
