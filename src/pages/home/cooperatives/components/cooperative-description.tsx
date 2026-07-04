type CooperativeDescriptionProps = {
  description: string | null
}

export function CooperativeDescription({ description }: CooperativeDescriptionProps) {
  if (!description) return null

  return (
    <div className="rounded-[14px] border border-border/50 bg-card p-[20px_24px]">
      <h2 className="mb-3 text-[15px] font-medium text-foreground">Sobre a cooperativa</h2>
      <p className="max-w-[700px] text-[14px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
