/** Paleta isolada dos gráficos — usa os tokens do design system (§design_system.md). */
export const CHART_COLORS = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  grid: 'var(--color-border)',
  muted: 'var(--color-muted-foreground)',
} as const

export const CHART_TOOLTIP_STYLE = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--color-foreground)',
} as const
