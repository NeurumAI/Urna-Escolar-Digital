import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Download, 
  Trash2, 
  School, 
  Calendar, 
  Vote, 
  FileJson, 
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Archive,
  AlertCircle
} from 'lucide-react';
import { useVote, ElectionRecord } from '../context/VoteContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Historico() {
  const { history, archiveCurrentElection, deleteFromHistory, schoolName, electionTitle } = useVote();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showConfirmArchive, setShowConfirmArchive] = useState(false);

  const downloadJSON = (record: ElectionRecord) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `eleicao_${record.schoolName}_${record.date.split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCSV = (record: ElectionRecord) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header for Election Info
    csvContent += "ELEICAO:," + record.electionTitle + "\n";
    csvContent += "ESCOLA:," + record.schoolName + "\n";
    csvContent += "DATA:," + new Date(record.date).toLocaleDateString('pt-BR') + "\n";
    csvContent += "TOTAL VOTOS:," + record.totalVotos + "\n\n";

    // Candidates Summary
    csvContent += "RESUMO POR CANDIDATO\n";
    csvContent += "Candidato,Numero,Cargo,Grupo,Votos,Percentual\n";
    record.candidatos.forEach(c => {
      const perc = record.totalVotos > 0 ? Math.round(((c.votos || 0) / record.totalVotos) * 100) : 0;
      csvContent += `${c.nome},${c.numero},${c.cargo},${c.grupo},${c.votos || 0},${perc}%\n`;
    });

    // Special Votes
    csvContent += "\nVOTOS ESPECIAIS\n";
    csvContent += "Tipo,Cargo,Votos\n";
    ['Professor', 'Representante', 'Grêmio'].forEach(cargo => {
      csvContent += `Branco,${cargo},${record.votosEspeciais.branco[cargo] || 0}\n`;
      csvContent += `Nulo,${cargo},${record.votosEspeciais.nulo[cargo] || 0}\n`;
    });

    // Detailed Votes (The "Profile" data)
    csvContent += "\nDETALHAMENTO DE VOTOS (PERFIL)\n";
    csvContent += "Candidato,Sexo,Serie,Turma,Turno,Idade\n";
    record.candidatos.forEach(c => {
      if (c.votosDetalhados && c.votosDetalhados.length > 0) {
        c.votosDetalhados.forEach((v: any) => {
          csvContent += `${c.nome},${v.sexo},${v.serie},${v.turma},${v.turno},${v.idade}\n`;
        });
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eleicao_${record.schoolName}_${record.date.split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Histórico de Eleições</h2>
          <p className="text-slate-500">Gerencie e exporte dados de eleições passadas.</p>
        </div>

        <button 
          onClick={() => setShowConfirmArchive(true)}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
        >
          <Archive size={18} />
          Arquivar Eleição Atual
        </button>
      </header>

      {/* Confirm Archive Modal */}
      <AnimatePresence>
        {showConfirmArchive && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Arquivar Eleição?</h3>
                <p className="text-slate-500 font-medium">
                  Isso salvará os resultados atuais no histórico e **limpará todos os dados** (candidatos e eleitores) para iniciar uma nova eleição do zero.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowConfirmArchive(false)}
                  className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    archiveCurrentElection();
                    setShowConfirmArchive(false);
                  }}
                  className="py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
                >
                  Sim, Arquivar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
              <History size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tight">Nenhum histórico encontrado</h3>
              <p className="text-slate-400 font-medium">Arquive uma eleição finalizada para vê-la aqui.</p>
            </div>
          </div>
        ) : (
          history.map((record) => (
            <div 
              key={record.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
            >
              <div 
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center shrink-0">
                    <School size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{record.schoolName || 'Escola não informada'}</h4>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(record.date).toLocaleDateString('pt-BR')}</span>
                      <span className="flex items-center gap-1"><Vote size={12} /> {record.totalVotos} Votos</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadJSON(record); }}
                      className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                      title="Baixar JSON"
                    >
                      <FileJson size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadCSV(record); }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="Baixar CSV"
                    >
                      <FileSpreadsheet size={20} />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteFromHistory(record.id); }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="text-slate-300 ml-2">
                    {expandedId === record.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === record.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/50"
                  >
                    <div className="p-8 space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Título da Eleição</p>
                          <p className="text-lg font-black text-slate-800 uppercase">{record.electionTitle}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total de Eleitores</p>
                          <p className="text-lg font-black text-slate-800">{record.eleitores.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Candidatos</p>
                          <p className="text-lg font-black text-slate-800">{record.candidatos.length}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Resumo de Votos</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {record.candidatos.slice(0, 6).map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                              <span className="text-xs font-bold text-slate-600 uppercase truncate max-w-[150px]">{c.nome}</span>
                              <span className="text-sm font-black text-violet-600">{c.votos || 0}</span>
                            </div>
                          ))}
                          {record.candidatos.length > 6 && (
                            <div className="flex items-center justify-center p-4 text-[10px] font-bold text-slate-400 uppercase">
                              + {record.candidatos.length - 6} outros candidatos
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          onClick={() => downloadJSON(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                        >
                          <FileJson size={16} />
                          Exportar JSON
                        </button>
                        <button 
                          onClick={() => downloadCSV(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                        >
                          <FileSpreadsheet size={16} />
                          Exportar CSV
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
