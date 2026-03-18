import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Mesario from './pages/Mesario';
import Urna from './pages/Urna';
import Painel from './pages/Painel';
import Configuracoes from './pages/Configuracoes';
import Historico from './pages/Historico';
import { VoteProvider, useVote } from './context/VoteContext';
import { AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ErrorBanner() {
  const { error, clearError } = useVote();
  
  if (!error) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl p-6 rounded-2xl shadow-2xl border-2 flex flex-col sm:flex-row items-center sm:items-start gap-4 animate-in fade-in slide-in-from-top-8 duration-500 bg-red-50 border-red-200 text-red-900">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-red-100 text-red-600">
          <AlertCircle size={28} />
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h4 className="font-bold text-lg">
            Erro no Sistema
          </h4>
          <p className="text-sm leading-relaxed opacity-90">
            {error}
          </p>
        </div>

        <button 
          onClick={clearError}
          className="px-4 py-2 rounded-xl font-bold text-sm transition-all shrink-0 bg-red-200 hover:bg-red-300 text-red-900"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return (
    <Router basename={base}>
      <ErrorBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/urna" element={<Urna />} />
        <Route path="/cadastro" element={<AdminLayout><Cadastro /></AdminLayout>} />
        <Route path="/mesario" element={<AdminLayout><Mesario /></AdminLayout>} />
        <Route path="/painel" element={<AdminLayout><Painel /></AdminLayout>} />
        <Route path="/configuracoes" element={<AdminLayout><Configuracoes /></AdminLayout>} />
        <Route path="/historico" element={<AdminLayout><Historico /></AdminLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <VoteProvider>
      <AppContent />
    </VoteProvider>
  );
}
