import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Poll } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, RefreshCw, BarChart2, ShieldCheck, Lock, Smartphone } from 'lucide-react';

export const VotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionText, setVotedOptionText] = useState<string>('');
  const [totalVotes, setTotalVotes] = useState<number>(0);

  const storageKey = `voted_poll_${id}`;
  const deviceRegistryKey = 'rrhh_device_voted_polls';

  useEffect(() => {
    fetchPoll();
    checkIfVoted();

    // Realtime update for total votes
    if (!id) return;
    const channel = supabase
      .channel(`realtime:poll_${id}_votes`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes', filter: `question_id=eq.${id}` },
        () => {
          setTotalVotes(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const checkIfVoted = () => {
    if (!id) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHasVoted(true);
        setVotedOptionText(saved);
        return;
      }

      // Check secondary registry
      const registryRaw = localStorage.getItem(deviceRegistryKey);
      if (registryRaw) {
        const registry = JSON.parse(registryRaw);
        if (registry && registry[id]) {
          setHasVoted(true);
          setVotedOptionText(registry[id].optionText || 'Voto registrado');
        }
      }
    } catch {
      // Ignore storage errors
    }
  };

  const fetchPoll = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) return;

      const { data: pollData, error: pollErr } = await supabase
        .from('polls')
        .select('*')
        .eq('id', id)
        .single();

      if (pollErr) throw pollErr;
      setPoll(pollData);

      // Fetch current vote count
      const { count, error: countErr } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', id);

      if (!countErr && count !== null) {
        setTotalVotes(count);
      }
    } catch (err: any) {
      console.error("Error fetching poll:", err);
      setError("No se pudo cargar la encuesta. Verifica la URL o intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (selectedIndex === null || !poll || hasVoted || submitting) return;

    try {
      setSubmitting(true);
      const optionText = poll.options[selectedIndex];

      const { error: insertErr } = await supabase
        .from('votes')
        .insert({
          question_id: poll.id,
          option_index: selectedIndex,
          option_text: optionText
        });

      if (insertErr) throw insertErr;

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Save strictly to device localStorage (ONE VOTE PER DEVICE)
      try {
        localStorage.setItem(storageKey, optionText);
        const registryRaw = localStorage.getItem(deviceRegistryKey);
        const registry = registryRaw ? JSON.parse(registryRaw) : {};
        registry[poll.id] = {
          optionIndex: selectedIndex,
          optionText: optionText,
          votedAt: new Date().toISOString()
        };
        localStorage.setItem(deviceRegistryKey, JSON.stringify(registry));
      } catch (storageErr) {
        console.warn('Storage save warning:', storageErr);
      }

      setHasVoted(true);
      setVotedOptionText(optionText);
      setTotalVotes(prev => prev + 1);

    } catch (err: any) {
      console.error("Error submitting vote:", err);
      alert("Ocurrió un error al registrar tu voto. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050813] text-white flex flex-col items-center justify-center p-6 text-center font-['Montserrat',sans-serif]">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse text-sm">Cargando encuesta...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-[#050813] text-white flex flex-col items-center justify-center p-6 text-center font-['Montserrat',sans-serif]">
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-8 rounded-3xl max-w-md shadow-2xl">
          <h2 className="text-xl font-bold mb-2 text-white">Pregunta no disponible</h2>
          <p className="text-sm text-slate-300 mb-6">{error || 'La pregunta solicitada no existe o no está activa.'}</p>
          <span className="text-xs text-orange-400 font-mono">ID: {id}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050813] text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 font-['Montserrat',sans-serif] selection:bg-orange-500 selection:text-white">
      
      {/* Top Header */}
      <header className="w-full max-w-lg pt-2 pb-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-sm shadow-inner">
            LM
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wide">Votación en Vivo</h1>
            <p className="text-[11px] text-slate-400">Panel de Audiencia</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-xs font-bold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>{poll.id.toUpperCase()}</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-lg my-auto py-6">
        <div className="backdrop-blur-2xl bg-[#090e1c]/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          
          {/* Top orange accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500"></div>

          <div className="mb-6 pt-2">
            <span className="text-[11px] font-black tracking-widest text-orange-400 uppercase block mb-2">
              {poll.slide_target}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {poll.title}
            </h2>
          </div>

          {!hasVoted ? (
            /* Voting Options State */
            <div className="space-y-3">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                Selecciona una opción:
              </p>

              {poll.options.map((option, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/20 border-2 border-orange-500 text-white font-bold shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 font-medium'
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-snug pr-3">{option}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-white/30 group-hover:border-white/60'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                disabled={selectedIndex === null || submitting}
                onClick={handleVoteSubmit}
                className="w-full mt-6 py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Enviando respuesta...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Respuesta</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center mt-3 pt-2">
                <Lock className="w-3 h-3 text-orange-400" />
                <span>Solo se permite una respuesta por dispositivo.</span>
              </div>
            </div>
          ) : (
            /* Voted Confirmation State (STRICTLY LOCKED - NO RE-VOTING) */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">¡Voto Registrado con Éxito!</h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Tu respuesta ya fue contabilizada en tiempo real en la pantalla del expositor.
              </p>

              <div className="bg-black/40 border border-orange-500/30 rounded-2xl p-4 mb-6 text-left relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="text-[11px] font-black text-orange-400 uppercase tracking-wider block">Tu respuesta seleccionada:</span>
                </div>
                <p className="text-base font-extrabold text-white pl-4">{votedOptionText}</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-300 bg-white/5 py-3 px-4 rounded-xl border border-white/10 mb-5">
                <BarChart2 className="w-4 h-4 text-orange-400" />
                <span>Total de respuestas en la sala: <strong className="text-white font-mono">{totalVotes}</strong></span>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 bg-black/30 py-2.5 px-4 rounded-xl border border-white/5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Respuesta única por dispositivo confirmada</span>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg text-center py-3 text-xs text-slate-500 border-t border-white/10">
        <p>Conferencia Magistral • <strong>Lucas Marinero</strong></p>
      </footer>

    </div>
  );
};
