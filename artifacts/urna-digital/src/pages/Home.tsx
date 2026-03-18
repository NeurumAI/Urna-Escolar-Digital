import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Fingerprint, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Vote,
  Users,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export default function Home() {
  const navigate = useNavigate();
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1920&auto=format&fit=crop");
  const [schoolImage, setSchoolImage] = useState("https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImages = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      
      // Generate Hero Image
      const heroResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: 'A realistic and professional photograph of a modern school election. Diverse high school students and a teacher are gathered in a bright, modern school hallway. Some students are looking at a digital tablet (voting machine) with a sleek UI. The lighting is warm and inspiring, with subtle violet and orange accents in the background to match a high-tech theme. 4k resolution, cinematic lighting.',
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "4:3",
          },
        },
      });

      // Generate School Context Image
      const schoolResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: 'A professional and clean shot of a digital voting station in a school library. A student is interacting with a sleek tablet mounted on a stand. In the background, other students are waiting in line in a blurred, modern school environment. The color palette features soft violets, fuchsias, and whites. Realistic, high-quality photography.',
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      const extractImage = (response: any) => {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        return null;
      };

      const newHero = extractImage(heroResponse);
      const newSchool = extractImage(schoolResponse);

      if (newHero) setHeroImage(newHero);
      if (newSchool) setSchoolImage(newSchool);
    } catch (error) {
      console.error("Error generating images:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Optionally auto-generate on first load if needed, 
    // but for now we'll provide a button to trigger it for better UX control
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Fingerprint size={24} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-slate-800">Urna Digital</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/cadastro')}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              Entrar
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-violet-200/30 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-orange-200/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-xs font-bold uppercase tracking-widest border border-violet-100">
              <Zap size={14} />
              A Revolução da Democracia Escolar
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Votação <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500">
                Inteligente.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
              Transforme as eleições do seu colégio com uma plataforma digital segura, intuitiva e totalmente transparente. Do cadastro ao resultado em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => navigate('/cadastro')}
                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
              >
                Iniciar Agora
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => window.open('/urna', '_blank')}
                  className="px-8 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                  <Vote size={22} />
                  Ver Urna
                </button>
                
                <button 
                  onClick={generateImages}
                  disabled={isGenerating}
                  className="px-8 py-5 bg-violet-50 text-violet-600 border-2 border-violet-100 rounded-2xl font-black text-lg hover:bg-violet-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
                  {isGenerating ? 'Gerando...' : 'IA Imagens'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-8 border-t border-slate-100">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                +1.200 Alunos já votaram hoje
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-violet-200 border-8 border-white">
              <img 
                src={heroImage} 
                alt="Digital Voting Interface" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 to-transparent" />
            </div>
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-xl z-20 border border-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                  <p className="text-lg font-black text-slate-800">100% Seguro</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, delay: 1 }}
              className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-xl z-20 border border-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Resultados</p>
                  <p className="text-lg font-black text-slate-800">Tempo Real</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Ambiente Escolar Moderno e Digital
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Nossa plataforma foi desenhada para se integrar perfeitamente ao cotidiano escolar, trazendo tecnologia de ponta para o processo democrático.
              </p>
              <div className="space-y-4">
                {[
                  "Acessibilidade para todos os níveis de ensino",
                  "Monitoramento em tempo real pelos mesários",
                  "Resultados auditáveis e transparentes"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src={schoolImage} 
                alt="School Environment" 
                className="w-full h-auto object-cover aspect-video"
              />
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Por que escolher a nossa Urna Digital?
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Desenvolvida para simplificar o processo eleitoral escolar, garantindo que cada voto conte e seja auditável.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Segurança Biométrica",
                desc: "Identificação única por aluno através de CGM e validação do mesário, evitando votos duplicados.",
                icon: ShieldCheck,
                color: "from-violet-500 to-fuchsia-500"
              },
              {
                title: "Interface Intuitiva",
                desc: "Design inspirado na urna eletrônica real, facilitando o entendimento de alunos de todas as idades.",
                icon: Vote,
                color: "from-fuchsia-500 to-orange-500"
              },
              {
                title: "Relatórios Detalhados",
                desc: "Gráficos demográficos por idade, sexo e turma para uma análise profunda dos resultados.",
                icon: BarChart3,
                color: "from-orange-500 to-amber-500"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 space-y-6"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                Pronto para modernizar as eleições da sua escola?
              </h2>
              <p className="text-slate-400 text-lg font-medium">
                Junte-se a centenas de instituições que já utilizam a Urna Digital para promover a cidadania e a tecnologia no ambiente escolar.
              </p>
              <button 
                onClick={() => navigate('/cadastro')}
                className="px-10 py-5 bg-violet-600 text-white rounded-2xl font-black text-lg hover:bg-violet-500 transition-all shadow-xl shadow-violet-900/20 flex items-center gap-3"
              >
                Começar Agora
                <ArrowRight size={22} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Votos Totais", value: "1500+", icon: Users },
                { label: "Escolas", value: "2", icon: Fingerprint },
                { label: "Segurança", value: "100%", icon: ShieldCheck },
                { label: "Precisão", value: "99.9%", icon: Zap },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 sm:p-8 rounded-3xl space-y-2 flex flex-col justify-center">
                  <stat.icon size={24} className="text-violet-400 mb-1" />
                  <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 rounded-lg flex items-center justify-center text-white">
              <Fingerprint size={18} />
            </div>
            <span className="font-black text-lg tracking-tighter uppercase text-slate-800">Urna Digital</span>
          </div>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
            © 2026 Inovafy
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors font-bold text-xs uppercase tracking-widest">Privacidade</a>
            <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors font-bold text-xs uppercase tracking-widest">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
