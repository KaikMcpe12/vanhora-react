import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, FileText, Phone, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDriverProfile,
  useUpdateDriverProfile,
} from '@/lib/api/mock-driver-portal-api'

const driverProfileSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(8, 'Telefone inválido'),
})

type DriverProfileForm = z.infer<typeof driverProfileSchema>

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

function ReadOnlyField({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="rounded-md border bg-muted/30 px-3 py-2 text-[13px] text-foreground">
        {value}
      </p>
    </div>
  )
}

export function DriverProfilePage() {
  const { data: profile, isLoading } = useDriverProfile()
  const updateProfile = useUpdateDriverProfile()

  const form = useForm<DriverProfileForm>({
    resolver: zodResolver(driverProfileSchema),
    defaultValues: { name: '', phone: '' },
  })

  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name, phone: profile.phone })
    }
  }, [profile, form])

  async function onSubmit(values: DriverProfileForm) {
    await updateProfile.mutateAsync(values)
    toast.success('Alterações salvas.')
    form.reset(values)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <AdminSectionTitle
          title="Meu perfil"
          description="Dados pessoais e informações de habilitação."
        />

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="space-y-6">
            {/* campos editáveis */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          Nome completo
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
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
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          Telefone
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending || !form.formState.isDirty}
                  >
                    {updateProfile.isPending ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </form>
            </Form>

            {/* campos somente leitura */}
            <div className="space-y-3 border-t pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Informações fixas
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <ReadOnlyField
                  label="E-mail"
                  value={profile?.email ?? ''}
                  icon={User}
                />
                <ReadOnlyField
                  label="CNH"
                  value={profile ? `${profile.cnh} (Tipo ${profile.cnhType})` : ''}
                  icon={FileText}
                />
                <ReadOnlyField
                  label="Cooperativa"
                  value={profile?.cooperativeName ?? ''}
                  icon={Building2}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Para alterar e-mail, CNH ou cooperativa, entre em contato com o suporte.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
