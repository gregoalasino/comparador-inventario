import { SheetRow } from "@/lib/types"

function formatCell(v: unknown): string {
  if (v instanceof Date) return v.toLocaleDateString("es-AR")
  return String(v ?? "")
}

interface ControlTabProps {
  rows: SheetRow[]
}

export function ControlTab({ rows }: ControlTabProps) {
  if (rows.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No se encontraron datos en la hoja CONTROL.
      </div>
    )
  }

  const headers = Object.keys(rows[0])
  const nonEmpty = rows.filter(
    (row) => !Object.values(row).every((v) => v === null || v === "" || v === undefined)
  )

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary border-b">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left px-3 py-2 font-medium text-xs text-muted-foreground whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nonEmpty.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-secondary/30">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 text-xs" style={{ maxWidth: 220 }}>
                  <span
                    className="block overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ maxWidth: 220 }}
                  >
                    {formatCell(row[h])}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
