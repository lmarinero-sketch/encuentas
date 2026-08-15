import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Poll } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, Vote, RefreshCw, ChevronLeft, Sparkles, BarChart2 } from 'lucide-react';

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

  useEffect(() => {
    fetchPoll();
    checkIfVoted();
  }, [id]);

  const checkIfVoted = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setHasVoted(true);
      setVotedOptionText(saved);
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

      // Fetch vote count
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
    if (selectedIndex === null || !poll) return;

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

      localStorage.setItem(storageKey, optionText);
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

  const handleResetVote = () => {
    localStorage.removeItem(storageKey);
    setHasVoted(false);
    setSelectedIndex(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Cargando encuesta...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-md shadow-sm">
          <h2 className="text-xl font-bold mb-2">Encuesta no encontrada</h2>
          <p className="text-sm mb-6">{error || 'La pregunta solicitada no existe o no está disponible.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all">
            <ChevronLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-between p-4 sm:p-6">
      
      {/* Header */}
      <header className="w-full max-w-lg pt-2 pb-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Vote className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Encuesta en Vivo</h1>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-200">
          Pregunta {poll.id.toUpperCase()}
        </span>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-lg my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
          
          {/* Top orange accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-orange-500"></div>

          <div className="mb-6 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>{poll.slide_target}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {poll.title}
            </h2>
          </div>

          {!hasVoted ? (
            /* Voting Options State */
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                Selecciona tu respuesta:
              </p>

              {poll.options.map((option, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-orange-50 border-2 border-orange-500 text-slate-900 font-bold shadow-md shadow-orange-500/10'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-medium'
                    }`}
                  >
                    <span className="text-sm sm:text-base leading-snug">{option}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300 group-hover:border-slate-400'
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
                className="w-full mt-6 py-4 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-base shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
            </div>
          ) : (
            /* Voted Confirmation State */
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">¡Voto Registrado!</h3>
              <p className="text-sm text-slate-600 mb-6">
                Tu respuesta se ha enviado correctamente al panel de la presentación.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tu selección:</span>
                <p className="text-sm font-extrabold text-slate-900">{votedOptionText}</p>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-600 bg-slate-100 py-2.5 px-4 rounded-xl border border-slate-200 mb-4">
                <BarChart2 className="w-4 h-4 text-orange-500" />
                <span>Total respuestas registradas: <strong className="text-slate-900">{totalVotes}</strong></span>
              </div>

              <button
                type="button"
                onClick={handleResetVote}
                className="text-xs text-slate-500 hover:text-orange-600 underline font-semibold transition-colors"
              >
                ¿Quieres cambiar tu respuesta?
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg text-center py-3 text-xs text-slate-500 border-t border-slate-200">
        <p>Presentado por <strong>Lucas Marinero</strong></p>
      </footer>

    </div>
  );
};
