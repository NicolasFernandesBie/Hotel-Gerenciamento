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
import { ShoppingBag, Trash2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getAll, save, update, remove } from '@/lib/storage'
import { formatCurrency } from '@/lib/format'
import type { Servico } from '@/types'

const servicoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().min(5, 'Descrição inválida'),
  precoUnitario: z.string().transform(v => parseFloat(v)).refine(v => v > 0, 'Preço deve ser maior que 0'),
  categoria: z.string().min(2, 'Categoria inválida'),
  unidade: z.string().min(1, 'Unidade inválida'),
})

type ServicoFormData = z.infer<typeof servicoSchema>

export default function Servicos() {
  const [mounted, setMounted] = useState(false)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(servicoSchema),
  })

  useEffect(() => {
    const data = getAll<Servico>('hms_servicos')
    setServicos(data)
    setMounted(true)
  }, [])

  const onSubmit = (data: any) => {
    if (editingId) {
      const servico = servicos.find(s => s.id === editingId)
      if (servico) {
        update('hms_servicos', { ...servico, ...data })
        setServicos(getAll('hms_servicos'))
      }
      setEditingId(null)
    } else {
      const newServico: Servico = {
        id: crypto.randomUUID(),
        ...data,
      }
      save('hms_servicos', newServico)
      setServicos(getAll('hms_servicos'))
    }
    setOpenDialog(false)
    reset()
  }

  const handleEdit = (servico: Servico) => {
    setValue('nome', servico.nome)
    setValue('descricao', servico.descricao)
    setValue('precoUnitario', servico.precoUnitario.toString())
    setValue('categoria', servico.categoria)
    setValue('unidade', servico.unidade)
    setEditingId(servico.id)
    setOpenDialog(true)
  }

  const handleDelete = (id: string) => {
    remove('hms_servicos', id)
    setServicos(getAll('hms_servicos'))
    setDeleteConfirm(null)
  }

  if (!mounted) return null

  return (
    <Layout title="Serviços">
      <PageHeader
        title="Serviços"
        action={{
          label: 'Novo Serviço',
          onClick: () => {
            setEditingId(null)
            reset()
            setOpenDialog(true)
          },
        }}
      />

      {servicos.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhum serviço cadastrado"
          description="Comece adicionando um novo serviço ao sistema"
        />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {servicos.map(servico => (
            <Card key={servico.id} className="bg-zinc-900 border-zinc-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-50">{servico.nome}</h3>
                  <p className="text-zinc-400 text-sm mt-1">{servico.descricao}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(servico)}
                    className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(servico.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Badge className="bg-zinc-800 text-zinc-300">{servico.categoria}</Badge>

                <div>
                  <p className="text-2xl font-bold text-zinc-50">
                    {formatCurrency(servico.precoUnitario)}
                    <span className="text-sm font-normal text-zinc-400">/{servico.unidade}</span>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">
              {editingId ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-zinc-300">Nome</Label>
              <Input
                {...register('nome')}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Ex: Café da Manhã"
              />
              {errors.nome && <p className="text-red-500 text-sm mt-1">Nome inválido</p>}
            </div>

            <div>
              <Label className="text-zinc-300">Descrição</Label>
              <Textarea
                {...register('descricao')}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Descrição do serviço"
                rows={3}
              />
              {errors.descricao && <p className="text-red-500 text-sm mt-1">Descrição inválida</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Preço Unitário (R$)</Label>
                <Input
                  {...register('precoUnitario')}
                  type="number"
                  step="0.01"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="35.00"
                />
                {errors.precoUnitario && <p className="text-red-500 text-sm mt-1">Preço inválido</p>}
              </div>
              <div>
                <Label className="text-zinc-300">Unidade</Label>
                <Input
                  {...register('unidade')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: por pessoa"
                />
                {errors.unidade && <p className="text-red-500 text-sm mt-1">Unidade inválida</p>}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Categoria</Label>
              <Input
                {...register('categoria')}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Ex: Alimentação"
              />
              {errors.categoria && <p className="text-red-500 text-sm mt-1">Categoria inválida</p>}
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
        title="Excluir Serviço"
        description="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Excluir"
        isDestructive
      />
    </Layout>
  )
}
