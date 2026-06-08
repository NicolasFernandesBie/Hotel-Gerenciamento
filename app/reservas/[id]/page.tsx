'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { StarRating } from '@/components/StarRating'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { getAll, save, update, remove } from '@/lib/storage'
import { formatDate, formatDateTime, formatCurrency, calculateDays } from '@/lib/format'
import type {
  Reserva,
  Hospede,
  Quarto,
  TipoQuarto,
  Funcionario,
  CheckinCheckout,
  Pagamento,
  Consumo,
  Servico,
  Avaliacao,
} from '@/types'

export default function ReservaDetailPage() {
  const params = useParams<{ id: string }>()
  const [mounted, setMounted] = useState(false)
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [hospede, setHospede] = useState<Hospede | null>(null)
  const [quarto, setQuarto] = useState<Quarto | null>(null)
  const [tipo, setTipo] = useState<TipoQuarto | null>(null)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [checkinCheckout, setCheckinCheckout] = useState<CheckinCheckout | null>(null)
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [consumos, setConsumos] = useState<Consumo[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])

  const [openCheckinDialog, setOpenCheckinDialog] = useState(false)
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false)
  const [openPagamentoDialog, setOpenPagamentoDialog] = useState(false)
  const [openConsumoDialog, setOpenConsumoDialog] = useState(false)
  const [openAvaliacaoDialog, setOpenAvaliacaoDialog] = useState(false)

  const [checkinFuncionarioId, setCheckinFuncionarioId] = useState('')
  const [checkinObservacoes, setCheckinObservacoes] = useState('')
  const [checkoutObservacoes, setCheckoutObservacoes] = useState('')
  const [pagamentoValor, setPagamentoValor] = useState('')
  const [pagamentoForma, setPagamentoForma] = useState('')
  const [consumoServicoId, setConsumoServicoId] = useState('')
  const [consumoQuantidade, setConsumoQuantidade] = useState('')
  const [consumoFuncionarioId, setConsumoFuncionarioId] = useState('')

  const [notaGeral, setNotaGeral] = useState(0)
  const [notaLimpeza, setNotaLimpeza] = useState(0)
  const [notaAtendimento, setNotaAtendimento] = useState(0)
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('')

  useEffect(() => {
    const reservaId = params?.id
    const reservaData = getAll<Reserva>('hms_reservas').find(r => r.id === reservaId)

    if (!reservaData) return

    const hospedeData = getAll<Hospede>('hms_hospedes').find(h => h.id === reservaData.hospedeId)
    const quartoData = getAll<Quarto>('hms_quartos').find(q => q.id === reservaData.quartoId)
    const tipoData = getAll<TipoQuarto>('hms_tipos_quarto').find(t => t.id === quartoData?.tipoQuartoId)
    const funcionariosData = getAll<Funcionario>('hms_funcionarios')
    const checkinData = getAll<CheckinCheckout>('hms_checkins').find(c => c.reservaId === reservaId)
    const pagamentosData = getAll<Pagamento>('hms_pagamentos').filter(p => p.reservaId === reservaId)
    const consumosData = getAll<Consumo>('hms_consumos').filter(c => c.reservaId === reservaId)
    const servicosData = getAll<Servico>('hms_servicos')
    const avaliacoesData = getAll<Avaliacao>('hms_avaliacoes').filter(a => a.reservaId === reservaId)

    setReserva(reservaData)
    setHospede(hospedeData || null)
    setQuarto(quartoData || null)
    setTipo(tipoData || null)
    setFuncionarios(funcionariosData)
    setCheckinCheckout(checkinData || null)
    setPagamentos(pagamentosData)
    setConsumos(consumosData)
    setServicos(servicosData)
    setAvaliacoes(avaliacoesData)

    if (avaliacoesData.length > 0) {
      const avaliacao = avaliacoesData[0]
      setNotaGeral(avaliacao.notaGeral)
      setNotaLimpeza(avaliacao.notaLimpeza)
      setNotaAtendimento(avaliacao.notaAtendimento)
      setComentarioAvaliacao(avaliacao.comentario || '')
    }

    setMounted(true)
  }, [params?.id])

  if (!mounted || !reserva || !hospede || !quarto || !tipo) return null

  const dias = calculateDays(reserva.dataCheckinPrev, reserva.dataCheckoutPrev)
  const valorConsumos = consumos.reduce((sum, c) => sum + c.valorTotal, 0)
  const valorPago = pagamentos.filter(p => p.status === 'aprovado').reduce((sum, p) => sum + p.valor, 0)
  const saldoDevedor = reserva.valorTotal - valorPago

  const handleCheckin = () => {
    if (!checkinFuncionarioId) {
      alert('Selecione um funcionário')
      return
    }
    const newCheckin: CheckinCheckout = {
      id: crypto.randomUUID(),
      reservaId: reserva.id,
      funcionarioId: checkinFuncionarioId,
      dataCheckin: new Date().toISOString(),
      dataCheckout: null,
      observacoes: checkinObservacoes,
    }
    save('hms_checkins', newCheckin)
    update('hms_quartos', { ...quarto, status: 'ocupado' })
    setCheckinCheckout(newCheckin)
    setCheckinFuncionarioId('')
    setCheckinObservacoes('')
    setOpenCheckinDialog(false)
  }

  const handleCheckout = () => {
    if (!checkinCheckout) return
    if (saldoDevedor > 0) {
      alert(`Não é possível concluir o check-out. Saldo devedor pendente: ${formatCurrency(saldoDevedor)}`)
      return
    }
    const updated = {
      ...checkinCheckout,
      dataCheckout: new Date().toISOString(),
      observacoes: checkoutObservacoes,
    }
    update('hms_checkins', updated)
    update('hms_quartos', { ...quarto, status: 'disponivel' })
    update('hms_reservas', { ...reserva, status: 'concluida' })
    setCheckinCheckout(updated)
    setReserva({ ...reserva, status: 'concluida' })
    setCheckoutObservacoes('')
    setOpenCheckoutDialog(false)
  }

  const handlePagamento = () => {
    if (!pagamentoValor || !pagamentoForma) {
      alert('Preencha todos os campos')
      return
    }
    const valor = parseFloat(pagamentoValor)
    if (valor > saldoDevedor) {
      alert(`O valor do pagamento (R$ ${valor.toFixed(2)}) excede o saldo devedor (R$ ${saldoDevedor.toFixed(2)})`)
      return
    }
    const newPagamento: Pagamento = {
      id: crypto.randomUUID(),
      reservaId: reserva.id,
      valor,
      formaPagamento: pagamentoForma,
      status: 'aprovado',
      dataPagamento: new Date().toISOString(),
      codigoTransacao: 'TRX-' + Math.random().toString(36).substring(7).toUpperCase(),
    }
    save('hms_pagamentos', newPagamento)
    setPagamentos([...pagamentos, newPagamento])
    setPagamentoValor('')
    setPagamentoForma('')
    setOpenPagamentoDialog(false)
  }

  const handleConsumo = () => {
    if (!consumoServicoId || !consumoQuantidade || !consumoFuncionarioId) {
      alert('Preencha todos os campos')
      return
    }
    if (!checkinCheckout || checkinCheckout.dataCheckout) {
      alert('Consumo só pode ser registrado durante hospedagem ativa (entre check-in e check-out)')
      return
    }
    const servico = servicos.find(s => s.id === consumoServicoId)
    if (!servico) return

    const newConsumo: Consumo = {
      id: crypto.randomUUID(),
      reservaId: reserva.id,
      servicoId: consumoServicoId,
      funcionarioId: consumoFuncionarioId,
      quantidade: parseInt(consumoQuantidade),
      valorTotal: parseInt(consumoQuantidade) * servico.precoUnitario,
      dataHora: new Date().toISOString(),
    }
    save('hms_consumos', newConsumo)
    const novoValorTotal = reserva.valorTotal + newConsumo.valorTotal
    update('hms_reservas', { ...reserva, valorTotal: novoValorTotal })
    setConsumos([...consumos, newConsumo])
    setReserva({ ...reserva, valorTotal: novoValorTotal })
    setConsumoServicoId('')
    setConsumoQuantidade('')
    setConsumoFuncionarioId('')
    setOpenConsumoDialog(false)
  }

  const handleRemoveConsumo = (consumoId: string) => {
    const consumo = consumos.find(c => c.id === consumoId)
    if (!consumo) return

    remove('hms_consumos', consumoId)
    const novoValorTotal = reserva.valorTotal - consumo.valorTotal
    update('hms_reservas', { ...reserva, valorTotal: novoValorTotal })
    setConsumos(consumos.filter(c => c.id !== consumoId))
    setReserva({ ...reserva, valorTotal: novoValorTotal })
  }

  const handleAvaliacao = () => {
    if (notaGeral === 0 || notaLimpeza === 0 || notaAtendimento === 0) {
      alert('Por favor, preencha todas as notas')
      return
    }

    const newAvaliacao: Avaliacao = {
      id: crypto.randomUUID(),
      reservaId: reserva.id,
      hospedeId: hospede.id,
      notaGeral,
      notaLimpeza,
      notaAtendimento,
      comentario: comentarioAvaliacao,
      dataAvaliacao: new Date().toISOString(),
    }
    save('hms_avaliacoes', newAvaliacao)
    setAvaliacoes([newAvaliacao])
    setOpenAvaliacaoDialog(false)
  }

  const consumoPreview = (parseInt(consumoQuantidade) || 0) * (servicos.find(s => s.id === consumoServicoId)?.precoUnitario || 0)

  const resetCheckinForm = () => {
    setCheckinFuncionarioId('')
    setCheckinObservacoes('')
  }

  const resetCheckoutForm = () => {
    setCheckoutObservacoes('')
  }

  const resetPagamentoForm = () => {
    setPagamentoValor('')
    setPagamentoForma('')
  }

  const resetConsumoForm = () => {
    setConsumoServicoId('')
    setConsumoQuantidade('')
    setConsumoFuncionarioId('')
  }

  return (
    <>
      <PageHeader title={`Reserva #${reserva.id.slice(0, 8)}`} />

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Informações da Reserva */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">Informações da Reserva</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Hóspede:</span>
                <span className="text-zinc-50">{hospede.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Quarto:</span>
                <span className="text-zinc-50">{quarto.numero} ({tipo.nome})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Período:</span>
                <span className="text-zinc-50">
                  {formatDate(reserva.dataCheckinPrev)} a {formatDate(reserva.dataCheckoutPrev)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Dias:</span>
                <span className="text-zinc-50">{dias}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status:</span>
                <StatusBadge status={reserva.status} />
              </div>
            </div>
          </Card>

          {/* Movimentação */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">Movimentação</h3>
            <div className="space-y-3">
              {!checkinCheckout && reserva.status === 'confirmada' ? (
                <div className="space-y-2">
                  <Button
                    onClick={() => setOpenCheckinDialog(true)}
                    className="w-full bg-zinc-100 text-zinc-900 hover:bg-white"
                  >
                    Registrar Check-in
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
                        const updated = { ...reserva, status: 'cancelada' as const }
                        update('hms_reservas', updated)
                        setReserva(updated)
                      }
                    }}
                    variant="outline"
                    className="w-full border-red-800 text-red-400 hover:bg-red-900/30"
                  >
                    Cancelar Reserva
                  </Button>
                </div>
              ) : !checkinCheckout && reserva.status === 'cancelada' ? (
                <p className="text-zinc-400 text-center py-4">Reserva cancelada</p>
              ) : !checkinCheckout ? (
                <p className="text-zinc-400 text-center py-4">Check-in indisponível para reserva {reserva.status}</p>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Check-in:</span>
                    <span className="text-zinc-50">{formatDateTime(checkinCheckout.dataCheckin!)}</span>
                  </div>
                  {!checkinCheckout.dataCheckout ? (
                    <Button
                      onClick={() => setOpenCheckoutDialog(true)}
                      className="w-full bg-zinc-100 text-zinc-900 hover:bg-white"
                    >
                      Registrar Check-out
                    </Button>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Check-out:</span>
                      <span className="text-zinc-50">{formatDateTime(checkinCheckout.dataCheckout!)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Pagamentos */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-50">Pagamentos</h3>
              <Button
                onClick={() => setOpenPagamentoDialog(true)}
                size="sm"
                className="bg-zinc-100 text-zinc-900 hover:bg-white"
              >
                Registrar Pagamento
              </Button>
            </div>
            {pagamentos.length === 0 ? (
              <p className="text-zinc-400 text-center py-4">Nenhum pagamento registrado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Forma</TableHead>
                    <TableHead className="text-zinc-400">Valor</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentos.map(p => (
                    <TableRow key={p.id} className="border-zinc-800">
                      <TableCell className="text-zinc-50 capitalize">{p.formaPagamento}</TableCell>
                      <TableCell className="text-zinc-50">{formatCurrency(p.valor)}</TableCell>
                      <TableCell className="text-zinc-50">
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-zinc-50">
                        {p.dataPagamento ? formatDate(p.dataPagamento) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Valor Pago:</span>
                <span className="text-zinc-50">{formatCurrency(valorPago)}</span>
              </div>
              <div className="flex justify-between text-zinc-50 font-semibold">
                <span>Saldo Devedor:</span>
                <span className={saldoDevedor > 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {formatCurrency(saldoDevedor)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Consumos */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-50">Consumos</h3>
              <Button
                onClick={() => setOpenConsumoDialog(true)}
                size="sm"
                className="bg-zinc-100 text-zinc-900 hover:bg-white"
              >
                Adicionar
              </Button>
            </div>
            {consumos.length === 0 ? (
              <p className="text-zinc-400 text-center py-4 text-sm">Nenhum consumo</p>
            ) : (
              <div className="space-y-2">
                {consumos.map(c => {
                  const servico = servicos.find(s => s.id === c.servicoId)
                  return (
                    <div key={c.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-50 text-sm font-medium truncate">{servico?.nome}</p>
                        <p className="text-zinc-400 text-xs">{c.quantidade}x {formatCurrency(servico?.precoUnitario || 0)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-50 text-sm font-semibold">
                          {formatCurrency(c.valorTotal)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveConsumo(c.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-zinc-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-400 text-sm">Subtotal:</span>
                <span className="text-zinc-50 font-semibold">{formatCurrency(valorConsumos)}</span>
              </div>
            </div>
          </Card>

          {/* Avaliação */}
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">Avaliação</h3>
            {reserva.status !== 'concluida' ? (
              <p className="text-zinc-400 text-sm text-center py-4">Disponível após o check-out</p>
            ) : avaliacoes.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Geral</p>
                  <StarRating rating={avaliacoes[0].notaGeral} readOnly />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Limpeza</p>
                  <StarRating rating={avaliacoes[0].notaLimpeza} readOnly />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Atendimento</p>
                  <StarRating rating={avaliacoes[0].notaAtendimento} readOnly />
                </div>
                {avaliacoes[0].comentario && (
                  <p className="text-zinc-400 text-sm italic mt-3">{avaliacoes[0].comentario}</p>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setOpenAvaliacaoDialog(true)}
                className="w-full bg-zinc-100 text-zinc-900 hover:bg-white"
              >
                Enviar Avaliação
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Dialogs */}

      {/* Check-in Dialog */}
      <Dialog open={openCheckinDialog} onOpenChange={open => { setOpenCheckinDialog(open); if (!open) resetCheckinForm() }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Registrar Check-in</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">Funcionário</Label>
              <Select value={checkinFuncionarioId} onValueChange={setCheckinFuncionarioId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {funcionarios.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Observações</Label>
              <Textarea
                value={checkinObservacoes}
                onChange={e => setCheckinObservacoes(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpenCheckinDialog(false); resetCheckinForm() }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button onClick={handleCheckin} className="bg-zinc-100 text-zinc-900 hover:bg-white">
                Confirmar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={openCheckoutDialog} onOpenChange={open => { setOpenCheckoutDialog(open); if (!open) resetCheckoutForm() }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Registrar Check-out</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">Observações</Label>
              <Textarea
                value={checkoutObservacoes}
                onChange={e => setCheckoutObservacoes(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpenCheckoutDialog(false); resetCheckoutForm() }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button onClick={handleCheckout} className="bg-zinc-100 text-zinc-900 hover:bg-white">
                Confirmar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagamento Dialog */}
      <Dialog open={openPagamentoDialog} onOpenChange={open => { setOpenPagamentoDialog(open); if (!open) resetPagamentoForm() }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">Valor (R$)</Label>
              <Input
                value={pagamentoValor}
                onChange={e => setPagamentoValor(e.target.value)}
                type="number"
                step="0.01"
                max={saldoDevedor}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="0.00"
              />
              {pagamentoValor && parseFloat(pagamentoValor) > saldoDevedor && (
                <p className="text-red-400 text-sm mt-1">
                  Valor excede o saldo devedor (R$ {saldoDevedor.toFixed(2)})
                </p>
              )}
              <p className="text-zinc-400 text-xs mt-1">
                Saldo devedor: {formatCurrency(saldoDevedor)}
              </p>
            </div>
            <div>
              <Label className="text-zinc-300">Forma de Pagamento</Label>
              <Select value={pagamentoForma} onValueChange={setPagamentoForma}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpenPagamentoDialog(false); resetPagamentoForm() }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button onClick={handlePagamento} className="bg-zinc-100 text-zinc-900 hover:bg-white">
                Registrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consumo Dialog */}
      <Dialog open={openConsumoDialog} onOpenChange={open => { setOpenConsumoDialog(open); if (!open) resetConsumoForm() }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Adicionar Consumo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300">Serviço</Label>
              <Select value={consumoServicoId} onValueChange={setConsumoServicoId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {servicos.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome} - {formatCurrency(s.precoUnitario)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-zinc-300">Quantidade</Label>
              <Input
                value={consumoQuantidade}
                onChange={e => setConsumoQuantidade(e.target.value)}
                type="number"
                min="1"
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="1"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Funcionário</Label>
              <Select value={consumoFuncionarioId} onValueChange={setConsumoFuncionarioId}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {funcionarios.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {consumoPreview > 0 && (
              <div className="bg-zinc-800 p-3 rounded">
                <p className="text-zinc-400 text-sm">Valor total:</p>
                <p className="text-zinc-50 font-semibold text-lg">{formatCurrency(consumoPreview)}</p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpenConsumoDialog(false); resetConsumoForm() }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button onClick={handleConsumo} className="bg-zinc-100 text-zinc-900 hover:bg-white">
                Adicionar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avaliação Dialog */}
      <Dialog open={openAvaliacaoDialog} onOpenChange={setOpenAvaliacaoDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Enviar Avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300 mb-2 block">Nota Geral</Label>
              <StarRating rating={notaGeral} onRatingChange={setNotaGeral} />
            </div>
            <div>
              <Label className="text-zinc-300 mb-2 block">Limpeza</Label>
              <StarRating rating={notaLimpeza} onRatingChange={setNotaLimpeza} />
            </div>
            <div>
              <Label className="text-zinc-300 mb-2 block">Atendimento</Label>
              <StarRating rating={notaAtendimento} onRatingChange={setNotaAtendimento} />
            </div>
            <div>
              <Label className="text-zinc-300">Comentário</Label>
              <Textarea
                value={comentarioAvaliacao}
                onChange={e => setComentarioAvaliacao(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Deixe um comentário (opcional)"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenAvaliacaoDialog(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button onClick={handleAvaliacao} className="bg-zinc-100 text-zinc-900 hover:bg-white">
                Enviar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
