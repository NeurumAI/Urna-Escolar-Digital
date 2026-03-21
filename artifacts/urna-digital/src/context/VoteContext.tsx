import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { Eleitor, Candidato } from '../data/initialData';
import { OperationType, SupabaseErrorInfo } from '../types';

export { OperationType };
export type { SupabaseErrorInfo };

export interface VotoDetalhado {
  sexo: string;
  idade: number;
  serie: string;
  turma: string;
  turno: string;
}

export interface ElectionConfig {
  // Available cargo (positions) for this election
  cargos: string[]; // e.g., ['Professor', 'Representante', 'Grêmio']
  cargoDigitos?: Record<string, number>; // e.g., { 'Professor': 5, 'Representante': 2 }
}

export interface ElectionRecord {
  id: string;
  date: string;
  schoolName: string;
  electionTitle: string;
  eleitores: Eleitor[];
  candidatos: Candidato[];
  votosEspeciais: {
    branco: Record<string, number>;
    nulo: Record<string, number>;
  };
  totalVotos: number;
  config?: ElectionConfig;
}

interface VoteContextType {
  eleitores: Eleitor[];
  candidatos: Candidato[];
  activeVoter: Eleitor | null;
  isElectionOpen: boolean;
  schoolName: string;
  electionTitle: string;
  electionConfig: ElectionConfig;
  votosEspeciais: {
    branco: Record<string, number>;
    nulo: Record<string, number>;
  };
  history: ElectionRecord[];
  urnas: any[];
  currentUrnaId: string | null;
  setCurrentUrnaId: (id: string) => void;
  authorizeVoter: (cgm: string, urnaId: string) => Promise<void>;
  recordVote: (candidatoId: string | 'BRANCO' | 'NULO', cargo: string) => Promise<void>;
  resetActiveVoter: (urnaId?: string) => Promise<void>;
  setIsElectionOpen: (open: boolean) => Promise<void>;
  setSchoolName: (name: string) => Promise<void>;
  setElectionTitle: (title: string) => Promise<void>;
  setElectionConfig: (config: ElectionConfig) => void;
  resetDatabase: () => Promise<void>;
  resetVotes: () => Promise<void>;
  resetStudents: () => Promise<void>;
  resetCandidates: () => Promise<void>;
  archiveCurrentElection: () => Promise<void>;
  deleteFromHistory: (id: string) => Promise<void>;
  addEleitor: (eleitor: Eleitor) => Promise<void>;
  addEleitoresBulk: (eleitores: Eleitor[]) => Promise<void>;
  removeEleitor: (cgm: string) => Promise<void>;
  removeEleitoresBulk: (cgms: string[]) => Promise<void>;
  addCandidato: (candidato: Candidato) => Promise<void>;
  addCandidatosBulk: (candidatos: Candidato[]) => Promise<void>;
  removeCandidato: (id: string) => Promise<void>;
  removeCandidatosBulk: (ids: string[]) => Promise<void>;
  user: User | null;
  isAdmin: boolean;
  isAuthReady: boolean;
  error: string | null;
  clearError: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [eleitores, setEleitores] = useState<Eleitor[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [activeVoter, setActiveVoter] = useState<Eleitor | null>(null);
  const [isElectionOpen, setIsElectionOpenLocal] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [electionTitle, setElectionTitle] = useState('');
  // Initialize config from localStorage or use defaults
  const [electionConfig, setElectionConfigLocal] = useState<ElectionConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('electionConfig');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          console.log('📦 Loaded config from localStorage:', parsed);
          return parsed;
        } catch (e) {
          console.error('Error parsing saved config:', e);
        }
      }
    }
    return { cargos: ['Professor', 'Representante', 'Grêmio'] };
  });
  const [votosEspeciais, setVotosEspeciais] = useState({
    branco: { Professor: 0, Representante: 0, Grêmio: 0 },
    nulo: { Professor: 0, Representante: 0, Grêmio: 0 }
  });
  const [history, setHistory] = useState<ElectionRecord[]>([]);
  const [urnas, setUrnas] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrnaId, setCurrentUrnaId] = useState<string | null>(null);

  const clearError = () => setError(null);
  
  // FIXED: Always use this single urna ID across all browsers
  const MAIN_URNA_ID = 'MAIN_URNA_001';

  function normalizeRecord<T extends Record<string, any>>(record: T): T {
    const result: any = {};
    for (const key of Object.keys(record)) {
      const val = record[key];
      result[key] = typeof val === 'string' ? val.normalize('NFC') : val;
    }
    return result as T;
  }

  function handleSupabaseError(err: any, operationType: OperationType, path: string | null) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    const errInfo: SupabaseErrorInfo = {
      error: errorMessage,
      authInfo: {
        userId: user?.id,
        email: user?.email,
      },
      operationType,
      path
    };
    
    console.error('Supabase Error: ', JSON.stringify(errInfo));
    setError(`Erro no banco de dados (${operationType}): ${errorMessage}`);
    
    if (operationType === OperationType.CREATE || 
        operationType === OperationType.UPDATE || 
        operationType === OperationType.DELETE || 
        operationType === OperationType.WRITE) {
      throw new Error(JSON.stringify(errInfo));
    }
  }

  // Track auth state - sem login Google, admin sempre ativo
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(true);
      setIsAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(true);
      setIsAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Initialize the SINGLE fixed urna on app startup
  useEffect(() => {
    if (!isAuthReady) return;

    const initializeMainUrna = async () => {
      try {
        // Check if main urna exists
        const { data: existing, error: checkError } = await supabase
          .from('urnas')
          .select('*')
          .eq('id', MAIN_URNA_ID)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          // Urna doesn't exist, create it
          const { error: insertError } = await supabase.from('urnas').insert({
            id: MAIN_URNA_ID,
            status: 'aguardando',
            student_matricula_ativa: null,
            last_active: new Date().toISOString()
          });
          if (insertError) {
            console.error('Error creating main urna:', insertError);
          } else {
            console.log('✅ Main urna created');
            setCurrentUrnaId(MAIN_URNA_ID);
          }
        } else if (!checkError) {
          // Urna exists, just use it
          console.log('✅ Main urna exists, using it');
          setCurrentUrnaId(MAIN_URNA_ID);
        }
      } catch (error) {
        console.error('Error initializing main urna:', error);
      }
    };

    initializeMainUrna();
  }, [isAuthReady, MAIN_URNA_ID]);

  // Real-time listeners
  useEffect(() => {
    if (!isAuthReady) return;

    // Initial fetches
    const fetchInitialData = async () => {
      try {
        const [
          { data: students },
          { data: candidates },
          { data: urnasData },
          { data: historyData },
          { data: votesData }
        ] = await Promise.all([
          supabase.from('students').select('*'),
          supabase.from('candidates').select('*'),
          supabase.from('urnas').select('*'),
          supabase.from('history').select('*'),
          supabase.from('votes').select('*')
        ]);

        const { data: activeElection } = await supabase
          .from('elections').select('*').eq('id', 'active').maybeSingle();

        if (students) setEleitores(students.map(normalizeRecord));
        if (candidates) setCandidatos(candidates.map(normalizeRecord));
        if (urnasData) {
          setUrnas(urnasData);
          // Restore active voter on page load/refresh
          if (currentUrnaId) {
            const myUrna = urnasData.find((u: any) => u.id === currentUrnaId);
            if (myUrna?.student_matricula_ativa) {
              const { data: student } = await supabase
                .from('students')
                .select('*')
                .eq('cgm', myUrna.student_matricula_ativa)
                .single();
              if (student) setActiveVoter(normalizeRecord(student));
            }
          }
        }
        if (activeElection) {
          setIsElectionOpenLocal(activeElection.status === 'aberta');
          setSchoolName(activeElection.school_name || '');
          setElectionTitle(activeElection.title || '');
        }
        if (historyData) setHistory(historyData);
        if (votesData) {
          processVotes(votesData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    const processVotes = (votes: any[]) => {
      const newVotosEspeciais = {
        branco: { Professor: 0, Representante: 0, Grêmio: 0 },
        nulo: { Professor: 0, Representante: 0, Grêmio: 0 }
      };
      
      votes.forEach(v => {
        if (v.candidate_id === 'BRANCO') {
          newVotosEspeciais.branco[v.cargo as keyof typeof newVotosEspeciais.branco]++;
        } else if (v.candidate_id === 'NULO') {
          newVotosEspeciais.nulo[v.cargo as keyof typeof newVotosEspeciais.nulo]++;
        }
      });
      setVotosEspeciais(newVotosEspeciais);

      // Also update candidate vote counts locally based on votes collection
      setCandidatos(prev => prev.map(c => {
        const candidateVotes = votes.filter(v => v.candidate_id === c.id);
        return {
          ...c,
          votos: candidateVotes.length,
          votosDetalhados: candidateVotes.map(v => ({
            sexo: v.sexo,
            idade: v.idade,
            serie: v.serie,
            turma: v.turma,
            turno: v.turno
          }))
        };
      }));
    };

    fetchInitialData();

    // Subscriptions
    const studentsChannel = supabase.channel('students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        supabase.from('students').select('*').then(({ data }) => data && setEleitores(data.map(normalizeRecord)));
      })
      .subscribe();

    const candidatesChannel = supabase.channel('candidates-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => {
        supabase.from('candidates').select('*').then(({ data }) => data && setCandidatos(data.map(normalizeRecord)));
      })
      .subscribe();

    const urnasChannel = supabase.channel('urnas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'urnas' }, (payload) => {
        supabase.from('urnas').select('*').then(({ data }) => {
          if (data) {
            setUrnas(data);
            if (currentUrnaId) {
              const myUrna = data.find(u => u.id === currentUrnaId);
              if (myUrna && myUrna.student_matricula_ativa) {
                supabase.from('students')
                  .select('*')
                  .eq('cgm', myUrna.student_matricula_ativa)
                  .single()
                  .then(({ data: student }) => {
                    if (student) setActiveVoter(student);
                  });
              } else {
                setActiveVoter(null);
              }
            }
          }
        });
      })
      .subscribe();

    const electionChannel = supabase.channel('election-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'elections', filter: 'id=eq.active' }, (payload) => {
        const data = payload.new as any;
        if (data) {
          setIsElectionOpenLocal(data.status === 'aberta');
          setSchoolName(data.school_name || '');
          setElectionTitle(data.title || '');
          // Load election config if it exists
          if (data.config) {
            try {
              const config = typeof data.config === 'string' 
                ? JSON.parse(data.config) 
                : data.config;
              setElectionConfigLocal(config);
            } catch (e) {
              console.error('Error parsing election config:', e);
            }
          }
        }
      })
      .subscribe();

    const historyChannel = supabase.channel('history-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'history' }, () => {
        supabase.from('history').select('*').then(({ data }) => data && setHistory(data));
      })
      .subscribe();

    const votesChannel = supabase.channel('votes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        supabase.from('votes').select('*').then(({ data }) => data && processVotes(data));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(candidatesChannel);
      supabase.removeChannel(urnasChannel);
      supabase.removeChannel(electionChannel);
      supabase.removeChannel(historyChannel);
      supabase.removeChannel(votesChannel);
    };
  }, [isAuthReady, currentUrnaId]);

  const authorizeVoter = async (cgm: string, urnaId: string) => {
    try {
      // CRITICAL: Must atomically reset ALL voting students and set new voter
      // Step 1: Get all students currently voting (verde)
      const { data: allVoting } = await supabase
        .from('students')
        .select('cgm')
        .eq('status_voto', 'verde');

      // Step 2: Reset all other verde voters back to cinza in sequence
      if (allVoting && allVoting.length > 0) {
        for (const voter of allVoting) {
          if (voter.cgm !== cgm) {
            await supabase
              .from('students')
              .update({ status_voto: 'cinza' })
              .eq('cgm', voter.cgm)
              .select(); // Force immediate execution
          }
        }
      }

      // Step 3: Update the urna with new voter
      await supabase
        .from('urnas')
        .update({ 
          student_matricula_ativa: cgm, 
          status: 'votando',
          last_active: new Date().toISOString()
        })
        .eq('id', urnaId)
        .select(); // Force immediate execution

      // Step 4: Mark the new voter as voting
      await supabase
        .from('students')
        .update({ status_voto: 'verde' })
        .eq('cgm', cgm)
        .select(); // Force immediate execution

      console.log(`✅ Authorized voter ${cgm} on urna ${urnaId}`);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, `urnas/${urnaId} or students/${cgm}`);
    }
  };

  const recordVote = async (candidatoId: string | 'BRANCO' | 'NULO', cargo: string) => {
    if (!activeVoter || !currentUrnaId) return;

    try {
      const voteId = `${activeVoter.cgm}-${cargo}`;
      await supabase.from('votes').upsert({
        id: voteId,
        election_id: 'active',
        student_matricula: activeVoter.cgm,
        candidate_id: candidatoId,
        cargo: cargo,
        urna_id: currentUrnaId,
        timestamp: new Date().toISOString(),
        sexo: activeVoter.sexo,
        idade: activeVoter.idade,
        serie: activeVoter.serie,
        turma: activeVoter.turma,
        turno: activeVoter.turno
      });

      if (cargo === 'Grêmio') {
        await supabase
          .from('students')
          .update({ status_voto: 'azul' })
          .eq('cgm', activeVoter.cgm);
          
        await supabase
          .from('urnas')
          .update({
            student_matricula_ativa: null,
            status: 'aguardando'
          })
          .eq('id', currentUrnaId);
      }
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'votes');
    }
  };

  const resetActiveVoter = async (urnaId?: string) => {
    const id = urnaId || currentUrnaId;
    if (id) {
      try {
        await supabase
          .from('urnas')
          .update({
            student_matricula_ativa: null,
            status: 'aguardando'
          })
          .eq('id', id);
      } catch (error) {
        handleSupabaseError(error, OperationType.WRITE, `urnas/${id}`);
      }
    }
  };

  const setIsElectionOpen = async (open: boolean) => {
    try {
      setIsElectionOpenLocal(open);
      await supabase
        .from('elections')
        .upsert({
          id: 'active',
          status: open ? 'aberta' : 'fechada',
          school_name: schoolName,
          title: electionTitle
        });
    } catch (error) {
      setIsElectionOpenLocal(!open);
      handleSupabaseError(error, OperationType.WRITE, 'elections/active');
    }
  };

  const setSchoolNameSupabase = async (name: string) => {
    try {
      setSchoolName(name);
      await supabase
        .from('elections')
        .update({ school_name: name })
        .eq('id', 'active');
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'elections/active');
    }
  };

  const setElectionTitleSupabase = async (title: string) => {
    try {
      setElectionTitle(title);
      await supabase
        .from('elections')
        .update({ title: title })
        .eq('id', 'active');
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'elections/active');
    }
  };

  const setElectionConfig = (config: ElectionConfig) => {
    console.log('💾 Saving config:', config);
    setElectionConfigLocal(config);
    // Save to localStorage for persistence
    try {
      localStorage.setItem('electionConfig', JSON.stringify(config));
      console.log('✅ Config saved to localStorage');
    } catch (e) {
      console.error('Error saving config to localStorage:', e);
    }
  };

  const resetCollection = async (collName: string) => {
    console.log(`Limpando coleção: ${collName}...`);
    let result;
    if (collName === 'students') {
      result = await supabase.from(collName).delete().neq('cgm', '');
    } else {
      result = await supabase.from(collName).delete().neq('id', '');
    }
    if (result.error) throw result.error;
    console.log(`Coleção ${collName} limpa com sucesso.`);
  };

  const resetVotes = async () => {
    try {
      await resetCollection('votes');
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, 'votes');
    }
  };

  const resetStudents = async () => {
    try {
      await resetCollection('students');
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, 'students');
    }
  };

  const resetCandidates = async () => {
    try {
      await resetCollection('candidates');
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, 'candidates');
    }
  };

  const resetDatabase = async () => {
    try {
      console.log('Iniciando reset completo do banco de dados...');
      const collections = ['students', 'candidates', 'votes', 'urnas', 'history'];
      
      for (const coll of collections) {
        await resetCollection(coll);
      }
      
      console.log('Reinicializando configurações da eleição...');
      await supabase.from('elections').upsert({
        id: 'active',
        title: 'Eleições de Representantes 2024',
        school_name: 'Escola Estadual de Teste',
        status: 'fechada'
      });

      if (currentUrnaId) {
        console.log(`Registrando urna atual: ${currentUrnaId}`);
        await supabase.from('urnas').insert({
          id: currentUrnaId,
          status: 'aguardando',
          student_matricula_ativa: null
        });
      }
      console.log('Reset do banco de dados concluído com sucesso.');
    } catch (error) {
      console.error('Erro crítico durante resetDatabase:', error);
      handleSupabaseError(error, OperationType.DELETE, 'multiple collections during reset');
    }
  };

  const archiveCurrentElection = async () => {
    try {
      const totalVotos = eleitores.filter(e => e.status_voto === 'azul').length;
      const record: ElectionRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        schoolName,
        electionTitle,
        eleitores,
        candidatos,
        votosEspeciais,
        totalVotos
      };

      await supabase.from('history').insert(record);
      await resetDatabase();
    } catch (error) {
      handleSupabaseError(error, OperationType.CREATE, 'history');
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await supabase.from('history').delete().eq('id', id);
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `history/${id}`);
    }
  };

  const addEleitor = async (e: Eleitor) => {
    try {
      await supabase.from('students').upsert(e);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, `students/${e.cgm}`);
    }
  };

  const addEleitoresBulk = async (newEleitores: Eleitor[]) => {
    try {
      const BATCH_SIZE = 500;
      console.log(`Iniciando importação de ${newEleitores.length} eleitores...`);
      for (let i = 0; i < newEleitores.length; i += BATCH_SIZE) {
        const chunk = newEleitores.slice(i, i + BATCH_SIZE);
        await supabase.from('students').upsert(chunk);
      }
      console.log('Importação de eleitores finalizada com sucesso.');
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'students bulk');
    }
  };

  const removeEleitor = async (cgm: string) => {
    try {
      await supabase.from('students').delete().eq('cgm', cgm);
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `students/${cgm}`);
    }
  };

  const removeEleitoresBulk = async (cgms: string[]) => {
    try {
      const BATCH_SIZE = 500;
      for (let i = 0; i < cgms.length; i += BATCH_SIZE) {
        const chunk = cgms.slice(i, i + BATCH_SIZE);
        await supabase.from('students').delete().in('cgm', chunk);
      }
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, 'students bulk');
    }
  };

  const toCandidatoRow = (c: Candidato) => ({
    id: c.id,
    nome: c.nome,
    numero: c.numero,
    cargo: c.cargo,
    grupo: c.grupo,
    foto: c.foto ?? null,
  });

  const addCandidato = async (c: Candidato) => {
    try {
      const { error } = await supabase.from('candidates').upsert(toCandidatoRow(c));
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, `candidates/${c.id}`);
    }
  };

  const addCandidatosBulk = async (newCandidatos: Candidato[]) => {
    try {
      const BATCH_SIZE = 500;
      console.log(`Iniciando importação de ${newCandidatos.length} candidatos...`);
      for (let i = 0; i < newCandidatos.length; i += BATCH_SIZE) {
        const chunk = newCandidatos.slice(i, i + BATCH_SIZE).map(toCandidatoRow);
        const { error } = await supabase.from('candidates').upsert(chunk);
        if (error) throw error;
      }
      console.log('Importação de candidatos finalizada com sucesso.');
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'candidates bulk');
    }
  };

  const removeCandidato = async (id: string) => {
    try {
      await supabase.from('candidates').delete().eq('id', id);
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `candidates/${id}`);
    }
  };

  const removeCandidatosBulk = async (ids: string[]) => {
    try {
      const BATCH_SIZE = 500;
      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const chunk = ids.slice(i, i + BATCH_SIZE);
        await supabase.from('candidates').delete().in('id', chunk);
      }
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, 'candidates bulk');
    }
  };

  // Derive effective eleitores with dynamic status_voto
  const effectiveEleitores = React.useMemo(() => {
    return eleitores.map(e => {
      // If student hasn't voted ('cinza') and election is closed, show as 'vermelho' (absent)
      if (e.status_voto === 'cinza' && !isElectionOpen) {
        return { ...e, status_voto: 'vermelho' as const };
      }
      // If student was 'vermelho' but election is open, show as 'cinza'
      if (e.status_voto === 'vermelho' && isElectionOpen) {
        return { ...e, status_voto: 'cinza' as const };
      }
      return e;
    });
  }, [eleitores, isElectionOpen]);

  return (
    <VoteContext.Provider value={{ 
      eleitores: effectiveEleitores, 
      candidatos, 
      activeVoter, 
      isElectionOpen,
      schoolName,
      electionTitle,
      electionConfig,
      votosEspeciais,
      history,
      urnas,
      currentUrnaId,
      setCurrentUrnaId,
      authorizeVoter, 
      recordVote,
      resetActiveVoter,
      setIsElectionOpen,
      setSchoolName: setSchoolNameSupabase,
      setElectionTitle: setElectionTitleSupabase,
      setElectionConfig,
      resetDatabase,
      resetVotes,
      resetStudents,
      resetCandidates,
      archiveCurrentElection,
      deleteFromHistory,
      addEleitor,
      addEleitoresBulk,
      removeEleitor,
      removeEleitoresBulk,
      addCandidato,
      addCandidatosBulk,
      removeCandidato,
      removeCandidatosBulk,
      user,
      isAdmin,
      isAuthReady,
      error,
      clearError,
      signIn,
      signOut
    }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  const context = useContext(VoteContext);
  if (context === undefined) {
    throw new Error('useVote must be used within a VoteProvider');
  }
  return context;
}
