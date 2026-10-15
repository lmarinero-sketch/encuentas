import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Poll, Vote } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { generatePollAnalysis, PollAnalysisResult } from '../lib/pollAnalysis';
import { 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2, 
  Flame, 
  Sparkles, 
  Trophy, 
  Tv, 
  Monitor, 
  Smartphone, 
  Compass, 
  Layers, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal, 
  Keyboard, 
  Database,
  Brain,
  ShieldCheck,
  Cpu,
  BarChart3,
  Network,
  Users,
  Compass as CompassIcon,
  HelpCircle,
  Mail,
  Linkedin,
  MapPin,
  List,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

type LightingMood = 'dawn' | 'tech-dark' | 'dusk-warm' | 'daylight' | 'twilight';

interface SceneData {
  id: string;
  chapterNumber: string;
  chapterLabel: string;
  badge: string;
  titleWhite: string;
  titleOrange: string;
  subtitle: string;
  videoSrc: string;
  mood: LightingMood;
  pollId?: string;
  type: 'slide' | 'poll' | 'climax' | 'closing';
}

const SCENES: SceneData[] = [
  {
    id: 'scene-1',
    chapterNumber: '01',
    chapterLabel: 'Prólogo',
    badge: 'PRÓLOGO • MINERÍA DEL FUTURO',
    titleWhite: 'El Despertar de la',
    titleOrange: 'Minería Inteligente',
    subtitle: 'La convergencia entre autonomía industrial, analítica predictiva y el talento humano en la alta cordillera.',
    videoSrc: '/video 1.mp4',
    mood: 'dawn',
    type: 'slide'
  },
  {
    id: 'scene-2',
    chapterNumber: '02',
    chapterLabel: 'Portada',
    badge: 'CONFERENCIA CENTRAL • DIAPOSITIVA 1',
    titleWhite: 'EL IMPACTO DE LA IA EN',
    titleOrange: 'RECURSOS HUMANOS',
    subtitle: 'Visión práctica, metodología y técnica para la transformación digital en la industria minera.',
    videoSrc: '/video 2.mp4',
    mood: 'tech-dark',
    type: 'slide'
  },
  {
    id: 'scene-3',
    chapterNumber: '03',
    chapterLabel: 'Paradigma',
    badge: 'ESTRATEGIA • DIAPOSITIVA 2',
    titleWhite: 'Un Cambio de',
    titleOrange: 'Paradigma',
    subtitle: 'El verdadero progreso demanda replantear nuestra forma de operar desde la cúspide del liderazgo.',
    videoSrc: '/video 3.mp4',
    mood: 'dusk-warm',
    type: 'slide'
  },
  {
    id: 'scene-4',
    chapterNumber: '04',
    chapterLabel: 'Encuesta 1',
    badge: 'PARTICIPACIÓN EN DIRECTO • PAUSA 1',
    titleWhite: 'Estado Actual de',
    titleOrange: 'Digitalización',
    subtitle: 'Votación instantánea de la audiencia vía código QR en tiempo real.',
    videoSrc: '/video 4.mp4',
    mood: 'dawn',
    pollId: 'q1',
    type: 'poll'
  },
  {
    id: 'scene-5',
    chapterNumber: '05',
    chapterLabel: 'Diagnóstico',
    badge: 'METODOLOGÍA • DIAPOSITIVA 3',
    titleWhite: 'Mirar Antes de Actuar:',
    titleOrange: 'Diagnóstico Organizacional',
    subtitle: 'Mapear procesos y detectar cuellos de botella antes de implementar tecnología con propósito.',
    videoSrc: '/video 5.mp4',
    mood: 'tech-dark',
    type: 'slide'
  },
  {
    id: 'scene-6',
    chapterNumber: '06',
    chapterLabel: 'Encuesta 2',
    badge: 'PARTICIPACIÓN EN DIRECTO • PAUSA 2',
    titleWhite: 'Fricciones y',
    titleOrange: 'Cuellos de Botella',
    subtitle: 'Identificación de trabas en acreditaciones, selección y normativas.',
    videoSrc: '/video 6.mp4',
    mood: 'daylight',
    pollId: 'q2',
    type: 'poll'
  },
  {
    id: 'scene-7',
    chapterNumber: '07',
    chapterLabel: 'Arquitectura',
    badge: 'INFRAESTRUCTURA • DIAPOSITIVA 4',
    titleWhite: 'Los Cimientos Invisibles:',
    titleOrange: 'Arquitectura de Datos',
    subtitle: 'Centralización, trazabilidad y robustez técnica como requisito previo a cualquier algoritmo.',
    videoSrc: '/video 7.mp4',
    mood: 'tech-dark',
    type: 'slide'
  },
  {
    id: 'scene-8',
    chapterNumber: '08',
    chapterLabel: 'Talento',
    badge: 'CAPITAL HUMANO • DIAPOSITIVA 5',
    titleWhite: 'Talento Especializado para un',
    titleOrange: 'Valor Profundo',
    subtitle: 'Científicos de datos, arquitectos y analistas de negocio orquestando modelos predictivos.',
    videoSrc: '/video 8.mp4',
    mood: 'tech-dark',
    type: 'slide'
  },
  {
    id: 'scene-9',
    chapterNumber: '09',
    chapterLabel: 'Gobernanza',
    badge: 'CALIDAD Y CONTROL • DIAPOSITIVA 6',
    titleWhite: 'Gobernanza de Datos:',
    titleOrange: 'La Base Indispensable',
    subtitle: 'Seguimiento y control de cada dato a lo largo del proceso, eliminando silos y duplicidades.',
    videoSrc: '/video 9.mp4',
    mood: 'twilight',
    type: 'slide'
  },
  {
    id: 'scene-10',
    chapterNumber: '10',
    chapterLabel: 'Encuesta 3',
    badge: 'PARTICIPACIÓN EN DIRECTO • PAUSA 3',
    titleWhite: 'Confianza en los',
    titleOrange: 'Datos de Gerencia',
    subtitle: 'Evaluación del nivel de certidumbre en las métricas de personas que recibe el liderazgo.',
    videoSrc: '/video 10.mp4',
    mood: 'dusk-warm',
    pollId: 'q3',
    type: 'poll'
  },
  {
    id: 'scene-11',
    chapterNumber: '11',
    chapterLabel: 'Decisiones',
    badge: 'TRANSVERSALIDAD • DIAPOSITIVA 7',
    titleWhite: 'Toma de Decisiones:',
    titleOrange: 'La IA como Copiloto',
    subtitle: 'Democratizar el acceso a métricas predictivas desde la cabina del operador hasta la gerencia.',
    videoSrc: '/video 11.mp4',
    mood: 'dawn',
    type: 'slide'
  },
  {
    id: 'scene-12',
    chapterNumber: '12',
    chapterLabel: 'Aplicación RRHH',
    badge: 'OPERACIÓN DE PERSONAS • DIAPOSITIVA 8',
    titleWhite: 'Aplicación Práctica en',
    titleOrange: 'Gestión del Talento',
    subtitle: 'Selección predictiva, agilidad en ingreso a mina y programas de formación hiper-personalizados.',
    videoSrc: '/video 12.mp4',
    mood: 'daylight',
    type: 'slide'
  },
  {
    id: 'scene-13',
    chapterNumber: '13',
    chapterLabel: 'Proyecto Simón',
    badge: 'BASE DE CONOCIMIENTO • DIAPOSITIVA 9',
    titleWhite: 'Proyecto Simón:',
    titleOrange: 'El Asistente RAG',
    subtitle: 'Acceso inmediato a convenios colectivos, normativas de seguridad y procedimientos operativos.',
    videoSrc: '/video 13.mp4',
    mood: 'tech-dark',
    type: 'slide'
  },
  {
    id: 'scene-14',
    chapterNumber: '14',
    chapterLabel: 'Cerebro Central',
    badge: 'CLÍMAX TECNOLÓGICO • ECOSISTEMA CONECTADO',
    titleWhite: 'El Cerebro Corporativo:',
    titleOrange: 'IA en Tiempo Real',
    subtitle: 'Monitoreo holístico de la planta y correlación de variables de personas y productividad en faena.',
    videoSrc: '/video 14.mp4',
    mood: 'tech-dark',
    type: 'climax'
  },
  {
    id: 'scene-15',
    chapterNumber: '15',
    chapterLabel: 'Métricas Reales',
    badge: 'CERTIDUMBRE • DIAPOSITIVA 10',
    titleWhite: 'Liderar con Certeza:',
    titleOrange: 'Datos en Tiempo Real',
    subtitle: 'Dejar atrás las suposiciones y basar cada decisión en indicadores verificables de faena.',
    videoSrc: '/video 15.mp4',
    mood: 'dusk-warm',
    type: 'slide'
  },
  {
    id: 'scene-16',
    chapterNumber: '16',
    chapterLabel: 'Retos Estratégicos',
    badge: 'CULTURA ORGANIZACIONAL • DIAPOSITIVA 11',
    titleWhite: 'Retos Estratégicos:',
    titleOrange: 'El Modelo Mental',
    subtitle: 'Cambiar la mentalidad antes que el software. La tecnología sin convicción cultural fracasa.',
    videoSrc: '/video 16.mp4',
    mood: 'dusk-warm',
    type: 'slide'
  },
  {
    id: 'scene-17',
    chapterNumber: '17',
    chapterLabel: 'Encuesta 4',
    badge: 'PARTICIPACIÓN EN DIRECTO • PAUSA 4',
    titleWhite: 'El Mayor Freno para',
    titleOrange: 'Implementar IA',
    subtitle: 'Cultura, datos desordenados o escasez de talento: la radiografía de la audiencia.',
    videoSrc: '/video 17.mp4',
    mood: 'twilight',
    pollId: 'q4',
    type: 'poll'
  },
  {
    id: 'scene-18',
    chapterNumber: '18',
    chapterLabel: 'Transformación',
    badge: 'VENTAJA COMPETITIVA • DIAPOSITIVA 12',
    titleWhite: 'Liderando la',
    titleOrange: 'Transformación',
    subtitle: 'Evolucionar la mentalidad directiva para transformar la innovación en una ventaja sustentable.',
    videoSrc: '/video 18.mp4',
    mood: 'daylight',
    type: 'slide'
  },
  {
    id: 'scene-19',
    chapterNumber: '19',
    chapterLabel: 'El Futuro',
    badge: 'EQUIPO DEL FUTURO • CONCLUSIÓN',
    titleWhite: 'El Verdadero Motor:',
    titleOrange: 'Personas + Tecnología',
    subtitle: 'La sinergia indisoluble entre la capacidad del trabajador minero y los algoritmos predictivos.',
    videoSrc: '/video 19.mp4',
    mood: 'dusk-warm',
    type: 'slide'
  },
  {
    id: 'scene-20',
    chapterNumber: '20',
    chapterLabel: 'Agradecimiento',
    badge: 'CIERRE Y NETWORKING • DIAPOSITIVA 13',
    titleWhite: '¡Muchas Gracias!',
    titleOrange: 'Lucas Marinero',
    subtitle: 'Abiertos al diálogo, preguntas y al futuro de la inteligencia artificial en la minería.',
    videoSrc: '/video 20.mp4',
    mood: 'twilight',
    type: 'closing'
  }
];

export const ScrolltellingPage: React.FC = () => {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [hasVotedMap, setHasVotedMap] = useState<{ [pollId: string]: number }>({});
  const [submittingVote, setSubmittingVote] = useState(false);

  // Desktop check state
  const [isDesktop, setIsDesktop] = useState(true);
  const [bypassMobileWarning, setBypassMobileWarning] = useState(false);

  // Supabase Polls & Votes state
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);

  // Poll completion & analysis state
  const [completedPolls, setCompletedPolls] = useState<{ [pollId: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('rrhh_completed_polls');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [analyzingPolls, setAnalyzingPolls] = useState<{ [pollId: string]: boolean }>({});
  const [analysisResults, setAnalysisResults] = useState<{ [pollId: string]: PollAnalysisResult }>(() => {
    try {
      const saved = localStorage.getItem('rrhh_analysis_results');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // References
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Responsive Screen Check (Desktop Only)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch all polls and votes
  useEffect(() => {
    fetchAllData();

    const channel = supabase
      .channel('realtime:all_presentation_votes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchVotesOnly();
        }
      )
      .subscribe();

    const interval = setInterval(fetchVotesOnly, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoadingPolls(true);
      const [pollsRes, votesRes] = await Promise.all([
        supabase.from('polls').select('*').order('id', { ascending: true }),
        supabase.from('votes').select('*')
      ]);

      if (pollsRes.data) setPolls(pollsRes.data);
      if (votesRes.data) setVotes(votesRes.data);
    } catch (e) {
      console.error('Error fetching polls:', e);
    } finally {
      setLoadingPolls(false);
    }
  };

  const fetchVotesOnly = async () => {
    const { data } = await supabase.from('votes').select('*');
    if (data) setVotes(data);
  };

  // Keyboard navigation for Presenter Mode
  const goToScene = useCallback((index: number) => {
    if (index < 0 || index >= SCENES.length) return;
    setActiveSceneIndex(index);
    setQuickMenuOpen(false);
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToScene(Math.min(activeSceneIndex + 1, SCENES.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToScene(Math.max(activeSceneIndex - 1, 0));
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'i' || e.key === 'I') {
        setQuickMenuOpen(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev);
      } else if (e.key === 'Escape') {
        setQuickMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSceneIndex, goToScene]);

  // Intersection Observer for scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index) && index !== activeSceneIndex) {
              setActiveSceneIndex(index);
            }
          }
        });
      },
      {
        threshold: 0.55
      }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeSceneIndex]);

  // Synchronize active video playback: play current, pause others
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeSceneIndex) {
        vid.currentTime = vid.currentTime || 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [activeSceneIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleVote = async (pollId: string, optionIndex: number, optionText: string) => {
    if (hasVotedMap[pollId] !== undefined || submittingVote) return;

    try {
      setSubmittingVote(true);
      const { error } = await supabase.from('votes').insert([
        {
          question_id: pollId,
          option_index: optionIndex,
          option_text: optionText
        }
      ]);

      if (error) throw error;

      setHasVotedMap(prev => ({ ...prev, [pollId]: optionIndex }));
      confetti({
        particleCount: 70,
        spread: 85,
        origin: { y: 0.65 }
      });
      await fetchVotesOnly();
    } catch (err) {
      console.error('Error submitting vote:', err);
    } finally {
      setSubmittingVote(false);
    }
  };

  // Poll Stats helper
  const getPollStats = (pollId: string, pollOptions: string[]) => {
    const pollVotes = votes.filter(v => v.question_id === pollId);
    const counts: { [idx: number]: number } = {};
    pollOptions.forEach((_, i) => { counts[i] = 0; });
    pollVotes.forEach(v => {
      if (counts[v.option_index] !== undefined) counts[v.option_index]++;
    });
    const total = pollVotes.length;
    const max = Math.max(...Object.values(counts), 0);
    return { counts, total, max };
  };

  const handleEndPoll = async (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    const pollOptions = poll?.options || [];
    const stats = getPollStats(pollId, pollOptions);

    setAnalyzingPolls(prev => ({ ...prev, [pollId]: true }));
    try {
      const analysis = await generatePollAnalysis(
        pollId,
        poll?.title || 'Encuesta en Vivo',
        pollOptions,
        stats
      );

      const nextResults = { ...analysisResults, [pollId]: analysis };
      const nextCompleted = { ...completedPolls, [pollId]: true };

      setAnalysisResults(nextResults);
      setCompletedPolls(nextCompleted);

      try {
        localStorage.setItem('rrhh_analysis_results', JSON.stringify(nextResults));
        localStorage.setItem('rrhh_completed_polls', JSON.stringify(nextCompleted));
      } catch (err) {
        console.error('Storage error:', err);
      }

      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.error('Error ending poll:', e);
    } finally {
      setAnalyzingPolls(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const handleReopenPoll = (pollId: string) => {
    const nextCompleted = { ...completedPolls, [pollId]: false };
    setCompletedPolls(nextCompleted);
    try {
      localStorage.setItem('rrhh_completed_polls', JSON.stringify(nextCompleted));
    } catch (err) {
      console.error('Storage error:', err);
    }
  };

  // Generate public URL for mobile phones scanning the QR code
  const getPollUrl = (pollId: string) => {
    const envUrl = import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_APP_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
      return `${envUrl.replace(/\/+$/, '')}/#/q/${pollId}`;
    }

    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const port = window.location.port ? `:${window.location.port}` : '';
        return `http://192.168.100.29${port}/#/q/${pollId}`;
      }
      return `${window.location.origin}/#/q/${pollId}`;
    }

    return `#/q/${pollId}`;
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentScene = SCENES[activeSceneIndex];

  // Dynamic visual styling helper based on the active scene's lighting mood
  const moodStyles = useMemo(() => {
    switch (currentScene.mood) {
      case 'daylight':
        return {
          scrimGradient: 'bg-gradient-to-r from-[#03060c]/95 via-[#03060c]/70 via-[#03060c]/45 to-[#03060c]/25',
          titleGradient: 'from-white via-orange-200 to-orange-500',
          cardBg: 'bg-[#040711]/90 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
          badgeBg: 'bg-orange-500/25 border-orange-400/50 text-orange-300',
          textShadow: 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]'
        };
      case 'dawn':
        return {
          scrimGradient: 'bg-gradient-to-r from-[#050914]/95 via-[#050914]/70 via-[#050914]/40 to-[#050914]/20',
          titleGradient: 'from-white via-amber-200 to-orange-400',
          cardBg: 'bg-[#060c1a]/85 border-orange-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)]',
          badgeBg: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
          textShadow: 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'
        };
      case 'dusk-warm':
        return {
          scrimGradient: 'bg-gradient-to-r from-[#070b16]/95 via-[#070b16]/70 via-[#070b16]/40 to-[#070b16]/20',
          titleGradient: 'from-white via-orange-200 to-orange-500',
          cardBg: 'bg-[#070d1a]/85 border-amber-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.85)]',
          badgeBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
          textShadow: 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]'
        };
      case 'twilight':
        return {
          scrimGradient: 'bg-gradient-to-r from-[#050811]/95 via-[#050811]/70 via-[#050811]/40 to-[#050811]/20',
          titleGradient: 'from-white via-orange-100 to-orange-400',
          cardBg: 'bg-[#060a16]/85 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
          badgeBg: 'bg-orange-500/20 border-orange-500/35 text-orange-300',
          textShadow: 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]'
        };
      case 'tech-dark':
      default:
        return {
          scrimGradient: 'bg-gradient-to-r from-[#040710]/95 via-[#040710]/70 via-[#040710]/40 to-[#040710]/15',
          titleGradient: 'from-white via-orange-200 to-orange-400',
          cardBg: 'bg-[#050914]/85 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]',
          badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
          textShadow: 'drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]'
        };
    }
  }, [currentScene.mood]);

  // ============================================================
  // DESKTOP-EXCLUSIVE BLOCKER OVERLAY (For Mobile Screens)
  // ============================================================
  if (!isDesktop && !bypassMobileWarning) {
    return (
      <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-['Montserrat',sans-serif] selection:bg-orange-500">
        <div className="max-w-md w-full backdrop-blur-2xl bg-slate-900/90 border border-orange-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Monitor className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-black tracking-widest text-orange-400 uppercase block mb-2">
            Experiencia Exclusiva para Computadora
          </span>

          <h2 className="text-2xl font-black text-white tracking-tight leading-snug mb-4">
            Visualización Diseñada para Pantallas de Escritorio
          </h2>

          <p className="text-sm text-slate-300 font-light leading-relaxed mb-8">
            Esta presentación con <strong>scrollytelling cinematográfico de 20 escenas</strong> y videos HD está optimizada exclusivamente para laptops, computadoras de escritorio y pantallas de conferencia (mínimo 1024px).
          </p>

          <div className="space-y-3">
            <a
              href="#/q/q1"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Participar en la Votación Móvil</span>
            </a>

            <button
              onClick={() => setBypassMobileWarning(true)}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all border border-white/10"
            >
              Continuar a la presentación de todos modos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative bg-[#040710] text-slate-100 min-h-screen font-['Montserrat',sans-serif] antialiased selection:bg-orange-500 selection:text-white"
    >
      
      {/* ============================================================ */}
      {/* FIXED BACKGROUND VIDEOS (20 VIDEOS) WITH SMOOTH CROSSFADE    */}
      {/* ============================================================ */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {SCENES.map((scene, idx) => (
          <div
            key={scene.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              activeSceneIndex === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <video
              ref={(el) => (videoRefs.current[idx] = el)}
              src={scene.videoSrc}
              muted={isMuted}
              loop
              playsInline
              preload={Math.abs(activeSceneIndex - idx) <= 2 ? "auto" : "none"}
              className="w-full h-full object-cover object-[78%_center] xl:object-[right_center] scale-[1.01]"
            />
          </div>
        ))}

        {/* Dynamic Full-Screen Scrim Gradient spanning 100% of the screen without any vertical dividing line */}
        <div className={`absolute inset-0 w-full h-full ${moodStyles.scrimGradient} transition-all duration-700`} />
        
        {/* Top Vignette */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#040710]/95 via-[#040710]/40 to-transparent" />
        
        {/* Bottom Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#040710]/98 via-[#040710]/60 to-transparent" />
        
        {/* Warm Ambient Orange Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      </div>



      {/* ============================================================ */}
      {/* QUICK JUMP MODAL / INDEX DRAWER                              */}
      {/* ============================================================ */}
      {quickMenuOpen && (
        <div 
          onClick={() => setQuickMenuOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full max-h-[85vh] bg-[#060a14] border border-orange-500/30 rounded-3xl p-6 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-orange-400 block">
                  Índice de la Presentación
                </span>
                <h3 className="text-xl font-black text-white">Navegación Rápida por las 20 Diapositivas</h3>
              </div>
              <button
                onClick={() => setQuickMenuOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
              >
                Cerrar (ESC)
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {SCENES.map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                const isPoll = scene.type === 'poll';
                return (
                  <button
                    key={scene.id}
                    onClick={() => goToScene(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : isPoll
                          ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-slate-200'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-orange-500 text-white' : isPoll ? 'bg-amber-500/30 text-amber-300' : 'bg-white/10 text-slate-400'
                      }`}>
                        {scene.chapterNumber}
                      </span>
                      {isPoll && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                    </div>
                    <span className="text-xs font-bold line-clamp-1 text-white">{scene.titleOrange}</span>
                    <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{scene.chapterLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SIDE TIMELINE NAVIGATION (Compact 20 Dots)                  */}
      {/* ============================================================ */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-2.5 py-4">
        {SCENES.map((scene, idx) => {
          const isActive = activeSceneIndex === idx;
          const isPoll = scene.type === 'poll';
          return (
            <button
              key={scene.id}
              onClick={() => goToScene(idx)}
              className="group flex items-center gap-3 text-right focus:outline-none cursor-pointer"
              title={`${scene.chapterNumber} - ${scene.chapterLabel}`}
            >
              <span
                className={`text-[10px] font-black tracking-wider transition-all duration-300 uppercase ${
                  isActive
                    ? 'text-orange-400 opacity-100 translate-x-0'
                    : 'text-slate-400 opacity-0 group-hover:opacity-100 translate-x-2'
                }`}
              >
                {scene.chapterNumber} • {scene.chapterLabel}
              </span>
              <div
                className={`transition-all duration-300 rounded-full border ${
                  isActive
                    ? 'w-3 h-3 bg-orange-500 border-orange-400 scale-125 shadow-lg shadow-orange-500/50 ring-2 ring-orange-500/30'
                    : isPoll
                      ? 'w-2 h-2 bg-amber-400/60 border-amber-400/80 group-hover:scale-125'
                      : 'w-2 h-2 bg-white/20 border-white/30 group-hover:bg-white/40'
                }`}
              />
            </button>
          );
        })}
      </nav>



      {/* ============================================================ */}
      {/* SCROLLING CONTENT SECTIONS (ALL 20 SCENES)                   */}
      {/* ============================================================ */}
      <main className="relative z-10">
        {SCENES.map((scene, idx) => {
          const poll = scene.pollId ? polls.find(p => p.id === scene.pollId) : null;
          const pollOptions = poll?.options || [];
          const stats = scene.pollId ? getPollStats(scene.pollId, pollOptions) : { counts: {}, total: 0, max: 0 };
          const pollUrl = scene.pollId ? getPollUrl(scene.pollId) : '';
          const userVotedIndex = scene.pollId ? hasVotedMap[scene.pollId] : undefined;

          return (
            <section
              key={scene.id}
              ref={(el) => (sectionRefs.current[idx] = el)}
              data-index={idx}
              className="min-h-screen flex items-center px-10 xl:px-24 py-28"
            >
              <div className={`${scene.type === 'poll' ? 'max-w-5xl' : 'max-w-3xl'} w-full transition-all duration-500`}>
                {/* Dynamic High-Contrast Title (Prioritizing Pure White + Vibrant Orange) */}
                <h2 className={`text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.1] mb-5 ${moodStyles.textShadow}`}>
                  {scene.titleWhite}{' '}
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${moodStyles.titleGradient} block mt-1`}>
                    {scene.titleOrange}
                  </span>
                </h2>

                <p className={`text-base xl:text-lg text-slate-200 font-light leading-relaxed mb-8 ${moodStyles.textShadow}`}>
                  {scene.subtitle}
                </p>

                {/* -------------------------------------------------------- */}
                {/* CASE 1: LIVE POLL SCENES (q1, q2, q3, q4)                */}
                {/* -------------------------------------------------------- */}
                {scene.type === 'poll' && (
                  <>
                    {Boolean(scene.pollId && completedPolls[scene.pollId]) ? (
                      /* ==================================================== */
                      /* CONSOLIDATED DIAGNOSIS VIEW (COMPLETED POLL)         */
                      /* ==================================================== */
                      <div className="backdrop-blur-xl bg-[#040812]/92 border border-orange-500/35 rounded-3xl p-6 xl:p-8 shadow-2xl relative overflow-hidden mb-6">
                        {/* Header bar with Status and Reopen button */}
                        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-inner">
                              <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-base xl:text-lg font-black text-white tracking-wide uppercase">
                                Resultados y Diagnóstico de la Audiencia
                              </h3>
                              <p className="text-xs text-slate-400 font-medium">
                                Encuesta concluida con {stats.total} votos registrados
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleReopenPoll(scene.pollId!)}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer hover:border-orange-500/40"
                            title="Reanudar recepción de votos"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                            <span>Reabrir Votación</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-12 gap-6 items-start">
                          {/* Gráfico de Resultados */}
                          <div className="col-span-12 lg:col-span-5 bg-black/40 border border-white/10 rounded-2xl p-5 shadow-inner">
                            <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest block mb-4">
                              Gráfico de Resultados
                            </span>
                            <div className="space-y-4">
                              {pollOptions.map((optText, optIdx) => {
                                const count = stats.counts[optIdx] || 0;
                                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                const isWinner = count > 0 && count === stats.max;

                                return (
                                  <div key={optIdx} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs xl:text-sm font-bold text-slate-200">
                                      <span className="flex items-center gap-1.5 pr-2 truncate">
                                        {isWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                        <span className="truncate">{optText}</span>
                                      </span>
                                      <span className="shrink-0 font-mono text-white text-xs font-black">
                                        {percentage}% <span className="text-slate-400 font-normal">({count})</span>
                                      </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-0.5">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                                          isWinner
                                            ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 shadow-md shadow-orange-500/50'
                                            : 'bg-slate-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Realidad de la Audiencia & Reflexión Estratégica */}
                          <div className="col-span-12 lg:col-span-7 space-y-4">
                            {/* Realidad de la Audiencia */}
                            <div className="bg-gradient-to-br from-orange-500/10 via-black/40 to-transparent border border-orange-500/35 rounded-2xl p-5 relative overflow-hidden shadow-lg">
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-400"></span>
                                <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest">
                                  Realidad de la Audiencia
                                </h4>
                              </div>
                              <p className="text-sm xl:text-base text-slate-100 font-normal leading-relaxed">
                                {analysisResults[scene.pollId!]?.audienceReality || 'Consolidando la realidad de la audiencia según los votos emitidos...'}
                              </p>
                            </div>

                            {/* Reflexión Estratégica */}
                            <div className="bg-black/40 border border-white/15 rounded-2xl p-5 shadow-lg">
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-white/70"></span>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest">
                                  Reflexión Estratégica
                                </h4>
                              </div>
                              <p className="text-sm xl:text-base text-slate-200 font-light leading-relaxed">
                                {analysisResults[scene.pollId!]?.strategicReflection || 'Formulando las implicancias estratégicas y operacionales de los resultados...'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ==================================================== */
                      /* ACTIVE LIVE VOTING VIEW                              */
                      /* ==================================================== */
                      <div className="grid grid-cols-12 gap-6 items-stretch mb-6">
                        {/* QR Code Container */}
                        <div className="col-span-4 backdrop-blur-xl bg-[#040812]/90 border border-orange-500/40 rounded-3xl p-5 flex flex-col items-center justify-between text-center shadow-2xl relative overflow-hidden">
                          <div className="w-full flex flex-col items-center">
                            <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest block mb-3">
                              📲 Escanea con tu celular
                            </span>

                            <a
                              href={pollUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block"
                              title="Abrir enlace de esta pregunta"
                            >
                              <div className="bg-white p-3 rounded-2xl inline-block shadow-2xl border-4 border-orange-500 group-hover:scale-105 transition-transform cursor-pointer">
                                <QRCodeSVG
                                  value={pollUrl}
                                  size={135}
                                  level="H"
                                  includeMargin={false}
                                />
                              </div>
                            </a>

                            <a
                              href={pollUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-white hover:text-orange-400 font-bold mt-3 tracking-wide inline-flex items-center gap-1.5 transition-colors group"
                            >
                              <span>Ingresar a Pregunta</span>
                              <ExternalLink className="w-3.5 h-3.5 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                            </a>

                            <div className="mt-2 w-full px-1">
                              <p className="text-[10px] text-slate-400 font-mono break-all bg-black/50 py-1 px-2 rounded-lg border border-white/10 select-all" title="Enlace directo a esta pregunta">
                                {pollUrl}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-2">
                            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                            <span className="text-xs font-black text-white">
                              {stats.total} votos registrados
                            </span>
                          </div>
                        </div>

                        {/* Bars & Live Interactive Vote */}
                        <div className="col-span-8 backdrop-blur-xl bg-[#040812]/90 border border-white/15 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-300 mb-4 pb-2 border-b border-white/10 font-semibold">
                              <span>Opciones de la pregunta</span>
                              <span className="text-orange-400 font-bold">Haz clic para votar o escanea</span>
                            </div>

                            <div className="space-y-3">
                              {pollOptions.map((optText, optIdx) => {
                                const count = stats.counts[optIdx] || 0;
                                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                                const isWinner = count > 0 && count === stats.max;
                                const isSelected = userVotedIndex === optIdx;

                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => handleVote(scene.pollId!, optIdx, optText)}
                                    className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-300 relative overflow-hidden ${
                                      isSelected
                                        ? 'bg-orange-500/25 border-orange-500 shadow-md shadow-orange-500/20'
                                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between text-xs xl:text-sm font-bold text-slate-100 mb-2 relative z-10">
                                      <span className="flex items-center gap-2 pr-2">
                                        {isWinner && <Trophy className="w-4 h-4 text-amber-400 shrink-0" />}
                                        <span>{optText}</span>
                                      </span>
                                      <span className="text-slate-300 shrink-0 font-mono">
                                        <strong className="text-white text-sm font-black">{percentage}%</strong> ({count})
                                      </span>
                                    </div>

                                    <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
                                      <div
                                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                                          isWinner
                                            ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 shadow-lg shadow-orange-500/50'
                                            : 'bg-slate-400'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {userVotedIndex !== undefined && (
                            <p className="text-xs text-emerald-400 font-bold mt-3 flex items-center gap-1.5 animate-fadeIn">
                              <CheckCircle2 className="w-4 h-4" />
                              ¡Voto registrado en tiempo real en la base de datos!
                            </p>
                          )}

                          {/* Terminar Encuesta Action Button */}
                          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span className="font-medium">Votación abierta</span>
                            </div>

                            <button
                              onClick={() => handleEndPoll(scene.pollId!)}
                              disabled={Boolean(scene.pollId && analyzingPolls[scene.pollId])}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                            >
                              {Boolean(scene.pollId && analyzingPolls[scene.pollId]) ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Consolidando resultados...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                  <span>Terminar Encuesta</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 2: SCENE 02 PORTADA (Presenter Card)                */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-2' && (
                  <div className="space-y-6">
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-3xl p-6 shadow-2xl flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-orange-500/30 shrink-0">
                        LM
                      </div>
                      <div>
                        <span className="text-[11px] uppercase font-black tracking-[0.2em] text-orange-400 block mb-0.5">
                          Conferencista Principal
                        </span>
                        <h3 className="text-2xl font-black text-white tracking-tight">Lucas Marinero</h3>
                        <p className="text-xs text-slate-300 font-medium">
                          Estrategia y Transformación de Personas impulsada por Datos & IA
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="backdrop-blur-xl bg-[#040812]/75 border border-white/10 rounded-2xl p-4">
                        <span className="text-xs font-black text-orange-400 block mb-1">01. Centro Integrado (CIO)</span>
                        <p className="text-xs text-slate-300 font-light">Decisiones coordinadas que resguardan la seguridad y productividad del personal.</p>
                      </div>
                      <div className="backdrop-blur-xl bg-[#040812]/75 border border-white/10 rounded-2xl p-4">
                        <span className="text-xs font-black text-orange-400 block mb-1">02. De la Intuición al Dato</span>
                        <p className="text-xs text-slate-300 font-light">La inteligencia artificial como copiloto analítico para líderes de capital humano.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 3: SCENE 03 PARADIGMA (Executive Quote)             */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-3' && (
                  <div className="space-y-6">
                    <div className="relative backdrop-blur-xl bg-[#040812]/90 border-l-4 border-l-orange-500 border border-white/15 rounded-3xl p-7 xl:p-8 shadow-2xl">
                      <div className="text-5xl text-orange-500/30 font-serif leading-none absolute top-4 right-6 select-none">
                        “
                      </div>
                      <p className="text-xl font-bold text-white leading-snug mb-3 tracking-tight">
                        El verdadero progreso demanda replantear nuestra forma de operar.
                      </p>
                      <p className="text-sm text-slate-200 leading-relaxed font-light">
                        Abrazar sistemas avanzados y predictivos no representa un riesgo, sino un giro radical en nuestra visión del negocio. Para asegurar el éxito de esta evolución, la visión del cambio y la brújula estratégica deben surgir indefectiblemente desde lo más alto del liderazgo.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3.5">
                      <div className="backdrop-blur-xl bg-[#040812]/80 border border-white/10 rounded-2xl p-4">
                        <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 block mb-1">01 / Liderazgo</span>
                        <p className="text-xs text-slate-300 font-light">La brújula estratégica debe nacer en la alta dirección.</p>
                      </div>
                      <div className="backdrop-blur-xl bg-[#040812]/80 border border-white/10 rounded-2xl p-4">
                        <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 block mb-1">02 / Criterio</span>
                        <p className="text-xs text-slate-300 font-light">Predecir dotación y formación con antelación.</p>
                      </div>
                      <div className="backdrop-blur-xl bg-[#040812]/80 border border-white/10 rounded-2xl p-4">
                        <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 block mb-1">03 / Cultura</span>
                        <p className="text-xs text-slate-300 font-light">La tecnología amplifica la capacidad humana.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 4: SCENE 05 DIAGNÓSTICO (3 Action Steps)            */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-5' && (
                  <div className="space-y-3.5 mb-6">
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-black text-sm shrink-0">1</div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">Mapear los Procesos Actuales</h4>
                        <p className="text-xs text-slate-300 font-light">Auditar el viaje completo del trabajador: postulación, acreditación en mina e inducción técnica.</p>
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-sm shrink-0">2</div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">Detectar Cuellos de Botella</h4>
                        <p className="text-xs text-slate-300 font-light">Localizar fricciones críticas, tiempos muertos en trámites de acreditación y duplicidad de planillas.</p>
                      </div>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-4 flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-sm shrink-0">3</div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">Implementar con Propósito Claro</h4>
                        <p className="text-xs text-slate-300 font-light">Desplegar IA únicamente donde resuelva problemas concretos y medibles para la operación.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 5: SCENE 07 ARQUITECTURA DE DATOS                   */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-7' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <Database className="w-6 h-6 text-orange-400 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-1">Centralización</h4>
                      <p className="text-xs text-slate-300 font-light">Unificar datos dispersos en faenas, campamentos y oficinas centrales en una base confiable.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <ShieldCheck className="w-6 h-6 text-amber-400 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-1">Trazabilidad</h4>
                      <p className="text-xs text-slate-300 font-light">Auditoría estricta de certificaciones, exámenes médicos y capacitaciones obligatorias.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <Cpu className="w-6 h-6 text-orange-500 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-1">Infraestructura</h4>
                      <p className="text-xs text-slate-300 font-light">Servidores robustos capaces de procesar telemetría y consultas en tiempo real.</p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 6: SCENE 08 TALENTO ESPECIALIZADO                   */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-8' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <span className="text-xs font-black uppercase text-orange-400 block mb-2">01 / Científico de Datos</span>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">Modelado estadístico y análisis predictivo para prever rotación y demanda de perfiles clave.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <span className="text-xs font-black uppercase text-amber-400 block mb-2">02 / Arquitecto de Datos</span>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">Garantizar integración y calidad de flujos de datos sin silos entre faenas.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <span className="text-xs font-black uppercase text-orange-500 block mb-2">03 / Analista de Negocio</span>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">Interpretación contextual y validación de resultados para asegurar valor real.</p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 7: SCENE 09 GOBERNANZA DE DATOS                     */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-9' && (
                  <div className="backdrop-blur-xl bg-[#040812]/90 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
                    <p className="text-sm text-white font-medium">
                      "Sin calidad, seguridad y reglas claras en los cimientos, es imposible alcanzar la innovación en la cúspide."
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div>
                        <span className="text-xs font-bold text-orange-400 block mb-1">Certeza Regulatoria</span>
                        <p className="text-xs text-slate-300 font-light">Cumplimiento irrestricto de normativas de seguridad minera y protección de datos laborales.</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-orange-400 block mb-1">Datos Limpios y Verificables</span>
                        <p className="text-xs text-slate-300 font-light">Eliminación de planillas duplicadas y registros manuales no auditados.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 8: SCENE 11 TOMA DE DECISIONES TRANSVERSAL          */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-11' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <span className="text-xs font-black text-orange-400 uppercase block mb-1">En el Terreno y Operaciones</span>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">Supervisores y operadores con acceso a alertas preventivas y recomendaciones operativas inmediatas.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <span className="text-xs font-black text-amber-400 uppercase block mb-1">En la Mesa Directiva</span>
                      <p className="text-xs text-slate-300 font-light leading-relaxed">Visualización estratégica del clima, fatiga, dotación y costos en tiempo real con certidumbre.</p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 9: SCENE 12 APLICACIÓN PRÁCTICA RRHH                */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-12' && (
                  <div className="grid grid-cols-3 gap-3.5">
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-4">
                      <span className="text-xs font-black text-orange-400 block mb-1">Acreditación Ágil</span>
                      <p className="text-xs text-slate-300 font-light">Reducción de hasta un 70% en los tiempos de espera para el ingreso a faena.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-4">
                      <span className="text-xs font-black text-amber-400 block mb-1">Selección Predictiva</span>
                      <p className="text-xs text-slate-300 font-light">Filtrado contextual de perfiles técnicos adaptados a la alta exigencia minera.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-4">
                      <span className="text-xs font-black text-orange-500 block mb-1">Capacitación Focalizada</span>
                      <p className="text-xs text-slate-300 font-light">Cierre dinámico de brechas de habilidades con simuladores y módulos a medida.</p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 10: SCENE 13 PROYECTO SIMÓN (RAG)                   */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-13' && (
                  <div className="backdrop-blur-xl bg-[#040812]/90 border border-orange-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center font-black">
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">Simón: Asistente RAG Corporativo</h4>
                        <p className="text-xs text-slate-300">Generación Aumentada por Recuperación con precisión estricta</p>
                      </div>
                    </div>
                    <p className="text-xs xl:text-sm text-slate-200 font-light leading-relaxed">
                      Cada respuesta está respaldada exclusivamente en la documentación oficial de la empresa: convenios colectivos de trabajo, manuales de procedimiento seguro y normativas de recursos humanos, eliminando cualquier alucinación.
                    </p>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 11: SCENE 14 CLÍMAX TECNOLÓGICO                    */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-14' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-xl bg-[#040812]/90 border border-orange-500/40 rounded-2xl p-5 shadow-2xl">
                      <Cpu className="w-6 h-6 text-orange-400 mb-2 animate-pulse" />
                      <h4 className="text-sm font-bold text-white mb-1">Cerebro Conectado</h4>
                      <p className="text-xs text-slate-300 font-light">Integración total entre sistemas de control operacional, accesos y métricas de desempeño.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/90 border border-amber-500/40 rounded-2xl p-5 shadow-2xl">
                      <Sparkles className="w-6 h-6 text-amber-300 mb-2" />
                      <h4 className="text-sm font-bold text-white mb-1">Simulación Continua</h4>
                      <p className="text-xs text-slate-300 font-light">Proyecciones automáticas de turnos, descansos y necesidades críticas de faena.</p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 12: SCENE 15 MÉTRICAS EN TIEMPO REAL                */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-15' && (
                  <div className="grid grid-cols-3 gap-3.5">
                    <div className="backdrop-blur-xl bg-[#040812]/80 border border-white/10 rounded-2xl p-4">
                      <span className="text-2xl font-black text-orange-400 block mb-1">100%</span>
                      <span className="text-xs text-slate-300 font-light">Trazabilidad documental</span>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/80 border border-white/10 rounded-2xl p-4">
                      <span className="text-2xl font-black text-amber-300 block mb-1">0 Seg</span>
                      <span className="text-xs text-slate-300 font-light">Latencia en consultas clave</span>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/80 border border-white/10 rounded-2xl p-4">
                      <span className="text-2xl font-black text-orange-500 block mb-1">24 / 7</span>
                      <span className="text-xs text-slate-300 font-light">Disponibilidad operacional</span>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 13: SCENE 16 RETOS ESTRATÉGICOS                     */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-16' && (
                  <div className="backdrop-blur-xl bg-[#040812]/90 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-3">
                    <h4 className="text-base font-black text-white">Cambiar el modelo mental antes que la tecnología</h4>
                    <p className="text-xs xl:text-sm text-slate-200 font-light leading-relaxed">
                      El liderazgo debe adoptar una visión basada en datos, priorizando el diagnóstico y la cultura organizacional como punto de partida. Invertir en arquitectura y talento especializado es la única garantía para un retorno perdurable.
                    </p>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 14: SCENE 18 LIDERANDO LA TRANSFORMACIÓN            */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-18' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <span className="text-xs font-black text-orange-400 uppercase block mb-1">De la Reacción a la Anticipación</span>
                      <p className="text-xs text-slate-300 font-light">Planificar necesidades de personal y certificaciones antes de que se conviertan en emergencias.</p>
                    </div>
                    <div className="backdrop-blur-xl bg-[#040812]/85 border border-white/15 rounded-2xl p-5">
                      <span className="text-xs font-black text-amber-400 uppercase block mb-1">Ventaja Sostenible</span>
                      <p className="text-xs text-slate-300 font-light">Las compañías que unifican datos y cultura lideran el costo por tonelada y la retención de talento.</p>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 15: SCENE 19 EL EQUIPO DEL FUTURO                   */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-19' && (
                  <div className="backdrop-blur-xl bg-[#040812]/90 border-l-4 border-l-orange-500 border border-white/15 rounded-3xl p-6 shadow-2xl">
                    <p className="text-base xl:text-lg font-bold text-white mb-2">
                      "La verdadera potencia de la minería radica en la inteligencia colectiva de sus personas, potenciada al máximo por la tecnología."
                    </p>
                    <p className="text-xs text-slate-300 font-light">
                      Ingenieros, operadores, cuadrillas de terreno y especialistas de personas caminando juntos hacia una faena segura, eficiente y humana.
                    </p>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* CASE 16: SCENE 20 CIERRE Y CONTACTO                      */}
                {/* -------------------------------------------------------- */}
                {scene.id === 'scene-20' && (
                  <div className="backdrop-blur-xl bg-[#040812]/90 border border-orange-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
                    <div>
                      <span className="text-xs font-black text-orange-400 uppercase tracking-widest block mb-1">
                        Conferencia & Estrategia
                      </span>
                      <h3 className="text-3xl font-black text-white">Lucas Marinero</h3>
                      <p className="text-sm text-slate-300">Consultor y Especialista en IA & Estrategia de Capital Humano en Minería</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3 text-xs text-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">@</div>
                        <span>lmarinero@sanatorioargentino.com.ar</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">in</div>
                        <span>linkedin.com/in/lucasmarinero</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <a
                        href="#/admin"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-orange-500/25 transition-all cursor-pointer"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Ver Resultados Finales en Panel Admin</span>
                      </a>

                      <button
                        onClick={() => goToScene(0)}
                        className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-orange-400" />
                        <span>Reiniciar Presentación</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </section>
          );
        })}
      </main>

    </div>
  );
};

export default ScrolltellingPage;
