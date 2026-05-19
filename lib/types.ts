export type SheetRow = Record<string, string | number | Date | null>

export interface ComparisonItem {
  id: string
  patrimonio?: SheetRow
  logistica?: SheetRow
}

export interface ComparisonResult {
  coinciden: ComparisonItem[]
  soloPatrimonio: ComparisonItem[]
  soloLogistica: ComparisonItem[]
  pSinSerie: SheetRow[]
  lSinSerie: SheetRow[]
  totalPatrimonio: number
  totalLogistica: number
}

export interface MatchedField {
  name: string
  pValue: string
  lValue: string
}

export interface CaprichoMatch {
  id: string
  patrimonioRow: SheetRow
  logisticaRow: SheetRow | null
  matchCount: number
  matchedFields: MatchedField[]
  weakDescription: boolean
}

export interface CaprichoResult {
  alta: CaprichoMatch[]
  media: CaprichoMatch[]
  baja: CaprichoMatch[]
  noCoinciden: CaprichoMatch[]
}

export interface AnalysisResult {
  totalComp: ComparisonResult
  vigComp: ComparisonResult
  bajComp: ComparisonResult
  ctrlRows: SheetRow[]
  totales: { patrimonio: number; logistica: number }
  sheetNames: string[]
  capricho: CaprichoResult
}
