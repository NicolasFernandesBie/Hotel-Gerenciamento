'use client'

import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarCheck, Eye } from 'lucide-react'
import { getAll } from '@/lib/storage'
import { formatDate, formatCurrency, calculateDays } from '@/lib/format'
import type { Reserva, Hospede, Quarto, TipoQuarto } from '@/types'
import ReservaDialog from '@/components/ReservaDialog'

export default function Reservas() {
  const [, navigate] = useLocation()
  const [mounted, setMounted] = useState(false)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([])
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [tipos, setTipos] = useState<TipoQuarto[]>([])
  const [statusFilter, setStatusFilter] = useState<'todos' | 'confirmada' | 'concluida' | 'cancelada'>('todos')
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const reservasData = getAll<Reserva>('hms_reservas')
    const hospedesData = getAll<Hospede>('hms_hospedes')
    const quartosData = getAll<Quarto>('hms_quartos')
    const tiposData = getAll<TipoQuarto>('hms_tipos_quarto')

    setReservas(reservasData)
    setHospedes(hospedesData)
    setQuartos(quartosData)
    setTipos(tiposData)
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = reservas
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }
    setFilteredReservas(filtered)
  }, [statusFilter, reservas])

  if (!mounted) return null

  const handleReservaCreated = () => {
    const updatedReservas = getAll<Reserva>('hms_reservas')
    setReservas(updatedReservas)
    setOpenDialog(false)
  }

  return (
    <Layout title="Reservas">
      <PageHeader
        title="Reservas"
        action={{
          label: 'Nova Reserva',
          onClick: () => setOpenDialog(true),
        }}
      >
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <Card className="bg-zinc-900 border-zinc-800">
        {filteredReservas.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CalendarCheck}
              title="Nenhuma reserva encontrada"
              description="Comece criando uma nova reserva"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Hóspede</TableHead>
                <TableHead className="text-zinc-400">Quarto</TableHead>
                <TableHead className="text-zinc-400">Check-in</TableHead>
                <TableHead className="text-zinc-400">Check-out</TableHead>
                <TableHead className="text-zinc-400">Dias</TableHead>
                <TableHead className="text-zinc-400">Valor Total</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservas.map(reserva => {
                const hospede = hospedes.find(h => h.id === reserva.hospedeId)
                const quarto = quartos.find(q => q.id === reserva.quartoId)
                const dias = calculateDays(reserva.dataCheckinPrev, reserva.dataCheckoutPrev)

                return (
                  <TableRow key={reserva.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-50">{hospede?.nome}</TableCell>
                    <TableCell className="text-zinc-50">{quarto?.numero}</TableCell>
                    <TableCell className="text-zinc-50">{formatDate(reserva.dataCheckinPrev)}</TableCell>
                    <TableCell className="text-zinc-50">{formatDate(reserva.dataCheckoutPrev)}</TableCell>
                    <TableCell className="text-zinc-50">{dias}</TableCell>
                    <TableCell className="text-zinc-50">{formatCurrency(reserva.valorTotal)}</TableCell>
                    <TableCell className="text-zinc-50">
                      <StatusBadge status={reserva.status} />
                    </TableCell>
                    <TableCell className="text-zinc-50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/reservas/${reserva.id}`)}
                        className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <ReservaDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onReservaCreated={handleReservaCreated}
        hospedes={hospedes}
        quartos={quartos}
        tipos={tipos}
      />
    </Layout>
  )
}
