type FavoritesHeaderProps = {
  favoriteCount: number
  distinctRoutesCount: number
}

export function FavoritesHeader({ favoriteCount, distinctRoutesCount }: FavoritesHeaderProps) {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-medium tracking-tight text-foreground">Seus favoritos</h1>
      <p className="mt-1.5 text-[13px] text-muted-foreground">
        {favoriteCount} {favoriteCount === 1 ? 'horário salvo' : 'horários salvos'}
        {distinctRoutesCount > 0 && (
          <>
            {' · '}em {distinctRoutesCount} {distinctRoutesCount === 1 ? 'rota diferente' : 'rotas diferentes'}
          </>
        )}
      </p>
    </div>
  )
}
