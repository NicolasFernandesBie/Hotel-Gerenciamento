'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Receipt } from 'lucide-react'
import { getAll } from '@/lib/storage'
import { formatDate, formatCurrency } from '@/lib/format'
import type { Consumo, Reserva, Hospede, Servico } from '@/types'

export default function Consumos() {
  const [mounted, setMounted] = useState(false)
  const [consumos, setConsumos] = useState<Consumo[]>([])
  const [filteredConsumos, setFilteredConsumos] = useState<Consumo[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [monthFilter, setMonthFilter] = useState<string>('')

  useEffect(() => {
    const consumosData = getAll<Consumo>('hms_consumos')
    const reservasData = getAll<Reserva>('hms_reservas')
    const hospedesData = getAll<Hospede>('hms_hospedes')
    const servicosData = getAll<Servico>('hms_servicos')

    setConsumos(consumosData)
    setReservas(reservasData)
    setHospedes(hospedesData)
    setServicos(servicosData)

    // Set default month to current month
    const now = new Date()
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setMonthFilter(defaultMonth)

    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = consumos
    if (monthFilter) {
      filtered = filtered.filter(c => {
        const date = new Date(c.dataHora)
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return month === monthFilter
      })
    }
    setFilteredConsumos(filtered)
  }, [monthFilter, consumos])

  if (!mounted) return null

  const totalConsumos = filteredConsumos.reduce((sum, c) => sum + c.valorTotal, 0)

  return (
    <Layout title="Consumos">
      <PageHeader title="Consumos">
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date()
              date.setMonth(date.getMonth() - i)
              const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
              return (
                <SelectItem key={month} value={month}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </PageHeader>

      <Card className="bg-zinc-900 border-zinc-800">
        {filteredConsumos.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Receipt}
              title="Nenhum consumo encontrado"
              description="Não há consumos registrados para este período"
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Reserva</TableHead>
                  <TableHead className="text-zinc-400">Hóspede</TableHead>
                  <TableHead className="text-zinc-400">Serviço</TableHead>
                  <TableHead className="text-zinc-400">Quantidade</TableHead>
                  <TableHead className="text-zinc-400">Valor Total</TableHead>
                  <TableHead className="text-zinc-400">Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsumos.map(consumo => {
                  const reserva = reservas.find(r => r.id === consumo.reservaId)
                  const hospede = hospedes.find(h => h.id === reserva?.hospedeId)
                  const servico = servicos.find(s => s.id === consumo.servicoId)

                  return (
                    <TableRow key={consumo.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-zinc-50">{consumo.reservaId.slice(0, 8)}</TableCell>
                      <TableCell className="text-zinc-50">{hospede?.nome}</TableCell>
                      <TableCell className="text-zinc-50">{servico?.nome}</TableCell>
                      <TableCell className="text-zinc-50">{consumo.quantidade}</TableCell>
                      <TableCell className="text-zinc-50">{formatCurrency(consumo.valorTotal)}</TableCell>
                      <TableCell className="text-zinc-50">{formatDate(consumo.dataHora)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <div className="p-6 border-t border-zinc-800 flex justify-end">
              <div className="text-right">
                <p className="text-zinc-400 text-sm">Subtotal:</p>
                <p className="text-2xl font-bold text-zinc-50">{formatCurrency(totalConsumos)}</p>
              </div>
            </div>
          </>
        )}
      </Card>
    </Layout>
  )
}
