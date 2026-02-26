'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Brain, Network, Table2, Monitor, FileText, Video, Sparkles, ArrowRight } from 'lucide-react';
import FlashcardsTab from './FlashcardsTab';
import QuizTab from './QuizTab';
import MindMapTab from './MindMapTab';
import TableTab from './TableTab';
import PresentationTab from './PresentationTab';
import ReportTab from './ReportTab';
import VideoScriptTab from './VideoScriptTab';

type NotebookTab = 'flashcards' | 'quiz' | 'mindmap' | 'table' | 'presentation' | 'report' | 'video';

const skills: {
  id: NotebookTab;
  label: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
  description: string;
  emoji: string;
  tag: string;
}[] = [
  {
    id: 'flashcards',
    label: 'Flashcard',
    icon: Layers,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    glow: 'rgba(168,85,247,0.5)',
    description: 'Ripasso rapido con carte intelligenti',
    emoji: '🃏',
    tag: 'Memoria',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: Brain,
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    glow: 'rgba(16,185,129,0.5)',
    description: 'Verifica le tue conoscenze',
    emoji: '🧠',
    tag: 'Valutazione',
  },
  {
    id: 'mindmap',
    label: 'Mappa Mentale',
    icon: Network,
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    glow: 'rgba(59,130,246,0.5)',
    description: 'Visualizza i concetti collegati',
    emoji: '🌐',
    tag: 'Visualizzazione',
  },
  {
    id: 'table',
    label: 'Tabella',
    icon: Table2,
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    glow: 'rgba(245,158,11,0.5)',
    description: 'Organizza e confronta i dati',
    emoji: '📊',
    tag: 'Organizzazione',
  },
  {
    id: 'presentation',
    label: 'Presentazione',
    icon: Monitor,
    gradient: 'linear-gradient(135deg, #9d174d 0%, #ec4899 100%)',
    glow: 'rgba(236,72,153,0.5)',
    description: 'Crea slide strutturate per lo studio',
    emoji: '📽',
    tag: 'Presentazione',
  },
  {
    id: 'report',
    label: 'Report',
    icon: FileText,
    gradient: 'linear-gradient(135deg, #3730a3 0%, #6366f1 100%)',
    glow: 'rgba(99,102,241,0.5)',
    description: 'Saggio, analisi e relazioni',
    emoji: '📄',
    tag: 'Scrittura',
  },
  {
    id: 'video',
    label: 'Overview Video',
    icon: Video,
    gradient: 'linear-gradient(135deg, #164e63 0%, #06b6d4 100%)',
    glow: 'rgba(6,182,212,0.5)',
    description: 'Script e storyboard per video',
    emoji: '🎬',
    tag: 'Multimedia',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.94 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function NotebookView() {
  const [activeSkill, setActiveSkill] = useState<NotebookTab | null>(null);
  const active = skills.find((s) => s.id === activeSkill);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="tag">Notebook AI</span>
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
            Gemini AI attivo
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-none mb-2">
          <span className="gradient-text">Genera materiali</span>
          <span style={{ color: '#e2e8f0' }}> di studio</span>
        </h1>
        <p style={{ color: '#8899b0' }} className="text-sm">
          Scegli una skill — Gemini AI creerà contenuti personalizzati in pochi secondi
        </p>
      </motion.div>

      {/* Skill grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        {skills.map((skill) => {
          const Icon = skill.icon;
          const isActive = activeSkill === skill.id;
          return (
            <motion.button
              key={skill.id}
              variants={cardVariants}
              onClick={() => setActiveSkill(isActive ? null : skill.id)}
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative text-left rounded-2xl overflow-hidden group"
              style={{
                background: isActive ? skill.gradient : '#111827',
                border: isActive
                  ? `1px solid transparent`
                  : `1px solid rgba(255,255,255,0.07)`,
                boxShadow: isActive ? `0 8px 32px ${skill.glow}` : 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = `rgba(255,255,255,0.18)`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${skill.glow.replace('0.5', '0.25')}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = `rgba(255,255,255,0.07)`;
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              {/* Gradient overlay when inactive on hover */}
              {!isActive && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: skill.gradient, opacity: 0 }}
                />
              )}

              {/* Active glow overlay */}
              {isActive && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%)' }}
                />
              )}

              <div className="relative p-4">
                {/* Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                      color: isActive ? 'rgba(255,255,255,0.9)' : '#4a5568',
                    }}
                  >
                    {skill.tag}
                  </span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.25)' }}
                    >
                      <span className="text-white text-[9px] font-black">✓</span>
                    </motion.div>
                  )}
                </div>

                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-xl"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    fontSize: '20px',
                  }}
                >
                  {skill.emoji}
                </div>

                {/* Label */}
                <h3
                  className="font-extrabold text-sm leading-tight mb-1"
                  style={{ color: isActive ? '#fff' : '#e2e8f0' }}
                >
                  {skill.label}
                </h3>
                <p
                  className="text-[11px] leading-snug"
                  style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#4a5568' }}
                >
                  {skill.description}
                </p>

                {/* CTA */}
                <div
                  className="flex items-center gap-1 mt-3 text-[10px] font-bold"
                  style={{ color: isActive ? 'rgba(255,255,255,0.9)' : '#6ee7b7' }}
                >
                  {isActive ? 'Attivo' : 'Genera ora'}
                  <ArrowRight size={10} className={isActive ? '' : 'group-hover:translate-x-0.5 transition-transform'} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Divider when skill is selected */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="h-px origin-left"
            style={{ background: `linear-gradient(90deg, ${active.glow}, transparent)` }}
          />
        )}
      </AnimatePresence>

      {/* Active skill label */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3"
          >
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{ background: active.gradient, color: '#fff' }}
            >
              <Sparkles size={13} />
              {active.label}
            </div>
            <span style={{ color: '#4a5568' }} className="text-xs">
              {active.description} — inserisci un argomento e Gemini genera in secondi
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeSkill && (
          <motion.div
            key={activeSkill}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {activeSkill === 'flashcards' && <FlashcardsTab accentColor="#a855f7" accentGradient="linear-gradient(135deg,#7c3aed,#a855f7)" />}
            {activeSkill === 'quiz' && <QuizTab accentColor="#10b981" accentGradient="linear-gradient(135deg,#047857,#10b981)" />}
            {activeSkill === 'mindmap' && <MindMapTab />}
            {activeSkill === 'table' && <TableTab />}
            {activeSkill === 'presentation' && <PresentationTab />}
            {activeSkill === 'report' && <ReportTab />}
            {activeSkill === 'video' && <VideoScriptTab />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!activeSkill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
          >
            ✨
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#8899b0' }}>
            Seleziona una skill sopra
          </p>
          <p className="text-xs" style={{ color: '#4a5568' }}>
            Gemini AI genererà il contenuto in pochi secondi
          </p>
        </motion.div>
      )}
    </div>
  );
}
