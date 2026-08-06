import type { DelayCause } from '@/lib/schemas/report-delay'

export interface AdminDelay {
  id: string
  routeCode: string
  routeName: string
  cooperativeId: string
  cooperativeName: string
  delayMinutes: number
  reason: string
  severity: 'low' | 'medium' | 'high'
  // causa estruturada (enum) — opcional: registros antigos não a possuem
  cause?: DelayCause
  reportedBy: string
  reportedAt: string
  status: 'pending' | 'resolved'
  resolvedAt?: string
}

export interface AdminDelayStats {
  delays24h: number
  avgDelayMinutes: number
  criticalDelays24h: number
  resolutionRate: number
}

const now = new Date('2026-07-25T14:00:00Z')
const h = (hours: number) => new Date(now.getTime() - hours * 3_600_000).toISOString()
const d = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()

export const MOCK_ADMIN_DELAYS: AdminDelay[] = [
  // Últimas 24h — pendentes e resolvidos
  { id: 'delay-001', routeCode: 'R-402', routeName: 'Centro - Norte', cooperativeId: 'coop-metro', cooperativeName: 'Metro Transportes', delayMinutes: 32, reason: 'Fluxo intenso no centro devido ao evento municipal.', severity: 'high', reportedBy: 'João Silva', reportedAt: h(1), status: 'pending' },
  { id: 'delay-002', routeCode: 'L-12', routeName: 'Vila Nova - Shopping', cooperativeId: 'coop-vale', cooperativeName: 'Cooperativa Vale', delayMinutes: 8, reason: 'Parada prolongada no ponto de embarque.', severity: 'low', reportedBy: 'Marcos Oliveira', reportedAt: h(2), status: 'resolved', resolvedAt: h(1) },
  { id: 'delay-003', routeCode: 'X-09', routeName: 'Express Aeroporto', cooperativeId: 'coop-saofrancisco', cooperativeName: 'Expresso São Francisco', delayMinutes: 22, reason: 'Acidente de trânsito bloqueando a BR-116.', severity: 'high', reportedBy: 'Carlos Lima', reportedAt: h(3), status: 'pending' },
  { id: 'delay-004', routeCode: 'R-101', routeName: 'Distrito Industrial', cooperativeId: 'coop-metro', cooperativeName: 'Metro Transportes', delayMinutes: 14, reason: 'Problema mecânico resolvido em campo.', severity: 'medium', reportedBy: 'Pedro Santos', reportedAt: h(4), status: 'resolved', resolvedAt: h(2) },
  { id: 'delay-005', routeCode: 'N-07', routeName: 'Noturna Sul', cooperativeId: 'coop-nordeste', cooperativeName: 'Cooperativa Nordeste', delayMinutes: 40, reason: 'Chuva forte causou alagamento na Av. Principal.', severity: 'high', reportedBy: 'Ricardo Alves', reportedAt: h(6), status: 'pending' },
  { id: 'delay-006', routeCode: 'R-305', routeName: 'Centro-Sul', cooperativeId: 'coop-saofrancisco', cooperativeName: 'Expresso São Francisco', delayMinutes: 10, reason: 'Passageiro com dificuldade de mobilidade.', severity: 'low', reportedBy: 'Felipe Costa', reportedAt: h(8), status: 'resolved', resolvedAt: h(5) },
  { id: 'delay-007', routeCode: 'R-402', routeName: 'Centro - Norte', cooperativeId: 'coop-metro', cooperativeName: 'Metro Transportes', delayMinutes: 18, reason: 'Manifestação bloqueou parte do percurso.', severity: 'medium', reportedBy: 'João Silva', reportedAt: h(10), status: 'pending' },
  { id: 'delay-008', routeCode: 'L-12', routeName: 'Vila Nova - Shopping', cooperativeId: 'coop-vale', cooperativeName: 'Cooperativa Vale', delayMinutes: 5, reason: 'Semáforo com falha no cruzamento principal.', severity: 'low', reportedBy: 'Marcos Oliveira', reportedAt: h(12), status: 'resolved', resolvedAt: h(9) },

  // Última semana
  { id: 'delay-009', routeCode: 'X-09', routeName: 'Express Aeroporto', cooperativeId: 'coop-nordeste', cooperativeName: 'Cooperativa Nordeste', delayMinutes: 28, reason: 'Fiscalização na rodovia.', severity: 'medium', reportedBy: 'Carlos Lima', reportedAt: d(2), status: 'resolved', resolvedAt: d(2) },
  { id: 'delay-010', routeCode: 'R-101', routeName: 'Distrito Industrial', cooperativeId: 'coop-metro', cooperativeName: 'Metro Transportes', delayMinutes: 7, reason: 'Embarque com volume acima do previsto.', severity: 'low', reportedBy: 'Pedro Santos', reportedAt: d(2), status: 'resolved', resolvedAt: d(2) },
  { id: 'delay-011', routeCode: 'N-07', routeName: 'Noturna Sul', cooperativeId: 'coop-saofrancisco', cooperativeName: 'Expresso São Francisco', delayMinutes: 35, reason: 'Pane elétrica no veículo. Substituição necessária.', severity: 'high', reportedBy: 'Ricardo Alves', reportedAt: d(3), status: 'resolved', resolvedAt: d(3) },
  { id: 'delay-012', routeCode: 'R-305', routeName: 'Centro-Sul', cooperativeId: 'coop-vale', cooperativeName: 'Cooperativa Vale', delayMinutes: 12, reason: 'Obras de pavimentação parcialmente bloqueando a via.', severity: 'medium', reportedBy: 'Felipe Costa', reportedAt: d(3), status: 'pending' },
  { id: 'delay-013', routeCode: 'R-402', routeName: 'Centro - Norte', cooperativeId: 'coop-nordeste', cooperativeName: 'Cooperativa Nordeste', delayMinutes: 9, reason: 'Congestionamento rotineiro no horário de pico.', severity: 'low', reportedBy: 'João Silva', reportedAt: d(4), status: 'resolved', resolvedAt: d(4) },
  { id: 'delay-014', routeCode: 'L-12', routeName: 'Vila Nova - Shopping', cooperativeId: 'coop-metro', cooperativeName: 'Metro Transportes', delayMinutes: 20, reason: 'Veículo avariou. Passageiros redistribuídos.', severity: 'medium', reportedBy: 'Marcos Oliveira', reportedAt: d(4), status: 'resolved', resolvedAt: d(4) },
  { id: 'delay-015', routeCode: 'X-09', routeName: 'Express Aeroporto', cooperativeId: 'coop-saofrancisco', cooperativeName: 'Expresso São Francisco', delayMinutes: 45, reason: 'Bloqueio policial na BR-116 por mais de 1 hora.', severity: 'high', reportedBy: 'Carlos Lima', reportedAt: d(5), status: 'resolved', resolvedAt: d(5) },
  { id: 'delay-016', routeCode: 'R-101', routeName: 'Distrito Industrial', cooperativeId: 'coop-vale', cooperativeName: 'Cooperativa Vale', delayMinutes: 6, reason: 'Passageiro esqueceu objeto — curta parada.', severity: 'low', reportedBy: 'Pedro Santos', reportedAt: d(5), status: 'resolved', resolvedAt: d(5) },
  { id: 'delay-017', routeCode: 'N-07', routeName: 'Noturna Sul', cooperativeId: 'coop-metro', cooperativeName: 'Metro Transportes', delayMinutes: 17, reason: 'Neblina intensa na serra dificultou a velocidade.', severity: 'medium', reportedBy: 'Ricardo Alves', reportedAt: d(6), status: 'resolved', resolvedAt: d(6) },
  { id: 'delay-018', routeCode: 'R-305', routeName: 'Centro-Sul', cooperativeId: 'coop-nordeste', cooperativeName: 'Cooperativa Nordeste', delayMinutes: 11, reason: 'Desvio de rota por buraco na pista.', severity: 'medium', reportedBy: 'Felipe Costa', reportedAt: d(6), status: 'pending' },

  // Último mês
  { id: 'delay-019', routeCode: 'R-402', routeName: 'Centro - Norte', cooperativeId: 'coop-saofrancisco', cooperativeName: 'Expresso São Francisco', delayMinutes: 25, reason: 'Greve parcial na garagem causou atraso na saída.', severity: 'medium', reportedBy: 'João Silva', reportedAt: d(10), status: 'resolved', resolvedAt: d(10) },
  { id: 'delay-020', routeCode: 'L-12', routeName: 'Vila Nova - Shopping', cooperativeId: 'coop-nordeste', cooperativeName: 'Cooperativa Nordeste', delayMinutes: 8, reason: 'Fila no pedágio acima do esperado.', severity: 'low', reportedBy: 'Marcos Oliveira', reportedAt: d(12), status: 'resolved', resolvedAt: d(12) },
  { id: 'delay-021', routeCode: 'X-09', routeName: 'Express Aeroporto', cooperativeId: 'coop-vale', cooperativeName: 'Cooperativa Vale', delayMinutes: 38, reason: 'Chuva torrencial com alagamento na SP-60.', severity: 'high', reportedBy: 'Carlos Lima', reportedAt: d(15), status: 'resolved', resolvedAt: d(14) },
  { id: 'delay-022', routeCode: 'R-101', routeName: 'Distrito Industrial', cooperativeId: 'coop-metro', cooperativeName: 'Metro Transportes', delayMinutes: 13, reason: 'Manutenção emergencial de pneu no meio do percurso.', severity: 'medium', reportedBy: 'Pedro Santos', reportedAt: d(18), status: 'resolved', resolvedAt: d(18) },
  { id: 'delay-023', routeCode: 'N-07', routeName: 'Noturna Sul', cooperativeId: 'coop-saofrancisco', cooperativeName: 'Expresso São Francisco', delayMinutes: 6, reason: 'Sinalização confusa causou percurso incorreto.', severity: 'low', reportedBy: 'Ricardo Alves', reportedAt: d(20), status: 'resolved', resolvedAt: d(20) },
  { id: 'delay-024', routeCode: 'R-305', routeName: 'Centro-Sul', cooperativeId: 'coop-nordeste', cooperativeName: 'Cooperativa Nordeste', delayMinutes: 30, reason: 'Manifestação de moradores bloqueou via por 30 min.', severity: 'high', reportedBy: 'Felipe Costa', reportedAt: d(22), status: 'resolved', resolvedAt: d(22) },
  { id: 'delay-025', routeCode: 'R-402', routeName: 'Centro - Norte', cooperativeId: 'coop-vale', cooperativeName: 'Cooperativa Vale', delayMinutes: 10, reason: 'Passageiro com mal-estar. Parada médica.', severity: 'medium', reportedBy: 'João Silva', reportedAt: d(25), status: 'resolved', resolvedAt: d(25) },
]

export const MOCK_DELAY_STATS: AdminDelayStats = {
  delays24h: 8,
  avgDelayMinutes: 18,
  criticalDelays24h: 3,
  resolutionRate: 62,
}
