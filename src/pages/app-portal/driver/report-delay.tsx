import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { AdminSectionTitle } from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useDriverRoutes,
  useReportDelay,
} from '@/lib/api/mock-driver-portal-api'
import {
  type ReportDelaySchema,
  reportDelaySchema,
} from '@/lib/schemas/report-delay'

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Baixa — até 15 min' },
  { value: 'medium', label: 'Média — 15 a 30 min' },
  { value: 'high', label: 'Alta — acima de 30 min' },
] as const

export function DriverReportDelayPage() {
  const { data: routes = [], isLoading: routesLoading } = useDriverRoutes()
  const reportDelay = useReportDelay()

  const form = useForm<ReportDelaySchema>({
    resolver: zodResolver(reportDelaySchema),
    defaultValues: {
      routeId: '',
      delayMinutes: undefined,
      severity: undefined,
      reason: '',
    },
  })

  async function onSubmit(values: ReportDelaySchema) {
    const route = routes.find((r) => r.id === values.routeId)
    if (!route) return

    await reportDelay.mutateAsync({
      routeId: values.routeId,
      routeCode: route.code,
      routeName: route.name,
      delayMinutes: values.delayMinutes,
      severity: values.severity,
      reason: values.reason,
    })

    form.reset()
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <AdminSectionTitle
          title="Reportar atraso"
          description="Registre ocorrências em tempo real para que a cooperativa e o admin sejam notificados."
        />

        {routesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="routeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rota</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a rota" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routes.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.code} — {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delayMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atraso (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={999}
                          placeholder="Ex: 25"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value),
                            )
                          }
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Severidade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a severidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o motivo do atraso com detalhes suficientes para investigação..."
                        className="min-h-[96px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={reportDelay.isPending}>
                  <Send className="h-4 w-4" />
                  {reportDelay.isPending ? 'Enviando...' : 'Enviar reporte'}
                </Button>

                {form.formState.isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => form.reset()}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-amber-800 dark:text-amber-200">
              Importante
            </p>
            <p className="text-[13px] text-muted-foreground">
              Reportes falsos ou imprecisos podem impactar o desempenho da cooperativa.
              Informe apenas atrasos reais com o motivo correto.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
