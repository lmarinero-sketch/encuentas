import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Poll, Vote } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BarChart3, 
  QrCode, 
  RotateCcw, 
  Users, 
  Maximize2, 
  X, 
  ExternalLink, 
  Sparkles, 
  Trophy, 
  Flame,
  Tv
} from 'lucide-react';

interface PollStats {
  totalVotes: number;
  optionsCount: { [index: number]: number };
}

export const AdminDashboard: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('q1');
  const [modalPoll, setModalPoll] = useState<Poll | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchInitialData();

    // Subscribe to realtime changes in votes table
    const channel = supabase
      .channel('public:votes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => {
          console.log('Realtime vote change:', payload);
          fetchVotesOnly();
        }
      )
      .subscribe();

    // Fallback polling interval every 3s
    const interval = setInterval(fetchVotesOnly, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [pollsRes, votesRes] = await Promise.all([
        supabase.from('polls').select('*').order('id', { ascending: true }),
        supabase.from('votes').select('*')
      ]);

      if (pollsRes.data) setPolls(pollsRes.data);
      if (votesRes.data) setVotes(votesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotesOnly = async () => {
    const { data } = await supabase.from('votes').select('*');
    if (data) setVotes(data);
  };

  const computeStats = (pollId: string, options: string[]): PollStats => {
    const pollVotes = votes.filter(v => v.question_id === pollId);
    const optionsCount: { [index: number]: number } = {};
    
    options.forEach((_, idx) => {
      optionsCount[idx] = 0;
    });

    pollVotes.forEach(v => {
      if (optionsCount[v.option_index] !== undefined) {
        optionsCount[v.option_index]++;
      }
    });

    return {
      totalVotes: pollVotes.length,
      optionsCount
    };
  };

  const handleClearVotes = async (pollId?: string) => {
    const msg = pollId 
      ? `¿Estás seguro de reiniciar los votos de la pregunta ${pollId.toUpperCase()}?`
      : `¿Estás seguro de reiniciar TODOS los votos de la presentación?`;

    if (!window.confirm(msg)) return;

    try {
      setClearing(true);
      let query = supabase.from('votes').delete();
      if (pollId) {
        query = query.eq('question_id', pollId);
      } else {
        query = query.neq('question_id', 'none');
      }

      const { error } = await query;
      if (error) throw error;

      await fetchVotesOnly();
    } catch (err) {
      console.error("Error clearing votes:", err);
      alert("No se pudieron reiniciar los votos.");
    } finally {
      setClearing(false);
    }
  };

  const totalAllVotes = votes.length;
  const currentOrigin = window.location.origin;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Cargando Panel de Control...</p>
      </div>
    );
  }

  const selectedPoll = polls.find(p => p.id === activeTab) || polls[0];
  const selectedStats = selectedPoll ? computeStats(selectedPoll.id, selectedPoll.options) : { totalVotes: 0, optionsCount: {} };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      {/* Top Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-11 w-auto max-w-[150px] object-contain drop-shadow-sm" 
              />
              <div className="border-l border-slate-200 pl-3">
                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  Panel de Control en Vivo
                </h1>
                <p className="text-xs text-slate-500 font-semibold">Lucas Marinero — Encuestas por QR</p>
              </div>
            </div>
          </div>

          {/* Stats Summary & Global Actions */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
              <Users className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-slate-600 font-medium">Total Respuestas:</span>
              <span className="text-base font-black text-slate-900">{totalAllVotes}</span>
            </div>

            <button
              onClick={() => handleClearVotes()}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all active:scale-95"
            >
              <RotateCcw className={`w-4 h-4 ${clearing ? 'animate-spin' : ''}`} />
              <span>Reiniciar Votos</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1 flex flex-col gap-6">

        {/* Navigation Tabs for Questions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {polls.map((poll) => {
            const stats = computeStats(poll.id, poll.options);
            const isActive = activeTab === poll.id;
            return (
              <button
                key={poll.id}
                onClick={() => setActiveTab(poll.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-2 border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                    isActive ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {poll.id.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    {stats.totalVotes} voto{stats.totalVotes !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className={`text-xs sm:text-sm font-bold line-clamp-2 ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                  {poll.title}
                </h3>
                <span className="text-[11px] text-orange-600 font-bold mt-2 block">
                  {poll.slide_target}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Question Display & Realtime Chart */}
        {selectedPoll && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Col: Live Results Chart (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col justify-between shadow-md">
              
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-bold border border-orange-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ubicación: <strong>{selectedPoll.slide_target}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalPoll(selectedPoll)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all"
                    >
                      <Tv className="w-4 h-4" />
                      <span>Presentar QR en Pantalla</span>
                    </button>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-6">
                  {selectedPoll.title}
                </h2>

                {/* Bars */}
                <div className="space-y-5">
                  {selectedPoll.options.map((option, idx) => {
                    const count = selectedStats.optionsCount[idx] || 0;
                    const percentage = selectedStats.totalVotes > 0 
                      ? Math.round((count / selectedStats.totalVotes) * 100) 
                      : 0;

                    // Find max count to highlight winner
                    const maxCount = Math.max(...Object.values(selectedStats.optionsCount));
                    const isWinner = count > 0 && count === maxCount;

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                          <span className="text-slate-800 flex items-center gap-2">
                            {isWinner && <Trophy className="w-4 h-4 text-orange-500 shrink-0" />}
                            <span>{option}</span>
                          </span>
                          <span className="text-slate-500 shrink-0 font-mono">
                            <strong className="text-slate-900 text-base font-black">{percentage}%</strong> ({count})
                          </span>
                        </div>

                        {/* Animated Bar */}
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              isWinner 
                                ? 'bg-orange-500 shadow-sm shadow-orange-500/50' 
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Summary Bar */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  <span>Respuestas en esta pregunta: <strong className="text-slate-900 font-bold">{selectedStats.totalVotes} votos</strong></span>
                </div>
                <button
                  onClick={() => handleClearVotes(selectedPoll.id)}
                  disabled={clearing}
                  className="text-red-500 hover:text-red-700 underline font-bold"
                >
                  Limpiar esta pregunta
                </button>
              </div>

            </div>

            {/* Right Col: QR Preview Card (1 col) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col items-center justify-between text-center shadow-md">
              
              <div className="w-full">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="text-xs font-black text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" /> Código QR Activo
                  </span>
                  <span className="text-xs text-slate-400 font-bold">ID: {selectedPoll.id}</span>
                </div>

                <div className="bg-white p-4 rounded-2xl inline-block shadow-md my-2 border-2 border-orange-500">
                  <QRCodeSVG 
                    value={`${currentOrigin}/#/q/${selectedPoll.id}`} 
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <p className="text-xs text-slate-700 font-bold mt-3">
                  Escanea para responder en directo
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1 break-all">
                  {`${currentOrigin}/#/q/${selectedPoll.id}`}
                </p>
              </div>

              <div className="w-full mt-6 space-y-2">
                <button
                  onClick={() => setModalPoll(selectedPoll)}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Proyectar QR en Pantalla</span>
                </button>

                <a
                  href={`${currentOrigin}/#/q/${selectedPoll.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Probar Vista Móvil</span>
                </a>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Fullscreen Presentation Modal for QR Proyector */}
      {modalPoll && (
        <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-xl flex flex-col items-center justify-between p-6 sm:p-12 animate-fadeIn">
          
          {/* Modal Header */}
          <div className="w-full max-w-5xl flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain" 
              />
              <div className="flex items-center gap-3">
                <span className="bg-orange-500 text-white font-black text-sm px-3 py-1 rounded-xl">
                  PREGUNTA {modalPoll.id.toUpperCase()}
                </span>
                <span className="text-xs text-slate-600 font-bold">
                  {modalPoll.slide_target}
                </span>
              </div>
            </div>

            <button
              onClick={() => setModalPoll(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-black transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Center Content */}
          <div className="max-w-4xl w-full my-auto flex flex-col md:flex-row items-center justify-center gap-12 text-center md:text-left">
            
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-8 border-orange-500 shrink-0">
              <QRCodeSVG 
                value={`${currentOrigin}/#/q/${modalPoll.id}`} 
                size={260}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-black text-orange-600 uppercase tracking-widest block mb-2">
                  📲 Escanea el código con tu celular
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                  {modalPoll.title}
                </h2>
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 inline-flex items-center gap-3 shadow-sm">
                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-700">
                  Respuestas recibidas: <strong className="text-orange-600 text-xl font-black">{computeStats(modalPoll.id, modalPoll.options).totalVotes}</strong>
                </span>
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="w-full max-w-5xl text-center text-xs text-slate-400 border-t border-slate-200 pt-4 font-medium">
            Presiona <strong>ESC</strong> o el botón de cerrar para volver al panel de control.
          </div>

        </div>
      )}

    </div>
  );
};
