'use client';

import { motion } from 'framer-motion';
import { Plus, Clock, Target, Trash2, MessageCircle, GraduationCap, TrendingUp, ArrowRight, Flame } from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import type { Professor } from '@/types';

interface HomeViewProps {
  professors: Professor[];
  onSelectProfessor: (id: string) => void;
  onCreateProfessor: () => void;
  onDeleteProfessor: (id: string) => void;
}

function getDaysLeft(examDate?: string): number | null {
  if (!examDate) return null;
  try {
    const d = parseISO(examDate);
    if (!isValid(d)) return null;
    return differenceInDays(d, new Date());
  } catch {
    return null;
  }
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
};

export default function HomeView({ professors, onSelectProfessor, onCreateProfessor, onDeleteProfessor }: HomeViewProps) {
  return (
    <div className="min-h-screen relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 flex items-end justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="tag">Dashboard</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none mb-2">
            <span className="gradient-text">I tuoi Esami</span>
          </h1>
          <p style={{ color: '#8899b0' }} className="text-base">
            {professors.length === 0
              ? 'Aggiungi il tuo primo esame per iniziare'
              : `${professors.length} ${professors.length === 1 ? 'esame attivo' : 'esami attivi'} — studia con il tuo professore AI`}
          </p>
        </div>
        <motion.button
          onClick={onCreateProfessor}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="glow-button flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
        >
          <Plus size={16} />
          Nuovo esame
        </motion.button>
      </motion.div>

      {/* Empty State */}
      {professors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center justify-center py-28 text-center"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-6"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}
          >
            🎓
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: '#e2e8f0' }}>
            Nessun esame ancora
          </h2>
          <p className="text-base mb-8 max-w-sm leading-relaxed" style={{ color: '#8899b0' }}>
            Crea il tuo primo professore AI per iniziare a studiare in modo intelligente.
          </p>
          <motion.button
            onClick={onCreateProfessor}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="glow-button flex items-center gap-2.5 px-8 py-3.5 text-base font-bold"
          >
            <Plus size={18} />
            Aggiungi il tuo primo esame
          </motion.button>
        </motion.div>
      )}

      {/* Professor Cards Grid */}
      {professors.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10"
        >
          {professors.map((prof) => {
            const daysLeft = getDaysLeft(prof.examDate);
            const daysColor = getDaysColor(daysLeft);
            const daysLabel = getDaysLabel(daysLeft);
            const color = prof.color || '#10b981';
            const emoji = prof.emoji || '🎓';
            const chatCount = prof.chatHistory?.length || 0;
            const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

            return (
              <motion.div
                key={prof.id}
                variants={cardVariants}
                className="relative group"
              >
                {/* Delete */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onDeleteProfessor(prof.id); }}
                  className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-all duration-200"
                  style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={13} />
                </motion.button>

                {/* Card */}
                <motion.div
                  onClick={() => onSelectProfessor(prof.id)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                  className="cursor-pointer rounded-xl overflow-hidden relative"
                  style={{
                    background: '#111827',
                    border: `1px solid rgba(255,255,255,0.06)`,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.border = `1px solid ${color}30`;
                    el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5)`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.border = `1px solid rgba(255,255,255,0.06)`;
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Colored left bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[3px]"
                    style={{ background: `linear-gradient(180deg, ${color}, ${color}55)` }}
                  />

                  {/* Urgent glow badge */}
                  {isUrgent && (
                    <div className="absolute top-3 left-5">
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
                      >
                        <Flame size={9} />
                        URGENTE
                      </div>
                    </div>
                  )}

                  <div className="p-5 pl-6">
                    {/* Avatar + name */}
                    <div className="flex items-start gap-3.5 mb-4" style={{ marginTop: isUrgent ? '20px' : '0' }}>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${color}18`,
                          border: `1px solid ${color}30`,
                          fontSize: '22px',
                        }}
                      >
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm tracking-tight truncate" style={{ color: '#e2e8f0' }}>
                          Prof. {prof.name}
                        </h3>
                        <p className="text-xs font-semibold mt-0.5 truncate" style={{ color }}>
                          {prof.subject || prof.department || 'Materia'}
                        </p>
                        {/* Difficulty dots */}
                        <div className="flex items-center gap-1 mt-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-4 h-1 rounded-full"
                              style={{
                                background: i < (prof.difficulty || 3)
                                  ? `linear-gradient(90deg,${color},${color}88)`
                                  : 'rgba(255,255,255,0.07)',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Exam countdown */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
                      style={{
                        background: `${daysColor}0e`,
                        border: `1px solid ${daysColor}28`,
                      }}
                    >
                      <Clock size={12} style={{ color: daysColor }} />
                      <span className="text-xs font-bold" style={{ color: daysColor }}>
                        {daysLabel}
                      </span>
                      {daysLeft !== null && daysLeft > 0 && (
                        <span className="text-[10px] ml-auto" style={{ color: '#4a5568' }}>
                          all&apos;esame
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1" style={{ color: '#4a5568' }}>
                        <MessageCircle size={11} />
                        <span className="text-[11px]">{chatCount}</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: '#4a5568' }}>
                        <Target size={11} />
                        <span className="text-[11px]">{prof.targetGrade || 28}/30</span>
                      </div>
                      <div
                        className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#8899b0',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {prof.examFormat}
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.button
                      onClick={() => onSelectProfessor(prof.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
                      style={{
                        background: `${color}14`,
                        color,
                        border: `1px solid ${color}28`,
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = `${color}22`;
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = `${color}14`;
                      }}
                    >
                      Studia con me
                      <ArrowRight size={12} />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Add new card */}
          <motion.div variants={cardVariants}>
            <motion.button
              onClick={onCreateProfessor}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-full min-h-[240px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-200 group"
              style={{ borderColor: 'rgba(16,185,129,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)')}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <Plus size={20} style={{ color: '#10b981' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold" style={{ color: '#8899b0' }}>
                  Aggiungi esame
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#4a5568' }}>Nuovo professore AI</p>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Stats bar */}
      {professors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl p-5 flex flex-wrap items-center gap-6"
          style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.1)' }}
        >
          {[
            {
              icon: <GraduationCap size={16} style={{ color: '#10b981' }} />,
              value: professors.length,
              label: 'Professori',
              bg: 'rgba(16,185,129,0.1)',
            },
            {
              icon: <MessageCircle size={16} style={{ color: '#06b6d4' }} />,
              value: professors.reduce((acc, p) => acc + (p.chatHistory?.length || 0), 0),
              label: 'Messaggi',
              bg: 'rgba(6,182,212,0.1)',
            },
            {
              icon: <TrendingUp size={16} style={{ color: '#fbbf24' }} />,
              value: professors.filter((p) => {
                const d = getDaysLeft(p.examDate);
                return d !== null && d <= 14 && d >= 0;
              }).length,
              label: 'Entro 2 sett.',
              bg: 'rgba(251,191,36,0.1)',
            },
            {
              icon: <Target size={16} style={{ color: '#a78bfa' }} />,
              value: professors.length > 0
                ? Math.round(professors.reduce((acc, p) => acc + (p.targetGrade || 28), 0) / professors.length)
                : 0,
              label: 'Media obiettivo',
              bg: 'rgba(167,139,250,0.1)',
            },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <div className="w-px h-8 hidden sm:block" style={{ background: 'rgba(16,185,129,0.08)' }} />}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: stat.bg }}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-black leading-none" style={{ color: '#e2e8f0' }}>{stat.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#4a5568' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
