
export interface Eleitor {
  cgm: string;
  nome: string;
  idade: number;
  sexo: string;
  serie: string;
  turma: string;
  turno: string;
  tipo: 'aluno' | 'professor' | 'funcionario';
  status_voto: 'cinza' | 'verde' | 'azul' | 'vermelho';
}

export interface VotoDetalhado {
  sexo: string;
  idade: number;
  serie: string;
  turma: string;
  turno: string;
}

export interface Candidato {
  id: string;
  nome: string;
  numero: string;
  cargo: 'Professor' | 'Representante' | 'Grêmio';
  grupo: string;
  foto?: string;
  votos?: number;
  votosDetalhados?: VotoDetalhado[];
}

export const INITIAL_VOTERS: Eleitor[] = [
  // 1ª série A
  { cgm: "70906589", nome: "ALICIA LEANDRA MACHADO CAVALCANTE", idade: 15, sexo: "F", serie: "1ª série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1023538268", nome: "AMANDA DA SILVA BATISTA", idade: 15, sexo: "F", serie: "1ª série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1030989127", nome: "AUGUSTO PAIVA VIEIRA NETO", idade: 13, sexo: "M", serie: "1ª série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1008098073", nome: "BIANCA SILVA DE SOUZA", idade: 15, sexo: "F", serie: "1ª série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "cinza" },
  { cgm: "1006504180", nome: "CHRISTOFER ISMAEL DA SILVA VICENTE", idade: 15, sexo: "M", serie: "1ª série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  
  // 1ª série B
  { cgm: "1005607023", nome: "AMANDA BARBOSA DA SILVA", idade: 15, sexo: "F", serie: "1ª série", turma: "B", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1011701007", nome: "CARLOS DANIEL NASCIMENTO TAVARES", idade: 15, sexo: "M", serie: "1ª série", turma: "B", turno: "MANHÃ", tipo: "aluno", status_voto: "cinza" },
  
  // 1ª série C
  { cgm: "1005476549", nome: "ALESSANDRO MATOZO", idade: 15, sexo: "M", serie: "1ª série", turma: "C", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1010793773", nome: "ALICIA CESCHIN", idade: 15, sexo: "F", serie: "1ª série", turma: "C", turno: "MANHÃ", tipo: "aluno", status_voto: "cinza" },
  
  // 2ª série A
  { cgm: "1004506924", nome: "ABNER NAPOLEAO PATRUNI", idade: 15, sexo: "M", serie: "2ª série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1009704902", nome: "ANA DANIELY RODRIGUES MACHADO", idade: 16, sexo: "F", serie: "2ª série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  
  // 3ª Série A
  { cgm: "70904241", nome: "ALE WILLIAN ALEXANDRE", idade: 17, sexo: "M", serie: "3ª Série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1018266764", nome: "ALINE FERREIRA DA SILVA", idade: 16, sexo: "F", serie: "3ª Série", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "cinza" },
  
  // 9ºAno A
  { cgm: "1012048196", nome: "ADRIAN PACHECO DUARTE", idade: 14, sexo: "M", serie: "9ºAno", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },
  { cgm: "1016299550", nome: "ALEXIA TESSALIA GOUVEIA SERPA", idade: 13, sexo: "F", serie: "9ºAno", turma: "A", turno: "MANHÃ", tipo: "aluno", status_voto: "azul" },

  // 6ºAno A
  { cgm: "1013232306", nome: "ABNER LUCAS FERREIRA", idade: 11, sexo: "M", serie: "6ºAno", turma: "A", turno: "TARDE", tipo: "aluno", status_voto: "azul" },
  { cgm: "1013146507", nome: "ANTHONY MIGUEL GUIMARÃES DE DEUS", idade: 11, sexo: "M", serie: "6ºAno", turma: "A", turno: "TARDE", tipo: "aluno", status_voto: "azul" },

  // 7ºAno A
  { cgm: "1014152438", nome: "ANA CLARA HARTMANN DO ESPIRITO SANTO", idade: 11, sexo: "F", serie: "7ºAno", turma: "A", turno: "TARDE", tipo: "aluno", status_voto: "azul" },
  { cgm: "1013878079", nome: "ANA KARLA COELHO DE OLIVEIRA", idade: 12, sexo: "F", serie: "7ºAno", turma: "A", turno: "TARDE", tipo: "aluno", status_voto: "cinza" },

  // 8ºAno A
  { cgm: "1011939615", nome: "ANA ALICE BONETTE DOS SANTOS", idade: 13, sexo: "F", serie: "8ºAno", turma: "A", turno: "TARDE", tipo: "aluno", status_voto: "azul" },
  { cgm: "1016709316", nome: "ANA BEATRIZ DA SILVA PEREIRA", idade: 12, sexo: "F", serie: "8ºAno", turma: "A", turno: "TARDE", tipo: "aluno", status_voto: "cinza" },
];

export const INITIAL_CANDIDATES: Candidato[] = [
  // Professores (5 dígitos)
  { 
    id: 'p1', 
    nome: 'PROF. RICARDO ALMEIDA', 
    numero: '10123', 
    cargo: 'Professor', 
    grupo: 'Docentes', 
    votos: 145,
    votosDetalhados: [
      { sexo: 'M', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'F', idade: 16, serie: '2ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'M', idade: 14, serie: '9ºAno', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'F', idade: 12, serie: '7ºAno', turma: 'A', turno: 'TARDE' },
      { sexo: 'M', idade: 15, serie: '1ª série', turma: 'B', turno: 'MANHÃ' },
      { sexo: 'F', idade: 11, serie: '6ºAno', turma: 'A', turno: 'TARDE' },
    ]
  },
  { 
    id: 'p2', 
    nome: 'PROFA. HELENA SOUZA', 
    numero: '10456', 
    cargo: 'Professor', 
    grupo: 'Docentes', 
    votos: 112,
    votosDetalhados: [
      { sexo: 'F', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'M', idade: 17, serie: '3ª Série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'F', idade: 13, serie: '8ºAno', turma: 'A', turno: 'TARDE' },
    ]
  },
  { id: 'p3', nome: 'PROF. MARCOS OLIVEIRA', numero: '10789', cargo: 'Professor', grupo: 'Docentes', votos: 89 },
  
  // Líderes de Turma (5 dígitos)
  { 
    id: 'l1', 
    nome: 'LUCAS SILVA', 
    numero: '20111', 
    cargo: 'Representante', 
    grupo: '1º Ano A', 
    votos: 28,
    votosDetalhados: [
      { sexo: 'M', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'M', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
    ]
  },
  { 
    id: 'l2', 
    nome: 'BEATRIZ SOUZA', 
    numero: '20222', 
    cargo: 'Representante', 
    grupo: '1º Ano B', 
    votos: 24,
    votosDetalhados: [
      { sexo: 'F', idade: 15, serie: '1ª série', turma: 'B', turno: 'MANHÃ' },
    ]
  },
  { id: 'l3', nome: 'MARCOS PAULO', numero: '20333', cargo: 'Representante', grupo: '2º Ano A', votos: 31 },
  { id: 'l4', nome: 'ANA CLARA', numero: '20444', cargo: 'Representante', grupo: '2º Ano B', votos: 19 },
  
  // Chapas do Grêmio (5 dígitos)
  { 
    id: 'g1', 
    nome: 'CHAPA VOZ ATIVA', 
    numero: '30001', 
    cargo: 'Grêmio', 
    grupo: 'Grêmio Estudantil', 
    votos: 186,
    votosDetalhados: [
      { sexo: 'F', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'F', idade: 15, serie: '1ª série', turma: 'B', turno: 'MANHÃ' },
      { sexo: 'M', idade: 15, serie: '1ª série', turma: 'C', turno: 'MANHÃ' },
      { sexo: 'F', idade: 16, serie: '2ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'M', idade: 17, serie: '3ª Série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'M', idade: 11, serie: '6ºAno', turma: 'A', turno: 'TARDE' },
      { sexo: 'F', idade: 12, serie: '7ºAno', turma: 'A', turno: 'TARDE' },
      { sexo: 'F', idade: 13, serie: '8ºAno', turma: 'A', turno: 'TARDE' },
      { sexo: 'M', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'F', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
    ]
  },
  { 
    id: 'g2', 
    nome: 'CHAPA UNIÃO JOVEM', 
    numero: '30002', 
    cargo: 'Grêmio', 
    grupo: 'Grêmio Estudantil', 
    votos: 154,
    votosDetalhados: [
      { sexo: 'M', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'F', idade: 15, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'M', idade: 13, serie: '1ª série', turma: 'A', turno: 'MANHÃ' },
      { sexo: 'F', idade: 15, serie: '1ª série', turma: 'B', turno: 'MANHÃ' },
      { sexo: 'M', idade: 11, serie: '6ºAno', turma: 'A', turno: 'TARDE' },
      { sexo: 'M', idade: 14, serie: '9ºAno', turma: 'A', turno: 'MANHÃ' },
    ]
  },
  { id: 'g3', nome: 'CHAPA NOVA ERA', numero: '30003', cargo: 'Grêmio', grupo: 'Grêmio Estudantil', votos: 92 },
];
