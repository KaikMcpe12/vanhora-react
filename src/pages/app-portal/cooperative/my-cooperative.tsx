import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  Clock3,
  Globe,
  Phone,
  Route,
  Save,
  Star,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AdminKPICard, AdminSectionTitle } from '@/components/admin'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useCoopPortalStats,
  useCoopProfile,
  useUpdateCoopProfile,
} from '@/lib/api/mock-cooperative-portal-api'
import { MOCK_COOP_PORTAL_USER_ID } from '@/lib/data/mock-cooperative-portal'

const coopProfileSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(8, 'Telefone inválido'),
  site: z.string().url('URL inválida').or(z.literal('')),
  description: z.string().max(500, 'Máximo 500 caracteres'),
})

type CoopProfileForm = z.infer<typeof coopProfileSchema>

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

export function CooperativeMyCooperativePage() {
  const { data: profile, isLoading } = useCoopProfile(MOCK_COOP_PORTAL_USER_ID)
  const updateProfile = useUpdateCoopProfile(MOCK_COOP_PORTAL_USER_ID)
  const { data: stats } = useCoopPortalStats()

  const form = useForm<CoopProfileForm>({
    resolver: zodResolver(coopProfileSchema),
    defaultValues: {
      name: '',
      phone: '',
      site: '',
      description: '',
    },
  })

  // preenche o form quando os dados chegam
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        phone: profile.phone,
        site: profile.site ?? '',
        description: profile.description ?? '',
      })
    }
  }, [profile, form])

  async function onSubmit(values: CoopProfileForm) {
    await updateProfile.mutateAsync(values)
    toast.success('Dados da cooperativa atualizados')
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <AdminSectionTitle
          title="Visão geral"
          description="Resumo da sua cooperativa"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: 'Total de rotas',
              value: stats?.activeRoutes ?? 0,
              icon: Route,
            },
            {
              label: 'Motoristas ativos',
              value: stats?.totalDrivers ?? 0,
              icon: Users,
            },
            {
              label: 'Horários ativos',
              value: stats?.schedulesToday ?? 0,
              icon: Clock3,
            },
            {
              label: 'Avaliação média',
              value: stats?.avgRating ?? 0,
              icon: Star,
            },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <AdminKPICard label={k.label} value={k.value} icon={k.icon} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <AdminSectionTitle
          title="Dados da cooperativa"
          description="Informações exibidas publicamente para passageiros e administradores."
        />

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Building2 className="text-muted-foreground h-3.5 w-3.5" />
                        Nome da cooperativa
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nome oficial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="text-muted-foreground h-3.5 w-3.5" />
                        Telefone de contato
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="site"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-1.5">
                        <Globe className="text-muted-foreground h-3.5 w-3.5" />
                        Site oficial
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://suacooperativa.com.br"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a cooperativa para os passageiros..."
                        className="min-h-[96px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending || !form.formState.isDirty}
                >
                  <Save className="h-4 w-4" />
                  {updateProfile.isPending
                    ? 'Salvando...'
                    : 'Salvar alterações'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </section>

      {profile && (
        <section className="space-y-3 border-t pt-6">
          <p className="text-muted-foreground text-xs">
            Cadastrada em{' '}
            {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </section>
      )}
    </div>
  )
}
