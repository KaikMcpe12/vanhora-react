import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  CloudRain,
  Edit,
  Eye,
  Info,
  Plus,
  TrafficCone,
  Trash2,
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
  AdminSectionTitle,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { ChoiceChips } from '@/components/forms/choice-chips'
import { MinuteStepper } from '@/components/forms/minute-stepper'
import { SelectableCard } from '@/components/forms/selectable-card'
import { StepIndicator } from '@/components/forms/step-indicator'
import { StatusChip } from '@/components/status-chip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DELAY_STATUS_META,
  DRIVER_SCHEDULE_STATUS_META,
  ROUTE_STATUS_META,
  SCHEDULE_STATUS_META,
  type StatusChipInput,
  USER_ROLE_META,
  USER_STATUS_META,
} from '@/lib/status/status-meta'

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
    </div>
  )
}
