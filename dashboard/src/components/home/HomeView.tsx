'use client';

import { motion } from 'framer-motion';
import {
  BookMarked, BarChart3, Upload, Zap,
  Plus, MessageCircle, Clock, Target,
  Trash2, ArrowRight, Flame, CalendarDays,
} from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import type { Professor } from '@/types';

interface HomeViewProps {
  professors: Professor[];
  onSelectProfessor: (id: string) => void;
  onCreateProfessor: () => void;
  onDeleteProfessor: (id: string) => void;
  onNavigate?: (view: string) => void;
}

function getDaysLeft(examDate?: string): number | null {
  if (!examDate) return null;
  try {
    const d = parseISO(examDate);
    if (!isValid(d)) return null;
    return differenceInDays(d, new Date());
  } catch { return null; }
}
function getDaysColor(days: number | null): string {
  if (days === null) return '#4a5568';
  if (days <= 7) return '#f87171';
  if (days <= 20) return '#fbbf24';
  return '#4ade80';
}
function getDaysLabel(days: number | null): string {
  if (days === null) return 'Data non impostata';
  if (days < 0) return 'Esame passato';
  if (days === 0) return 'Oggi!';
  if (days === 1) return '1 giorno';
  return `${days} giorni`;
}

// ── Navigation orbs config ──────────────────────────────────────────────────
const NAV_ORBS = [
  {
    id: 'chat',
    label: 'Chat AI',
    sub: 'Parla col professore',
    emoji: '💬',
    icon: MessageCircle,
    c1: '#e879f9', c2: '#a21caf', c3: '#4a044e',
    glow: '#d946ef',
    floatDelay: 0, floatDur: 4.2,
  },
  {
    id: 'notebook',
    label: 'Notebook AI',
    sub: 'Flashcard, Quiz, Mappe',
    emoji: '📓',
    icon: BookMarked,
    c1: '#93c5fd', c2: '#2563eb', c3: '#1e3a8a',
    glow: '#3b82f6',
    floatDelay: 0.55, floatDur: 3.8,
  },
  {
    id: 'progress',
    label: 'Progressi',
    sub: 'Statistiche e grafici',
    emoji: '📈',
    icon: BarChart3,
    c1: '#6ee7b7', c2: '#059669', c3: '#064e3b',
    glow: '#10b981',
    floatDelay: 1.1, floatDur: 4.6,
  },
  {
    id: 'upload',
    label: 'Materiali',
    sub: 'Carica appunti e file',
    emoji: '📁',
    icon: Upload,
    c1: '#fde68a', c2: '#d97706', c3: '#78350f',
    glow: '#f59e0b',
    floatDelay: 0.3, floatDur: 3.7,
  },
  {
    id: 'study-plan',
    label: 'Piano Studio',
    sub: 'Organizza le sessioni',
    emoji: '📋',
    icon: CalendarDays,
    c1: '#f9a8d4', c2: '#db2777', c3: '#831843',
    glow: '#ec4899',
    floatDelay: 0.85, floatDur: 4.1,
  },
  {
    id: 'exam',
    label: 'Simulazione',
    sub: "Prova l'esame vero",
    emoji: '🎯',
    icon: Zap,
    c1: '#67e8f9', c2: '#0891b2', c3: '#164e63',
    glow: '#06b6d4',
    floatDelay: 1.4, floatDur: 3.9,
  },
] as const;

export default function HomeView({
  professors,
  onSelectProfessor,
  onCreateProfessor,
  onDeleteProfessor,
  onNavigate,
}: HomeViewProps) {

  const handleOrbClick = (id: string) => {
    if (id === 'chat') {
      if (professors.length === 0) {
        onCreateProfessor();
      } else if (professors.length === 1) {
        onSelectProfessor(professors[0].id);
        onNavigate?.('chat');
      } else {
        document.getElementById('prof-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate?.(id);
    }
  };

  return (
    <div className="relative min-h-screen">

      {/* ══════════════════════════════════════════════
          BACKGROUND ATMOSPHERIC BLOBS (fixed, z-0)
      ══════════════════════════════════════════════ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Violet — top-left */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-18%', left: '-18%',
            width: '70vw', height: '70vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Cyan — bottom-right */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          style={{
            position: 'absolute', bottom: '-22%', right: '-18%',
            width: '65vw', height: '65vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(14,165,233,0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Pink — center */}
        <motion.div
          animate={{ scale: [1, 1.06, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          style={{
            position: 'absolute', top: '35%', right: '15%',
            width: '42vw', height: '42vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Green — bottom-left */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute', bottom: '5%', left: '5%',
            width: '35vw', height: '35vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════
          CONTENT (z-10)
      ══════════════════════════════════════════════ */}
      <div className="relative" style={{ zIndex: 10 }}>

        {/* ── HERO SECTION ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 pt-4"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{
                background: 'rgba(124,58,237,0.12)',
                color: '#7c3aed',
                border: '1px solid rgba(124,58,237,0.25)',
                boxShadow: '0 0 20px rgba(124,58,237,0.1)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse inline-block" />
              Powered by Gemini AI
            </span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-5">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="block"
              style={{
                background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 40%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Studia più
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="block"
              style={{ color: '#1e1b4b' }}
            >
              intelligente.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-lg max-w-md mx-auto"
            style={{ color: '#5b5694' }}
          >
            Il tuo assistente universitario AI — scegli una sezione per iniziare
          </motion.p>
        </motion.div>

        {/* ── NAVIGATION ORBS GRID ─────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.55 } } }}
          className="grid grid-cols-3 gap-y-10 gap-x-4 sm:gap-x-8 max-w-xl sm:max-w-2xl mx-auto px-2 mb-20"
        >
          {NAV_ORBS.map((orb) => (
            <motion.div
              key={orb.id}
              variants={{
                hidden: { opacity: 0, scale: 0.5, y: 40 },
                visible: {
                  opacity: 1, scale: 1, y: 0,
                  transition: { type: 'spring', stiffness: 220, damping: 20 },
                },
              }}
              className="flex flex-col items-center gap-3"
            >
              {/* Floating orb button */}
              <motion.button
                animate={{ y: [0, -13, 0] }}
                transition={{
                  duration: orb.floatDur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: orb.floatDelay,
                }}
                whileHover={{ scale: 1.12, y: -18 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleOrbClick(orb.id)}
                className="relative flex items-center justify-center focus:outline-none"
                style={{
                  width: 'clamp(100px, 14vw, 160px)',
                  height: 'clamp(100px, 14vw, 160px)',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 38% 32%, ${orb.c1}f0 0%, ${orb.c2} 48%, ${orb.c3} 100%)`,
                  boxShadow: `0 0 40px ${orb.glow}55, 0 0 80px ${orb.glow}22, 0 12px 32px rgba(0,0,0,0.12), inset 0 0 30px rgba(255,255,255,0.04)`,
                  border: `1px solid ${orb.glow}35`,
                  cursor: 'pointer',
                  transition: 'box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 0 60px ${orb.glow}80, 0 0 120px ${orb.glow}35, 0 16px 40px rgba(0,0,0,0.15), inset 0 0 40px rgba(255,255,255,0.06)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 0 40px ${orb.glow}55, 0 0 80px ${orb.glow}22, 0 20px 40px rgba(0,0,0,0.4), inset 0 0 30px rgba(255,255,255,0.04)`;
                }}
              >
                {/* Specular highlight */}
                <div
                  style={{
                    position: 'absolute', top: '13%', left: '18%',
                    width: '32%', height: '22%', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.65) 0%, transparent 100%)',
                    filter: 'blur(4px)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Secondary glow dot */}
                <div
                  style={{
                    position: 'absolute', bottom: '18%', right: '20%',
                    width: '18%', height: '12%', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    filter: 'blur(3px)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Emoji */}
                <span
                  style={{
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    lineHeight: 1,
                    position: 'relative',
                    zIndex: 1,
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
                  }}
                >
                  {orb.emoji}
                </span>
              </motion.button>

              {/* Label */}
              <div className="text-center">
                <p
                  className="font-extrabold text-sm sm:text-base leading-tight"
                  style={{ color: '#1e1b4b' }}
                >
                  {orb.label}
                </p>
                <p
                  className="text-[10px] sm:text-xs mt-0.5 leading-snug hidden sm:block"
                  style={{ color: '#6b7280' }}
                >
                  {orb.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── SEPARATOR ────────────────────────────── */}
        <div
          className="mb-10 h-px max-w-4xl mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), rgba(6,182,212,0.2), transparent)',
          }}
        />

        {/* ── PROFESSOR SECTION ────────────────────── */}
        <div id="prof-section">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black" style={{ color: '#1e1b4b' }}>
                I tuoi Esami
                {professors.length > 0 && (
                  <span className="ml-2 text-base font-semibold" style={{ color: '#9ca3af' }}>
                    ({professors.length})
                  </span>
                )}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
                {professors.length === 0
                  ? 'Aggiungi il tuo primo esame per iniziare'
                  : 'Seleziona un professore per chattare'}
              </p>
            </div>
            <motion.button
              onClick={onCreateProfessor}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              }}
            >
              <Plus size={16} />
              Nuovo esame
            </motion.button>
          </div>

          {/* Empty State */}
          {professors.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
              style={{
                background: 'rgba(124,58,237,0.04)',
                border: '1px dashed rgba(124,58,237,0.2)',
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
                style={{
                  background: 'rgba(124,58,237,0.1)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  boxShadow: '0 0 30px rgba(124,58,237,0.12)',
                }}
              >
                🎓
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: '#1e1b4b' }}>
                Nessun esame ancora
              </h3>
              <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: '#6b7280' }}>
                Crea il tuo primo professore AI e inizia a studiare in modo intelligente
              </p>
              <motion.button
                onClick={onCreateProfessor}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  boxShadow: '0 4px 24px rgba(124,58,237,0.45)',
                }}
              >
                <Plus size={16} />
                Aggiungi il tuo primo esame
              </motion.button>
            </motion.div>
          )}

          {/* Professor cards grid */}
          {professors.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8"
            >
              {professors.map((prof) => {
                const daysLeft = getDaysLeft(prof.examDate);
                const daysColor = getDaysColor(daysLeft);
                const daysLabel = getDaysLabel(daysLeft);
                const color = prof.color || '#a855f7';
                const emoji = prof.emoji || '🎓';
                const chatCount = prof.chatHistory?.length || 0;
                const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

                return (
                  <motion.div
                    key={prof.id}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.97 },
                      visible: {
                        opacity: 1, y: 0, scale: 1,
                        transition: { type: 'spring', stiffness: 300, damping: 26 },
                      },
                    }}
                    className="relative group"
                  >
                    {/* Delete */}
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); onDeleteProfessor(prof.id); }}
                      className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={12} />
                    </motion.button>

                    {/* Card */}
                    <motion.div
                      onClick={() => { onSelectProfessor(prof.id); onNavigate?.('chat'); }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.99 }}
                      className="cursor-pointer rounded-2xl overflow-hidden relative"
                      style={{
                        background: '#ffffff',
                        border: `1px solid rgba(124,58,237,0.1)`,
                        boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
                        transition: 'all 0.25s ease',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.border = `1px solid ${color}40`;
                        el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px ${color}20`;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.border = `1px solid rgba(124,58,237,0.1)`;
                        el.style.boxShadow = '0 2px 12px rgba(124,58,237,0.06)';
                      }}
                    >
                      {/* Top color strip */}
                      <div
                        className="h-1 w-full"
                        style={{ background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }}
                      />

                      {/* Urgent badge */}
                      {isUrgent && (
                        <div className="absolute top-4 right-4 z-10">
                          <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase"
                            style={{
                              background: 'rgba(248,113,113,0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(248,113,113,0.3)',
                              boxShadow: '0 0 12px rgba(248,113,113,0.2)',
                            }}
                          >
                            <Flame size={8} /> Urgente
                          </div>
                        </div>
                      )}

                      <div className="p-5">
                        {/* Avatar + name */}
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                            style={{
                              background: `${color}18`,
                              border: `1px solid ${color}30`,
                              boxShadow: `0 0 20px ${color}20`,
                            }}
                          >
                            {emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-sm tracking-tight truncate" style={{ color: '#1e1b4b' }}>
                              Prof. {prof.name}
                            </h3>
                            <p className="text-xs font-semibold mt-0.5 truncate" style={{ color }}>
                              {prof.subject || prof.department || 'Materia'}
                            </p>
                            <div className="flex items-center gap-0.5 mt-1.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-1 rounded-full"
                                  style={{
                                    width: i < (prof.difficulty || 3) ? 14 : 10,
                                    background: i < (prof.difficulty || 3)
                                      ? `linear-gradient(90deg,${color},${color}66)`
                                      : 'rgba(124,58,237,0.08)',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Countdown */}
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                          style={{ background: `${daysColor}0c`, border: `1px solid ${daysColor}25` }}
                        >
                          <Clock size={11} style={{ color: daysColor }} />
                          <span className="text-xs font-bold" style={{ color: daysColor }}>{daysLabel}</span>
                          {daysLeft !== null && daysLeft > 0 && (
                            <span className="text-[10px] ml-auto" style={{ color: '#9ca3af' }}>all&apos;esame</span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1" style={{ color: '#9ca3af' }}>
                            <MessageCircle size={10} />
                            <span className="text-[10px] font-semibold">{chatCount}</span>
                          </div>
                          <div className="flex items-center gap-1" style={{ color: '#9ca3af' }}>
                            <Target size={10} />
                            <span className="text-[10px] font-semibold">{prof.targetGrade || 28}/30</span>
                          </div>
                          <div
                            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(124,58,237,0.06)', color: '#6b7280' }}
                          >
                            {prof.examFormat}
                          </div>
                        </div>

                        {/* CTA */}
                        <div
                          className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          style={{
                            background: `linear-gradient(135deg, ${color}22, ${color}12)`,
                            border: `1px solid ${color}30`,
                            color,
                          }}
                        >
                          Studia con me <ArrowRight size={11} />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Add card */}
              <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              >
                <motion.button
                  onClick={onCreateProfessor}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full min-h-[240px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 group"
                  style={{ borderColor: 'rgba(124,58,237,0.15)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
                    e.currentTarget.style.background = 'rgba(124,58,237,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: 'rgba(124,58,237,0.1)',
                      border: '1px solid rgba(124,58,237,0.25)',
                    }}
                  >
                    <Plus size={20} style={{ color: '#a855f7' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold" style={{ color: '#5b5694' }}>Aggiungi esame</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Nuovo professore AI</p>
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
