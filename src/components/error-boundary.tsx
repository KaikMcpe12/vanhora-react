import { AlertTriangle, House, RefreshCw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/button'

// ─── Shared visual shell ──────────────────────────────────────────────────────

interface ErrorShellProps {
  code?: string | number
  title: string
  description: string
  detail?: string
  actions: ReactNode
}

function ErrorShell({ code, title, description, detail, actions }: ErrorShellProps) {
  return (
    <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8">
      {/* Glow decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="from-primary/15 to-primary/5 absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-r blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {code ? (
          <span className="text-muted-foreground/40 text-9xl font-black tabular-nums">
            {code}
          </span>
        ) : (
          <AlertTriangle
            size={64}
            strokeWidth={1.25}
            className="text-warning text-amber-500"
          />
        )}

        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-base">{description}</p>
        </div>

        {/* Stack trace em dev — não expõe em produção */}
        {detail && import.meta.env.DEV && (
          <pre className="bg-muted text-muted-foreground max-w-lg overflow-x-auto rounded-lg border border-border p-4 text-left text-xs">
            {detail}
          </pre>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
      </div>
    </div>
  )
}

// ─── RouteErrorElement (usado em errorElement das rotas) ──────────────────────

export function RouteErrorElement() {
  const error = useRouteError()
  const navigate = useNavigate()

  if (isRouteErrorResponse(error)) {
    const map: Record<number, { title: string; description: string }> = {
      404: {
        title: 'Página não encontrada',
        description: 'Essa rota não faz parte do nosso trajeto.',
      },
      403: {
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar esta página.',
      },
      500: {
        title: 'Erro no servidor',
        description: 'Ocorreu um problema inesperado. Tente novamente em instantes.',
      },
    }

    const content = map[error.status] ?? {
      title: `Erro ${error.status}`,
      description: error.statusText || 'Algo saiu errado.',
    }

    return (
      <ErrorShell
        code={error.status}
        {...content}
        actions={
          <>
            <Button onClick={() => navigate('/')} className="gap-2 font-semibold">
              <House className="h-4 w-4" />
              Ir para o início
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="font-semibold">
              Voltar
            </Button>
          </>
        }
      />
    )
  }

  // Erro JS inesperado capturado pelo react-router
  const message =
    error instanceof Error ? error.message : 'Erro desconhecido.'
  const stack = error instanceof Error ? (error.stack ?? undefined) : undefined

  return (
    <ErrorShell
      title="Algo saiu errado"
      description="Ocorreu um erro inesperado nesta página."
      detail={stack ?? message}
      actions={
        <>
          <Button
            onClick={() => window.location.reload()}
            className="gap-2 font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="font-semibold">
            <House className="h-4 w-4 mr-2" />
            Ir para o início
          </Button>
        </>
      }
    />
  )
}

// ─── AppErrorBoundary (captura erros JS fora do react-router) ─────────────────

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  error: Error | null
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: enviar para Sentry quando disponível
    // Sentry.captureException(error, { extra: info })
    if (import.meta.env.DEV) {
      console.error('[AppErrorBoundary]', error, info)
    }
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorShell
          title="Algo saiu errado"
          description="Ocorreu um erro inesperado. Recarregue a página ou volte ao início."
          detail={this.state.error.stack ?? this.state.error.message}
          actions={
            <>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2.5 font-semibold transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Recarregar
              </button>
              <button
                onClick={() => {
                  this.setState({ error: null })
                  window.location.href = '/'
                }}
                className="border-border hover:bg-accent flex items-center gap-2 rounded-lg border px-6 py-2.5 font-semibold transition-colors"
              >
                <House className="h-4 w-4" />
                Ir para o início
              </button>
            </>
          }
        />
      )
    }

    return this.props.children
  }
}
