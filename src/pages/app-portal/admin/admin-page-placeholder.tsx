import { Wrench } from 'lucide-react'

interface AdminPagePlaceholderProps {
  pageName: string
  description?: string
  expectedFeatures?: string[]
}

export function AdminPagePlaceholder({
  pageName,
  description,
  expectedFeatures,
}: AdminPagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-4 max-w-sm">
        <Wrench className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
        <p className="text-foreground mb-2 text-[15px] font-medium">
          {pageName} em desenvolvimento
        </p>
        {description && (
          <p className="text-muted-foreground mb-4 text-[13px] leading-relaxed">
            {description}
          </p>
        )}
        {expectedFeatures && expectedFeatures.length > 0 && (
          <div className="text-left">
            <p className="text-muted-foreground mb-2 text-[12px] font-medium">
              O que estará disponível:
            </p>
            <ul className="space-y-1">
              {expectedFeatures.map((feature) => (
                <li
                  key={feature}
                  className="text-muted-foreground flex items-start gap-2 text-[12px]"
                >
                  <span className="mt-0.5 leading-none">·</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
