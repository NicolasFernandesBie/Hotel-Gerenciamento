'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Tag, Trash2, Edit2, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getAll, save, update, remove } from '@/lib/storage'
import { formatCurrency } from '@/lib/format'
import type { TipoQuarto } from '@/types'

const tipoQuartoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().min(5, 'Descrição inválida'),
  capacidade: z.string().transform(v => parseInt(v, 10)).refine(v => v >= 1, 'Capacidade deve ser pelo menos 1'),
  precoDiaria: z.string().transform(v => parseFloat(v)).refine(v => v > 0, 'Preço deve ser maior que 0'),
})

type TipoQuartoFormData = z.infer<typeof tipoQuartoSchema>

export default function Tipos() {
  const [mounted, setMounted] = useState(false)
  const [tipos, setTipos] = useState<TipoQuarto[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [comodidades, setComodidades] = useState<string[]>([])
  const [novaComodidade, setNovaComodidade] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(tipoQuartoSchema),
  })

  useEffect(() => {
    const data = getAll<TipoQuarto>('hms_tipos_quarto')
    setTipos(data)
    setMounted(true)
  }, [])

  const onSubmit = (data: any) => {
    if (editingId) {
      const tipo = tipos.find(t => t.id === editingId)
      if (tipo) {
        update('hms_tipos_quarto', { ...tipo, ...data, comodidades })
        setTipos(getAll('hms_tipos_quarto'))
      }
      setEditingId(null)
    } else {
      const newTipo: TipoQuarto = {
        id: crypto.randomUUID(),
        ...data,
        comodidades,
      }
      save('hms_tipos_quarto', newTipo)
      setTipos(getAll('hms_tipos_quarto'))
    }
    setOpenDialog(false)
    reset()
    setComodidades([])
  }

  const handleEdit = (tipo: TipoQuarto) => {
    setValue('nome', tipo.nome)
    setValue('descricao', tipo.descricao)
    setValue('capacidade', tipo.capacidade)
    setValue('precoDiaria', tipo.precoDiaria)
    setComodidades(tipo.comodidades)
    setEditingId(tipo.id)
    setOpenDialog(true)
  }

  const handleDelete = (id: string) => {
    remove('hms_tipos_quarto', id)
    setTipos(getAll('hms_tipos_quarto'))
    setDeleteConfirm(null)
  }

  const addComodidade = () => {
    if (novaComodidade.trim()) {
      setComodidades([...comodidades, novaComodidade.trim()])
      setNovaComodidade('')
    }
  }

  const removeComodidade = (index: number) => {
    setComodidades(comodidades.filter((_, i) => i !== index))
  }

  if (!mounted) return null

  return (
    <Layout title="Tipos de Quarto">
      <PageHeader
        title="Tipos de Quarto"
        action={{
          label: 'Novo Tipo',
          onClick: () => {
            setEditingId(null)
            reset()
            setComodidades([])
            setOpenDialog(true)
          },
        }}
      />

      {tipos.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Nenhum tipo de quarto"
          description="Comece adicionando um novo tipo de quarto"
        />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {tipos.map(tipo => (
            <Card key={tipo.id} className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-50">{tipo.nome}</h3>
                  <p className="text-zinc-400 text-sm mt-1">{tipo.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tipo)}
                    className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(tipo.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Badge className="bg-zinc-800 text-zinc-300">
                    Capacidade: {tipo.capacidade} pessoas
                  </Badge>
                </div>

                <div>
                  <p className="text-2xl font-bold text-zinc-50">
                    {formatCurrency(tipo.precoDiaria)}
                    <span className="text-sm font-normal text-zinc-400">/noite</span>
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-400 mb-2">Comodidades:</p>
                  <div className="space-y-1">
                    {tipo.comodidades.map((comodidade, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-zinc-300 text-sm">
                        <Check className="w-4 h-4 text-emerald-400" />
                        {comodidade}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">
              {editingId ? 'Editar Tipo de Quarto' : 'Novo Tipo de Quarto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Nome</Label>
                <Input
                  {...register('nome')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: Standard"
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">{typeof errors.nome === 'string' ? errors.nome : 'Erro'}</p>}
              </div>
              <div>
                <Label className="text-zinc-300">Capacidade</Label>
                <Input
                  {...register('capacidade')}
                  type="number"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="2"
                />
                {errors.capacidade && (
                  <p className="text-red-500 text-sm mt-1">{typeof errors.capacidade === 'string' ? errors.capacidade : 'Erro'}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Descrição</Label>
              <Textarea
                {...register('descricao')}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Descrição do tipo de quarto"
                rows={3}
              />
              {errors.descricao && (
                <p className="text-red-500 text-sm mt-1">{typeof errors.descricao === 'string' ? errors.descricao : 'Erro'}</p>
              )}
            </div>

            <div>
              <Label className="text-zinc-300">Preço da Diária (R$)</Label>
              <Input
                {...register('precoDiaria')}
                type="number"
                step="0.01"
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="150.00"
              />
              {errors.precoDiaria && (
                <p className="text-red-500 text-sm mt-1">{typeof errors.precoDiaria === 'string' ? errors.precoDiaria : 'Erro'}</p>
              )}
            </div>

            <div>
              <Label className="text-zinc-300">Comodidades</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={novaComodidade}
                  onChange={e => setNovaComodidade(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addComodidade())}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Digite uma comodidade"
                />
                <Button
                  type="button"
                  onClick={addComodidade}
                  className="bg-zinc-100 text-zinc-900 hover:bg-white"
                >
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {comodidades.map((comodidade, idx) => (
                  <Badge
                    key={idx}
                    className="bg-zinc-800 text-zinc-300 cursor-pointer hover:bg-zinc-700"
                    onClick={() => removeComodidade(idx)}
                  >
                    {comodidade} ×
                  </Badge>
                ))}
              </div>
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={open => !open && setDeleteConfirm(null)}
        title="Excluir Tipo de Quarto"
        description="Tem certeza que deseja excluir este tipo de quarto? Esta ação não pode ser desfeita."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Excluir"
        isDestructive
      />
    </Layout>
  )
}
