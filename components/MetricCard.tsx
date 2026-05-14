import React from "react"

type Color = "amber" | "blue" | "green" | "red" | "gray"

const colorMap: Record<Color, { bg: string; text: string }> = {
  amber: { bg: "#FAEEDA", text: "#BA7517" },
  blue: { bg: "#E6F1FB", text: "#185FA5" },
  green: { bg: "#EAF3DE", text: "#3B6D11" },
  red: { bg: "#FCEBEB", text: "#A32D2D" },
  gray: { bg: "#F1EFE8", text: "#5F5E5A" },
}

interface MetricCardProps {
  icon: React.ReactNode
  value: number
  label: string
  sub?: string
  color: Color
}

export function MetricCard({ icon, value, label, sub, color }: MetricCardProps) {
  const { bg, text } = colorMap[color]
  return (
    <div className="bg-secondary rounded-lg p-4 flex items-start gap-3">
      <div
        className="flex items-center justify-center rounded shrink-0"
        style={{ width: 30, height: 30, backgroundColor: bg, color: text }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-medium">{value.toLocaleString("es-AR")}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
    </div>
  )
}
