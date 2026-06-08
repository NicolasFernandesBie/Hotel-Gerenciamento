'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BedDouble, Users, CalendarCheck, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { getAll } from '@/lib/storage'
import { formatCurrency, formatDate, calculateDays } from '@/lib/format'
import type { Reserva, Hospede, Quarto, TipoQuarto, Pagamento } from '@/types'

const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b']

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [tipos, setTipos] = useState<TipoQuarto[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])

  useEffect(() => {
    setReservas(getAll<Reserva>('hms_reservas'))
    setHospedes(getAll<Hospede>('hms_hospedes'))
    setQuartos(getAll<Quarto>('hms_quartos'))
    setTipos(getAll<TipoQuarto>('hms_tipos_quarto'))
    setPagamentos(getAll<Pagamento>('hms_pagamentos'))
    setMounted(true)
  }, [])

  if (!mounted) return null

  const quartosDisponiveis = quartos.filter(q => q.status === 'disponivel').length
  const reservasAtivas = reservas.filter(r => r.status === 'confirmada').length
  const totalHospedes = hospedes.length
  const receitaTotal = pagamentos.filter(p => p.status === 'aprovado').reduce((sum, p) => sum + p.valor, 0)

  const reservasPorMes = Array.from({ length: 6 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - i)
    const monthStr = month.toLocaleString('pt-BR', { month: 'short' })
    const total = reservas.filter(r => {
      const created = new Date(r.criadoEm)
      return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear()
    }).reduce((sum, r) => sum + r.valorTotal, 0)
    return { name: monthStr, valor: total }
  }).reverse()

  const quartosPorTipo = tipos.map(t => {
    const qtd = quartos.filter(q => q.tipoQuartoId === t.id).length
    return { name: t.nome, value: qtd }
  })

  const proximasChegadas = reservas
    .filter(r => r.status === 'confirmada')
    .sort((a, b) => new Date(a.dataCheckinPrev).getTime() - new Date(b.dataCheckinPrev).getTime())
    .slice(0, 5)

  return (
    <>
      <PageHeader title="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Quartos Disponíveis" value={quartosDisponiveis} icon={BedDouble} color="emerald" />
        <StatCard label="Reservas Ativas" value={reservasAtivas} icon={CalendarCheck} color="blue" />
        <StatCard label="Total de Hóspedes" value={totalHospedes} icon={Users} color="violet" />
        <StatCard label="Receita Total" value={formatCurrency(receitaTotal)} icon={DollarSign} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-zinc-50 mb-4">Reservas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="valor" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-50 mb-4">Quartos por Tipo</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={quartosPorTipo} cx="50%" cy="45%" innerRadius={60} outerRadius={100} dataKey="value">
                {quartosPorTipo.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [value, name]} />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '13px', color: '#a1a1aa', paddingTop: '12px' }}
                formatter={(value: string) => (
                  <span style={{ color: '#e4e4e7' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-6 mt-6">
        <h3 className="text-lg font-semibold text-zinc-50 mb-4">Próximas Chegadas</h3>
        {proximasChegadas.length === 0 ? (
          <p className="text-zinc-400 text-center py-4">Nenhuma chegada prevista</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Hóspede</TableHead>
                <TableHead className="text-zinc-400">Quarto</TableHead>
                <TableHead className="text-zinc-400">Check-in</TableHead>
                <TableHead className="text-zinc-400">Check-out</TableHead>
                <TableHead className="text-zinc-400">Valor</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proximasChegadas.map(reserva => {
                const hospede = hospedes.find(h => h.id === reserva.hospedeId)
                const quarto = quartos.find(q => q.id === reserva.quartoId)
                const dias = calculateDays(reserva.dataCheckinPrev, reserva.dataCheckoutPrev)
                return (
                  <TableRow key={reserva.id} className="border-zinc-800">
                    <TableCell className="text-zinc-50">{hospede?.nome}</TableCell>
                    <TableCell className="text-zinc-50">{quarto?.numero}</TableCell>
                    <TableCell className="text-zinc-50">{formatDate(reserva.dataCheckinPrev)}</TableCell>
                    <TableCell className="text-zinc-50">{formatDate(reserva.dataCheckoutPrev)}</TableCell>
                    <TableCell className="text-zinc-50">{formatCurrency(reserva.valorTotal)}</TableCell>
                    <TableCell className="text-zinc-50">
                      <StatusBadge status={reserva.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  )
}
