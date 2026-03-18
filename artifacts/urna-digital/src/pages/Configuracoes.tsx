import { useState, ReactNode } from 'react';
import { 
  Settings, 
  Lock, 
  Unlock, 
  Trash2, 
  Save, 
  School, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { useVote } from '../context/VoteContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Configuracoes() {
  const { 
    isElectionOpen, 
    setIsElectionOpen, 
    schoolName, 
    setSchoolName, 
    electionTitle, 
    setElectionTitle,
    resetDatabase,
    resetVotes,
    resetStudents,
    resetCandidates,
    isAdmin,
    urnas,
    resetActiveVoter,
  } = useVote();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'all' | 'votes' | 'students' | 'candidates'>('all');
  const [isResetting, setIsResetting] = useState(false);

  const QUOTA_LIMIT = 20000;
  const estimatedWrites = 0;
  const quotaPercentage = Math.min(100, (estimatedWrites / QUOTA_LIMIT) * 100);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      if (resetType === 'all') await resetDatabase();
      else if (resetType === 'votes') await resetVotes();
      else if (resetType === 'students') await resetStudents();
      else if (resetType === 'candidates') await resetCandidates();
      
      setShowResetModal(false);
    } catch (error) {
      console.error("Erro ao resetar banco:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const openResetModal = (type: 'all' | 'votes' | 'students' | 'candidates') => {
    setResetType(type);
    setShowResetModal(true);
  };

  const getResetTitle = () => {
    switch(resetType) {
      case 'votes': return 'Zerar apenas Votos?';
      case 'students': return 'Zerar apenas Eleitores?';
      case 'candidates': return 'Zerar apenas Candidatos?';
      default: return 'Zerar Banco de Dados Completo?';
    }
  };

  const getResetDescription = () => {
    switch(resetType) {
      case 'votes': return 'Esta ação irá apagar todos os votos registrados, mas manterá os eleitores e candidatos.';
      case 'students': return 'Esta ação irá apagar todos os eleitores cadastrados.';
      case 'candidates': return 'Esta ação irá apagar todos os candidatos cadastrados.';
      default: return 'Esta ação irá apagar todos os votos, eleitores, candidatos e histórico. É um reset total.';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações</h2>
        <p className="text-slate-500">Gerencie os parâmetros globais da eleição.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* SIDEBAR CONFIG */}
        <div className="space-y-2">
          <ConfigNavButton active icon={<Settings size={18} />} label="Geral" />
          <ConfigNavButton icon={<ShieldCheck size={18} />} label="Segurança" />
          <ConfigNavButton icon={<Trash2 size={18} />} label="Zona de Perigo" />
          
          {/* QUOTA STATUS */}
          <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uso da Cota (Sessão)</h4>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-full",
                quotaPercentage > 80 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {estimatedWrites.toLocaleString()} / {QUOTA_LIMIT.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  quotaPercentage > 80 ? "bg-rose-500" : "bg-emerald-500"
                )}
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              * Estimativa baseada nas operações desta sessão. O Google reinicia a cota real a cada 24h.
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="md:col-span-2 space-y-6">
          {/* ELECTION STATUS */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800">Status da Eleição</h3>
                <p className="text-xs text-slate-500">Controle a abertura e o fechamento das urnas.</p>
              </div>
              {isAdmin ? (
                <button 
                  onClick={() => setIsElectionOpen(!isElectionOpen)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md",
                    isElectionOpen 
                      ? "bg-violet-600 text-white shadow-violet-100 hover:bg-violet-700" 
                      : "bg-rose-600 text-white shadow-rose-100 hover:bg-rose-700"
                  )}
                >
                  {isElectionOpen ? <Unlock size={18} /> : <Lock size={18} />}
                  {isElectionOpen ? 'ELEIÇÃO ABERTA' : 'ELEIÇÃO FECHADA'}
                </button>
              ) : (
                <div className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-bold border",
                  isElectionOpen ? "text-violet-600 border-violet-100 bg-violet-50" : "text-rose-600 border-rose-100 bg-rose-50"
                )}>
                  {isElectionOpen ? <Unlock size={18} /> : <Lock size={18} />}
                  {isElectionOpen ? 'ABERTA' : 'FECHADA'}
                </div>
              )}
            </div>
            
            <div className={cn(
              "p-4 rounded-xl border flex items-start gap-3",
              isElectionOpen ? "bg-violet-50 border-violet-100" : "bg-rose-50 border-rose-100"
            )}>
              <AlertTriangle size={20} className={isElectionOpen ? "text-violet-600" : "text-rose-600"} />
              <p className={cn("text-xs font-medium leading-relaxed", isElectionOpen ? "text-violet-700" : "text-rose-700")}>
                {isElectionOpen 
                  ? "As urnas estão liberadas para receber votos. O mesário pode autorizar eleitores." 
                  : "As urnas estão bloqueadas. Ninguém pode votar até que a eleição seja aberta."}
              </p>
            </div>
          </section>

          {/* SCHOOL INFO */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <School size={20} className="text-slate-400" />
              Identidade da Eleição
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome da Escola</label>
                <input 
                  type="text" 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Título da Eleição</label>
                <input 
                  type="text" 
                  value={electionTitle}
                  onChange={(e) => setElectionTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* URNA MANAGEMENT */}
          {isAdmin && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-slate-400" />
                  Gerenciamento de Urnas
                </h3>
                <p className="text-xs text-slate-500">Libere ou resete urnas que estejam travadas.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {urnas.length === 0 && (
                  <p className="text-sm text-slate-400 italic">Nenhuma urna conectada no momento.</p>
                )}
                {urnas.map((urna) => (
                  <div key={urna.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                        urna.status === 'votando' ? "bg-emerald-500" : "bg-slate-400"
                      )}>
                        <Settings size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{urna.id}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Status: {urna.status === 'votando' ? 'Em Votação' : 'Aguardando'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => resetActiveVoter(urna.id)}
                      className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
                    >
                      Resetar Urna
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DANGER ZONE */}
          {isAdmin && (
            <section className="bg-rose-50 p-6 rounded-2xl border border-rose-100 space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-rose-800">Zona de Perigo</h3>
                <p className="text-xs text-rose-600">Ações irreversíveis que afetam toda a eleição.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => openResetModal('votes')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={16} />
                  Zerar apenas Votos
                </button>
                <button 
                  onClick={() => openResetModal('students')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={16} />
                  Zerar apenas Eleitores
                </button>
                <button 
                  onClick={() => openResetModal('candidates')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={16} />
                  Zerar apenas Candidatos
                </button>
                <button 
                  onClick={() => openResetModal('all')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
                >
                  <Trash2 size={16} />
                  Zerar Tudo (Reset Total)
                </button>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Dica de Cota do Google</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    O Google Firestore possui um limite diário de 20.000 gravações gratuitas. 
                    Se você tiver muitos dados (ex: 5.000 alunos), cada reset ou importação consome essa cota. 
                    Tente zerar apenas o necessário para economizar recursos.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">{getResetTitle()}</h3>
              <p className="text-slate-500 text-sm">{getResetDescription()}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReset}
                disabled={isResetting}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Apagando...
                  </>
                ) : "Sim, Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ConfigNavButton({ icon, label, active = false }: { icon: ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
      active ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-100"
    )}>
      {icon}
      {label}
    </button>
  );
}
