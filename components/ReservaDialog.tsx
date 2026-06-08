'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { save, getAll } from '@/lib/storage'
import { formatCurrency, calculateDays } from '@/lib/format'
import type { Reserva, Hospede, Quarto, TipoQuarto } from '@/types'

const step1Schema = z.object({
  dataCheckinPrev: z.string().min(1, 'Data de check-in é obrigatória'),
  dataCheckoutPrev: z.string().min(1, 'Data de check-out é obrigatória'),
})

const step2Schema = z.object({
  quartoId: z.string().min(1, 'Quarto é obrigatório'),
})

const step3Schema = z.object({
  hospedeId: z.string().optional(),
  novoHospede: z.object({
    nome: z.string().optional(),
    cpf: z.string().optional(),
    email: z.string().optional(),
    telefone: z.string().optional(),
  }).optional(),
})

interface ReservaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReservaCreated: () => void
  hospedes: Hospede[]
  quartos: Quarto[]
  tipos: TipoQuarto[]
}

export default function ReservaDialog({
  open,
  onOpenChange,
  onReservaCreated,
  hospedes,
  quartos,
  tipos,
}: ReservaDialogProps) {
  const [step, setStep] = useState(1)
  const [checkinDate, setCheckinDate] = useState('')
  const [checkoutDate, setCheckoutDate] = useState('')
  const [selectedQuartoId, setSelectedQuartoId] = useState('')
  const [selectedHospedeId, setSelectedHospedeId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNovoHospede, setShowNovoHospede] = useState(false)

  const {
    register: registerNovoHospede,
    handleSubmit: handleSubmitNovoHospede,
    reset: resetNovoHospede,
    formState: { errors: errorsNovoHospede },
  } = useForm<any>()

  const handleStep1Submit = () => {
    if (!checkinDate || !checkoutDate) {
      alert('Por favor, preencha as datas')
      return
    }
    if (new Date(checkoutDate) <= new Date(checkinDate)) {
      alert('Data de check-out deve ser após check-in')
      return
    }
    setStep(2)
  }

  const handleStep2Submit = () => {
    if (!selectedQuartoId) {
      alert('Por favor, selecione um quarto')
      return
    }
    setStep(3)
  }

  const handleStep3Submit = () => {
    if (!selectedHospedeId && !showNovoHospede) {
      alert('Por favor, selecione ou crie um hóspede')
      return
    }

    const quarto = quartos.find(q => q.id === selectedQuartoId)
    const tipo = tipos.find(t => t.id === quarto?.tipoQuartoId)

    if (!quarto || !tipo) return

    const dias = calculateDays(checkinDate, checkoutDate)
    const valorTotal = dias * tipo.precoDiaria

    const newReserva: Reserva = {
      id: crypto.randomUUID(),
      hospedeId: selectedHospedeId,
      quartoId: selectedQuartoId,
      dataCheckinPrev: checkinDate,
      dataCheckoutPrev: checkoutDate,
      valorTotal,
      status: 'confirmada',
      criadoEm: new Date().toISOString(),
    }

    save('hms_reservas', newReserva)
    resetForm()
    onReservaCreated()
  }

  const handleNovoHospede = (data: any) => {
    const todosHospedes = getAll<Hospede>('hms_hospedes')
    if (todosHospedes.some(h => h.cpf === data.cpf)) {
      alert('CPF já cadastrado no sistema')
      return
    }
    if (data.email && todosHospedes.some(h => h.email === data.email)) {
      alert('Email já cadastrado no sistema')
      return
    }

    const newHospede: Hospede = {
      id: crypto.randomUUID(),
      nome: data.nome,
      cpf: data.cpf,
      email: data.email,
      telefone: data.telefone,
      dataNascimento: '',
      endereco: '',
      tipoDocumento: 'RG',
      numeroDocumento: '',
      criadoEm: new Date().toISOString(),
    }
    save('hms_hospedes', newHospede)
    setSelectedHospedeId(newHospede.id)
    setShowNovoHospede(false)
    resetNovoHospede()
  }

  const resetForm = () => {
    setStep(1)
    setCheckinDate('')
    setCheckoutDate('')
    setSelectedQuartoId('')
    setSelectedHospedeId('')
    setSearchTerm('')
    setShowNovoHospede(false)
  }

  // Get available rooms for selected dates
  const availableQuartos = quartos.filter(q => {
    if (q.status !== 'disponivel') return false
    const reservasConflict = getAll<Reserva>('hms_reservas').some(r => {
      if (r.quartoId !== q.id || r.status !== 'confirmada') return false
      const rStart = new Date(r.dataCheckinPrev)
      const rEnd = new Date(r.dataCheckoutPrev)
      const start = new Date(checkinDate)
      const end = new Date(checkoutDate)
      return !(end <= rStart || start >= rEnd)
    })
    return !reservasConflict
  })

  const selectedQuarto = quartos.find(q => q.id === selectedQuartoId)
  const selectedTipo = tipos.find(t => t.id === selectedQuarto?.tipoQuartoId)
  const dias = checkinDate && checkoutDate ? calculateDays(checkinDate, checkoutDate) : 0
  const estimatedValue = dias * (selectedTipo?.precoDiaria || 0)

  const filteredHospedes = hospedes.filter(h =>
    h.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.cpf.includes(searchTerm)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-50">
            {step === 1 && 'Passo 1: Período da Reserva'}
            {step === 2 && 'Passo 2: Selecionar Quarto'}
            {step === 3 && 'Passo 3: Selecionar Hóspede'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Period */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Data de Check-in</Label>
                <Input
                  type="date"
                  value={checkinDate}
                  onChange={e => setCheckinDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Data de Check-out</Label>
                <Input
                  type="date"
                  value={checkoutDate}
                  onChange={e => setCheckoutDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 2 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <p className="text-zinc-400 text-sm">
              Quartos disponíveis para {dias} dia(s)
            </p>
            {availableQuartos.length === 0 ? (
              <p className="text-zinc-400 text-center py-8">Nenhum quarto disponível para este período</p>
            ) : (
              availableQuartos.map(quarto => {
                const tipo = tipos.find(t => t.id === quarto.tipoQuartoId)
                const isSelected = quarto.id === selectedQuartoId
                return (
                  <Card
                    key={quarto.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-600'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                    onClick={() => setSelectedQuartoId(quarto.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-zinc-50 font-semibold">Quarto {quarto.numero}</p>
                        <p className="text-zinc-400 text-sm">{tipo?.nome}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-zinc-50">
                          {formatCurrency(tipo?.precoDiaria || 0)}
                        </p>
                        <p className="text-zinc-400 text-sm">/noite</p>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Step 3: Guest Selection */}
        {step === 3 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {!showNovoHospede ? (
              <>
                <div>
                  <Label className="text-zinc-300">Buscar Hóspede</Label>
                  <Input
                    placeholder="Nome ou CPF"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  {filteredHospedes.map(hospede => (
                    <Card
                      key={hospede.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        hospede.id === selectedHospedeId
                          ? 'bg-zinc-800 border-zinc-600'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                      onClick={() => setSelectedHospedeId(hospede.id)}
                    >
                      <p className="text-zinc-50 font-semibold">{hospede.nome}</p>
                      <p className="text-zinc-400 text-sm">{hospede.cpf} • {hospede.email}</p>
                    </Card>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNovoHospede(true)}
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cadastrar Novo Hóspede
                </Button>
              </>
            ) : (
              <form onSubmit={handleSubmitNovoHospede(handleNovoHospede)} className="space-y-4">
                <div>
                  <Label className="text-zinc-300">Nome</Label>
                  <Input
                    {...registerNovoHospede('nome')}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">CPF</Label>
                  <Input
                    {...registerNovoHospede('cpf')}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="11 dígitos"
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Email</Label>
                  <Input
                    {...registerNovoHospede('email')}
                    type="email"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Telefone</Label>
                  <Input
                    {...registerNovoHospede('telefone')}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="(11) 98765-4321"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNovoHospede(false)}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-white"
                  >
                    Criar e Continuar
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Summary */}
        {step === 3 && selectedQuarto && selectedTipo && (
          <Card className="bg-zinc-800 border-zinc-700 p-4 mt-4">
            <h4 className="text-zinc-50 font-semibold mb-3">Resumo da Reserva</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-300">
                <span>Quarto:</span>
                <span className="text-zinc-50">{selectedQuarto.numero} ({selectedTipo.nome})</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Período:</span>
                <span className="text-zinc-50">{dias} noite(s)</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span>Valor/noite:</span>
                <span className="text-zinc-50">{formatCurrency(selectedTipo.precoDiaria)}</span>
              </div>
              <div className="border-t border-zinc-700 pt-2 flex justify-between text-zinc-50 font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(estimatedValue)}</span>
              </div>
            </div>
          </Card>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1)
              } else {
                onOpenChange(false)
                resetForm()
              }
            }}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (step === 1) handleStep1Submit()
              else if (step === 2) handleStep2Submit()
              else if (step === 3) handleStep3Submit()
            }}
            className="bg-zinc-100 text-zinc-900 hover:bg-white"
          >
            {step === 3 ? 'Confirmar Reserva' : 'Próximo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
