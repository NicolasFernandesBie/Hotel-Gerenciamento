'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserCog, Trash2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getAll, save, update, remove } from '@/lib/storage'
import { formatDate, formatCPF } from '@/lib/format'
import type { Funcionario } from '@/types'

const funcionarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cargo: z.string().min(2, 'Cargo inválido'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  telefone: z.string().min(10, 'Telefone inválido'),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
  turno: z.enum(['manha', 'tarde', 'noite']),
})

type FuncionarioFormData = z.infer<typeof funcionarioSchema>

const turnoLabels = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
}

export default function Funcionarios() {
  const [mounted, setMounted] = useState(false)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
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
    resolver: zodResolver(funcionarioSchema),
  })

  useEffect(() => {
    const data = getAll<Funcionario>('hms_funcionarios')
    setFuncionarios(data)
    setMounted(true)
  }, [])

  const onSubmit = (data: any) => {
    if (editingId) {
      const funcionario = funcionarios.find(f => f.id === editingId)
      if (funcionario) {
        update('hms_funcionarios', { ...funcionario, ...data })
        setFuncionarios(getAll('hms_funcionarios'))
      }
      setEditingId(null)
    } else {
      const newFuncionario: Funcionario = {
        id: crypto.randomUUID(),
        ...data,
      }
      save('hms_funcionarios', newFuncionario)
      setFuncionarios(getAll('hms_funcionarios'))
    }
    setOpenDialog(false)
    reset()
  }

  const handleEdit = (funcionario: Funcionario) => {
    setValue('nome', funcionario.nome)
    setValue('cargo', funcionario.cargo)
    setValue('cpf', funcionario.cpf)
    setValue('telefone', funcionario.telefone)
    setValue('dataAdmissao', funcionario.dataAdmissao)
    setValue('turno', funcionario.turno)
    setEditingId(funcionario.id)
    setOpenDialog(true)
  }

  const handleDelete = (id: string) => {
    remove('hms_funcionarios', id)
    setFuncionarios(getAll('hms_funcionarios'))
    setDeleteConfirm(null)
  }

  if (!mounted) return null

  return (
    <Layout title="Funcionários">
      <PageHeader
        title="Funcionários"
        action={{
          label: 'Novo Funcionário',
          onClick: () => {
            setEditingId(null)
            reset()
            setOpenDialog(true)
          },
        }}
      />

      <Card className="bg-zinc-900 border-zinc-800">
        {funcionarios.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={UserCog}
              title="Nenhum funcionário cadastrado"
              description="Comece adicionando um novo funcionário ao sistema"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Nome</TableHead>
                <TableHead className="text-zinc-400">Cargo</TableHead>
                <TableHead className="text-zinc-400">CPF</TableHead>
                <TableHead className="text-zinc-400">Telefone</TableHead>
                <TableHead className="text-zinc-400">Turno</TableHead>
                <TableHead className="text-zinc-400">Data Admissão</TableHead>
                <TableHead className="text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map(funcionario => (
                <TableRow key={funcionario.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-50">{funcionario.nome}</TableCell>
                  <TableCell className="text-zinc-50">{funcionario.cargo}</TableCell>
                  <TableCell className="text-zinc-50">{formatCPF(funcionario.cpf)}</TableCell>
                  <TableCell className="text-zinc-50">{funcionario.telefone}</TableCell>
                  <TableCell className="text-zinc-50">
                    <Badge className="bg-zinc-800 text-zinc-300">
                      {turnoLabels[funcionario.turno as keyof typeof turnoLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-50">{formatDate(funcionario.dataAdmissao)}</TableCell>
                  <TableCell className="text-zinc-50">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(funcionario)}
                        className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(funcionario.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-zinc-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">
              {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Nome</Label>
                <Input
                  {...register('nome')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Nome completo"
                />
                {errors.nome && <p className="text-red-500 text-sm mt-1">Nome inválido</p>}
              </div>
              <div>
                <Label className="text-zinc-300">Cargo</Label>
                <Input
                  {...register('cargo')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: Recepcionista"
                />
                {errors.cargo && <p className="text-red-500 text-sm mt-1">Cargo inválido</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">CPF</Label>
                <Input
                  {...register('cpf')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="11 dígitos"
                  maxLength={11}
                />
                {errors.cpf && <p className="text-red-500 text-sm mt-1">CPF inválido</p>}
              </div>
              <div>
                <Label className="text-zinc-300">Telefone</Label>
                <Input
                  {...register('telefone')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="(11) 98765-4321"
                />
                {errors.telefone && <p className="text-red-500 text-sm mt-1">Telefone inválido</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Data de Admissão</Label>
                <Input
                  {...register('dataAdmissao')}
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                {errors.dataAdmissao && (
                  <p className="text-red-500 text-sm mt-1">Data inválida</p>
                )}
              </div>
              <div>
                <Label className="text-zinc-300">Turno</Label>
                <Select
                  onValueChange={value => setValue('turno', value as 'manha' | 'tarde' | 'noite')}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
                {errors.turno && <p className="text-red-500 text-sm mt-1">Turno inválido</p>}
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
        title="Excluir Funcionário"
        description="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Excluir"
        isDestructive
      />
    </Layout>
  )
}
