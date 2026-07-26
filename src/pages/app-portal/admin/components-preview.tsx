import { Edit, Plus, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminSectionTitle,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'

interface SampleRow {
  id: string
  name: string
  status: 'active' | 'suspended' | 'inactive'
  city: string
  routes: number
}

const sampleData: SampleRow[] = [
  { id: '1', name: 'Metro Transporters', status: 'active', city: 'Fortaleza', routes: 12 },
  { id: '2', name: 'Cooperativa Vale', status: 'suspended', city: 'Caucaia', routes: 5 },
  { id: '3', name: 'Swift Bus Co.', status: 'inactive', city: 'Maracanaú', routes: 0 },
]

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-foreground border-b border-border pb-2">{title}</h2>
      <div>{children}</div>
    </section>
  )
}

export function AdminComponentsPreviewPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [confirmOpen, setConfirmOpenState] = useState(false)
  const [typedConfirmOpen, setTypedConfirmOpen] = useState(false)
  const [sortState, setSortState] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>()
  const [showEmpty, setShowEmpty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
        <span className="font-medium text-foreground">{row.name}</span>
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
      render: (row) => {
        const variantMap = {
          active: 'success',
          suspended: 'attention',
          inactive: 'neutral',
        } as const
        const labelMap = {
          active: 'Ativo',
          suspended: 'Suspenso',
          inactive: 'Inativo',
        }
        return (
          <AdminStatusBadge
            variant={variantMap[row.status]}
            label={labelMap[row.status]}
          />
        )
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <AdminActionMenu
          items={[
            { label: 'Ver detalhes', icon: Eye, onClick: () => alert(`Ver ${row.name}`) },
            { label: 'Editar', icon: Edit, onClick: () => alert(`Editar ${row.name}`) },
            { divider: true, label: '', onClick: () => {} },
            { label: 'Excluir', icon: Trash2, onClick: () => setConfirmOpenState(true), variant: 'danger' },
          ]}
        />
      ),
    },
  ]

  const tableData = showEmpty ? [] : sampleData

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Componentes Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Referência visual dos componentes da biblioteca{' '}
          <code className="font-mono text-xs">src/components/admin/</code>
        </p>
      </div>

      <PreviewSection title="AdminKPICard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminKPICard
            label="Cooperativas Ativas"
            value="48"
            trend={{ value: '+3.2%', direction: 'up', contextLabel: 'com operação ativa' }}
          />
          <AdminKPICard
            label="Atrasos (24h)"
            value="14"
            trend={{ value: '+5', direction: 'up', contextLabel: 'vs período anterior' }}
            severity="critical"
          />
          <AdminKPICard
            label="Avaliação Média"
            value="4.6"
            trend={{ value: '-0.1', direction: 'down', contextLabel: 'esta semana' }}
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

      <PreviewSection title="AdminStatusBadge">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">sm (default)</p>
            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge variant="success" label="No Horário" />
              <AdminStatusBadge variant="attention" label="Atrasado" />
              <AdminStatusBadge variant="critical" label="Cancelado" />
              <AdminStatusBadge variant="neutral" label="Suspenso" />
              <AdminStatusBadge variant="info" label="Agendado" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">md</p>
            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge variant="success" label="Ativo" size="md" />
              <AdminStatusBadge variant="attention" label="Atenção" size="md" />
              <AdminStatusBadge variant="critical" label="Alta" size="md" />
              <AdminStatusBadge variant="neutral" label="Inativo" size="md" />
              <AdminStatusBadge variant="info" label="Baixa" size="md" />
            </div>
          </div>
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
            <p className="text-xs text-muted-foreground">Padrão</p>
            <AdminActionMenu
              items={[
                { label: 'Ver detalhes', icon: Eye, onClick: () => {} },
                { label: 'Editar', icon: Edit, onClick: () => {} },
              ]}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Com ação perigo</p>
            <AdminActionMenu
              items={[
                { label: 'Ver detalhes', icon: Eye, onClick: () => {} },
                { label: 'Editar', icon: Edit, onClick: () => {} },
                { divider: true, label: '', onClick: () => {} },
                { label: 'Excluir', icon: Trash2, onClick: () => {}, variant: 'danger' },
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
          onConfirm={() =>
            new Promise((resolve) => setTimeout(resolve, 1500))
          }
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
          onConfirm={() =>
            new Promise((resolve) => setTimeout(resolve, 1500))
          }
        />
      </PreviewSection>

      <PreviewSection title="AdminEmptyState">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border">
            <AdminEmptyState
              title="Nenhuma rota encontrada"
              description="Ajuste os filtros ou crie uma nova rota para começar."
              action={{ label: 'Nova rota', onClick: () => {}, icon: Plus }}
            />
          </div>
          <div className="rounded-xl border border-border">
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
    </div>
  )
}
