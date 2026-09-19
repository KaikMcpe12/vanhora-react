import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { RouteDelayCount } from '@/lib/data/mock-cooperative-operations'

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-colors'
import { ChartEmpty } from './chart-empty'

export function DelaysByRouteBarChart({ data }: { data: RouteDelayCount[] }) {
  if (!data.length) {
    return <ChartEmpty message="Sem atrasos registrados no período." />
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.grid}
          vertical={false}
        />
        <XAxis
          dataKey="routeCode"
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          width={28}
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
          formatter={(v) => [v, 'Atrasos']}
        />
        <Bar
          dataKey="count"
          fill={CHART_COLORS.warning}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
