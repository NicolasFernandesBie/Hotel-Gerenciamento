import { Badge } from '@/components/ui/badge'

type Status =
  | 'confirmada'
  | 'concluida'
  | 'cancelada'
  | 'disponivel'
  | 'ocupado'
  | 'manutencao'
  | 'pendente'
  | 'aprovado'
  | 'recusado'

interface StatusBadgeProps {
  status: Status
}

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  confirmada: {
    bg: 'bg-blue-900/50',
    text: 'text-blue-300',
    label: 'Confirmada',
  },
  concluida: {
    bg: 'bg-emerald-900/50',
    text: 'text-emerald-300',
    label: 'Concluída',
  },
  cancelada: {
    bg: 'bg-red-900/50',
    text: 'text-red-300',
    label: 'Cancelada',
  },
  disponivel: {
    bg: 'bg-emerald-900/50',
    text: 'text-emerald-300',
    label: 'Disponível',
  },
  ocupado: {
    bg: 'bg-red-900/50',
    text: 'text-red-300',
    label: 'Ocupado',
  },
  manutencao: {
    bg: 'bg-amber-900/50',
    text: 'text-amber-300',
    label: 'Manutenção',
  },
  pendente: {
    bg: 'bg-amber-900/50',
    text: 'text-amber-300',
    label: 'Pendente',
  },
  aprovado: {
    bg: 'bg-emerald-900/50',
    text: 'text-emerald-300',
    label: 'Aprovado',
  },
  recusado: {
    bg: 'bg-red-900/50',
    text: 'text-red-300',
    label: 'Recusado',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge className={`${config.bg} ${config.text} border border-current`}>
      {config.label}
    </Badge>
  )
}
