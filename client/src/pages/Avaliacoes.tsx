'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { StarRating } from '@/components/StarRating'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { getAll } from '@/lib/storage'
import { formatDate } from '@/lib/format'
import type { Avaliacao, Hospede, Reserva, Quarto } from '@/types'

export default function Avaliacoes() {
  const [mounted, setMounted] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [quartos, setQuartos] = useState<Quarto[]>([])

  useEffect(() => {
    const avaliacoesData = getAll<Avaliacao>('hms_avaliacoes')
    const hospedesData = getAll<Hospede>('hms_hospedes')
    const reservasData = getAll<Reserva>('hms_reservas')
    const quartosData = getAll<Quarto>('hms_quartos')

    setAvaliacoes(avaliacoesData)
    setHospedes(hospedesData)
    setReservas(reservasData)
    setQuartos(quartosData)
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Calculate averages
  const mediaGeral = avaliacoes.length > 0
    ? (avaliacoes.reduce((sum, a) => sum + a.notaGeral, 0) / avaliacoes.length).toFixed(1)
    : '0'

  const mediaLimpeza = avaliacoes.length > 0
    ? (avaliacoes.reduce((sum, a) => sum + a.notaLimpeza, 0) / avaliacoes.length).toFixed(1)
    : '0'

  const mediaAtendimento = avaliacoes.length > 0
    ? (avaliacoes.reduce((sum, a) => sum + a.notaAtendimento, 0) / avaliacoes.length).toFixed(1)
    : '0'

  return (
    <Layout title="Avaliações">
      <PageHeader title="Avaliações" />

      {/* Média Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <p className="text-zinc-400 text-sm mb-2">Nota Geral Média</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-amber-400">{mediaGeral}</p>
            <StarRating rating={Math.round(parseFloat(mediaGeral))} readOnly />
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <p className="text-zinc-400 text-sm mb-2">Limpeza Média</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-amber-400">{mediaLimpeza}</p>
            <StarRating rating={Math.round(parseFloat(mediaLimpeza))} readOnly />
          </div>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <p className="text-zinc-400 text-sm mb-2">Atendimento Médio</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-amber-400">{mediaAtendimento}</p>
            <StarRating rating={Math.round(parseFloat(mediaAtendimento))} readOnly />
          </div>
        </Card>
      </div>

      {/* Avaliações */}
      {avaliacoes.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Nenhuma avaliação"
          description="Não há avaliações registradas ainda"
        />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {avaliacoes.map(avaliacao => {
            const hospede = hospedes.find(h => h.id === avaliacao.hospedeId)
            const reserva = reservas.find(r => r.id === avaliacao.reservaId)
            const quarto = quartos.find(q => q.id === reserva?.quartoId)

            return (
              <Card key={avaliacao.id} className="bg-zinc-900 border-zinc-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-50">{hospede?.nome}</h3>
                    <p className="text-zinc-400 text-sm">{formatDate(avaliacao.dataAvaliacao)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-1">
                    Quarto {quarto?.numero} • {formatDate(reserva?.dataCheckinPrev || '')} a{' '}
                    {formatDate(reserva?.dataCheckoutPrev || '')}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Geral</p>
                    <StarRating rating={avaliacao.notaGeral} readOnly />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Limpeza</p>
                    <StarRating rating={avaliacao.notaLimpeza} readOnly />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Atendimento</p>
                    <StarRating rating={avaliacao.notaAtendimento} readOnly />
                  </div>
                </div>

                {avaliacao.comentario && (
                  <p className="text-zinc-400 text-sm italic border-t border-zinc-800 pt-4">
                    "{avaliacao.comentario}"
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
