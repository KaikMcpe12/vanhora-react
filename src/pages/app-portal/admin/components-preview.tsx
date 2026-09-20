import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  CircleDashed,
  CloudRain,
  Copy,
  Edit,
  Eye,
  Info,
  LayoutGrid,
  MousePointerClick,
  Pencil,
  PlayCircle,
  Plus,
  PowerOff,
  Route as RouteIcon,
  Rows3,
  TrafficCone,
  Trash2,
  UserRound,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminPagination,
  AdminSectionTitle,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { ChoiceChips } from '@/components/forms/choice-chips'
import { MinuteStepper } from '@/components/forms/minute-stepper'
import { SelectableCard } from '@/components/forms/selectable-card'
import { StepIndicator } from '@/components/forms/step-indicator'
import { CooperativePicker } from '@/components/pickers/cooperative-picker'
import {
  type Weekday,
  WeekdayPicker,
} from '@/components/pickers/weekday-picker'
import { StatusChip } from '@/components/status-chip'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_ADMIN_COOPERATIVES } from '@/lib/data/mock-admin-cooperatives'
import { MOCK_ADMIN_ROUTES as MOCK_ADMIN_ROUTES_PREVIEW } from '@/lib/data/mock-admin-schedules'
import {
  DELAY_STATUS_META,
  DRIVER_SCHEDULE_STATUS_META,
  ROUTE_STATUS_META,
  SCHEDULE_STATUS_META,
  type StatusChipInput,
  USER_ROLE_META,
  USER_STATUS_META,
} from '@/lib/status/status-meta'
import { cn } from '@/lib/utils'
import { CooperativeDetailPanel } from '@/pages/app-portal/admin/cooperatives/cooperative-detail-panel'
import { GeneralTab } from '@/pages/app-portal/admin/cooperatives/tabs/general-tab'
import { ScheduleFormDialog } from '@/pages/app-portal/schedules/schedule-form-dialog'

interface SampleRow {
  id: string
  name: string
  status: 'active' | 'suspended' | 'inactive'
  city: string
  routes: number
}

const sampleData: SampleRow[] = [
  {
    id: '1',
    name: 'Metro Transporters',
    status: 'active',
    city: 'Fortaleza',
    routes: 12,
  },
  {
    id: '2',
    name: 'Cooperativa Vale',
    status: 'suspended',
    city: 'Caucaia',
    routes: 5,
  },
  {
    id: '3',
    name: 'Swift Bus Co.',
    status: 'inactive',
    city: 'Maracanaú',
    routes: 0,
  },
]

// Cooperativas de exemplo para o preview do PR9 (dados mock reais).
const previewCoopRich = MOCK_ADMIN_COOPERATIVES.find(
  (c) => c.id === '11111111-1111-4111-8111-111111111111',
)!
const previewCoopGeneral = MOCK_ADMIN_COOPERATIVES.find(
  (c) => c.id === '44444444-4444-4444-8444-444444444444',
)!

function PreviewSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-foreground border-border border-b pb-2 text-base font-semibold">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  )
}

function StatusRow({
  label,
  chips,
}: {
  label: string
  chips: StatusChipInput[]
}) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-center gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <div className="flex flex-wrap gap-2">
        {chips.map((s) => (
          <StatusChip key={s.label} {...s} />
        ))}
      </div>
    </div>
  )
}

export function AdminComponentsPreviewPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [confirmOpen, setConfirmOpenState] = useState(false)
  const [typedConfirmOpen, setTypedConfirmOpen] = useState(false)
  const [sortState, setSortState] = useState<
    { key: string; direction: 'asc' | 'desc' } | undefined
  >()
  const [showEmpty, setShowEmpty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stepperA, setStepperA] = useState(15)
  const [stepperB, setStepperB] = useState(20)
  const [stepperC, setStepperC] = useState(3)
  const [chip, setChip] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<'a' | 'b'>('a')
  const [previewPage, setPreviewPage] = useState(0)
  const [previewCoop, setPreviewCoop] = useState<string | null>(null)
  const [coopPicker, setCoopPicker] = useState('')
  const [weekMulti, setWeekMulti] = useState<Weekday[]>(['seg', 'ter', 'qua'])
  const [weekNoPreset, setWeekNoPreset] = useState<Weekday[]>(['sex'])
  const [weekSingle, setWeekSingle] = useState<Weekday[]>(['qua'])
  const [detailTab, setDetailTab] = useState('geral')

  function handleSort(key: string) {
    setSortState((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const sampleColumns: AdminTableColumn<SampleRow>[] = [
    {
      key: 'name',
      label: 'Nome',
      render: (row) => (
        <span className="text-foreground font-medium">{row.name}</span>
      ),
      sortable: true,
    },
    {
      key: 'city',
      label: 'Cidade',
      render: (row) => row.city,
    },
    {
      key: 'routes',
      label: 'Rotas',
      align: 'right',
      render: (row) => row.routes,
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip {...ROUTE_STATUS_META[row.status]} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <AdminActionMenu
          items={[
            {
              label: 'Ver detalhes',
              icon: Eye,
              onClick: () => alert(`Ver ${row.name}`),
            },
            {
              label: 'Editar',
              icon: Edit,
              onClick: () => alert(`Editar ${row.name}`),
            },
            { divider: true, label: '', onClick: () => {} },
            {
              label: 'Excluir',
              icon: Trash2,
              onClick: () => setConfirmOpenState(true),
              variant: 'danger',
            },
          ]}
        />
      ),
    },
  ]

  const tableData = showEmpty ? [] : sampleData

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-foreground text-2xl font-medium">
          Componentes Admin
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Referência visual dos componentes da biblioteca{' '}
          <code className="font-mono text-xs">src/components/admin/</code>
        </p>
      </div>

      <PreviewSection title="AdminKPICard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminKPICard
            label="Cooperativas Ativas"
            value="48"
            trend={{
              value: '+3.2%',
              direction: 'up',
              contextLabel: 'com operação ativa',
            }}
          />
          <AdminKPICard
            label="Atrasos (24h)"
            value="14"
            trend={{
              value: '+5',
              direction: 'up',
              contextLabel: 'vs período anterior',
            }}
            severity="critical"
          />
          <AdminKPICard
            label="Avaliação Média"
            value="4.6"
            trend={{
              value: '-0.1',
              direction: 'down',
              contextLabel: 'esta semana',
            }}
            severity="attention"
          />
          <AdminKPICard
            label="Rotas Cadastradas"
            value="892"
            helper="considerando todas as cooperativas"
          />
          <AdminKPICard
            label="Atrasos Críticos"
            value="6"
            trend={{ value: '−2', direction: 'down' }}
            severity="critical"
          />
          <AdminKPICard
            label="Clicável"
            value="42"
            trend={{ value: '+7%', direction: 'up' }}
            onClick={() => alert('card clicado')}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="AdminFilterBar">
        <AdminFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar cooperativas..."
          filters={
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>
          }
          actions={
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Nova cooperativa
            </Button>
          }
        />
      </PreviewSection>

      <PreviewSection title="AdminTable">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEmpty((v) => !v)}
            >
              {showEmpty ? 'Mostrar dados' : 'Mostrar empty state'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), 2000)
              }}
            >
              Simular loading (2s)
            </Button>
          </div>
          <AdminTable
            columns={sampleColumns}
            data={tableData}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            sortState={sortState}
            onSort={handleSort}
            onRowClick={(row) => console.log('row click', row.name)}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="AdminActionMenu">
        <div className="flex items-center gap-8">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">Padrão</p>
            <AdminActionMenu
              items={[
                { label: 'Ver detalhes', icon: Eye, onClick: () => {} },
                { label: 'Editar', icon: Edit, onClick: () => {} },
              ]}
            />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">Com ação perigo</p>
            <AdminActionMenu
              items={[
                { label: 'Ver detalhes', icon: Eye, onClick: () => {} },
                { label: 'Editar', icon: Edit, onClick: () => {} },
                { divider: true, label: '', onClick: () => {} },
                {
                  label: 'Excluir',
                  icon: Trash2,
                  onClick: () => {},
                  variant: 'danger',
                },
              ]}
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="AdminConfirmDialog">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpenState(true)}
          >
            Abrir dialog simples
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTypedConfirmOpen(true)}
          >
            Abrir typed confirmation
          </Button>
        </div>

        <AdminConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpenState}
          title="Desativar cooperativa"
          description="Esta ação vai desativar a cooperativa Metro Transporters e todas as suas 12 rotas ativas. Passageiros não conseguirão mais ver horários dessa cooperativa."
          confirmLabel="Desativar"
          onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
        />

        <AdminConfirmDialog
          open={typedConfirmOpen}
          onOpenChange={setTypedConfirmOpen}
          title="Excluir cooperativa permanentemente"
          description="Esta ação é irreversível. Todos os dados dessa cooperativa, incluindo rotas e histórico, serão removidos."
          confirmLabel="Excluir definitivamente"
          requireTypedConfirmation={{
            expectedText: 'Metro Transporters',
            label: 'Digite "Metro Transporters" para confirmar:',
          }}
          onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1500))}
        />
      </PreviewSection>

      <PreviewSection title="AdminEmptyState">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border-border rounded-xl border">
            <AdminEmptyState
              title="Nenhuma rota encontrada"
              description="Ajuste os filtros ou crie uma nova rota para começar."
              action={{ label: 'Nova rota', onClick: () => {}, icon: Plus }}
            />
          </div>
          <div className="border-border rounded-xl border">
            <AdminEmptyState title="Nenhum item encontrado" />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="AdminSectionTitle">
        <div className="space-y-6">
          <AdminSectionTitle title="Últimos atrasos reportados" />
          <AdminSectionTitle
            title="Próximas partidas"
            description="Registros das próximas 2 horas"
            actions={
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                Ver todos
              </Button>
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Componentes-base (PR3)">
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-foreground text-sm font-medium">MinuteStepper</p>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs">
                  default (step 1 · +5/+10/+15)
                </p>
                <MinuteStepper value={stepperA} onChange={setStepperA} />
              </div>
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs">
                  shortcuts custom (+1/+2/+3)
                </p>
                <MinuteStepper
                  value={stepperB}
                  onChange={setStepperB}
                  shortcuts={[1, 2, 3]}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs">
                  min/max estreito (0–10 · unit “un”)
                </p>
                <MinuteStepper
                  value={stepperC}
                  onChange={setStepperC}
                  min={0}
                  max={10}
                  unit="un"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground text-sm font-medium">ChoiceChips</p>
            <p className="text-muted-foreground text-xs">
              seleção única · ícone + label
            </p>
            <ChoiceChips
              options={[
                { value: 'traffic', label: 'Trânsito', icon: TrafficCone },
                { value: 'mechanical', label: 'Mecânico', icon: Wrench },
                { value: 'weather', label: 'Clima', icon: CloudRain },
                { value: 'passengers', label: 'Passageiros', icon: Users },
              ]}
              value={chip}
              onChange={setChip}
              ariaLabel="Exemplo de ChoiceChips"
            />
          </div>

          <div className="space-y-3">
            <p className="text-foreground text-sm font-medium">
              SelectableCard
            </p>
            <p className="text-muted-foreground text-xs">
              radio-indicator + border-l verde no selecionado
            </p>
            <div
              role="radiogroup"
              aria-label="Exemplo de SelectableCard"
              className="grid gap-3 sm:grid-cols-2"
            >
              <SelectableCard
                selected={selectedCard === 'a'}
                onSelect={() => setSelectedCard('a')}
              >
                <div className="flex-1 space-y-0.5">
                  <div className="font-medium">Opção A</div>
                  <div className="text-muted-foreground text-sm">
                    selecionada por padrão
                  </div>
                </div>
              </SelectableCard>
              <SelectableCard
                selected={selectedCard === 'b'}
                onSelect={() => setSelectedCard('b')}
              >
                <div className="flex-1 space-y-0.5">
                  <div className="font-medium">Opção B</div>
                  <div className="text-muted-foreground text-sm">
                    clique para selecionar
                  </div>
                </div>
              </SelectableCard>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground text-sm font-medium">StepIndicator</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <StepIndicator
                current={1}
                total={3}
                labels={['Rota', 'Horário', 'Detalhes']}
              />
              <StepIndicator
                current={2}
                total={3}
                labels={['Rota', 'Horário', 'Detalhes']}
              />
              <StepIndicator
                current={3}
                total={3}
                labels={['Rota', 'Horário', 'Detalhes']}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground text-sm font-medium">StatusChip</p>
            <p className="text-muted-foreground text-xs">
              sempre cor + ícone + texto (§6)
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusChip
                tone="success"
                icon={CheckCircle2}
                label="Em operação"
              />
              <StatusChip
                tone="warning"
                icon={AlertTriangle}
                label="Atrasado"
              />
              <StatusChip tone="danger" icon={XCircle} label="Cancelado" />
              <StatusChip tone="info" icon={Info} label="Programado" />
              <StatusChip tone="neutral" icon={CircleDashed} label="Suspenso" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-foreground text-sm font-medium">
              StatusChip — Status de domínio
            </p>
            <p className="text-muted-foreground text-xs">
              chips reais gerados pelos metas em{' '}
              <code className="font-mono">src/lib/status/status-meta.ts</code>
            </p>
            <div className="space-y-2">
              <StatusRow
                label="Horário (operação)"
                chips={Object.values(SCHEDULE_STATUS_META)}
              />
              <StatusRow
                label="Rota / cidade / cooperativa"
                chips={Object.values(ROUTE_STATUS_META)}
              />
              <StatusRow
                label="Usuário / motorista"
                chips={Object.values(USER_STATUS_META)}
              />
              <StatusRow
                label="Atraso (resolução)"
                chips={Object.values(DELAY_STATUS_META)}
              />
              <StatusRow
                label="Viagem do motorista"
                chips={Object.values(DRIVER_SCHEDULE_STATUS_META)}
              />
              <StatusRow
                label="Papel do usuário"
                chips={Object.values(USER_ROLE_META)}
              />
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Infra de tabela (PR7)">
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              AdminTable — linhas clicáveis (onRowClick)
            </p>
            <p className="text-muted-foreground text-xs">
              Tab até a linha + Enter/Espaço aciona; foco visível; cabeçalho
              ordenável com aria-sort.
            </p>
            <AdminTable
              columns={sampleColumns}
              data={sampleData}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => alert(`Linha: ${row.name}`)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              AdminTable — estática (sem onRowClick)
            </p>
            <AdminTable
              columns={sampleColumns}
              data={sampleData}
              keyExtractor={(row) => row.id}
            />
          </div>

          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              AdminTable — empty state
            </p>
            <AdminTable
              columns={sampleColumns}
              data={[]}
              keyExtractor={(row) => row.id}
              emptyState={
                <AdminEmptyState
                  icon={Users}
                  title="Nenhum registro"
                  description="Ajuste os filtros ou cadastre um novo item."
                />
              }
            />
          </div>

          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              AdminPagination — 0-indexed, "N–M de T"
            </p>
            <AdminPagination
              page={previewPage}
              perPage={10}
              total={87}
              onPageChange={setPreviewPage}
            />
          </div>

          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              SearchableSelect — combobox pesquisável (15 opções)
            </p>
            <SearchableSelect
              options={Array.from({ length: 15 }, (_, i) => ({
                value: `coop-${i + 1}`,
                label: `Cooperativa ${i + 1}`,
              }))}
              value={previewCoop}
              onChange={setPreviewCoop}
              allLabel="Todas as cooperativas"
              searchPlaceholder="Buscar cooperativa"
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Pickers de domínio (PR8)">
        <div className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                CooperativePicker — padrão (com "Todas")
              </p>
              <p className="text-muted-foreground text-xs">
                dados reais (React Query) + bolinha da cor da marca
              </p>
              <CooperativePicker value={coopPicker} onChange={setCoopPicker} />
            </div>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                CooperativePicker — sem "Todas" (allowAll=false)
              </p>
              <CooperativePicker
                value={coopPicker}
                onChange={setCoopPicker}
                allowAll={false}
              />
            </div>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                CooperativePicker — desabilitado
              </p>
              <CooperativePicker
                value="11111111-1111-4111-8111-111111111111"
                onChange={() => {}}
                disabled
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                WeekdayPicker — multi + presets
              </p>
              <WeekdayPicker
                value={weekMulti}
                onChange={setWeekMulti}
                presets
              />
            </div>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                WeekdayPicker — multi sem presets
              </p>
              <WeekdayPicker
                value={weekNoPreset}
                onChange={setWeekNoPreset}
                presets={false}
              />
            </div>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">
                WeekdayPicker — single
              </p>
              <WeekdayPicker
                value={weekSingle}
                onChange={setWeekSingle}
                mode="single"
              />
            </div>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Cooperativas admin (PR9)">
        <div className="space-y-8">
          {/* Painel de detalhes com dados mock — master-detail, 4 abas */}
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              Painel de detalhes (master-detail) — {previewCoopRich.name}
            </p>
            <p className="text-muted-foreground text-xs">
              4 abas navegáveis por teclado (setas). Geral consome
              GET&nbsp;/api/cooperatives/:id; Rotas/Motoristas/Atrasos consomem
              seus endpoints isolados por cooperative_id.
            </p>
            <div className="border-border rounded-xl border p-5">
              <CooperativeDetailPanel
                cooperative={previewCoopRich}
                activeTab={detailTab}
                onTabChange={setDetailTab}
                onEdit={() => alert('Editar cooperativa')}
              />
            </div>
          </div>

          {/* Aba Geral isolada — a lente criativa */}
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              Aba Geral isolada — {previewCoopGeneral.name}
            </p>
            <p className="text-muted-foreground text-xs">
              Identidade com brand_color, KPIs escalonados, padrão semanal,
              cidades atendidas, pontualidade e cancelamentos recentes.
            </p>
            <div className="border-border rounded-xl border p-5">
              <GeneralTab cooperative={previewCoopGeneral} />
            </div>
          </div>

          {/* Estados degradados */}
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">
              Estados degradados
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="border-border rounded-xl border p-4">
                <p className="text-muted-foreground mb-3 text-xs">
                  1 · Nenhuma cooperativa selecionada
                </p>
                <AdminEmptyState
                  icon={MousePointerClick}
                  title="Selecione uma cooperativa"
                  description="Escolha uma cooperativa na lista para ver o painel completo."
                />
              </div>
              <div className="border-border rounded-xl border p-4">
                <p className="text-muted-foreground mb-3 text-xs">
                  2 · Cooperativa sem rotas
                </p>
                <AdminEmptyState
                  icon={Plus}
                  title="Nenhuma rota cadastrada"
                  description="Esta cooperativa ainda não possui rotas."
                  action={{ label: 'Cadastrar rota', onClick: () => {}, icon: Plus }}
                />
              </div>
              <div className="border-border rounded-xl border p-4">
                <p className="text-muted-foreground mb-3 text-xs">
                  3 · Cooperativa sem motoristas
                </p>
                <AdminEmptyState
                  icon={Users}
                  title="Nenhum motorista vinculado"
                  description="Esta cooperativa ainda não possui motoristas cadastrados."
                />
              </div>
              <div className="border-border rounded-xl border p-4">
                <p className="text-muted-foreground mb-3 text-xs">
                  4 · Sem atrasos (boa notícia)
                </p>
                <AdminEmptyState
                  icon={CircleCheck}
                  title="Nenhum atraso registrado"
                  description="Sem atrasos nos últimos 30 dias. ✓"
                />
              </div>
            </div>
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Building2 className="h-3.5 w-3.5" />
              Em telas ≤md o layout vira stack: a lista ocupa a tela e, ao
              selecionar, o painel abre em tela cheia com botão de voltar.
              <RouteIcon className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Rotas admin (PR10)">
        <RoutesPr10Preview />
      </PreviewSection>

      <PreviewSection title="Horários admin (PR11)">
        <SchedulesPr11Preview />
      </PreviewSection>
    </div>
  )
}

// ── Rotas admin (PR10) ──────────────────────────────────────────────────────

const previewRoutes = [
  {
    id: 'preview-route-1',
    name: 'Expresso Norte',
    code: 'R-204',
    cooperative: 'Metro Transportes',
    brandColor: '#1A5FA8',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    status: 'active' as const,
    price: 30,
    driverName: 'João Silva',
  },
  {
    id: 'preview-route-2',
    name: 'Linha Sul Express',
    code: 'R-319',
    cooperative: 'Expresso São Francisco',
    brandColor: '#B91C1C',
    origin: 'Praça da Sé',
    destination: 'Aeroporto Int.',
    status: 'suspended' as const,
    price: 45,
    driverName: undefined,
  },
  {
    id: 'preview-route-3',
    name: 'Rota Noturna A',
    code: 'N-07',
    cooperative: 'Cooperativa Vale',
    brandColor: '#047857',
    origin: 'Campus Univ.',
    destination: 'Estação Metro',
    status: 'inactive' as const,
    price: 25,
    driverName: 'Marcus Antônio',
  },
]

const STATUS_BORDER_PREVIEW: Record<'active' | 'suspended' | 'inactive', string> = {
  active: 'border-l-emerald-500',
  suspended: 'border-l-amber-500',
  inactive: 'border-l-slate-400',
}

function RoutesPr10Preview() {
  const [view, setView] = useState<'grid' | 'table'>('grid')

  return (
    <div className="space-y-6">
      {/* Toggle Grid/Tabela em isolamento */}
      <div className="space-y-2">
        <p className="text-muted-foreground text-[12px]">
          Toggle Grid ↔ Tabela (persistido em <code>?view=</code>).
        </p>
        <div
          role="tablist"
          aria-label="Alternar visualização"
          className="border-border bg-background inline-flex items-center gap-0.5 rounded-md border p-0.5"
        >
          <button
            role="tab"
            aria-selected={view === 'grid'}
            aria-label="Grade"
            onClick={() => setView('grid')}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 text-xs font-medium transition-colors',
              'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
              view === 'grid'
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            role="tab"
            aria-selected={view === 'table'}
            aria-label="Tabela"
            onClick={() => setView('table')}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 text-xs font-medium transition-colors',
              'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
              view === 'table'
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Rows3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid — 3 status lado a lado */}
      {view === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {previewRoutes.map((r) => (
            <article
              key={r.id}
              className={cn(
                'bg-card border-border flex h-full flex-col gap-4 rounded-xl border border-l-4 p-5',
                STATUS_BORDER_PREVIEW[r.status],
                r.status === 'inactive' && 'opacity-70',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <StatusChip {...ROUTE_STATUS_META[r.status]} />
                  <div className="min-w-0">
                    <h3 className="text-foreground truncate text-base font-semibold">
                      {r.name}
                    </h3>
                    <p className="text-muted-foreground font-mono text-[11px]">
                      {r.code}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-foreground text-[13px] font-semibold tabular-nums">
                    R$ {r.price.toFixed(2)}
                  </span>
                  <AdminActionMenu
                    items={[
                      { label: 'Editar', icon: Pencil, onClick: () => {} },
                      { label: 'Duplicar', icon: Copy, onClick: () => {} },
                      {
                        label: 'Horários',
                        icon: CalendarDays,
                        onClick: () => {},
                      },
                      { divider: true, label: '', onClick: () => {} },
                      r.status === 'active'
                        ? {
                            label: 'Suspender',
                            icon: PowerOff,
                            onClick: () => {},
                            variant: 'danger',
                          }
                        : {
                            label: 'Reativar',
                            icon: PlayCircle,
                            onClick: () => {},
                          },
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: r.brandColor }}
                  />
                  <span className="text-muted-foreground truncate text-[12px]">
                    {r.cooperative}
                  </span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-[5px] h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="bg-border my-0.5 h-4 w-px" />
                    <span className="mb-[5px] h-2 w-2 rounded-full bg-red-500" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-foreground truncate leading-6">
                      {r.origin}
                    </p>
                    <p className="text-muted-foreground truncate leading-6">
                      {r.destination}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span
                    className={cn(
                      'truncate text-sm',
                      r.driverName
                        ? 'text-foreground'
                        : 'text-muted-foreground italic',
                    )}
                  >
                    {r.driverName ?? 'Sem motorista'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminTable
          columns={[
            {
              key: 'code',
              label: 'Código',
              width: '110px',
              render: (r) => (
                <span className="font-mono text-[13px]">{r.code}</span>
              ),
            },
            {
              key: 'name',
              label: 'Rota',
              render: (r) => (
                <div>
                  <p className="text-foreground font-medium">{r.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {r.origin} → {r.destination}
                  </p>
                </div>
              ),
            },
            {
              key: 'cooperative',
              label: 'Cooperativa',
              hideOnMobile: true,
              render: (r) => (
                <span className="text-foreground inline-flex items-center gap-2 text-[13px]">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: r.brandColor }}
                  />
                  {r.cooperative}
                </span>
              ),
            },
            {
              key: 'price',
              label: 'Preço',
              width: '110px',
              align: 'right',
              render: (r) => (
                <span className="font-medium tabular-nums">
                  R$ {r.price.toFixed(2)}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              width: '130px',
              render: (r) => <StatusChip {...ROUTE_STATUS_META[r.status]} />,
            },
          ]}
          data={previewRoutes}
          keyExtractor={(r) => r.id}
        />
      )}

      {/* Nota sobre duplicar */}
      <div className="border-border bg-muted/30 space-y-2 rounded-xl border p-4">
        <div className="text-foreground flex items-center gap-2 text-[13px] font-medium">
          <Copy className="h-4 w-4" />
          Ação Duplicar rota
        </div>
        <p className="text-muted-foreground text-[12px]">
          Clonar uma rota existente abre o drawer em modo criação com todos os
          campos pré-preenchidos, exceto:
        </p>
        <ul className="text-muted-foreground list-disc pl-6 text-[12px]">
          <li>
            <code className="font-mono">code</code> — sugerido como{' '}
            <code className="font-mono">&lt;source.code&gt;-COPY</code>{' '}
            (truncado a 12 chars, sufixos <code className="font-mono">-2</code>,{' '}
            <code className="font-mono">-3</code>… se colide). Editável.
          </li>
          <li>
            <code className="font-mono">status</code> — força{' '}
            <code className="font-mono">inactive</code> para evitar que a cópia
            entre em operação por acidente.
          </li>
        </ul>
      </div>
    </div>
  )
}

// ── Horários admin (PR11) ───────────────────────────────────────────────────

function SchedulesPr11Preview() {
  const [dupOpen, setDupOpen] = useState(false)

  const exceptions = [
    {
      type: 'rescheduled' as const,
      date: '18/04/2026',
      departureTime: '07:15',
      newDepartureTime: '09:15',
      reason: 'Alta demanda — saída adiada',
    },
    {
      type: 'cancelled' as const,
      date: '21/04/2026',
      departureTime: '06:30',
      reason: 'Feriado municipal em Petrolina',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Card de rota agrupada — layout do PR11 refinado */}
      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-foreground flex flex-wrap items-baseline gap-x-2 text-lg leading-tight font-bold">
            Rota R-204
            <span className="text-muted-foreground text-sm font-normal">
              Metro Transportes
            </span>
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Juazeiro → Petrolina · R$ 24,00
            </span>
            <span className="inline-flex min-h-9 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              <AlertTriangle className="h-3 w-3" />2 exceções abertas — próxima
              18/04/2026
            </span>
          </div>
        </div>

        <div className="border-t">
          {[
            { time: '06:30', tone: 'success' as const, label: 'Em operação' },
            { time: '07:15', tone: 'warning' as const, label: 'Atrasado' },
          ].map((s) => (
            <div
              key={s.time}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
            >
              <span className="text-info w-16 shrink-0 text-3xl leading-none font-bold">
                {s.time}
              </span>
              <div className="flex-1" />
              <StatusChip
                tone={s.tone}
                icon={s.tone === 'success' ? PlayCircle : AlertTriangle}
                label={s.label}
              />
            </div>
          ))}
        </div>

        {/* Bloco de horários temporários (serviço extra) diferenciado */}
        <div className="border-t">
          <div className="flex items-center gap-2 px-4 pt-2.5 pb-1">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              Serviços extras
            </p>
            <span className="text-muted-foreground text-[11px]">(1)</span>
          </div>
          <div className="flex items-center gap-3 border-l-[3px] border-l-amber-400 bg-amber-50/30 px-4 py-2.5">
            <span className="w-16 shrink-0 text-xl leading-none font-bold text-amber-700">
              10:00
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-xs font-medium">
                Alta demanda feriado
              </p>
              <p className="text-muted-foreground text-[11px]">19/04/2026</p>
            </div>
            <StatusChip tone="warning" icon={PlayCircle} label="Serviço extra" />
          </div>
        </div>
      </div>

      {/* Nota sobre badge + popover */}
      <div className="border-border bg-muted/30 space-y-2 rounded-xl border p-4">
        <div className="text-foreground flex items-center gap-2 text-[13px] font-medium">
          <AlertTriangle className="h-4 w-4" />
          Badge de exceções abertas — popover inline
        </div>
        <p className="text-muted-foreground text-[12px]">
          Clicar no badge <code className="font-mono">N exceções abertas</code>{' '}
          abre um popover listando cada exceção com data + tipo + horário +
          motivo. Não navega para outra página.
        </p>
        <div className="bg-card mt-2 rounded-lg border">
          <div className="border-b px-3 py-2">
            <p className="text-foreground text-[13px] font-semibold">
              Exceções da rota R-204
            </p>
            <p className="text-muted-foreground text-[11px]">
              2 ocorrências — clique para detalhes
            </p>
          </div>
          <ul>
            {exceptions.map((exc, i) => (
              <li
                key={i}
                className="border-b px-3 py-2.5 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                        exc.type === 'cancelled' &&
                          'border-red-300 bg-red-50 text-red-700',
                        exc.type === 'rescheduled' &&
                          'border-blue-300 bg-blue-50 text-blue-700',
                      )}
                    >
                      <AlertTriangle className="h-2.5 w-2.5" />
                      {exc.type === 'cancelled' ? 'Cancelado' : 'Reagendado'}
                    </span>
                    <span className="text-muted-foreground text-[11px] font-medium">
                      {exc.departureTime}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">
                    {exc.date}
                  </span>
                </div>
                <p className="text-foreground mt-1 text-[12px] leading-snug">
                  {exc.reason}
                </p>
                {exc.newDepartureTime && (
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Novo horário: {exc.newDepartureTime}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Nota sobre duplicar horário */}
      <div className="border-border bg-muted/30 space-y-2 rounded-xl border p-4">
        <div className="text-foreground flex items-center gap-2 text-[13px] font-medium">
          <Copy className="h-4 w-4" />
          Ação Duplicar horário
        </div>
        <p className="text-muted-foreground text-[12px]">
          Clonar um horário abre o modal em modo criação pré-preenchido, exceto:
        </p>
        <ul className="text-muted-foreground list-disc pl-6 text-[12px]">
          <li>
            <code className="font-mono">departureTime</code> — vazio: precisa
            ser único por rota+dia.
          </li>
          <li>
            <code className="font-mono">activeDays</code> — copiados do origem
            (multi).
          </li>
        </ul>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setDupOpen(true)}
        >
          <Copy className="h-3.5 w-3.5" />
          Abrir modal Duplicar horário
        </Button>
      </div>

      {/* Nota sobre AdminSchedule enriquecido */}
      <div className="border-border bg-muted/30 space-y-2 rounded-xl border p-4">
        <div className="text-foreground flex items-center gap-2 text-[13px] font-medium">
          <Info className="h-4 w-4" />
          Modelo enriquecido — <code className="font-mono">AdminSchedule</code>
        </div>
        <p className="text-muted-foreground text-[12px]">
          A partir do PR11 cada horário carrega{' '}
          <code className="font-mono">routeId</code> e{' '}
          <code className="font-mono">cooperativeId</code> (UUIDs) além do
          display <code className="font-mono">routeCode</code>. Filtros e
          navegação passam por id; o wizard de atraso quick recebe os ids
          direto do contexto e não depende mais do fallback via{' '}
          <code className="font-mono">routeCode</code>.
        </p>
      </div>

      {dupOpen &&
        (() => {
          const route = MOCK_ADMIN_ROUTES_PREVIEW[0]
          const source = route.schedules[0]
          return (
            <ScheduleFormDialog
              open
              onOpenChange={(v) => !v && setDupOpen(false)}
              mode="duplicate"
              routes={MOCK_ADMIN_ROUTES_PREVIEW}
              routeId={route.id}
              initialValues={{
                departureTime: '',
                activeDays: source.activeDays,
                notes: source.notes ?? '',
              }}
              onSubmit={() => setDupOpen(false)}
            />
          )
        })()}
    </div>
  )
}
