import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import type { SeverityCount } from '@/lib/data/mock-cooperative-operations'
import { type Severity, SEVERITY_META } from '@/lib/delays/severity'

import { CHART_COLORS, CHART_TOOLTIP_STYLE } from './chart-colors'
import { ChartEmpty } from './chart-empty'

const SEVERITY_COLOR: Record<Severity, string> = {
  low: CHART_COLORS.success,
  medium: CHART_COLORS.warning,
  high: CHART_COLORS.danger,
}

export function SeverityDonutChart({ data }: { data: SeverityCount[] }) {
  if (!data.length) {
    return <ChartEmpty message="Sem atrasos para distribuir por severidade." />
  }

  const chartData = data.map((d) => ({
    name: SEVERITY_META[d.severity].label,
    value: d.count,
    severity: d.severity,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          stroke="var(--color-card)"
        >
          {chartData.map((d) => (
            <Cell key={d.severity} fill={SEVERITY_COLOR[d.severity]} />
          ))}
        </Pie>
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        <Legend
          verticalAlign="bottom"
          height={24}
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
