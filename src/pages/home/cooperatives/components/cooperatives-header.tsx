type CooperativesHeaderProps = {
  cooperativeCount: number
  citiesServedCount: number
}

export function CooperativesHeader({ cooperativeCount, citiesServedCount }: CooperativesHeaderProps) {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-medium tracking-tight text-foreground">
        Cooperativas parceiras
      </h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        {cooperativeCount} {cooperativeCount === 1 ? 'cooperativa' : 'cooperativas'}
        {citiesServedCount > 0 && (
          <>
            {' · '}atendendo {citiesServedCount} {citiesServedCount === 1 ? 'cidade' : 'cidades'}
          </>
        )}
      </p>
    </div>
  )
}
