"use client"

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts"
import { AlertCircle, Building2, CheckCircle2, Server } from "lucide-react"
import { ComparisonResult } from "@/lib/types"
import { MetricCard } from "./MetricCard"

interface ResumenTabProps {
  totales: { patrimonio: number; logistica: number }
  vigComp: ComparisonResult
  bajComp: ComparisonResult
}

export function ResumenTab({ totales, vigComp, bajComp }: ResumenTabProps) {
  const totalCoinciden = vigComp.coinciden.length + bajComp.coinciden.length
  const totalDiferencias =
    vigComp.soloPatrimonio.length +
    vigComp.soloLogistica.length +
    bajComp.soloPatrimonio.length +
    bajComp.soloLogistica.length

  const barData = [
    { cat: "Total", Patrimonio: totales.patrimonio, Logística: totales.logistica },
    {
      cat: "Vigentes",
      Patrimonio: vigComp.totalPatrimonio,
      Logística: vigComp.totalLogistica,
    },
    {
      cat: "Bajas",
      Patrimonio: bajComp.totalPatrimonio,
      Logística: bajComp.totalLogistica,
    },
  ]

  const makePieData = (comp: ComparisonResult) => [
    { name: "Coinciden", value: comp.coinciden.length, color: "#3B6D11" },
    { name: "Solo patrimonio", value: comp.soloPatrimonio.length, color: "#BA7517" },
    { name: "Solo logística", value: comp.soloLogistica.length, color: "#185FA5" },
  ]

  const vigPie = makePieData(vigComp)
  const bajPie = makePieData(bajComp)

  const pctTotal =
    totales.patrimonio > 0 ? Math.round((totalCoinciden / totales.patrimonio) * 100) : 0
  const pctVig =
    vigComp.totalPatrimonio > 0
      ? Math.round((vigComp.coinciden.length / vigComp.totalPatrimonio) * 100)
      : 0
  const pctBaj =
    bajComp.totalPatrimonio > 0
      ? Math.round((bajComp.coinciden.length / bajComp.totalPatrimonio) * 100)
      : 0

  const radialData = [
    { name: "Bajas", pct: pctBaj, fill: "#BA7517" },
    { name: "Vigentes", pct: pctVig, fill: "#0F6E56" },
    { name: "Total", pct: pctTotal, fill: "#3B6D11" },
  ]

  const tableRows = [
    {
      label: "Total",
      patrimonio: totales.patrimonio,
      logistica: totales.logistica,
      coinciden: totalCoinciden,
      soloP: vigComp.soloPatrimonio.length + bajComp.soloPatrimonio.length,
      soloL: vigComp.soloLogistica.length + bajComp.soloLogistica.length,
    },
    {
      label: "Vigentes",
      patrimonio: vigComp.totalPatrimonio,
      logistica: vigComp.totalLogistica,
      coinciden: vigComp.coinciden.length,
      soloP: vigComp.soloPatrimonio.length,
      soloL: vigComp.soloLogistica.length,
    },
    {
      label: "Bajas",
      patrimonio: bajComp.totalPatrimonio,
      logistica: bajComp.totalLogistica,
      coinciden: bajComp.coinciden.length,
      soloP: bajComp.soloPatrimonio.length,
      soloL: bajComp.soloLogistica.length,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Métricas globales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={<Building2 size={16} />}
          value={totales.patrimonio}
          label="Total patrimonio"
          color="amber"
        />
        <MetricCard
          icon={<Server size={16} />}
          value={totales.logistica}
          label="Total logística"
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle2 size={16} />}
          value={totalCoinciden}
          label="Coincidencias totales"
          color="green"
        />
        <MetricCard
          icon={<AlertCircle size={16} />}
          value={totalDiferencias}
          label="Diferencias totales"
          color="red"
        />
      </div>

      {/* Bar chart agrupado */}
      <div>
        <h3 className="text-sm font-medium mb-3">Totales por categoría</h3>
        <div className="flex gap-4 mb-2">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#BA7517" }} />
            Patrimonio
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#185FA5" }} />
            Logística
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="cat" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            <Bar dataKey="Patrimonio" fill="#BA7517" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Logística" fill="#185FA5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie charts donut */}
      <div className="grid grid-cols-2 gap-6">
        {[
          { title: "Vigentes", data: vigPie },
          { title: "Bajas", data: bajPie },
        ].map(({ title, data }) => (
          <div key={title}>
            <h3 className="text-sm font-medium mb-2">{title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {data.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  {d.name} <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                  innerRadius={35}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* RadialBar semicircular */}
      <div>
        <h3 className="text-sm font-medium mb-2">Porcentaje de coincidencia</h3>
        <div className="flex flex-wrap gap-3 mb-3">
          {radialData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: d.fill }}
              />
              {d.name}: <span className="font-medium">{d.pct}%</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            data={radialData}
            startAngle={180}
            endAngle={0}
            innerRadius={30}
            outerRadius={90}
          >
            <RadialBar
              dataKey="pct"
              label={{ position: "insideStart", fill: "#fff", fontSize: 11 }}
              background
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
              formatter={(v: unknown) => [`${v}%`, "Coincidencia"]}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla resumen */}
      <div>
        <h3 className="text-sm font-medium mb-3">Resumen por categoría</h3>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary border-b">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                  Categoría
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                  Patrimonio
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                  Logística
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                  Coinciden
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                  Solo patrim.
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                  Solo logíst.
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b last:border-0 ${i === 0 ? "font-medium" : ""}`}
                >
                  <td className="px-3 py-2 text-xs">{row.label}</td>
                  <td className="px-3 py-2 text-xs text-right">{row.patrimonio}</td>
                  <td className="px-3 py-2 text-xs text-right">{row.logistica}</td>
                  <td className="px-3 py-2 text-xs text-right">{row.coinciden}</td>
                  <td
                    className="px-3 py-2 text-xs text-right"
                    style={row.soloP > 0 ? { color: "#A32D2D", fontWeight: 500 } : undefined}
                  >
                    {row.soloP}
                  </td>
                  <td
                    className="px-3 py-2 text-xs text-right"
                    style={row.soloL > 0 ? { color: "#A32D2D", fontWeight: 500 } : undefined}
                  >
                    {row.soloL}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
