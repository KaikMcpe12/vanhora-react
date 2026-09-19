import { AlertTriangle } from 'lucide-react'

import { AdminSectionTitle } from '@/components/admin'
import { DelayForm } from '@/components/delays/delay-form'

export function DriverReportDelayPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <AdminSectionTitle
          title="Reportar atraso"
          description="Registre ocorrências em tempo real para que a cooperativa e o admin sejam notificados."
        />

        {/* Sem contexto pré-selecionado → wizard de 3 passos (Rota → Horário → Detalhes). */}
        <DelayForm mode="wizard" />
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-amber-800 dark:text-amber-200">
              Importante
            </p>
            <p className="text-muted-foreground text-[13px]">
              Reportes falsos ou imprecisos podem impactar o desempenho da
              cooperativa. Informe apenas atrasos reais com o motivo correto.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
