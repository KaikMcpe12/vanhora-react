import { HeartOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/empty-state'

export function FavoritesEmptyState() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <EmptyState
        icon={HeartOff}
        title="Você ainda não tem favoritos"
        description="Salve horários das rotas que você mais usa para vê-los aqui rapidamente."
        action={{
          label: 'Explorar horários →',
          onClick: () => navigate('/schedules'),
          variant: 'default',
        }}
      />
    </div>
  )
}
