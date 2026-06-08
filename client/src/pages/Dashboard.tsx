'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  Star,
  AlertCircle,
} from 'lucide-react'
import { getAll } from '@/lib/storage'
import { formatDate, formatCurrency, calculateDays } from '@/lib/format'
import type { Quarto, Reserva, Pagamento, Avaliacao, Hospede, TipoQuarto } from '@/types'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [tiposQuarto, setTiposQuarto] = useState<TipoQuarto[]>([])

  useEffect(() => {
    setQuartos(getAll('hms_quartos'))
    setReservas(getAll('hms_reservas'))
    setPagamentos(getAll('hms_pagamentos'))
    setAvaliacoes(getAll('hms_avaliacoes'))
    setHospedes(getAll('hms_hospedes'))
    setTiposQuarto(getAll('hms_tipos_quarto'))
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Metrics
  const disponiveisCount = quartos.filter(q => q.status === 'disponivel').length
  const reservasAtivasCount = reservas.filter(r => r.status === 'confirmada').length
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const receitaMes = pagamentos
    .filter(p => {
      const date = new Date(p.dataPagamento || '')
      return p.status === 'aprovado' && date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, p) => sum + p.valor, 0)

  const avaliacaoMedia = avaliacoes.length > 0
    ? (avaliacoes.reduce((sum, a) => sum + a.notaGeral, 0) / avaliacoes.length).toFixed(1)
    : '0'

  // Charts data
  const reservasPorStatus = [
    { name: 'Confirmada', value: reservas.filter(r => r.status === 'confirmada').length },
    { name: 'Concluída', value: reservas.filter(r => r.status === 'concluida').length },
    { name: 'Cancelada', value: reservas.filter(r => r.status === 'cancelada').length },
  ]

  const quartosPorTipo = tiposQuarto.map(tipo => ({
    name: tipo.nome,
    value: quartos.filter(q => q.tipoQuartoId === tipo.id).length,
  }))

  const COLORS = ['#10b981', '#3b82f6', '#ef4444']

  // Próximas chegadas
  const proximasChegadas = reservas
    .filter(r => r.status === 'confirmada')
    .sort((a, b) => new Date(a.dataCheckinPrev).getTime() - new Date(b.dataCheckinPrev).getTime())
    .slice(0, 5)
    .map(reserva => {
      const hospede = hospedes.find(h => h.id === reserva.hospedeId)
      const quarto = quartos.find(q => q.id === reserva.quartoId)
      const tipo = tiposQuarto.find(t => t.id === quarto?.tipoQuartoId)
      const dias = calculateDays(reserva.dataCheckinPrev, reserva.dataCheckoutPrev)
      return { reserva, hospede, quarto, tipo, dias }
    })

  return (
    <Layout title="Dashboard">
      <PageHeader title="Dashboard" />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Quartos Disponíveis"
          value={disponiveisCount}
          icon={BedDouble}
          color="emerald"
        />
        <StatCard
          label="Reservas Ativas"
          value={reservasAtivasCount}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          label="Receita do Mês"
          value={formatCurrency(receitaMes)}
          icon={DollarSign}
          color="violet"
        />
        <StatCard
          label="Avaliação Média"
          value={avaliacaoMedia}
          icon={Star}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Reservas por Status */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-50 mb-4">Reservas por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservasPorStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="name" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                labelStyle={{ color: '#f4f4f5' }}
              />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quartos por Tipo */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-50 mb-4">Quartos por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={quartosPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {quartosPorTipo.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                labelStyle={{ color: '#f4f4f5' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Próximas Chegadas */}
      <Card className="bg-zinc-900 border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-50">Próximas Chegadas</h3>
        </div>
        {proximasChegadas.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={AlertCircle}
              title="Nenhuma chegada prevista"
              description="Não há reservas confirmadas para os próximos dias"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Hóspede</TableHead>
                <TableHead className="text-zinc-400">Quarto</TableHead>
                <TableHead className="text-zinc-400">Tipo</TableHead>
                <TableHead className="text-zinc-400">Check-in Previsto</TableHead>
                <TableHead className="text-zinc-400">Dias</TableHead>
                <TableHead className="text-zinc-400">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proximasChegadas.map(({ reserva, hospede, quarto, tipo, dias }) => (
                <TableRow key={reserva.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-50">{hospede?.nome}</TableCell>
                  <TableCell className="text-zinc-50">{quarto?.numero}</TableCell>
                  <TableCell className="text-zinc-50">{tipo?.nome}</TableCell>
                  <TableCell className="text-zinc-50">{formatDate(reserva.dataCheckinPrev)}</TableCell>
                  <TableCell className="text-zinc-50">{dias}</TableCell>
                  <TableCell className="text-zinc-50">{formatCurrency(reserva.valorTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </Layout>
  )
}
