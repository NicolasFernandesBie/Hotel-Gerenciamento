import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: 'emerald' | 'blue' | 'violet' | 'amber'
}

const colorClasses = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
  amber: 'text-amber-400',
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-zinc-50 mt-2">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${colorClasses[color]} opacity-80`} />
      </div>
    </Card>
  )
}
