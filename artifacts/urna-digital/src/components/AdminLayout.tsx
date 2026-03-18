import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ClipboardList, 
  Users, 
  LayoutDashboard, 
  History,
  Settings, 
  ExternalLink,
  Fingerprint,
  Menu,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Cadastro', path: '/cadastro', icon: ClipboardList },
    { name: 'Mesário', path: '/mesario', icon: Users },
    { name: 'Painel', path: '/painel', icon: LayoutDashboard },
    { name: 'Histórico', path: '/historico', icon: History },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-violet-200 shadow-lg animate-gradient-slow">
            <Fingerprint size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Urna Digital</h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Escolar</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-violet-50 text-violet-700 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-500")} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => window.open('/urna', '_blank')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <ExternalLink size={18} />
            <span className="font-semibold text-sm">Abrir Urna</span>
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 rounded-lg flex items-center justify-center text-white shadow-violet-200 shadow-lg">
              <Fingerprint size={18} />
            </div>
            <h1 className="font-bold text-slate-800 text-sm">Urna Digital</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.open('/urna', '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <ExternalLink size={14} />
              Urna
            </button>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 transition-all overflow-x-hidden max-w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 rounded-xl flex items-center justify-center text-white">
                    <Fingerprint size={24} />
                  </div>
                  <h1 className="font-bold text-slate-800">Urna Digital</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all",
                        isActive 
                          ? "bg-violet-50 text-violet-700 font-bold" 
                          : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Icon size={22} className={isActive ? "text-violet-600" : "text-slate-400"} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={() => {
                    window.open('/urna', '_blank');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg"
                >
                  <ExternalLink size={20} />
                  <span>Abrir Urna</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
