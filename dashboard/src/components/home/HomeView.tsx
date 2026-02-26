'use client';

import { motion } from 'framer-motion';
import { Plus, BookOpen, Clock, Target, Trash2, MessageCircle, GraduationCap, TrendingUp } from 'lucide-react';
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
  if (days === null) return '#a0a0b8';
  if (days <= 7) return '#ff7675';
  if (days <= 20) return '#fdcb6e';
  return '#00b894';
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
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

export default function HomeView({ professors, onSelectProfessor, onCreateProfessor, onDeleteProfessor }: HomeViewProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">I tuoi Professori</span>
            </h1>
            <p className="text-text-secondary text-lg">
              {professors.length === 0
                ? 'Aggiungi il tuo primo esame per iniziare'
                : `${professors.length} ${professors.length === 1 ? 'esame attivo' : 'esami attivi'} · Studia con il tuo professore AI`}
            </p>
          </div>
          <motion.button
            onClick={onCreateProfessor}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glow-button flex items-center gap-2 px-5 py-3 text-sm font-semibold"
          >
            <Plus size={18} />
            Nuovo Professore
          </motion.button>
        </div>
      </motion.div>

      {/* Empty State */}
      {professors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-accent/20 to-accent-teal/20 flex items-center justify-center mb-6 text-6xl">
            🎓
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Nessun esame ancora</h2>
          <p className="text-text-secondary text-center max-w-sm mb-8 leading-relaxed">
            Crea il tuo primo professore AI per iniziare a studiare in modo intelligente. Ogni professore ha memoria e stile unico.
          </p>
          <motion.button
            onClick={onCreateProfessor}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glow-button flex items-center gap-3 px-8 py-4 text-base font-semibold"
          >
            <Plus size={20} />
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10"
        >
          {professors.map((prof) => {
            const daysLeft = getDaysLeft(prof.examDate);
            const daysColor = getDaysColor(daysLeft);
            const daysLabel = getDaysLabel(daysLeft);
            const color = prof.color || '#6c5ce7';
            const emoji = prof.emoji || '🎓';
            const chatCount = prof.chatHistory?.length || 0;

            return (
              <motion.div
                key={prof.id}
                variants={cardVariants}
                className="relative group"
              >
                {/* Delete button */}
                <motion.button
                  onClick={(e) => { e.stopPropagation(); onDeleteProfessor(prof.id); }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center
                    bg-bg-primary/80 text-text-muted hover:text-accent-danger hover:bg-bg-card
                    opacity-0 group-hover:opacity-100 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={14} />
                </motion.button>

                {/* Card */}
                <motion.div
                  onClick={() => onSelectProfessor(prof.id)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300"
                  style={{
                    background: 'rgba(26, 26, 46, 0.8)',
                    borderColor: `${color}30`,
                    boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
                  }}
                >
                  {/* Color top bar */}
                  <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                  />

                  <div className="p-5">
                    {/* Avatar + name */}
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg"
                        style={{ background: `${color}20`, border: `1.5px solid ${color}40` }}
                      >
                        {emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text-primary text-base leading-tight truncate">
                          Prof. {prof.name}
                        </h3>
                        <p
                          className="text-sm font-medium mt-0.5 truncate"
                          style={{ color }}
                        >
                          {prof.subject || prof.department || 'Materia'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-1 rounded-full flex-1"
                              style={{
                                background: i < (prof.difficulty || 3) ? color : 'rgba(255,255,255,0.1)',
                              }}
                            />
                          ))}
                          <span className="text-[10px] text-text-muted ml-1">diff.</span>
                        </div>
                      </div>
                    </div>

                    {/* Exam countdown */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
                      style={{ background: `${daysColor}12`, border: `1px solid ${daysColor}30` }}
                    >
                      <Clock size={13} style={{ color: daysColor }} />
                      <span className="text-xs font-semibold" style={{ color: daysColor }}>
                        {daysLabel}
                      </span>
                      {daysLeft !== null && daysLeft > 0 && (
                        <span className="text-[10px] text-text-muted ml-auto">all&apos;esame</span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <MessageCircle size={12} />
                        <span className="text-xs">{chatCount} msg</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <Target size={12} />
                        <span className="text-xs">Voto: {prof.targetGrade || 28}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-muted ml-auto">
                        <GraduationCap size={12} />
                        <span className="text-xs capitalize">{prof.examFormat}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => onSelectProfessor(prof.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                      style={{
                        background: `${color}20`,
                        color,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <BookOpen size={15} />
                      Studia con me
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
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-full min-h-[260px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 group"
              style={{ borderColor: 'rgba(108,92,231,0.3)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Plus size={24} className="text-accent group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                  Aggiungi professore
                </p>
                <p className="text-xs text-text-muted mt-0.5">Nuovo esame</p>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Stats bar at bottom */}
      {professors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-static p-5 flex items-center gap-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <GraduationCap size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{professors.length}</p>
              <p className="text-xs text-text-muted">Professori attivi</p>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-success/15 flex items-center justify-center">
              <MessageCircle size={18} className="text-accent-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {professors.reduce((acc, p) => acc + (p.chatHistory?.length || 0), 0)}
              </p>
              <p className="text-xs text-text-muted">Messaggi totali</p>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-warning/15 flex items-center justify-center">
              <TrendingUp size={18} className="text-accent-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {professors.filter((p) => {
                  const d = getDaysLeft(p.examDate);
                  return d !== null && d <= 14 && d >= 0;
                }).length}
              </p>
              <p className="text-xs text-text-muted">Esami entro 2 settimane</p>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-pink/15 flex items-center justify-center">
              <Target size={18} className="text-accent-pink" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">
                {professors.length > 0
                  ? Math.round(professors.reduce((acc, p) => acc + (p.targetGrade || 28), 0) / professors.length)
                  : 0}
              </p>
              <p className="text-xs text-text-muted">Media voti obiettivo</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
