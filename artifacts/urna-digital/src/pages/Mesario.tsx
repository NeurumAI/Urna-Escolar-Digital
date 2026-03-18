import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  UserPlus, 
  Search, 
  Circle,
  CheckCircle2,
  Play,
  AlertCircle,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { useVote } from '../context/VoteContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Status = 'cinza' | 'verde' | 'azul' | 'vermelho';

const STATUS_LABELS: Record<Status, string> = {
  'cinza': 'Pendente',
  'verde': 'Presente',
  'azul': 'Votou',
  'vermelho': 'Ausente'
};

export default function Mesario() {
  const { eleitores, authorizeVoter, urnas, isElectionOpen, currentUrnaId } = useVote();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTurmas, setExpandedTurmas] = useState<string[]>([]);

  const selectedUrnaId = currentUrnaId || (urnas.length > 0 ? urnas[0].id : null);

  const toggleTurma = (turma: string) => {
    setExpandedTurmas(prev => 
      prev.includes(turma) 
        ? prev.filter(t => t !== turma) 
        : [...prev, turma]
    );
  };

  const turmas = useMemo(() => {
    const groups: Record<string, any[]> = {};
    eleitores.forEach(e => {
      const key = `${e.serie} - ${e.turma}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [eleitores]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'verde': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'azul': return 'text-violet-600 bg-violet-50 border-violet-100';
      case 'vermelho': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  const filteredTurmas = useMemo(() => {
    const filtered: Record<string, any[]> = {};
    Object.entries(turmas).forEach(([key, list]) => {
      const matches = (list as any[]).filter(e => 
        e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.cgm.includes(searchTerm)
      );
      if (matches.length > 0) filtered[key] = matches;
    });
    return filtered;
  }, [turmas, searchTerm]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 pb-20"
    >
      <header className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mesário</h2>
          <p className="text-slate-500">Controle de presença e liberação de eleitores.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CGM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
            />
          </div>

          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-bold",
            selectedUrnaId && urnas.find(u => u.id === selectedUrnaId)?.status === 'votando'
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : selectedUrnaId
                ? "bg-slate-50 border-slate-200 text-slate-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
          )}>
            <div className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              selectedUrnaId && urnas.find(u => u.id === selectedUrnaId)?.status === 'votando'
                ? "bg-emerald-500 animate-pulse"
                : selectedUrnaId ? "bg-slate-400" : "bg-amber-400"
            )} />
            {selectedUrnaId ? "Urna conectada" : "Aguardando urna..."}
          </div>
        </div>
      </header>

      {!isElectionOpen && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">A eleição está fechada nas configurações. Abra-a para liberar eleitores.</p>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(filteredTurmas).map(([turma, list]) => (
          <div key={turma} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleTurma(turma)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                  {turma.split(' ')[0]}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-800">{turma}</h3>
                  <p className="text-xs text-slate-500">{(list as any[]).length} eleitores</p>
                </div>
              </div>
              {(expandedTurmas.includes(turma) || searchTerm.length > 0) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {(expandedTurmas.includes(turma) || searchTerm.length > 0) && (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {(list as any[]).map((e) => (
                  <div key={e.cgm} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                        e.status_voto === 'azul' ? "bg-violet-500 border-violet-500 text-white" : "border-slate-200 text-slate-300"
                      )}>
                        {e.status_voto === 'azul' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{e.nome}</p>
                        <p className="text-xs text-slate-500 font-mono">CGM: {e.cgm}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <div className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold border",
                        getStatusColor(e.status_voto)
                      )}>
                        {STATUS_LABELS[e.status_voto as Status]}
                      </div>
                      
                      {['cinza', 'vermelho'].includes(e.status_voto) && (
                        <button 
                          disabled={!selectedUrnaId || !isElectionOpen}
                          onClick={() => selectedUrnaId && authorizeVoter(e.cgm, selectedUrnaId)}
                          className={cn(
                            "flex-1 sm:flex-none p-2 rounded-xl border transition-all flex items-center justify-center gap-2 text-xs font-bold",
                            (!selectedUrnaId || !isElectionOpen)
                              ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                              : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <Play size={14} fill="currentColor" />
                          {urnas.find(u => u.student_matricula_ativa === e.cgm) ? "Liberado" : "Liberar"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-30">
        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
          <UserPlus size={20} />
          Adicionar Eleitor Manual
        </button>
      </div>
    </motion.div>
  );
}
