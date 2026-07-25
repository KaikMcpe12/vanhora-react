import { Menu } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface AppPortalHeaderProps {
  breadcrumb: BreadcrumbItem[]
  actions?: React.ReactNode
  onOpenMobileMenu: () => void
}

export function AppPortalHeader({
  breadcrumb,
  actions,
  onOpenMobileMenu,
}: AppPortalHeaderProps) {
  const currentItem = breadcrumb.at(-1)

  return (
    <header className="bg-card border-border sticky top-0 z-40 flex h-16 items-center justify-between border-b px-6 md:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0 lg:hidden"
          onClick={onOpenMobileMenu}
        >
          <span className="sr-only">Abrir menu</span>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="text-foreground truncate text-xl font-medium leading-tight md:text-2xl">
            {currentItem?.label}
          </h1>
          {breadcrumb.length > 1 && (
            <nav
              aria-label="breadcrumb"
              className="mt-0.5 flex items-center gap-1 text-[11px]"
            >
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1
                return (
                  <Fragment key={item.label}>
                    {index > 0 && (
                      <span className="text-muted-foreground select-none">
                        ·
                      </span>
                    )}
                    {item.href && !isLast ? (
                      <Link
                        to={item.href}
                        className={cn(
                          'transition-colors',
                          'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={
                          isLast
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      >
                        {item.label}
                      </span>
                    )}
                  </Fragment>
                )
              })}
            </nav>
          )}
        </div>
      </div>

      {actions && <div className="ml-4 flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
