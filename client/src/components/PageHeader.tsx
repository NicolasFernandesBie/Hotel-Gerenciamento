import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function PageHeader({ title, action, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-zinc-50">{title}</h1>
      <div className="flex items-center gap-4">
        {children}
        {action && (
          <Button onClick={action.onClick} className="bg-zinc-100 text-zinc-900 hover:bg-white">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
