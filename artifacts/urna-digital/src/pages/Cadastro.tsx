import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import { Candidato } from '../data/initialData';

import { useVote } from '../context/VoteContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Cadastro() {
  const { 
    eleitores, 
    candidatos, 
    addEleitor, 
    addEleitoresBulk,
    removeEleitor, 
    removeEleitoresBulk,
    addCandidato, 
    addCandidatosBulk,
    removeCandidato,
    removeCandidatosBulk
  } = useVote();
  const [activeTab, setActiveTab] = useState<'eleitores' | 'candidatos'>('eleitores');
  const [eleitorSearch, setEleitorSearch] = useState('');
  const [candidatoSearch, setCandidatoSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<'eleitores' | 'candidatos' | null>(null);
  
  // Selection states
  const [selectedEleitores, setSelectedEleitores] = useState<string[]>([]);
  const [selectedCandidatos, setSelectedCandidatos] = useState<string[]>([]);
  
  // Form states for new candidate
  const [newNome, setNewNome] = useState('');
  const [newNumero, setNewNumero] = useState('');
  const [newCargo, setNewCargo] = useState<'Professor' | 'Representante' | 'Grêmio'>('Professor');
  const [newGrupo, setNewGrupo] = useState('');
  const [newFoto, setNewFoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const spreadsheetInputRef = useRef<HTMLInputElement>(null);

  // Form states for new eleitor
  const [newEleitorNome, setNewEleitorNome] = useState('');
  const [newEleitorCGM, setNewEleitorCGM] = useState('');
  const [newEleitorSerie, setNewEleitorSerie] = useState('');
  const [newEleitorTurma, setNewEleitorTurma] = useState('');
  const [newEleitorTurno, setNewEleitorTurno] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');
  const [newEleitorTipo, setNewEleitorTipo] = useState<'aluno' | 'professor' | 'funcionario'>('aluno');
  const [showEleitorForm, setShowEleitorForm] = useState(false);

  const handleAddEleitor = (e: FormEvent) => {
    e.preventDefault();
    if (!newEleitorNome || !newEleitorCGM) return;

    const newEleitor: any = {
      cgm: newEleitorCGM,
      nome: newEleitorNome,
      idade: 15, // Default or add field
      sexo: 'M', // Default or add field
      serie: newEleitorSerie,
      turma: newEleitorTurma,
      turno: newEleitorTurno.toUpperCase(),
      tipo: newEleitorTipo,
      status_voto: 'cinza'
    };

    addEleitor(newEleitor);
    setShowEleitorForm(false);
    setNewEleitorNome('');
    setNewEleitorCGM('');
  };

  const toggleSelectEleitor = (cgm: string) => {
    setSelectedEleitores(prev => 
      prev.includes(cgm) ? prev.filter(id => id !== cgm) : [...prev, cgm]
    );
  };

  const toggleSelectAllEleitores = () => {
    if (selectedEleitores.length === filteredEleitores.length) {
      setSelectedEleitores([]);
    } else {
      setSelectedEleitores(filteredEleitores.map(e => e.cgm));
    }
  };

  const handleBulkDeleteEleitores = async () => {
    await removeEleitoresBulk(selectedEleitores);
    setSelectedEleitores([]);
    setShowDeleteConfirm(null);
  };

  const toggleSelectCandidato = (id: string) => {
    setSelectedCandidatos(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCandidatos = () => {
    if (selectedCandidatos.length === filteredCandidatos.length) {
      setSelectedCandidatos([]);
    } else {
      setSelectedCandidatos(filteredCandidatos.map(c => c.id));
    }
  };

  const handleBulkDeleteCandidatos = async () => {
    await removeCandidatosBulk(selectedCandidatos);
    setSelectedCandidatos([]);
    setShowDeleteConfirm(null);
  };

  const filteredEleitores = eleitores.filter(e => 
    e.nome.toLowerCase().includes(eleitorSearch.toLowerCase()) || 
    e.cgm.includes(eleitorSearch)
  );

  const filteredCandidatos = candidatos.filter(c => 
    c.nome.toLowerCase().includes(candidatoSearch.toLowerCase()) || 
    c.numero.includes(candidatoSearch)
  );

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCandidato = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNome || newNumero.length !== 5) return;

    const newCandidato: Candidato = {
      id: Math.random().toString(36).substr(2, 9),
      nome: newNome,
      numero: newNumero,
      cargo: newCargo,
      grupo: newGrupo || (newCargo === 'Professor' ? 'Docentes' : 'Estudantes'),
      foto: newFoto || undefined,
    };

    try {
      await addCandidato(newCandidato);
      setNewNome('');
      setNewNumero('');
      setNewGrupo('');
      setNewFoto(null);
    } catch {
      // error already shown via context error state
    }
  };

  const normalizeStr = (val: unknown): string => {
    return String(val ?? '').normalize('NFC');
  };

  const handleSpreadsheetUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Get data as array of arrays to find the header row
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Find the header row (the one that contains the most matches for expected columns)
        const expectedCols = ['cgm', 'nome', 'número', 'numero', 'matricula', 'serie', 'série', 'turma', 'turno'];
        let headerRowIndex = -1;
        let maxMatches = 0;

        for (let i = 0; i < Math.min(rows.length, 20); i++) {
          const row = rows[i];
          if (!row) continue;
          
          let matches = 0;
          row.forEach(cell => {
            const val = String(cell).toLowerCase().trim();
            if (expectedCols.includes(val)) matches++;
          });

          if (matches > maxMatches) {
            maxMatches = matches;
            headerRowIndex = i;
          }
        }

        if (headerRowIndex === -1 || maxMatches === 0) {
          throw new Error('Não foi possível encontrar o cabeçalho da planilha. Verifique se as colunas (CGM, Nome, etc) estão presentes.');
        }

        // Re-parse from the header row
        const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex });
        console.log(`Planilha lida com sucesso. Total de linhas: ${data.length}`);

        if (data.length > 5000) {
          const proceed = window.confirm(
            `Atenção: Você está tentando importar ${data.length} registros. \n\n` +
            `O Google Firestore (versão gratuita) permite apenas 20.000 gravações por dia. \n` +
            `Esta importação consumirá uma parte significativa da sua cota diária. \n\n` +
            `Deseja continuar?`
          );
          if (!proceed) {
            setIsImporting(false);
            return;
          }
        }

        if (activeTab === 'eleitores') {
          console.log('Processando eleitores...');
          const newEleitores = data.map((row: any) => {
            // Normalize keys to lowercase for easier matching
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
              normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            return {
              cgm: normalizeStr(normalizedRow.cgm || normalizedRow.matricula || Math.random().toString(36).substr(2, 9)),
              nome: normalizeStr(normalizedRow.nome || normalizedRow.estudante || 'Sem Nome').toUpperCase(),
              idade: Number(normalizedRow.idade || 15),
              sexo: normalizeStr(normalizedRow.sexo || 'M').toUpperCase().charAt(0),
              serie: normalizeStr(normalizedRow.serie || normalizedRow.série || normalizedRow.ano || ''),
              turma: normalizeStr(normalizedRow.turma || ''),
              turno: normalizeStr(normalizedRow.turno || 'MANHÃ').toUpperCase(),
              tipo: normalizeStr(normalizedRow.tipo || 'aluno').toLowerCase(),
              status_voto: 'cinza'
            };
          });
          await addEleitoresBulk(newEleitores);
        } else {
          const newCandidatos = data.map((row: any) => {
            const normalizedRow: any = {};
            Object.keys(row).forEach(key => {
              normalizedRow[key.toLowerCase().trim()] = row[key];
            });

            return {
              id: Math.random().toString(36).substr(2, 9),
              nome: normalizeStr(normalizedRow.nome || 'Sem Nome').toUpperCase(),
              numero: normalizeStr(normalizedRow.numero || normalizedRow.número || '00000'),
              cargo: normalizeStr(normalizedRow.cargo || 'Professor') as any,
              grupo: normalizeStr(normalizedRow.grupo || normalizedRow.turma || ''),
              votos: 0,
              votosDetalhados: []
            };
          });
          await addCandidatosBulk(newCandidatos);
        }
        alert('Importação concluída com sucesso!');
      } catch (error) {
        console.error('Error importing spreadsheet:', error);
        alert(error instanceof Error ? error.message : 'Erro ao importar planilha.');
      } finally {
        setIsImporting(false);
        if (spreadsheetInputRef.current) spreadsheetInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Gerenciamento</h2>
          <p className="text-slate-500">Cadastre eleitores e candidatos para a eleição.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('eleitores')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'eleitores' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Eleitores
          </button>
          <button 
            onClick={() => setActiveTab('candidatos')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === 'candidatos' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Candidatos
          </button>
        </div>
      </header>

      {activeTab === 'eleitores' ? (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar eleitor..." 
                    value={eleitorSearch}
                    onChange={(e) => setEleitorSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all" 
                  />
                </div>
                  <div className="flex items-center gap-2">
                    {selectedEleitores.length > 0 && (
                      <div className="flex items-center gap-2">
                        {showDeleteConfirm === 'eleitores' ? (
                          <>
                            <button 
                              onClick={handleBulkDeleteEleitores}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-sm"
                            >
                              Confirmar ({selectedEleitores.length})
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition-all"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setShowDeleteConfirm('eleitores')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all border border-red-100"
                          >
                            <Trash2 size={18} /> Excluir ({selectedEleitores.length})
                          </button>
                        )}
                      </div>
                    )}
                    <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"><Filter size={18} /></button>
                  <button 
                    onClick={() => setShowEleitorForm(!showEleitorForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                  >
                    <UserPlus size={18} /> {showEleitorForm ? 'Fechar' : 'Novo Eleitor'}
                  </button>
                </div>
              </div>

              {showEleitorForm && (
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <form onSubmit={handleAddEleitor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nome</label>
                      <input 
                        type="text" 
                        value={newEleitorNome}
                        onChange={(e) => setNewEleitorNome(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">CGM</label>
                      <input 
                        type="text" 
                        value={newEleitorCGM}
                        onChange={(e) => setNewEleitorCGM(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Matrícula"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                      <select 
                        value={newEleitorTipo}
                        onChange={(e) => setNewEleitorTipo(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      >
                        <option value="aluno">Aluno</option>
                        <option value="professor">Professor</option>
                        <option value="funcionario">Funcionário</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Série</label>
                      <input 
                        type="text" 
                        value={newEleitorSerie}
                        onChange={(e) => setNewEleitorSerie(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Ex: 1ª série"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Turma</label>
                      <input 
                        type="text" 
                        value={newEleitorTurma}
                        onChange={(e) => setNewEleitorTurma(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Ex: A"
                      />
                    </div>
                    <div className="flex items-end">
                      <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Salvar Eleitor</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 w-10">
                        <input 
                          type="checkbox" 
                          checked={selectedEleitores.length === filteredEleitores.length && filteredEleitores.length > 0}
                          onChange={toggleSelectAllEleitores}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nome / CGM</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Série / Turma</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEleitores.map((e) => (
                      <tr key={e.cgm} className={cn(
                        "hover:bg-slate-50/50 transition-colors",
                        selectedEleitores.includes(e.cgm) && "bg-slate-50"
                      )}>
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedEleitores.includes(e.cgm)}
                            onChange={() => toggleSelectEleitor(e.cgm)}
                            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 text-sm">{e.nome}</p>
                          <p className="text-xs text-slate-500 font-mono">{e.cgm}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{e.serie} - {e.turma}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => removeEleitor(e.cgm)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><Upload size={24} /></div>
                <div>
                  <h3 className="font-bold text-lg">Importar Planilha</h3>
                  <p className="text-slate-400 text-sm">Adicione centenas de {activeTab} de uma só vez.</p>
                </div>
                <input 
                  ref={spreadsheetInputRef}
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                  onChange={handleSpreadsheetUpload}
                />
                <button 
                  onClick={() => spreadsheetInputRef.current?.click()}
                  disabled={isImporting}
                  className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  {isImporting ? 'Importando...' : 'Selecionar Arquivo'}
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="font-bold text-slate-800">Resumo</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total de Eleitores</span>
                    <span className="font-bold text-slate-900">{eleitores.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Turmas Ativas</span>
                    <span className="font-bold text-slate-900">
                      {new Set(eleitores.map(e => `${e.serie}-${e.turma}`)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Novo Candidato</h3>
                  <p className="text-sm text-slate-500">Preencha os dados para registrar um novo candidato.</p>
                </div>
                
                <form onSubmit={handleAddCandidato} className="space-y-4">
                  <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 relative group">
                    {newFoto ? (
                      <div className="relative w-32 h-32">
                        <img src={newFoto} alt="Preview" className="w-full h-full object-cover rounded-xl border-2 border-white shadow-md" />
                        <button 
                          type="button"
                          onClick={() => setNewFoto(null)}
                          className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-xl bg-white border-2 border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
                      >
                        <Camera size={32} />
                        <span className="text-[10px] font-bold uppercase">Foto</span>
                      </button>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload}
                    />
                    <p className="text-[10px] text-slate-400 font-medium text-center">Clique para enviar a foto do candidato</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    <input 
                      type="text" 
                      value={newNome}
                      onChange={(e) => setNewNome(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Número (5 dígitos)</label>
                      <input 
                        type="text" 
                        maxLength={5} 
                        value={newNumero}
                        onChange={(e) => setNewNumero(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                      <select 
                        value={newCargo}
                        onChange={(e) => setNewCargo(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                      >
                        <option value="Professor">Professor</option>
                        <option value="Representante">Representante</option>
                        <option value="Grêmio">Grêmio</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Turma / Grupo</label>
                    <input 
                      type="text" 
                      value={newGrupo}
                      onChange={(e) => setNewGrupo(e.target.value)}
                      placeholder={newCargo === 'Professor' ? 'Docentes' : 'Ex: 1º Ano A'}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all" 
                    />
                  </div>
                  <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Cadastrar Candidato</button>
                </form>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-slate-900">Candidatos Registrados</h3>
                    {selectedCandidatos.length > 0 && (
                      <div className="flex items-center gap-2">
                        {showDeleteConfirm === 'candidatos' ? (
                          <>
                            <button 
                              onClick={handleBulkDeleteCandidatos}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all shadow-sm"
                            >
                              Confirmar ({selectedCandidatos.length})
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-all"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => setShowDeleteConfirm('candidatos')}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all border border-red-100"
                          >
                            <Trash2 size={14} /> Excluir ({selectedCandidatos.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleSelectAllCandidatos}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {selectedCandidatos.length === filteredCandidatos.length ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
                    </button>
                    <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filtrar candidatos..." 
                      value={candidatoSearch}
                      onChange={(e) => setCandidatoSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all" 
                    />
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCandidatos.map((c) => (
                    <div key={c.id} className={cn(
                      "p-4 border rounded-2xl flex items-center gap-4 hover:border-slate-200 hover:bg-slate-50/30 transition-all group relative",
                      selectedCandidatos.includes(c.id) ? "border-slate-900 bg-slate-50/50" : "border-slate-100"
                    )}>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <input 
                          type="checkbox" 
                          checked={selectedCandidatos.includes(c.id)}
                          onChange={() => toggleSelectCandidato(c.id)}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        />
                      </div>
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 font-bold text-xl overflow-hidden border border-slate-200">
                        {c.foto ? (
                          <img src={c.foto} alt={c.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          c.nome.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{c.numero}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{c.cargo}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 truncate">{c.nome}</h4>
                        <p className="text-xs text-slate-500 truncate">{c.grupo}</p>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => removeCandidato(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
