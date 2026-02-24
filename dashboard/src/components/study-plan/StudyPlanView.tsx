'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Brain,
  Dumbbell,
  RotateCcw,
  FileQuestion,
  ChevronDown,
  ChevronRight,
  Flame,
  Target,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import type { StudyPlan, StudyPhase, DailyTask, TaskItem } from '@/types';

// ==========================================
// TYPES
// ==========================================

interface StudyPlanViewProps {
  plan: StudyPlan | null;
  onCompleteTask: (planId: string, dayId: string, taskId: string) => void;
  onNavigate: (view: string) => void;
}

// ==========================================
// CONSTANTS
// ==========================================

const taskTypeIcons: Record<TaskItem['type'], React.ElementType> = {
  lettura: BookOpen,
  riassunto: FileQuestion,
  esercizi: Dumbbell,
  ripasso: RotateCcw,
  simulazione: Brain,
  mappa_concettuale: Target,
  flashcard: Flame,
};

const taskTypeLabels: Record<TaskItem['type'], string> = {
  lettura: 'Lettura',
  riassunto: 'Riassunto',
  esercizi: 'Esercizi',
  ripasso: 'Ripasso',
  simulazione: 'Simulazione',
  mappa_concettuale: 'Mappa Concettuale',
  flashcard: 'Flashcard',
};

const phaseColors: Record<StudyPhase['type'], { bg: string; text: string; border: string; gradient: string }> = {
  comprensione: {
    bg: 'rgba(108, 92, 231, 0.15)',
    text: '#a29bfe',
    border: 'rgba(108, 92, 231, 0.3)',
    gradient: 'from-[#6c5ce7] to-[#a29bfe]',
  },
  approfondimento: {
    bg: 'rgba(162, 155, 254, 0.15)',
    text: '#d4a0ff',
    border: 'rgba(162, 155, 254, 0.3)',
    gradient: 'from-[#a29bfe] to-[#d4a0ff]',
  },
  pratica: {
    bg: 'rgba(0, 206, 201, 0.15)',
    text: '#00cec9',
    border: 'rgba(0, 206, 201, 0.3)',
    gradient: 'from-[#00cec9] to-[#55efc4]',
  },
  ripasso: {
    bg: 'rgba(253, 203, 110, 0.15)',
    text: '#fdcb6e',
    border: 'rgba(253, 203, 110, 0.3)',
    gradient: 'from-[#fdcb6e] to-[#ffeaa7]',
  },
  simulazione: {
    bg: 'rgba(253, 121, 168, 0.15)',
    text: '#fd79a8',
    border: 'rgba(253, 121, 168, 0.3)',
    gradient: 'from-[#fd79a8] to-[#fab1c4]',
  },
};

const phaseLabels: Record<StudyPhase['type'], string> = {
  comprensione: 'Comprensione',
  approfondimento: 'Approfondimento',
  pratica: 'Pratica',
  ripasso: 'Ripasso',
  simulazione: 'Simulazione',
};

const priorityConfig: Record<TaskItem['priority'], { color: string; bg: string; label: string }> = {
  alta: { color: '#ff7675', bg: 'rgba(255, 118, 117, 0.15)', label: 'Alta' },
  media: { color: '#fdcb6e', bg: 'rgba(253, 203, 110, 0.15)', label: 'Media' },
  bassa: { color: '#00b894', bg: 'rgba(0, 184, 148, 0.15)', label: 'Bassa' },
};

// ==========================================
// HELPERS
// ==========================================

function getDaysRemaining(examDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);
  const diff = exam.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDateItalian(dateStr: string): string {
  const date = new Date(dateStr);
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
  ];
  const days = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function getTodayISO(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getCurrentDayNumber(plan: StudyPlan): number {
  const start = new Date(plan.startDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function getActivePhase(plan: StudyPlan): StudyPhase | null {
  const currentDay = getCurrentDayNumber(plan);
  return plan.phases.find((p) => currentDay >= p.startDay && currentDay <= p.endDay) ?? null;
}

function getPhaseForDay(plan: StudyPlan, day: number): StudyPhase | null {
  return plan.phases.find((p) => day >= p.startDay && day <= p.endDay) ?? null;
}

function getTodayTasks(plan: StudyPlan): DailyTask | null {
  const today = getTodayISO();
  return plan.dailyTasks.find((d) => d.date.split('T')[0] === today) ?? null;
}

function getUpcomingDays(plan: StudyPlan, count: number): DailyTask[] {
  const today = getTodayISO();
  const sorted = [...plan.dailyTasks].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const todayIndex = sorted.findIndex((d) => d.date.split('T')[0] === today);
  const startIdx = todayIndex >= 0 ? todayIndex : sorted.findIndex((d) => !d.completed);
  if (startIdx < 0) return sorted.slice(-count);
  return sorted.slice(startIdx, startIdx + count);
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

/** Circular progress ring for the countdown hero */
function ProgressRing({
  progress,
  size = 180,
  strokeWidth = 8,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(108, 92, 231, 0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6c5ce7" />
          <stop offset="50%" stopColor="#00cec9" />
          <stop offset="100%" stopColor="#fd79a8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Empty state when no plan exists */
function EmptyState({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
    >
      {/* Illustration */}
      <div className="relative mb-8">
        <motion.div
          className="w-40 h-40 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(108, 92, 231, 0.15) 0%, rgba(0, 206, 201, 0.05) 70%)',
          }}
          animate={{
            boxShadow: [
              '0 0 40px rgba(108, 92, 231, 0.15)',
              '0 0 80px rgba(108, 92, 231, 0.25)',
              '0 0 40px rgba(108, 92, 231, 0.15)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <CalendarClock size={64} className="text-accent-light" strokeWidth={1.2} />
        </motion.div>
        <motion.div
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent-pink/20 flex items-center justify-center"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain size={18} className="text-accent-pink" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -left-3 w-8 h-8 rounded-full bg-accent-teal/20 flex items-center justify-center"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Target size={14} className="text-accent-teal" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mb-3">
        Nessun piano di studio attivo
      </h2>
      <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
        Configura il tuo primo esame per generare un piano di studio personalizzato
        e intelligente, adattato al tuo professore e ai tuoi materiali.
      </p>

      <motion.button
        onClick={() => onNavigate('onboarding')}
        className="glow-button px-8 py-3.5 text-base font-semibold flex items-center gap-2"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <CalendarClock size={18} />
        Configura il tuo primo esame
      </motion.button>
    </motion.div>
  );
}

/** Countdown Hero section */
function CountdownHero({ plan }: { plan: StudyPlan }) {
  const daysRemaining = getDaysRemaining(plan.examDate);
  const progress = plan.overallProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 md:p-8 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(108, 92, 231, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(0, 206, 201, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
        {/* Progress ring + countdown */}
        <div className="relative flex-shrink-0">
          <div className="pulse-glow rounded-full">
            <ProgressRing progress={progress} size={180} strokeWidth={8} />
          </div>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-5xl font-extrabold gradient-text leading-none"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, type: 'spring' }}
            >
              {daysRemaining}
            </motion.span>
            <span className="text-xs text-text-muted mt-1 font-medium">Giorni rimanenti</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center lg:text-left space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1">Il tuo Piano di Studio</h2>
            <p className="text-text-secondary text-sm">
              Esame previsto per{' '}
              <span className="text-accent-light font-semibold">{formatDateItalian(plan.examDate)}</span>
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <div className="glass-card-static px-4 py-3 flex items-center gap-3 min-w-[140px]">
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <TrendingUp size={16} className="text-accent-light" />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{Math.round(progress)}%</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Progresso</p>
              </div>
            </div>

            <div className="glass-card-static px-4 py-3 flex items-center gap-3 min-w-[140px]">
              <div className="w-9 h-9 rounded-lg bg-accent-teal/15 flex items-center justify-center">
                <CalendarClock size={16} className="text-accent-teal" />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{plan.totalDays}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Giorni totali</p>
              </div>
            </div>

            <div className="glass-card-static px-4 py-3 flex items-center gap-3 min-w-[140px]">
              <div className="w-9 h-9 rounded-lg bg-accent-pink/15 flex items-center justify-center">
                <AlertCircle size={16} className="text-accent-pink" />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{plan.adaptiveAdjustments}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Adattamenti</p>
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-muted">Progresso generale</span>
              <span className="text-xs font-semibold text-accent-light">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-bg-card rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full progress-shimmer"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Phase timeline */
function PhaseTimeline({ plan }: { plan: StudyPlan }) {
  const activePhase = getActivePhase(plan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
        <Target size={18} className="text-accent-light" />
        Fasi del Piano
      </h3>

      {/* Desktop horizontal timeline */}
      <div className="hidden md:block">
        <div className="relative flex items-start justify-between">
          {/* Connecting line */}
          <div className="absolute top-5 left-0 right-0 h-[2px] bg-bg-card z-0" />
          <div
            className="absolute top-5 left-0 h-[2px] z-[1] transition-all duration-700"
            style={{
              width: activePhase
                ? `${((plan.phases.indexOf(activePhase) + 0.5) / plan.phases.length) * 100}%`
                : '0%',
              background: 'linear-gradient(90deg, #6c5ce7, #00cec9)',
            }}
          />

          {plan.phases.map((phase, idx) => {
            const isActive = activePhase?.id === phase.id;
            const colors = phaseColors[phase.type];
            const isPast = activePhase
              ? plan.phases.indexOf(activePhase) > idx
              : false;

            return (
              <motion.div
                key={phase.id}
                className="relative z-10 flex flex-col items-center text-center"
                style={{ width: `${100 / plan.phases.length}%` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
              >
                {/* Node */}
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 transition-all duration-300"
                  style={{
                    background: isActive
                      ? colors.bg
                      : phase.completed || isPast
                      ? 'rgba(0, 184, 148, 0.15)'
                      : 'var(--color-bg-card)',
                    borderColor: isActive
                      ? colors.text
                      : phase.completed || isPast
                      ? '#00b894'
                      : 'rgba(108, 92, 231, 0.15)',
                    boxShadow: isActive ? `0 0 20px ${colors.bg}` : 'none',
                  }}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={isActive ? { duration: 2, repeat: Infinity } : {}}
                >
                  {phase.completed || isPast ? (
                    <CheckCircle2 size={18} className="text-accent-success" />
                  ) : (
                    <span
                      className="text-sm font-bold"
                      style={{ color: isActive ? colors.text : 'var(--color-text-muted)' }}
                    >
                      {idx + 1}
                    </span>
                  )}
                </motion.div>

                {/* Label */}
                <p
                  className="text-xs font-semibold mb-0.5 transition-colors"
                  style={{ color: isActive ? colors.text : 'var(--color-text-secondary)' }}
                >
                  {phaseLabels[phase.type]}
                </p>
                <p className="text-[10px] text-text-muted">
                  Giorno {phase.startDay}-{phase.endDay}
                </p>

                {/* Active badge */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                  >
                    In corso
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical timeline */}
      <div className="md:hidden space-y-3">
        {plan.phases.map((phase, idx) => {
          const isActive = activePhase?.id === phase.id;
          const colors = phaseColors[phase.type];
          const isPast = activePhase ? plan.phases.indexOf(activePhase) > idx : false;

          return (
            <motion.div
              key={phase.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: isActive ? colors.bg : 'transparent',
                border: isActive ? `1px solid ${colors.border}` : '1px solid transparent',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.06 }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border"
                style={{
                  borderColor: isActive ? colors.text : phase.completed || isPast ? '#00b894' : 'var(--color-border)',
                  background: phase.completed || isPast ? 'rgba(0, 184, 148, 0.1)' : 'var(--color-bg-card)',
                }}
              >
                {phase.completed || isPast ? (
                  <CheckCircle2 size={14} className="text-accent-success" />
                ) : (
                  <span className="text-xs font-bold" style={{ color: isActive ? colors.text : 'var(--color-text-muted)' }}>
                    {idx + 1}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: isActive ? colors.text : 'var(--color-text-secondary)' }}>
                  {phaseLabels[phase.type]}
                </p>
                <p className="text-[10px] text-text-muted truncate">{phase.description}</p>
              </div>
              <span className="text-[10px] text-text-muted flex-shrink-0">
                G.{phase.startDay}-{phase.endDay}
              </span>
              {isActive && (
                <span
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  Ora
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Single task item with checkbox */
function TaskItemRow({
  task,
  planId,
  dayId,
  onComplete,
}: {
  task: TaskItem;
  planId: string;
  dayId: string;
  onComplete: (planId: string, dayId: string, taskId: string) => void;
}) {
  const Icon = taskTypeIcons[task.type] ?? BookOpen;
  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${
        task.completed ? 'opacity-50' : 'hover:bg-bg-card-hover/50'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => !task.completed && onComplete(planId, dayId, task.id)}
        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
        aria-label={task.completed ? 'Completato' : 'Segna come completato'}
      >
        <AnimatePresence mode="wait">
          {task.completed ? (
            <motion.div
              key="checked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <CheckCircle2 size={20} className="text-accent-success" />
            </motion.div>
          ) : (
            <motion.div
              key="unchecked"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Circle size={20} className="text-text-muted group-hover:text-accent-light transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(108, 92, 231, 0.1)' }}
      >
        <Icon size={14} className="text-accent-light" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-medium ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {task.title}
          </p>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: priority.bg, color: priority.color }}
          >
            {priority.label}
          </span>
        </div>
        <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{task.description}</p>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1 text-text-muted flex-shrink-0">
        <Clock size={12} />
        <span className="text-xs">{task.duration} min</span>
      </div>
    </motion.div>
  );
}

/** Today's tasks card */
function TodayTasksCard({
  plan,
  todayTasks,
  onComplete,
}: {
  plan: StudyPlan;
  todayTasks: DailyTask;
  onComplete: (planId: string, dayId: string, taskId: string) => void;
}) {
  const completedCount = todayTasks.tasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.tasks.length;
  const todayProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const phase = getPhaseForDay(plan, todayTasks.day);
  const colors = phase ? phaseColors[phase.type] : phaseColors.comprensione;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-5 pb-4 relative"
        style={{
          background: `linear-gradient(135deg, ${colors.bg}, transparent)`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
            >
              <Flame size={18} style={{ color: colors.text }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Oggi</h3>
              <p className="text-xs text-text-muted">{formatDateItalian(todayTasks.date)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-text-primary">
              {completedCount}/{totalCount}
            </p>
            <p className="text-[10px] text-text-muted">completati</p>
          </div>
        </div>

        {/* Phase label + estimated hours */}
        <div className="flex items-center gap-3 flex-wrap">
          {phase && (
            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
            >
              {phaseLabels[phase.type]}
            </span>
          )}
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Clock size={12} />
            {todayTasks.estimatedHours}h stimate
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${colors.text}, var(--color-accent-teal))` }}
              initial={{ width: 0 }}
              animate={{ width: `${todayProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Tasks list */}
      <div className="p-4 pt-2 space-y-1">
        <AnimatePresence>
          {todayTasks.tasks.map((task) => (
            <TaskItemRow
              key={task.id}
              task={task}
              planId={plan.id}
              dayId={todayTasks.id}
              onComplete={onComplete}
            />
          ))}
        </AnimatePresence>

        {totalCount === 0 && (
          <p className="text-center text-text-muted text-sm py-6">
            Nessun compito per oggi.
          </p>
        )}
      </div>
    </motion.div>
  );
}

/** Expandable day card for the weekly view */
function DayCard({
  plan,
  dayTask,
  isToday,
  onComplete,
}: {
  plan: StudyPlan;
  dayTask: DailyTask;
  isToday: boolean;
  onComplete: (planId: string, dayId: string, taskId: string) => void;
}) {
  const [expanded, setExpanded] = useState(isToday);
  const phase = getPhaseForDay(plan, dayTask.day);
  const colors = phase ? phaseColors[phase.type] : phaseColors.comprensione;
  const completedCount = dayTask.tasks.filter((t) => t.completed).length;
  const totalCount = dayTask.tasks.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card-static overflow-hidden transition-all ${
        isToday ? 'ring-1 ring-accent/30' : ''
      } ${dayTask.completed ? 'opacity-60' : ''}`}
    >
      {/* Header - clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-bg-card-hover/30 transition-colors"
      >
        {/* Day number */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{
            background: dayTask.completed
              ? 'rgba(0, 184, 148, 0.1)'
              : isToday
              ? colors.bg
              : 'var(--color-bg-card)',
            borderColor: dayTask.completed
              ? 'rgba(0, 184, 148, 0.2)'
              : isToday
              ? colors.border
              : 'transparent',
          }}
        >
          {dayTask.completed ? (
            <CheckCircle2 size={18} className="text-accent-success" />
          ) : (
            <span
              className="text-sm font-bold"
              style={{ color: isToday ? colors.text : 'var(--color-text-secondary)' }}
            >
              {dayTask.day}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">
              Giorno {dayTask.day}
            </p>
            {isToday && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent-light border border-accent/20">
                OGGI
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-text-muted">{formatDateShort(dayTask.date)}</span>
            {phase && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: colors.bg, color: colors.text }}
              >
                {phaseLabels[phase.type]}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs font-medium text-text-secondary">
              {completedCount}/{totalCount}
            </p>
            <p className="text-[10px] text-text-muted flex items-center gap-1 justify-end">
              <Clock size={10} />
              {dayTask.estimatedHours}h
            </p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-text-muted" />
          </motion.div>
        </div>
      </button>

      {/* Expandable task list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-border space-y-1">
              {dayTask.tasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  planId={plan.id}
                  dayId={dayTask.id}
                  onComplete={onComplete}
                />
              ))}
              {dayTask.tasks.length === 0 && (
                <p className="text-center text-text-muted text-xs py-4">
                  Nessun compito assegnato.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Weekly accordion view */
function WeeklyView({
  plan,
  onComplete,
}: {
  plan: StudyPlan;
  onComplete: (planId: string, dayId: string, taskId: string) => void;
}) {
  const upcomingDays = getUpcomingDays(plan, 7);
  const todayISO = getTodayISO();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CalendarClock size={18} className="text-accent-teal" />
          Prossimi Giorni
        </h3>
        <span className="text-xs text-text-muted">
          {upcomingDays.length} giorni in vista
        </span>
      </div>

      <div className="space-y-2">
        {upcomingDays.map((dayTask, idx) => {
          const isToday = dayTask.date.split('T')[0] === todayISO;
          return (
            <motion.div
              key={dayTask.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + idx * 0.05 }}
            >
              <DayCard
                plan={plan}
                dayTask={dayTask}
                isToday={isToday}
                onComplete={onComplete}
              />
            </motion.div>
          );
        })}

        {upcomingDays.length === 0 && (
          <div className="glass-card-static p-8 text-center">
            <CheckCircle2 size={32} className="text-accent-success mx-auto mb-3" />
            <p className="text-text-secondary text-sm">
              Tutti i compiti sono stati completati!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function StudyPlanView({ plan, onCompleteTask, onNavigate }: StudyPlanViewProps) {
  if (!plan) {
    return <EmptyState onNavigate={onNavigate} />;
  }

  const todayTasks = getTodayTasks(plan);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text">Piano di Studio</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Generato il {formatDateShort(plan.createdAt)} &middot; {plan.phases.length} fasi &middot; {plan.totalDays} giorni
          </p>
        </div>
      </motion.div>

      {/* Countdown Hero */}
      <CountdownHero plan={plan} />

      {/* Phase Timeline */}
      <PhaseTimeline plan={plan} />

      {/* Today's Tasks */}
      {todayTasks ? (
        <TodayTasksCard plan={plan} todayTasks={todayTasks} onComplete={onCompleteTask} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-accent-warning/15 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={20} className="text-accent-warning" />
          </div>
          <p className="text-text-secondary text-sm">
            Nessun compito programmato per oggi.
          </p>
          <p className="text-text-muted text-xs mt-1">
            Controlla i prossimi giorni per le attivita in arrivo.
          </p>
        </motion.div>
      )}

      {/* Weekly View */}
      <WeeklyView plan={plan} onComplete={onCompleteTask} />
    </div>
  );
}
