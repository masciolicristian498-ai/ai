'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import FlashcardsTab from './FlashcardsTab';
import QuizTab from './QuizTab';
import MindMapTab from './MindMapTab';
import TableTab from './TableTab';
import PresentationTab from './PresentationTab';
import ReportTab from './ReportTab';
import VideoScriptTab from './VideoScriptTab';

type NotebookTab = 'flashcards' | 'quiz' | 'mindmap' | 'table' | 'presentation' | 'report' | 'video';

const SKILLS = [
  {
    id: 'flashcards' as NotebookTab,
    label: 'Flashcard',
    sub: 'Ripasso rapido con carte',
    emoji: '🃏',
    tag: 'Memoria',
    c1: '#e879f9', c2: '#a855f7', c3: '#581c87',
    glow: '#d946ef',
    floatDelay: 0,    floatDur: 4.1,
    accentColor: '#a855f7',
    accentGradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
  },
  {
    id: 'quiz' as NotebookTab,
    label: 'Quiz',
    sub: 'Verifica le conoscenze',
    emoji: '🧠',
    tag: 'Valutazione',
    c1: '#6ee7b7', c2: '#10b981', c3: '#065f46',
    glow: '#10b981',
    floatDelay: 0.6,  floatDur: 3.8,
    accentColor: '#10b981',
    accentGradient: 'linear-gradient(135deg,#047857,#10b981)',
  },
  {
    id: 'mindmap' as NotebookTab,
    label: 'Mappa Mentale',
    sub: 'Visualizza i concetti',
    emoji: '🌐',
    tag: 'Visualizzazione',
    c1: '#93c5fd', c2: '#3b82f6', c3: '#1e3a8a',
    glow: '#3b82f6',
    floatDelay: 1.1,  floatDur: 4.5,
    accentColor: '#3b82f6',
    accentGradient: 'linear-gradient(135deg,#1e40af,#3b82f6)',
  },
  {
    id: 'table' as NotebookTab,
    label: 'Tabella',
    sub: 'Organizza e confronta',
    emoji: '📊',
    tag: 'Organizzazione',
    c1: '#fde68a', c2: '#f59e0b', c3: '#78350f',
    glow: '#f59e0b',
    floatDelay: 0.3,  floatDur: 3.6,
    accentColor: '#f59e0b',
    accentGradient: 'linear-gradient(135deg,#b45309,#f59e0b)',
  },
  {
    id: 'presentation' as NotebookTab,
    label: 'Presentazione',
    sub: 'Slide strutturate',
    emoji: '📽',
    tag: 'Slide',
    c1: '#fbcfe8', c2: '#ec4899', c3: '#831843',
    glow: '#ec4899',
    floatDelay: 0.8,  floatDur: 4.2,
    accentColor: '#ec4899',
    accentGradient: 'linear-gradient(135deg,#9d174d,#ec4899)',
  },
  {
    id: 'report' as NotebookTab,
    label: 'Report',
    sub: 'Saggio, analisi, relazione',
    emoji: '📄',
    tag: 'Scrittura',
    c1: '#c7d2fe', c2: '#6366f1', c3: '#312e81',
    glow: '#6366f1',
    floatDelay: 1.3,  floatDur: 3.9,
    accentColor: '#6366f1',
    accentGradient: 'linear-gradient(135deg,#3730a3,#6366f1)',
  },
  {
    id: 'video' as NotebookTab,
    label: 'Overview Video',
    sub: 'Script e storyboard',
    emoji: '🎬',
    tag: 'Multimedia',
    c1: '#a5f3fc', c2: '#06b6d4', c3: '#164e63',
    glow: '#06b6d4',
    floatDelay: 0.5,  floatDur: 4.4,
    accentColor: '#06b6d4',
    accentGradient: 'linear-gradient(135deg,#164e63,#06b6d4)',
  },
] as const;

export default function NotebookView() {
  const [activeSkill, setActiveSkill] = useState<NotebookTab | null>(null);
  const active = SKILLS.find((s) => s.id === activeSkill);

  return (
    <div className="relative min-h-screen">

      {/* ── ATMOSPHERIC BACKGROUND BLOBS ─────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-10%', right: '-10%',
            width: '55vw', height: '55vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.07, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute', bottom: '10%', left: '-8%',
            width: '50vw', height: '50vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], x: [0, 30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', top: '40%', left: '30%',
            width: '40vw', height: '40vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ── CONTENT ──────────────────────────────────── */}
      <div className="relative space-y-10" style={{ zIndex: 10 }}>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="tag">Notebook AI</span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
              style={{ background: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
              Gemini AI attivo
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.95] mb-3">
            <span style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #c084fc 45%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Genera materiali
            </span>
            <br />
            <span style={{ color: '#94a3b8', fontSize: '0.7em', fontWeight: 700 }}>di studio con AI</span>
          </h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            Scegli una skill — Gemini creerà contenuti personalizzati in pochi secondi
          </p>
        </motion.div>

        {/* ── SKILL CARDS GRID ─────────────────────────── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {SKILLS.map((skill) => {
            const isActive = activeSkill === skill.id;

            return (
              <motion.div
                key={skill.id}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.88 },
                  visible: {
                    opacity: 1, y: 0, scale: 1,
                    transition: { type: 'spring', stiffness: 260, damping: 22 },
                  },
                }}
              >
                {/* Floating animation wrapper (only when inactive) */}
                <motion.button
                  animate={!isActive ? { y: [0, -8, 0] } : { y: 0 }}
                  transition={!isActive ? {
                    duration: skill.floatDur,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: skill.floatDelay,
                  } : { duration: 0.2 }}
                  whileHover={{ scale: 1.06, y: -12 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveSkill(isActive ? null : skill.id)}
                  className="w-full text-left relative rounded-2xl overflow-hidden focus:outline-none"
                  style={{
                    background: isActive
                      ? `radial-gradient(circle at 35% 30%, ${skill.c1}f0 0%, ${skill.c2} 50%, ${skill.c3} 100%)`
                      : `linear-gradient(135deg, ${skill.c1}22 0%, ${skill.c2}14 60%, ${skill.c3}0a 100%)`,
                    border: isActive
                      ? `1px solid ${skill.glow}70`
                      : `1px solid ${skill.glow}35`,
                    boxShadow: isActive
                      ? `0 0 50px ${skill.glow}55, 0 16px 48px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,255,255,0.04)`
                      : `0 4px 20px rgba(0,0,0,0.25)`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '200px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = `linear-gradient(135deg, ${skill.c1}40 0%, ${skill.c2}28 60%, ${skill.c3}18 100%)`;
                      el.style.borderColor = `${skill.glow}60`;
                      el.style.boxShadow = `0 8px 32px ${skill.glow}35, 0 16px 48px rgba(0,0,0,0.4)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = `linear-gradient(135deg, ${skill.c1}22 0%, ${skill.c2}14 60%, ${skill.c3}0a 100%)`;
                      el.style.borderColor = `${skill.glow}35`;
                      el.style.boxShadow = `0 4px 20px rgba(0,0,0,0.25)`;
                    }
                  }}
                >
                  {/* Specular highlight on active */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: '8%', left: '15%',
                      width: '35%', height: '22%', borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 100%)',
                      filter: 'blur(8px)', pointerEvents: 'none',
                    }} />
                  )}

                  {/* Active checkmark */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
                    >
                      <span className="text-white text-[10px] font-black">✓</span>
                    </motion.div>
                  )}

                  <div className="p-4 flex flex-col h-full" style={{ minHeight: '200px' }}>
                    {/* Tag */}
                    <div className="mb-4">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                        style={{
                          background: isActive ? 'rgba(255,255,255,0.22)' : `${skill.glow}20`,
                          color: isActive ? '#fff' : skill.glow,
                          border: `1px solid ${isActive ? 'rgba(255,255,255,0.3)' : skill.glow + '40'}`,
                        }}
                      >
                        {skill.tag}
                      </span>
                    </div>

                    {/* Large emoji orb */}
                    <div className="flex justify-center mb-4">
                      <div
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          background: isActive
                            ? 'rgba(255,255,255,0.18)'
                            : `radial-gradient(circle at 38% 32%, ${skill.c1}55, ${skill.c2}30 60%, ${skill.c3}18 100%)`,
                          boxShadow: isActive
                            ? `0 0 30px rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.08)`
                            : `0 0 24px ${skill.glow}45, 0 0 48px ${skill.glow}18`,
                          border: isActive ? '1px solid rgba(255,255,255,0.25)' : `1px solid ${skill.glow}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '34px',
                          backdropFilter: 'blur(4px)',
                          position: 'relative',
                        }}
                      >
                        {/* Mini specular on emoji orb */}
                        <div style={{
                          position: 'absolute', top: '12%', left: '18%',
                          width: '28%', height: '18%', borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 100%)',
                          filter: 'blur(2px)',
                          pointerEvents: 'none',
                        }} />
                        <span style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>
                          {skill.emoji}
                        </span>
                      </div>
                    </div>

                    {/* Label + description */}
                    <div className="text-center mt-auto">
                      <h3
                        className="font-extrabold text-sm leading-tight mb-1"
                        style={{ color: isActive ? '#fff' : '#f1f5f9' }}
                      >
                        {skill.label}
                      </h3>
                      <p
                        className="text-[11px] leading-snug"
                        style={{ color: isActive ? 'rgba(255,255,255,0.65)' : skill.glow + 'cc' }}
                      >
                        {skill.sub}
                      </p>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── ACTIVE SKILL HEADER ──────────────────────── */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4"
            >
              {/* Gradient divider */}
              <div className="flex-1 h-px" style={{
                background: `linear-gradient(90deg, ${active.glow}60, ${active.glow}20, transparent)`,
              }} />
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold shrink-0"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${active.c1}f0, ${active.c2} 55%, ${active.c3} 100%)`,
                  color: '#fff',
                  boxShadow: `0 4px 20px ${active.glow}50`,
                  border: `1px solid ${active.glow}50`,
                }}
              >
                <Sparkles size={14} />
                {active.label}
                <ChevronDown size={13} style={{ opacity: 0.7 }} />
              </div>
              <div className="flex-1 h-px" style={{
                background: `linear-gradient(90deg, transparent, ${active.glow}20, ${active.glow}60)`,
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB CONTENT ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeSkill && (
            <motion.div
              key={activeSkill}
              initial={{ opacity: 0, y: 24, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {activeSkill === 'flashcards' && (
                <FlashcardsTab accentColor="#a855f7" accentGradient="linear-gradient(135deg,#7c3aed,#a855f7)" />
              )}
              {activeSkill === 'quiz' && (
                <QuizTab accentColor="#10b981" accentGradient="linear-gradient(135deg,#047857,#10b981)" />
              )}
              {activeSkill === 'mindmap' && <MindMapTab />}
              {activeSkill === 'table' && <TableTab />}
              {activeSkill === 'presentation' && <PresentationTab />}
              {activeSkill === 'report' && <ReportTab />}
              {activeSkill === 'video' && <VideoScriptTab />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── EMPTY STATE ──────────────────────────────── */}
        {!activeSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5 } }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{
                background: 'radial-gradient(circle at 38% 32%, rgba(168,85,247,0.35), rgba(99,102,241,0.2) 50%, rgba(6,182,212,0.1) 100%)',
                border: '1px solid rgba(168,85,247,0.3)',
                boxShadow: '0 0 30px rgba(168,85,247,0.2)',
              }}
            >
              ✨
            </motion.div>
            <p className="text-sm font-bold mb-1" style={{ color: '#64748b' }}>
              Tocca una skill per iniziare
            </p>
            <p className="text-xs" style={{ color: '#334155' }}>
              Gemini AI genererà i contenuti in pochi secondi
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
