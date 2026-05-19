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
  // Col B (index 1) = Id SUAF; en BAJA suele ser "No tiene" → fallback a col C (Número de serie)
  const vals = Object.values(row)
  const suaf = vals[1] ? String(vals[1]).trim().toUpperCase() : ""
  const invalid = ["NO TIENE", "NOTIENE", "NULL", "S/N", "SN", ""]
  if (suaf && !invalid.includes(suaf)) return suaf
  const nroSerie = vals[2] ? String(vals[2]).trim().toUpperCase() : ""
  return nroSerie
}

function getLogisticaSerial(row: SheetRow): string {
  // Col D (index 3) = Nro Serie en Inventario
  const val = Object.values(row)[3]
  return val ? String(val).trim().toUpperCase() : ""
}

// Normaliza serie: quita separadores y aplica sustituciones de caracteres
// que suelen confundirse al cargar manualmente (S↔5, O↔0, I/L↔1, Z↔2)
function normalizeSerial(s: string): string {
  return s
    .toUpperCase()
    .replace(/[\s\-_.]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1")
    .replace(/S/g, "5")
    .replace(/Z/g, "2")
}

function serialsMatch(a: string, b: string): boolean {
  const na = normalizeSerial(a)
  const nb = normalizeSerial(b)
  if (!na || !nb || na.length < 3 || nb.length < 3) return false

  // Coincidencia exacta tras normalizar
  if (na === nb) return true

  // Uno es substring del otro (ej: un sistema carga prefijo "R" o sufijo extra)
  if (na.length >= 4 && nb.length >= 4 && (na.includes(nb) || nb.includes(na))) return true

  // Últimos N chars (hasta 6) idénticos: para prefijos distintos de sistema a sistema
  if (na.length >= 4 && nb.length >= 4) {
    const n = Math.min(na.length, nb.length, 6)
    if (n >= 4 && na.slice(-n) === nb.slice(-n)) return true
  }

  return false
}

const INVALID_SERIALS = new Set(["NO TIENE", "NOTIENE", "NULL", "S/N", "SN", "N/A", "NA"])

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

  // 1. N° Serie — comparación inteligente con sustituciones S/5, O/0, I/L/1, etc.
  const pSerial = getPatrimonioSerial(pRow)
  const lSerial = getLogisticaSerial(lRow)
  if (pSerial && lSerial && serialsMatch(pSerial, lSerial)) {
    matched.push({ name: "N° Serie", pValue: pSerial, lValue: lSerial })
  }

  // 2. Orden de compra
  // Patrimonio: "Orden de compra" (col F) | Inventario: "Ord" (col K)
  // "ord" como keyword matchea ambos: "Orden de compra".includes("ord") ✓ y "Ord".includes("ord") ✓
  const pOC = findField(pRow, "orden de compra", "orden compra", "nro orden", "ord")
  const lOC = findField(lRow, "ord", "orden de compra", "orden compra", "nro orden")
  if (pOC && lOC && fuzzyContains(pOC, lOC)) {
    matched.push({ name: "Orden de Compra", pValue: pOC, lValue: lOC })
  }

  // 3. ID Patrimonial
  // Patrimonio: col A = "ID" | Inventario: col I = "Nro Patrimonial"
  // Para Patrimonio se usa "id" como keyword de último recurso (matchea la col "ID")
  const pID = findField(
    pRow,
    "id patrimoni",
    "nro patrimonial",
    "numero patrimonial",
    "id bien",
    "cod bien",
    "codigo bien",
    "id"           // fallback: col "ID" de Patrimonio
  )
  const lID = findField(
    lRow,
    "nro patrimonial",   // col I de Inventario
    "id patrimoni",
    "numero patrimonial",
    "id bien",
    "cod bien",
    "codigo bien"
  )
  if (pID && lID && fuzzyContains(pID, lID)) {
    matched.push({ name: "ID Patrimonial", pValue: pID, lValue: lID })
  }

  // 4. Proveedor — coincidencia fuzzy y por palabras
  // Patrimonio: "Razón social" | Inventario: "Proveedor"
  const pProv = findField(pRow, "razon social", "razón social", "razon", "proveedor", "prove", "vendor")
  const lProv = findField(lRow, "proveedor", "prove", "vendor", "razon social", "razón social")
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
    const serialOk = pSerial && !INVALID_SERIALS.has(pSerial) && pSerial.length > 2
    const id = serialOk
      ? pSerial
      : bestFields.length > 0
        ? `Coincide en ${bestFields.map((f) => f.name).join(", ")}`
        : pDesc.slice(0, 30) || `baja-${idx}`

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
