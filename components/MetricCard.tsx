import React from "react"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  info?: string
}

export function MetricCard({ icon, value, label, sub, color, info }: MetricCardProps) {
  const { bg, text } = colorMap[color]
  return (
    <div className="bg-secondary rounded-lg p-4 flex items-start gap-3 relative">
      <div
        className="flex items-center justify-center rounded shrink-0"
        style={{ width: 30, height: 30, backgroundColor: bg, color: text }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-medium">{value.toLocaleString("es-AR")}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      {info && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                <Info size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs leading-relaxed whitespace-normal">
              {info}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
