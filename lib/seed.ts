'use client'

import {
  Hospede,
  TipoQuarto,
  Quarto,
  Funcionario,
  Reserva,
  CheckinCheckout,
  Servico,
  Consumo,
  Pagamento,
  Avaliacao,
} from '@/types'
import { getAll, saveAll } from './storage'

function generateId(): string {
  return crypto.randomUUID()
}

export function seedData(): void {
  if (typeof window === 'undefined') return

  // Check if data already exists
  const existingHospedes = getAll<Hospede>('hms_hospedes')
  if (existingHospedes.length > 0) return

  // Tipos de Quarto
  const tiposQuarto: TipoQuarto[] = [
    {
      id: generateId(),
      nome: 'Standard',
      descricao: 'Quarto confortável com o essencial',
      capacidade: 2,
      precoDiaria: 150,
      comodidades: ['WiFi', 'TV', 'Ar Condicionado', 'Banheiro Privativo'],
    },
    {
      id: generateId(),
      nome: 'Superior',
      descricao: 'Quarto espaçoso com mais comodidades',
      capacidade: 3,
      precoDiaria: 250,
      comodidades: ['WiFi', 'TV 42"', 'Ar Condicionado', 'Banheiro com Hidromassagem', 'Minibar'],
    },
    {
      id: generateId(),
      nome: 'Luxo',
      descricao: 'Quarto premium com todas as comodidades',
      capacidade: 4,
      precoDiaria: 400,
      comodidades: [
        'WiFi',
        'TV 55"',
        'Ar Condicionado',
        'Banheiro com Banheira',
        'Minibar',
        'Varanda',
        'Vista para o Mar',
      ],
    },
  ]

  // Quartos
  const quartos: Quarto[] = [
    {
      id: generateId(),
      numero: 101,
      andar: 1,
      tipoQuartoId: tiposQuarto[0].id,
      status: 'disponivel',
      observacoes: '',
    },
    {
      id: generateId(),
      numero: 102,
      andar: 1,
      tipoQuartoId: tiposQuarto[0].id,
      status: 'disponivel',
      observacoes: '',
    },
    {
      id: generateId(),
      numero: 201,
      andar: 2,
      tipoQuartoId: tiposQuarto[1].id,
      status: 'disponivel',
      observacoes: '',
    },
    {
      id: generateId(),
      numero: 202,
      andar: 2,
      tipoQuartoId: tiposQuarto[1].id,
      status: 'disponivel',
      observacoes: '',
    },
    {
      id: generateId(),
      numero: 301,
      andar: 3,
      tipoQuartoId: tiposQuarto[2].id,
      status: 'disponivel',
      observacoes: '',
    },
    {
      id: generateId(),
      numero: 302,
      andar: 3,
      tipoQuartoId: tiposQuarto[2].id,
      status: 'disponivel',
      observacoes: '',
    },
  ]

  // Funcionários
  const funcionarios: Funcionario[] = [
    {
      id: generateId(),
      nome: 'Ana Souza',
      cargo: 'Recepcionista',
      cpf: '12345678901',
      telefone: '(11) 98765-4321',
      dataAdmissao: '2023-01-15',
      turno: 'manha',
    },
    {
      id: generateId(),
      nome: 'Carlos Lima',
      cargo: 'Gerente',
      cpf: '98765432101',
      telefone: '(11) 99876-5432',
      dataAdmissao: '2022-06-01',
      turno: 'tarde',
    },
  ]

  // Serviços
  const servicos: Servico[] = [
    {
      id: generateId(),
      nome: 'Café da Manhã',
      descricao: 'Café da manhã completo',
      precoUnitario: 35,
      categoria: 'Alimentação',
      unidade: 'por pessoa',
    },
    {
      id: generateId(),
      nome: 'Almoço',
      descricao: 'Almoço no restaurante',
      precoUnitario: 65,
      categoria: 'Alimentação',
      unidade: 'por pessoa',
    },
    {
      id: generateId(),
      nome: 'Jantar',
      descricao: 'Jantar no restaurante',
      precoUnitario: 75,
      categoria: 'Alimentação',
      unidade: 'por pessoa',
    },
    {
      id: generateId(),
      nome: 'Lavanderia',
      descricao: 'Serviço de lavanderia',
      precoUnitario: 45,
      categoria: 'Serviços',
      unidade: 'por kg',
    },
    {
      id: generateId(),
      nome: 'Transfer',
      descricao: 'Transfer aeroporto',
      precoUnitario: 120,
      categoria: 'Transporte',
      unidade: 'por corrida',
    },
  ]

  // Hóspedes
  const hospedes: Hospede[] = [
    {
      id: generateId(),
      nome: 'João Silva',
      cpf: '11122233344',
      email: 'joao.silva@email.com',
      telefone: '(11) 98765-1234',
      dataNascimento: '1985-03-15',
      endereco: 'Rua A, 123, São Paulo, SP',
      tipoDocumento: 'RG',
      numeroDocumento: '123456789',
      criadoEm: new Date().toISOString(),
    },
    {
      id: generateId(),
      nome: 'Maria Santos',
      cpf: '22233344455',
      email: 'maria.santos@email.com',
      telefone: '(11) 98765-5678',
      dataNascimento: '1990-07-22',
      endereco: 'Rua B, 456, Rio de Janeiro, RJ',
      tipoDocumento: 'RG',
      numeroDocumento: '987654321',
      criadoEm: new Date().toISOString(),
    },
    {
      id: generateId(),
      nome: 'Pedro Oliveira',
      cpf: '33344455566',
      email: 'pedro.oliveira@email.com',
      telefone: '(11) 98765-9012',
      dataNascimento: '1988-11-10',
      endereco: 'Rua C, 789, Belo Horizonte, MG',
      tipoDocumento: 'CNH',
      numeroDocumento: '456789123',
      criadoEm: new Date().toISOString(),
    },
  ]

  // Reservas
  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)
  const proximaSemana = new Date(hoje)
  proximaSemana.setDate(proximaSemana.getDate() + 7)
  const semanPassada = new Date(hoje)
  semanPassada.setDate(semanPassada.getDate() - 7)
  const semanPassadaCheckout = new Date(semanPassada)
  semanPassadaCheckout.setDate(semanPassadaCheckout.getDate() + 3)

  const reservas: Reserva[] = [
    {
      id: generateId(),
      hospedeId: hospedes[0].id,
      quartoId: quartos[0].id,
      dataCheckinPrev: amanha.toISOString().split('T')[0],
      dataCheckoutPrev: proximaSemana.toISOString().split('T')[0],
      valorTotal: 150 * 6, // 6 dias
      status: 'confirmada',
      criadoEm: new Date().toISOString(),
    },
    {
      id: generateId(),
      hospedeId: hospedes[1].id,
      quartoId: quartos[2].id,
      dataCheckinPrev: semanPassada.toISOString().split('T')[0],
      dataCheckoutPrev: semanPassadaCheckout.toISOString().split('T')[0],
      valorTotal: 250 * 3 + 35 + 65 + 75, // 3 dias + serviços
      status: 'concluida',
      criadoEm: new Date().toISOString(),
    },
  ]

  // CheckinCheckout
  const checkinCheckout: CheckinCheckout[] = [
    {
      id: generateId(),
      reservaId: reservas[1].id,
      funcionarioId: funcionarios[0].id,
      dataCheckin: semanPassada.toISOString(),
      dataCheckout: semanPassadaCheckout.toISOString(),
      observacoes: 'Hóspede satisfeito com o atendimento',
    },
  ]

  // Consumos
  const consumos: Consumo[] = [
    {
      id: generateId(),
      reservaId: reservas[1].id,
      servicoId: servicos[0].id,
      funcionarioId: funcionarios[0].id,
      quantidade: 1,
      valorTotal: 35,
      dataHora: semanPassada.toISOString(),
    },
    {
      id: generateId(),
      reservaId: reservas[1].id,
      servicoId: servicos[1].id,
      funcionarioId: funcionarios[0].id,
      quantidade: 1,
      valorTotal: 65,
      dataHora: new Date(semanPassada.getTime() + 6 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Pagamentos
  const pagamentos: Pagamento[] = [
    {
      id: generateId(),
      reservaId: reservas[1].id,
      valor: reservas[1].valorTotal,
      formaPagamento: 'cartao',
      status: 'aprovado',
      dataPagamento: semanPassadaCheckout.toISOString(),
      codigoTransacao: 'TRX-' + Math.random().toString(36).substring(7).toUpperCase(),
    },
  ]

  // Avaliações
  const avaliacoes: Avaliacao[] = [
    {
      id: generateId(),
      reservaId: reservas[1].id,
      hospedeId: hospedes[1].id,
      notaGeral: 4,
      notaLimpeza: 5,
      notaAtendimento: 4,
      comentario: 'Excelente experiência, voltarei em breve!',
      dataAvaliacao: new Date().toISOString(),
    },
  ]

  // Save all data
  saveAll('hms_tipos_quarto', tiposQuarto)
  saveAll('hms_quartos', quartos)
  saveAll('hms_funcionarios', funcionarios)
  saveAll('hms_servicos', servicos)
  saveAll('hms_hospedes', hospedes)
  saveAll('hms_reservas', reservas)
  saveAll('hms_checkins', checkinCheckout)
  saveAll('hms_consumos', consumos)
  saveAll('hms_pagamentos', pagamentos)
  saveAll('hms_avaliacoes', avaliacoes)
}
