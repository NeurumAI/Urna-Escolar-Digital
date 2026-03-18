import { Lock, Monitor, Fingerprint } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVote } from '../context/VoteContext';

// Sons da Urna (Simulados)
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.log('Audio not supported or blocked');
  }
};

const playConfirmBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not supported or blocked');
  }
};

type Step = 'Professor' | 'Representante' | 'Grêmio' | 'Fim';

export default function Urna() {
  const { 
    candidatos, 
    recordVote, 
    resetActiveVoter, 
    activeVoter, 
    isElectionOpen,
    schoolName,
    electionTitle,
    currentUrnaId,
  } = useVote();
  const [step, setStep] = useState<Step>('Professor');
  const [numero, setNumero] = useState('');
  const [candidato, setCandidato] = useState<any>(null);
  const [isBranco, setIsBranco] = useState(false);

  // Determina se o votante é aluno (vota 3x) ou professor/funcionario (vota 1x no grêmio)
  const isAluno = activeVoter?.tipo === 'aluno';

  // Passos disponíveis por tipo de votante
  const steps: Step[] = isAluno
    ? ['Professor', 'Representante', 'Grêmio']
    : ['Grêmio'];

  const stepIndex = steps.indexOf(step);
  const totalSteps = steps.length;

  // Verifica se um candidato Representante pertence à turma do eleitor
  const isRepresentanteElegivel = (c: any): boolean => {
    if (!activeVoter) return false;
    const grupoUpper = c.grupo.trim().toUpperCase();
    const turmaUpper = activeVoter.turma.trim().toUpperCase();
    const grupoEndsWithTurma = grupoUpper.endsWith(turmaUpper) ||
      grupoUpper.endsWith(` ${turmaUpper}`);
    const serieYear = activeVoter.serie.match(/\d+/)?.[0] ?? '';
    const grupoYear = c.grupo.match(/\d+/)?.[0] ?? '';
    const yearsMatch = serieYear && grupoYear ? serieYear === grupoYear : true;
    return grupoEndsWithTurma && yearsMatch;
  };

  const handleNumber = useCallback((num: string) => {
    if (numero.length < 5 && !isBranco) {
      const novoNumero = numero + num;
      setNumero(novoNumero);
      playBeep();
      
      if (novoNumero.length === 5) {
        let found: any = candidatos.find(c => c.numero === novoNumero && c.cargo === step);
        // Para Representante, o candidato deve ser da turma do eleitor
        if (found && step === 'Representante' && !isRepresentanteElegivel(found)) {
          found = undefined;
        }
        setCandidato(found || 'nulo');
      }
    }
  }, [numero, isBranco, step, candidatos, activeVoter]);

  const handleBranco = () => {
    if (numero === '') {
      setIsBranco(true);
      setNumero('');
      setCandidato(null);
      playBeep();
    }
  };

  const handleCorrige = () => {
    setNumero('');
    setCandidato(null);
    setIsBranco(false);
    playBeep();
  };

  const handleConfirma = () => {
    if (isBranco || (numero.length === 5)) {
      playConfirmBeep();
      
      const currentCargo = step as string;
      if (isBranco) {
        recordVote('BRANCO', currentCargo);
      } else if (candidato === 'nulo') {
        recordVote('NULO', currentCargo);
      } else if (candidato) {
        recordVote(candidato.id, currentCargo);
      }
      
      const nextIndex = stepIndex + 1;
      if (nextIndex < steps.length) {
        setStep(steps[nextIndex]);
      } else {
        setStep('Fim');
        resetActiveVoter();
      }

      setNumero('');
      setCandidato(null);
      setIsBranco(false);
    }
  };

  // Define o passo inicial conforme o tipo do votante
  useEffect(() => {
    if (activeVoter) {
      const startStep: Step = activeVoter.tipo === 'aluno' ? 'Professor' : 'Grêmio';
      setStep(startStep);
      setNumero('');
      setCandidato(null);
      setIsBranco(false);
    }
  }, [activeVoter]);

  useEffect(() => {
    if (step === 'Fim') {
      const timer = setTimeout(() => {
        setStep('Professor');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [step]);


  // TELA DE BLOQUEIO (ELEIÇÃO FECHADA)
  if (!isElectionOpen) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="w-24 h-24 bg-violet-500/20 rounded-3xl flex items-center justify-center text-violet-500 animate-pulse">
          <Lock size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Eleição Fechada</h1>
          <p className="text-slate-400 font-medium max-w-md mx-auto">As urnas estão bloqueadas no momento. Por favor, aguarde a abertura oficial pela coordenação.</p>
        </div>
        <div className="pt-8 border-t border-white/10 w-full max-w-xs">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{schoolName}</p>
        </div>
      </div>
    );
  }

  // TELA DE ESPERA (AGUARDANDO LIBERAÇÃO)
  if (!activeVoter && step !== 'Fim') {
    return (
      <div className="min-h-screen w-full bg-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 rounded-3xl shadow-xl flex items-center justify-center mx-auto p-4 text-white">
            <Fingerprint size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{schoolName}</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Monitor size={12} />
            ID: {currentUrnaId}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div 
                key={i}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                className="w-4 h-4 bg-slate-900 rounded-full"
              />
            ))}
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">Aguardando</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest">Liberação do Mesário</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full">
          <p className="text-sm text-slate-600 leading-relaxed">
            Dirija-se à mesa do mesário com seu documento para autorizar seu voto.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Dica para o Administrador:</p>
            <p className="text-[10px] text-slate-400 mt-1">Acesse a aba <b>Votantes</b> no painel e clique em <b>Autorizar</b> para liberar esta urna.</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'Fim') {
    return (
      <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 md:space-y-8"
        >
          <h1 className="text-8xl md:text-[12rem] font-black text-slate-900 leading-none tracking-tighter">FIM</h1>
          <p className="text-lg md:text-2xl font-bold text-slate-500 uppercase tracking-widest">Voto Confirmado com Sucesso</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-200 flex items-center justify-center p-2 sm:p-4 md:p-8">
      {/* CORPO DA URNA */}
      <div className="bg-[#f0f0f0] rounded-xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col md:flex-row w-full max-w-6xl md:h-full md:max-h-[650px] overflow-hidden border-b-[8px] md:border-b-[12px] border-slate-400 relative">
        
        {/* LADO ESQUERDO: TELA */}
        <div className="flex-[1.5] p-3 sm:p-6 md:p-8 flex flex-col min-h-0">
          <div className="flex-1 bg-[#f8f9fa] border-2 md:border-4 border-slate-300 shadow-inner p-4 sm:p-6 md:p-8 flex flex-col relative overflow-hidden min-h-[350px] md:min-h-0">
            
            {/* Cabeçalho da Tela */}
            <div className="flex justify-between items-start mb-4 md:mb-6 shrink-0">
              <div className="space-y-1 flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Passo {stepIndex + 1} de {totalSteps}
                  </p>
                  {activeVoter && (
                    <p className="text-[9px] md:text-xs font-bold text-violet-600 uppercase tracking-widest truncate">
                      · {activeVoter.nome.split(' ').slice(0, 2).join(' ')}
                    </p>
                  )}
                </div>
                <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-tight">Seu voto para:</p>
                <h2 className="text-lg md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                  {step === 'Professor' ? 'Professor de Turma' : step === 'Representante' ? 'Líder de Turma' : 'Grêmio Estudantil'}
                </h2>
                {step === 'Representante' && activeVoter && (
                  <p className="text-[9px] md:text-xs font-medium text-slate-400 uppercase">
                    Turma: {activeVoter.serie} {activeVoter.turma}
                  </p>
                )}
              </div>
              <div className="w-16 h-20 md:w-28 md:h-32 bg-slate-200 rounded-lg flex items-center justify-center border-2 border-slate-300 overflow-hidden shrink-0">
                {candidato && candidato !== 'nulo' && candidato.foto ? (
                  <img src={candidato.foto} alt={candidato.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-[8px] md:text-[10px] font-bold text-slate-400 text-center px-1 md:px-2">FOTO DO CANDIDATO</span>
                )}
              </div>
            </div>

            {/* Slots de Número */}
            <div className="flex gap-1.5 md:gap-3 mb-4 md:mb-10 shrink-0">
              {[0, 1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className={`w-8 h-12 md:w-14 md:h-20 border-2 flex items-center justify-center text-2xl md:text-5xl font-black ${
                    numero.length === i ? 'border-slate-900 bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]' : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  {numero[i] || (numero.length === i && !isBranco ? <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 md:w-1 h-6 md:h-12 bg-slate-900" /> : '')}
                </div>
              ))}
            </div>

            {/* Informações do Candidato */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {isBranco ? (
                <div className="text-center py-2 md:py-8">
                  <h3 className="text-2xl md:text-6xl font-black text-slate-900">VOTO EM BRANCO</h3>
                </div>
              ) : candidato === 'nulo' ? (
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-xl md:text-4xl font-black text-slate-900">NÚMERO ERRADO</h3>
                  <p className="text-base md:text-2xl font-bold text-slate-500 uppercase">VOTO NULO</p>
                </div>
              ) : candidato ? (
                <div className="space-y-2 md:space-y-4">
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-[8px] md:text-sm font-bold text-slate-500 uppercase">Nome:</p>
                    <p className="text-lg md:text-3xl font-black text-slate-900 uppercase leading-tight truncate">{candidato.nome}</p>
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-[8px] md:text-sm font-bold text-slate-500 uppercase">Turma/Grupo:</p>
                    <p className="text-base md:text-2xl font-bold text-slate-700 uppercase truncate">{candidato.grupo}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Rodapé da Tela */}
            <div className="border-t-2 border-slate-300 pt-2 md:pt-4 mt-auto shrink-0">
              <p className="text-[8px] md:text-sm font-bold text-slate-600">Aperte a tecla:</p>
              <div className="flex flex-wrap gap-2 md:gap-8 mt-1">
                <p className="text-[8px] md:text-sm font-medium text-slate-500"><span className="font-bold text-violet-600">CONFIRMA</span> para PROSSEGUIR</p>
                <p className="text-[8px] md:text-sm font-medium text-slate-500"><span className="font-bold text-orange-600">CORRIGE</span> para REINICIAR</p>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: TECLADO */}
        <div className="flex-1 bg-[#2b2b2b] p-4 sm:p-6 md:p-8 flex flex-col items-center min-h-0">
          
          {/* Logo e Nome do Colégio */}
          <div className="w-full flex items-center gap-3 mb-4 md:mb-8 pb-4 md:pb-6 border-b border-white/10 shrink-0">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 rounded-xl flex items-center justify-center shrink-0 overflow-hidden text-white">
              <Fingerprint size={24} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-white font-black text-sm md:text-xl leading-tight tracking-tighter uppercase truncate">{schoolName}</h1>
              <p className="text-white/40 text-[6px] md:text-[10px] font-bold uppercase tracking-widest">{electionTitle}</p>
            </div>
          </div>

          {/* Teclado Numérico */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-12 shrink-0">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handleNumber(n.toString())}
                className="w-10 h-10 md:w-16 md:h-12 bg-[#1a1a1a] text-white text-lg md:text-2xl font-bold rounded shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center border border-white/5"
              >
                {n}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleNumber('0')}
              className="w-10 h-10 md:w-16 md:h-12 bg-[#1a1a1a] text-white text-lg md:text-2xl font-bold rounded shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center border border-white/5"
            >
              0
            </button>
            <div />
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 w-full mt-auto shrink-0 pb-4 lg:pb-0">
            <button
              onClick={handleBranco}
              className="h-10 md:h-14 bg-white text-black font-bold text-[8px] md:text-xs rounded shadow-lg active:translate-y-0.5 transition-all uppercase flex items-center justify-center px-1 text-center"
            >
              Branco
            </button>
            <button
              onClick={handleCorrige}
              className="h-10 md:h-14 bg-[#f37021] text-black font-bold text-[8px] md:text-xs rounded shadow-lg active:translate-y-0.5 transition-all uppercase flex items-center justify-center px-1 text-center"
            >
              Corrige
            </button>
            <button
              onClick={handleConfirma}
              className={`h-12 md:h-16 bg-violet-600 text-white font-black text-[10px] md:text-sm rounded shadow-lg active:translate-y-0.5 transition-all uppercase flex items-center justify-center px-1 text-center col-span-1 ${
                (numero.length === 5 || isBranco) ? 'opacity-100' : 'opacity-80'
              }`}
            >
              Confirma
            </button>
          </div>
        </div>

        {/* Detalhes Estéticos (Ranhuras) */}
        <div className="absolute bottom-0 left-0 w-full flex justify-around px-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-1 h-2 bg-slate-400/30 rounded-t" />
          ))}
        </div>
      </div>
    </div>
  );
}
