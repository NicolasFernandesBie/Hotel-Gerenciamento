'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Users, Trash2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getAll, save, update, remove } from '@/lib/storage'
import { formatCPF } from '@/lib/format'
import type { Hospede } from '@/types'

const hospedeSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  endereco: z.string().min(5, 'Endereço inválido'),
  tipoDocumento: z.enum(['RG', 'CNH', 'Passaporte', 'RNE']),
  numeroDocumento: z.string().min(5, 'Número do documento inválido'),
})

type HostedeFormData = z.infer<typeof hospedeSchema>

export default function Hospedes() {
  const [mounted, setMounted] = useState(false)
  const [hospedes, setHospedes] = useState<Hospede[]>([])
  const [filteredHospedes, setFilteredHospedes] = useState<Hospede[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HostedeFormData>({
    resolver: zodResolver(hospedeSchema),
  })

  useEffect(() => {
    const data = getAll<Hospede>('hms_hospedes')
    setHospedes(data)
    setFilteredHospedes(data)
    setMounted(true)
  }, [])

  useEffect(() => {
    const filtered = hospedes.filter(h =>
      h.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.cpf.includes(searchTerm)
    )
    setFilteredHospedes(filtered)
  }, [searchTerm, hospedes])

  const onSubmit = (data: HostedeFormData) => {
    if (editingId) {
      const hospede = hospedes.find(h => h.id === editingId)
      if (hospede) {
        update('hms_hospedes', { ...hospede, ...data })
        setHospedes(getAll('hms_hospedes'))
      }
      setEditingId(null)
    } else {
      const newHospede: Hospede = {
        id: crypto.randomUUID(),
        ...data,
        criadoEm: new Date().toISOString(),
      }
      save('hms_hospedes', newHospede)
      setHospedes(getAll('hms_hospedes'))
    }
    setOpenDialog(false)
    reset()
  }

  const handleEdit = (hospede: Hospede) => {
    setValue('nome', hospede.nome)
    setValue('cpf', hospede.cpf)
    setValue('email', hospede.email)
    setValue('telefone', hospede.telefone)
    setValue('dataNascimento', hospede.dataNascimento)
    setValue('endereco', hospede.endereco)
    setValue('tipoDocumento', hospede.tipoDocumento)
    setValue('numeroDocumento', hospede.numeroDocumento)
    setEditingId(hospede.id)
    setOpenDialog(true)
  }

  const handleDelete = (id: string) => {
    remove('hms_hospedes', id)
    setHospedes(getAll('hms_hospedes'))
    setDeleteConfirm(null)
  }

  if (!mounted) return null

  return (
    <Layout title="Hóspedes">
      <PageHeader
        title="Hóspedes"
        action={{
          label: 'Novo Hóspede',
          onClick: () => {
            setEditingId(null)
            reset()
            setOpenDialog(true)
          },
        }}
      >
        <Input
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-64 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
      </PageHeader>

      <Card className="bg-zinc-900 border-zinc-800">
        {filteredHospedes.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="Nenhum hóspede encontrado"
              description="Comece adicionando um novo hóspede ao sistema"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Nome</TableHead>
                <TableHead className="text-zinc-400">CPF</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Telefone</TableHead>
                <TableHead className="text-zinc-400">Documento</TableHead>
                <TableHead className="text-zinc-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHospedes.map(hospede => (
                <TableRow key={hospede.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-zinc-50">{hospede.nome}</TableCell>
                  <TableCell className="text-zinc-50">{formatCPF(hospede.cpf)}</TableCell>
                  <TableCell className="text-zinc-50">{hospede.email}</TableCell>
                  <TableCell className="text-zinc-50">{hospede.telefone}</TableCell>
                  <TableCell className="text-zinc-50">
                    {hospede.tipoDocumento} - {hospede.numeroDocumento}
                  </TableCell>
                  <TableCell className="text-zinc-50">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(hospede)}
                        className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(hospede.id)}
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
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">
              {editingId ? 'Editar Hóspede' : 'Novo Hóspede'}
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
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
              </div>
              <div>
                <Label className="text-zinc-300">CPF</Label>
                <Input
                  {...register('cpf')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="11 dígitos"
                  maxLength={11}
                />
                {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Email</Label>
                <Input
                  {...register('email')}
                  type="email"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label className="text-zinc-300">Telefone</Label>
                <Input
                  {...register('telefone')}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="(11) 98765-4321"
                />
                {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Data de Nascimento</Label>
                <Input
                  {...register('dataNascimento')}
                  type="date"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                {errors.dataNascimento && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataNascimento.message}</p>
                )}
              </div>
              <div>
                <Label className="text-zinc-300">Tipo de Documento</Label>
                <Select
                  onValueChange={value =>
                    setValue('tipoDocumento', value as 'RG' | 'CNH' | 'Passaporte' | 'RNE')
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="RG">RG</SelectItem>
                    <SelectItem value="CNH">CNH</SelectItem>
                    <SelectItem value="Passaporte">Passaporte</SelectItem>
                    <SelectItem value="RNE">RNE</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoDocumento && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoDocumento.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Número do Documento</Label>
              <Input
                {...register('numeroDocumento')}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Número do documento"
              />
              {errors.numeroDocumento && (
                <p className="text-red-500 text-sm mt-1">{errors.numeroDocumento.message}</p>
              )}
            </div>

            <div>
              <Label className="text-zinc-300">Endereço</Label>
              <Textarea
                {...register('endereco')}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Endereço completo"
                rows={3}
              />
              {errors.endereco && <p className="text-red-500 text-sm mt-1">{errors.endereco.message}</p>}
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
        title="Excluir Hóspede"
        description="Tem certeza que deseja excluir este hóspede? Esta ação não pode ser desfeita."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        confirmText="Excluir"
        isDestructive
      />
    </Layout>
  )
}
