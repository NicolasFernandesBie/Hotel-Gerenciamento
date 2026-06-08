'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { BedDouble, Trash2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getAll, save, update, remove } from '@/lib/storage'
import type { Quarto, TipoQuarto } from '@/types'

const quartoSchema = z.object({
  numero: z.coerce.number().min(1, 'Número inválido'),
  andar: z.coerce.number().min(1, 'Andar inválido'),
  tipoQuartoId: z.string().min(1, 'Tipo de quarto é obrigatório'),
  status: z.enum(['disponivel', 'ocupado', 'manutencao']),
  observacoes: z.string().optional(),
})

export default function QuartosPage() {
  const [mounted, setMounted] = useState(false)
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [tipos, setTipos] = useState<TipoQuarto[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusEditingId, setStatusEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<'disponivel' | 'ocupado' | 'manutencao'>('disponivel')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(quartoSchema),
  })

  useEffect(() => {
    const data = getAll<Quarto>('hms_quartos')
    const tiposData = getAll<TipoQuarto>('hms_tipos_quarto')
    setQuartos(data)
    setTipos(tiposData)
    setMounted(true)
  }, [])

  const onSubmit = (data: any) => {
    const numeroQuarto = parseInt(data.numero)
    const numeroExiste = quartos.some(q => q.numero === numeroQuarto && q.id !== editingId)
    if (numeroExiste) {
      alert('Já existe um quarto com este número')
      return
    }

    if (editingId) {
      const quarto = quartos.find(q => q.id === editingId)
      if (quarto) {
        update('hms_quartos', { ...quarto, ...data })
        setQuartos(getAll('hms_quartos'))
      }
      setEditingId(null)
    } else {
      const newQuarto: Quarto = {
        id: crypto.randomUUID(),
        numero: numeroQuarto,
        andar: parseInt(data.andar),
        tipoQuartoId: data.tipoQuartoId,
        status: data.status,
        observacoes: data.observacoes || '',
      }
      save('hms_quartos', newQuarto)
      setQuartos(getAll('hms_quartos'))
    }
    setOpenDialog(false)
    reset()
  }

  const handleEdit = (quarto: Quarto) => {
    setValue('numero', quarto.numero)
    setValue('andar', quarto.andar)
    setValue('tipoQuartoId', quarto.tipoQuartoId)
    setValue('status', quarto.status)
    setValue('observacoes', quarto.observacoes)
    setEditingId(quarto.id)
    setOpenDialog(true)
  }

  const handleDelete = (id: string) => {
    remove('hms_quartos', id)
    setQuartos(getAll('hms_quartos'))
    setDeleteConfirm(null)
  }

  const handleStatusChange = (id: string) => {
    const quarto = quartos.find(q => q.id === id)
    if (quarto) {
      update('hms_quartos', { ...quarto, status: newStatus })
      setQuartos(getAll('hms_quartos'))
    }
    setOpenStatusDialog(false)
    setStatusEditingId(null)
  }

  if (!mounted) return null

  const quartosPorAndar = quartos.reduce((acc, quarto) => {
    if (!acc[quarto.andar]) acc[quarto.andar] = []
    acc[quarto.andar].push(quarto)
    return acc
  }, {} as Record<number, Quarto[]>)

  const andares = Object.keys(quartosPorAndar).sort((a, b) => parseInt(a) - parseInt(b))

  return (
    <>
      <PageHeader
        title="Quartos"
        action={{
          label: 'Novo Quarto',
          onClick: () => {
            setEditingId(null)
            reset()
            setOpenDialog(true)
          },
        }}
      />

      {quartos.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="Nenhum quarto cadastrado"
          description="Comece adicionando um novo quarto ao sistema"
        />
      ) : (
        <div className="space-y-8">
          {andares.map(andar => (
            <div key={andar}>
              <h3 className="text-lg font-semibold text-zinc-50 mb-4">Andar {andar}</h3>
              <div className="grid grid-cols-4 gap-4">
                {quartosPorAndar[parseInt(andar)].map(quarto => {
                  const tipo = tipos.find(t => t.id === quarto.tipoQuartoId)
                  return (
                    <Card key={quarto.id} className="bg-zinc-900 border-zinc-800 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-2xl font-bold text-zinc-50">Quarto {quarto.numero}</h4>
                          <p className="text-zinc-400 text-sm">{tipo?.nome}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(quarto)}
                            className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(quarto.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <StatusBadge status={quarto.status} />
                        {quarto.observacoes && (
                          <p className="text-zinc-400 text-sm">{quarto.observacoes}</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setStatusEditingId(quarto.id)
                            setNewStatus(quarto.status)
                            setOpenStatusDialog(true)
                          }}
                          className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          Alterar Status
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">
              {editingId ? 'Editar Quarto' : 'Novo Quarto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Número</Label>
                <Input
                  {...register('numero')}
                  type="number"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="101"
                />
                {errors.numero && (
                  <p className="text-red-500 text-sm mt-1">Número inválido</p>
                )}
              </div>
              <div>
                <Label className="text-zinc-300">Andar</Label>
                <Input
                  {...register('andar')}
                  type="number"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="1"
                />
                {errors.andar && (
                  <p className="text-red-500 text-sm mt-1">Andar inválido</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Tipo de Quarto</Label>
              <Select
                onValueChange={value => setValue('tipoQuartoId', value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {tipos.map(tipo => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoQuartoId && (
                <p className="text-red-500 text-sm mt-1">Tipo de quarto é obrigatório</p>
              )}
            </div>

            <div>
              <Label className="text-zinc-300">Status</Label>
              <Select
                onValueChange={value =>
                  setValue('status', value as 'disponivel' | 'ocupado' | 'manutencao')
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="ocupado">Ocupado</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-zinc-300">Observações</Label>
              <Textarea
                {...register('observacoes')}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Observações sobre o quarto"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-zinc-100 text-zinc-900 hover:bg-white"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Alterar Status do Quarto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label className="text-zinc-300">Novo Status</Label>
            <Select
              value={newStatus}
              onValueChange={value =>
                setNewStatus(value as 'disponivel' | 'ocupado' | 'manutencao')
              }
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenStatusDialog(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => statusEditingId && handleStatusChange(statusEditingId)}
              className="bg-zinc-100 text-zinc-900 hover:bg-white"
            >
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={open => !open && setDeleteConfirm(null)}
        title="Excluir Quarto"
        description="Tem certeza que deseja excluir este quarto? Esta ação não pode ser desfeita."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Excluir"
        isDestructive
      />
    </>
  )
}
