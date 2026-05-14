import { AlertCircle, Building2, CheckCircle2, Download, Server } from "lucide-react"
import { ComparisonResult } from "@/lib/types"
import { exportComparison } from "@/lib/exporter"
import { Button } from "@/components/ui/button"
import { MetricCard } from "./MetricCard"
import { SinSerieWarning } from "./SinSerieWarning"
import { CollapseSection } from "./CollapseSection"

interface CompareTabProps {
  comp: ComparisonResult
  labelA: string
  labelB: string
  alertMsg?: string
  exportFilename: string
}

export function CompareTab({ comp, labelA, labelB, alertMsg, exportFilename }: CompareTabProps) {
  const {
    coinciden,
    soloPatrimonio,
    soloLogistica,
    pSinSerie,
    lSinSerie,
    totalPatrimonio,
    totalLogistica,
  } = comp

  const diferencias = soloPatrimonio.length + soloLogistica.length
  const pct = totalPatrimonio > 0 ? Math.round((coinciden.length / totalPatrimonio) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportComparison(comp, exportFilename)}
        >
          <Download size={14} className="mr-1.5" />
          Exportar
        </Button>
      </div>

      <SinSerieWarning pCount={pSinSerie.length} lCount={lSinSerie.length} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={<Building2 size={16} />}
          value={totalPatrimonio}
          label={labelA}
          color="amber"
        />
        <MetricCard
          icon={<Server size={16} />}
          value={totalLogistica}
          label={labelB}
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle2 size={16} />}
          value={coinciden.length}
          label="Coinciden"
          sub={`${pct}% del patrimonio`}
          color="green"
        />
        <MetricCard
          icon={<AlertCircle size={16} />}
          value={diferencias}
          label="Diferencias"
          color="red"
        />
      </div>

      {alertMsg && coinciden.length > 0 && (
        <div
          className="rounded-md border px-3 py-2 text-sm"
          style={{ backgroundColor: "#FCEBEB", borderColor: "#A32D2D", color: "#A32D2D" }}
        >
          {alertMsg.replace("{n}", String(coinciden.length))}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#FAEEDA", color: "#BA7517" }}
            >
              Solo en patrimonio
            </span>
            <span className="font-medium text-sm">{soloPatrimonio.length}</span>
            <span className="text-muted-foreground text-sm">
              bienes presentes en patrimonio pero no en logística
            </span>
          </div>
          <CollapseSection
            items={soloPatrimonio}
            emptyText="No hay bienes exclusivos de patrimonio"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#E6F1FB", color: "#185FA5" }}
            >
              Solo en logística
            </span>
            <span className="font-medium text-sm">{soloLogistica.length}</span>
            <span className="text-muted-foreground text-sm">
              bienes presentes en logística pero no en patrimonio
            </span>
          </div>
          <CollapseSection
            items={soloLogistica}
            emptyText="No hay bienes exclusivos de logística"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
            >
              Coinciden
            </span>
            <span className="font-medium text-sm">{coinciden.length}</span>
            <span className="text-muted-foreground text-sm">
              bienes presentes en ambos inventarios
            </span>
          </div>
          <CollapseSection items={coinciden} emptyText="No hay coincidencias" />
        </div>
      </div>
    </div>
  )
}
