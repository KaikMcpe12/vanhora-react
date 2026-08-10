import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { OnTimePoint } from '@/lib/data/mock-cooperative-operations'

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-colors'
import { ChartEmpty } from './chart-empty'

export function OnTimeAreaChart({ data }: { data: OnTimePoint[] }) {
  if (!data.length) {
    return (
      <ChartEmpty
        height={240}
        message="Os dados de pontualidade vão aparecer conforme as rotas rodarem."
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="onTimeFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={CHART_COLORS.success}
              stopOpacity={0.25}
            />
            <stop
              offset="100%"
              stopColor={CHART_COLORS.success}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={CHART_COLORS.grid}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          interval={5}
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="number"
          domain={[80, 100]}
          ticks={[80, 85, 90, 95, 100]}
          allowDecimals={false}
          width={40}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(v) => [`${v}%`, 'Pontualidade']}
        />
        <Area
          type="monotone"
          dataKey="rate"
          stroke={CHART_COLORS.success}
          strokeWidth={2}
          fill="url(#onTimeFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
