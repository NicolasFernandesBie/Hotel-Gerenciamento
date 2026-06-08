export interface Hospede {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
  dataNascimento: string
  endereco: string
  tipoDocumento: 'RG' | 'CNH' | 'Passaporte' | 'RNE'
  numeroDocumento: string
  criadoEm: string
}

export interface Quarto {
  id: string
  numero: number
  andar: number
  tipoQuartoId: string
  status: 'disponivel' | 'ocupado' | 'manutencao'
  observacoes?: string
}

export interface TipoQuarto {
  id: string
  nome: string
  descricao: string
  capacidade: number
  precoDiaria: number
  comodidades: string[]
}

export interface Reserva {
  id: string
  hospedeId: string
  quartoId: string
  dataCheckinPrev: string
  dataCheckoutPrev: string
  valorTotal: number
  status: 'confirmada' | 'concluida' | 'cancelada'
  criadoEm: string
}

export interface Funcionario {
  id: string
  nome: string
  cargo: string
  cpf: string
  telefone: string
  dataAdmissao: string
  turno: 'manha' | 'tarde' | 'noite'
}

export interface Servico {
  id: string
  nome: string
  descricao: string
  precoUnitario: number
  categoria: string
  unidade: string
}

export interface Consumo {
  id: string
  reservaId: string
  servicoId: string
  funcionarioId: string
  quantidade: number
  valorTotal: number
  dataHora: string
}

export interface Pagamento {
  id: string
  reservaId: string
  valor: number
  formaPagamento: string
  status: 'pendente' | 'aprovado' | 'recusado'
  dataPagamento?: string
  codigoTransacao: string
}

export interface Avaliacao {
  id: string
  reservaId: string
  hospedeId: string
  notaGeral: number
  notaLimpeza: number
  notaAtendimento: number
  comentario?: string
  dataAvaliacao: string
}

export interface CheckinCheckout {
  id: string
  reservaId: string
  funcionarioId: string
  dataCheckin: string
  dataCheckout: string | null
  observacoes: string
}
