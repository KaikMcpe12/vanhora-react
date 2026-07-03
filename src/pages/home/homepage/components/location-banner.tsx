import { MapPin } from 'lucide-react'

type LocationBannerProps = {
  detectedCity: string
  onConfirm: () => void
  onAlter: () => void
}

export function LocationBanner({ detectedCity, onConfirm, onAlter }: LocationBannerProps) {
  return (
    <div className="animate-vh-banner-appear flex items-center justify-center gap-3 rounded-[var(--radius)] bg-vh-amber-bg px-4 py-2 text-[12px] text-vh-amber-text">
      <span className="flex items-center gap-1">
        <MapPin size={12} strokeWidth={1.75} className="shrink-0" />
        Detectamos que você está em <strong className="ml-0.5">{detectedCity}</strong>
      </span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-pointer underline underline-offset-2 hover:opacity-80"
          onClick={onConfirm}
        >
          confirmar
        </button>
        <span className="opacity-40">·</span>
        <button
          type="button"
          className="cursor-pointer underline underline-offset-2 hover:opacity-80"
          onClick={onAlter}
        >
          alterar
        </button>
      </span>
    </div>
  )
}
