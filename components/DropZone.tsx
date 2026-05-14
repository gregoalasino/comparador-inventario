"use client"

import { useRef, useState } from "react"
import { Table } from "lucide-react"

interface DropZoneProps {
  onFile: (file: File) => void
  fileName: string
  sheets: string[]
}

export function DropZone({ onFile, fileName, sheets }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file.name.match(/\.(xlsx|xls)$/i)) onFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onClick = () => inputRef.current?.click()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="cursor-pointer rounded-xl border-2 border-dashed p-8 transition-colors"
      style={
        dragging
          ? { borderColor: "#185FA5", backgroundColor: "#E6F1FB" }
          : { borderColor: "var(--border)" }
      }
    >
      <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onChange} />
      {fileName ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <Table size={32} style={{ color: "#3B6D11" }} />
          <div>
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">Clic para cambiar archivo</p>
          </div>
          {sheets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {sheets.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-center">
          <Table size={32} className="text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">Arrastrá tu archivo Excel aquí</p>
            <p className="text-xs text-muted-foreground mt-1">
              o hacé clic para seleccionarlo · Solo .xlsx y .xls
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Clave de comparación: Número de Serie (col B patrimonio · col D logística)
          </p>
        </div>
      )}
    </div>
  )
}
