import {
  AlertTriangle,
  CloudRain,
  type LucideIcon,
  MoreHorizontal,
  TrafficCone,
  Users,
  Wrench,
} from 'lucide-react'

import { DELAY_CAUSES, type DelayCause } from '@/lib/schemas/report-delay'

export const DELAY_CAUSE_META: Record<
  DelayCause,
  { label: string; icon: LucideIcon }
> = {
  traffic: { label: 'Trânsito', icon: TrafficCone },
  mechanical: { label: 'Mecânico', icon: Wrench },
  accident: { label: 'Acidente', icon: AlertTriangle },
  weather: { label: 'Clima', icon: CloudRain },
  passengers: { label: 'Passageiros', icon: Users },
  other: { label: 'Outro', icon: MoreHorizontal },
}

export const DELAY_CAUSE_OPTIONS = DELAY_CAUSES.map((value) => ({
  value,
  ...DELAY_CAUSE_META[value],
}))
