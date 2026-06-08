import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="w-12 h-12 text-zinc-600 mb-4" />
      <h3 className="text-lg font-semibold text-zinc-50 mb-2">{title}</h3>
      <p className="text-zinc-400 text-center max-w-sm">{description}</p>
    </div>
  )
}
