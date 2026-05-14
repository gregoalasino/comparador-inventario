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

export interface AnalysisResult {
  totalComp: ComparisonResult
  vigComp: ComparisonResult
  bajComp: ComparisonResult
  ctrlRows: SheetRow[]
  totales: { patrimonio: number; logistica: number }
  sheetNames: string[]
}
