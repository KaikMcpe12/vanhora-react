/** Empty state amigável para gráficos sem dados — não esconde o gráfico. */
export function ChartEmpty({
  message,
  height = 220,
}: {
  message: string
  height?: number
}) {
  return (
    <div
      className="text-muted-foreground flex items-center justify-center rounded-lg border border-dashed text-center text-sm"
      style={{ height }}
    >
      <p className="max-w-[260px] px-4">{message}</p>
    </div>
  )
}
