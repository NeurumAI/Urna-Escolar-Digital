import { useState, ReactNode, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Users, 
  Vote, 
  UserMinus, 
  TrendingUp,
  Award,
  Download,
  Loader2,
  CheckCircle,
  PieChart as PieChartIcon,
  Printer,
  ChevronRight,
  School,
  UserCheck,
  Clock,
  Layers,
  VenetianMask
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { useVote, VotoDetalhado } from '../context/VoteContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'];

interface CandidateResultCardProps {
  candidato: any;
  totalVotos: number;
  key?: any;
}

const CandidateResultCard = ({ candidato, totalVotos }: CandidateResultCardProps) => {
  const stats = useMemo(() => {
    const detailedCount = candidato.votosDetalhados?.length || 0;
    if (detailedCount === 0) return null;

    const counts = {
      sexo: {} as Record<string, number>,
      turma: {} as Record<string, number>,
      turno: {} as Record<string, number>
    };

    candidato.votosDetalhados.forEach((v: any) => {
      counts.sexo[v.sexo] = (counts.sexo[v.sexo] || 0) + 1;
      const tKey = `${v.serie} ${v.turma}`;
      counts.turma[tKey] = (counts.turma[tKey] || 0) + 1;
      counts.turno[v.turno] = (counts.turno[v.turno] || 0) + 1;
    });

    const getDistrib = (obj: Record<string, number>) => {
      return Object.entries(obj).map(([name, value]) => ({
        name: name === 'F' ? 'Feminino' : name === 'M' ? 'Masculino' : String(name),
        value,
        percent: Math.round((value / detailedCount) * 100)
      })).sort((a, b) => b.value - a.value);
    };

    return {
      sexo: getDistrib(counts.sexo),
      turma: getDistrib(counts.turma).slice(0, 2),
      turno: getDistrib(counts.turno)
    };
  }, [candidato]);

  return (
    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col gap-5 items-start print:break-inside-avoid hover:border-slate-300 transition-all">
      <div className="w-full flex flex-col sm:flex-row gap-5 items-start">
        {/* Photo */}
        <div className="w-20 h-24 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shrink-0 mx-auto sm:mx-0">
          {candidato.foto ? (
            <img src={candidato.foto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-2xl">
              {candidato.nome.charAt(0)}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <h4 className="font-black text-slate-900 uppercase tracking-tight break-words leading-tight text-lg">{candidato.nome}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">#{candidato.numero}</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 truncate">{candidato.cargo} • {candidato.grupo}</p>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Votos</p>
              <p className="text-2xl font-black text-violet-600 leading-none">{candidato.votos || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Percentual</p>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {candidato.votos && totalVotos > 0 ? Math.round((candidato.votos / totalVotos) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {stats ? (
        <div className="w-full space-y-5 pt-2">
          {/* SEXO */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-1">
              <VenetianMask size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest">Perfil por Sexo</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.sexo.map((item) => (
                <div key={item.name} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-800">{item.percent}%</span>
                    <span className="text-[10px] font-bold text-slate-400">({item.value})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TURMAS E TURNOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-1">
                <Layers size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">Top Turmas</p>
              </div>
              <div className="space-y-2">
                {stats.turma.map((item) => (
                  <div key={item.name} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-600 uppercase truncate max-w-[80px]">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-violet-600">{item.percent}%</span>
                      <span className="text-[9px] font-bold text-slate-400">({item.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-50 pb-1">
                <Clock size={14} />
                <p className="text-[10px] font-black uppercase tracking-widest">Turnos</p>
              </div>
              <div className="space-y-2">
                {stats.turno.map((item) => (
                  <div key={item.name} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-600 uppercase">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800">{item.percent}%</span>
                      <span className="text-[9px] font-bold text-slate-400">({item.value})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full py-6 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Perfil Detalhado Indisponível</p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Aguardando novos votos detalhados</p>
        </div>
      )}
    </div>
  );
}

export default function Painel() {
  const { candidatos, eleitores, schoolName, electionTitle, votosEspeciais } = useVote();
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<string>('Geral');

  // Calculate Voter Turnout Profile Stats (People who actually voted)
  const voterStats = useMemo(() => {
    const stats = {
      sexo: { F: 0, M: 0 },
      idade: {} as Record<number, number>,
      turma: {} as Record<string, number>,
      turno: { MANHÃ: 0, TARDE: 0, NOITE: 0 } as Record<string, number>
    };

    // We take votes from the 'Grêmio' category as a proxy for unique voters who completed the process
    let uniqueVoters: VotoDetalhado[] = [];
    candidatos.filter(c => c.cargo === 'Grêmio').forEach(c => {
      if (c.votosDetalhados) {
        uniqueVoters.push(...c.votosDetalhados);
      }
    });

    // Filter by selected turma if not 'Geral'
    if (selectedTurma !== 'Geral') {
      uniqueVoters = uniqueVoters.filter(v => `${v.serie} ${v.turma}` === selectedTurma);
    }

    if (uniqueVoters.length === 0) {
      return { sexo: [], idade: [], turma: [], turno: [] };
    }

    uniqueVoters.forEach(v => {
      if (v.sexo === 'F' || v.sexo === 'M') {
        stats.sexo[v.sexo]++;
      }
      stats.idade[v.idade] = (stats.idade[v.idade] || 0) + 1;
      const turmaKey = `${v.serie} ${v.turma}`;
      stats.turma[turmaKey] = (stats.turma[turmaKey] || 0) + 1;
      if (v.turno in stats.turno) {
        stats.turno[v.turno as keyof typeof stats.turno]++;
      }
    });

    return {
      sexo: Object.entries(stats.sexo).map(([name, value]) => ({ name: name === 'F' ? 'Feminino' : 'Masculino', value })).filter(i => i.value > 0),
      idade: Object.entries(stats.idade).map(([name, value]) => ({ name: `${name} anos`, value })),
      turma: Object.entries(stats.turma).map(([name, value]) => ({ name, value })),
      turno: Object.entries(stats.turno).map(([name, value]) => ({ name, value })).filter(i => i.value > 0)
    };
  }, [candidatos, selectedTurma]);

  // Rankings
  const rankings = useMemo(() => {
    const sorted = [...candidatos].sort((a, b) => (b.votos || 0) - (a.votos || 0));
    return {
      professores: sorted.filter(c => c.cargo === 'Professor').slice(0, 5),
      lideres: sorted.filter(c => c.cargo === 'Representante').slice(0, 5),
      gremio: sorted.filter(c => c.cargo === 'Grêmio').slice(0, 5)
    };
  }, [candidatos]);

  const turmasList = useMemo(() => {
    const list = Array.from(new Set(eleitores.map(v => `${v.serie} ${v.turma}`)));
    return ['Geral', ...list.sort()];
  }, [eleitores]);

  const totalVotos = useMemo(() => {
    const candidatosVotos = candidatos.reduce((acc, curr) => acc + (curr.votos || 0), 0);
    const brancosVotos = Object.values(votosEspeciais.branco).reduce((a, b) => (a as number) + (b as number), 0) as number;
    const nulosVotos = Object.values(votosEspeciais.nulo).reduce((a, b) => (a as number) + (b as number), 0) as number;
    return candidatosVotos + brancosVotos + nulosVotos;
  }, [candidatos, votosEspeciais]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12 print:p-0 print:space-y-4"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Painel de Resultados</h2>
          <p className="text-slate-500">Acompanhamento em tempo real da apuração.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-violet-600 font-bold text-sm bg-violet-50 px-4 py-2 rounded-xl border border-violet-100"
              >
                <CheckCircle size={16} />
                Relatório Gerado!
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
            {isExporting ? 'Preparando...' : 'Imprimir Relatórios'}
          </button>
        </div>
      </header>

      {/* FILTRO POR TURMA */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 print:hidden">
        {turmasList.map(t => (
          <button
            key={t}
            onClick={() => setSelectedTurma(t)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
              selectedTurma === t 
                ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* SEÇÃO GERAL OU POR TURMA */}
      <div className="space-y-8">
        {/* TÍTULO DA SEÇÃO (Aparece na impressão) */}
        <div className="hidden print:block border-b-4 border-slate-900 pb-4 mb-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Relatório de Votação - {selectedTurma}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{electionTitle} - {schoolName}</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard 
            icon={<Vote size={20} />} 
            label="Total de Votos" 
            value={totalVotos.toString()} 
            trend="Votos registrados"
            color="violet"
          />
          <StatCard 
            icon={<Users size={20} />} 
            label="Eleitores Aptos" 
            value={eleitores.length.toString()} 
            trend="Participação ativa"
            color="blue"
          />
          <StatCard 
            icon={<UserMinus size={20} />} 
            label="Abstenções" 
            value={(eleitores.length - (totalVotos / 3) > 0 ? Math.round(eleitores.length - (totalVotos / 3)) : 0).toString()} 
            trend={`${Math.round(((eleitores.length - (totalVotos / 3)) / eleitores.length) * 100)}% do total`}
            color="rose"
          />
          <StatCard 
            icon={<TrendingUp size={20} />} 
            label="Participação" 
            value={`${Math.round(((totalVotos / 3) / eleitores.length) * 100)}%`} 
            trend="Quórum atual"
            color="amber"
          />
        </div>

        {/* VOTOS BRANCOS E NULOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {['Professor', 'Representante', 'Grêmio'].map(cargo => (
            <div key={cargo} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest border-b pb-2">Votos Especiais: {cargo}</h3>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brancos</p>
                  <p className="text-2xl font-black text-slate-900">{votosEspeciais.branco[cargo] || 0}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nulos</p>
                  <p className="text-2xl font-black text-rose-600">{votosEspeciais.nulo[cargo] || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PERFIL DE VOTANTES */}
        <section className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <PieChartIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Perfil de Quem Votou</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Demografia dos eleitores que já compareceram</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <ChartBox title="Por Sexo" data={voterStats.sexo} type="pie" />
            <ChartBox title="Por Idade" data={voterStats.idade} type="bar" />
            <ChartBox title="Por Turno" data={voterStats.turno} type="pie" />
            <ChartBox title="Por Turma" data={voterStats.turma} type="bar" />
          </div>
        </section>

        {/* RANKINGS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <RankingCard title="Professores" icon={<Award className="text-amber-500" />} candidates={rankings.professores} />
          <RankingCard title="Líderes de Turma" icon={<Users className="text-blue-500" />} candidates={rankings.lideres} />
          <RankingCard title="Grêmio Estudantil" icon={<School className="text-violet-500" />} candidates={rankings.gremio} />
        </div>

        {/* FICHA DE RESULTADO POR CANDIDATO */}
        <section className="space-y-6 print:break-before-page">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Ficha de Resultado por Candidato</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil detalhado de quem votou em cada um</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidatos.filter(c => (c.votos || 0) > 0).sort((a,b) => (b.votos || 0) - (a.votos || 0)).map(c => (
              <CandidateResultCard key={c.id} candidato={c} totalVotos={totalVotos} />
            ))}
          </div>
        </section>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:space-y-4 { margin-top: 1rem !important; }
          .print\\:border-none { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:break-before-page { break-before: page; }
          .recharts-responsive-container { min-height: 200px !important; }
        }
      `}</style>
    </motion.div>
  );
}

function RankingCard({ title, icon, candidates }: { title: string, icon: ReactNode, candidates: any[] }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 print:break-inside-avoid">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {candidates.map((c, i) => (
          <div key={c.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black",
                i === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
              )}>
                {i + 1}º
              </span>
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                {c.foto ? <img src={c.foto} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">{c.nome.charAt(0)}</div>}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800 uppercase truncate">{c.nome}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{c.grupo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-900">{c.votos || 0}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">votos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartBox({ title, data, type }: { title: string, data: any[], type: 'pie' | 'bar' }) {
  const hasData = data.length > 0 && data.some(item => item.value > 0);

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{title}</h4>
      <div className="h-48 sm:h-56 lg:h-64 w-full flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            ) : (
              <BarChart data={data}>
                <XAxis dataKey="name" hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <PieChartIcon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sem dados</p>
          </div>
        )}
      </div>
      {hasData && (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {data.slice(0, 4).map((item: any, i: number) => (
            <div key={item.name} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-[8px] font-bold text-slate-500 uppercase">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: ReactNode, label: string, value: string, trend: string, color: string }) {
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 print:border print:border-slate-100">
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-xl", colorMap[color])}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight print:hidden">{trend}</p>
    </div>
  );
}
