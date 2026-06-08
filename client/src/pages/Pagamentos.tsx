'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
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
import { CreditCard } from 'lucide-react'
import { getAll } from '@/lib/storage'
import { formatDate, formatCurrency } from '@/lib/format'
import type { Pagamento, Reserva, Hospede } from '@/types'

export default function Pagamentos() {
  const [mounted, setMounted] = useState(false)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [filteredPagamentos, setFilteredPagamentos] = useState<Pagamento[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'aprovado' | 'recusado'>('todos')

  useEffect(() => {
    const pagamentosData = getAll<Pagamento>('hms_pagamentos')
    const reservasData = getAll<Reserva>('hms_reservas')
    const hospedesData = getAll<Hospede>('hms_hospedes')

    setPagamentos(pagamentosData)
    setReservas(reservasData)
    setHospedes(hospedesData)
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = pagamentos
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }
    setFilteredPagamentos(filtered)
  }, [statusFilter, pagamentos])

  if (!mounted) return null

  const totalAprovado = pagamentos
    .filter(p => p.status === 'aprovado')
    .reduce((sum, p) => sum + p.valor, 0)

  const formaLabels: Record<string, string> = {
    cartao: 'Cartão',
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    boleto: 'Boleto',
  }

  return (
    <Layout title="Pagamentos">
      <PageHeader title="Pagamentos">
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="mb-6">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Total de Pagamentos Aprovados</p>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{formatCurrency(totalAprovado)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        {filteredPagamentos.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CreditCard}
              title="Nenhum pagamento encontrado"
              description="Não há pagamentos registrados para este filtro"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Reserva</TableHead>
                <TableHead className="text-zinc-400">Hóspede</TableHead>
                <TableHead className="text-zinc-400">Forma</TableHead>
                <TableHead className="text-zinc-400">Valor</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPagamentos.map(pagamento => {
                const reserva = reservas.find(r => r.id === pagamento.reservaId)
                const hospede = hospedes.find(h => h.id === reserva?.hospedeId)

                return (
                  <TableRow key={pagamento.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-50">{pagamento.reservaId.slice(0, 8)}</TableCell>
                    <TableCell className="text-zinc-50">{hospede?.nome}</TableCell>
                    <TableCell className="text-zinc-50">
                      {formaLabels[pagamento.formaPagamento] || pagamento.formaPagamento}
                    </TableCell>
                    <TableCell className="text-zinc-50">{formatCurrency(pagamento.valor)}</TableCell>
                    <TableCell className="text-zinc-50">
                      <StatusBadge status={pagamento.status} />
                    </TableCell>
                    <TableCell className="text-zinc-50">
                      {pagamento.dataPagamento ? formatDate(pagamento.dataPagamento) : '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </Layout>
  )
}
