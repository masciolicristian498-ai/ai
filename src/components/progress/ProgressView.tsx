'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Award, Clock, Target, Brain,
  Flame, BookOpen, CheckCircle2, Star, Zap, Trophy,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import type { UserProgress } from '@/types';

// ─── Count-up hook ────────────────────────────────────────────────────
function useCountUp(to: number, duration = 900, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [to, duration, delay]);
  return val;
}

// ─── Constants ────────────────────────────────────────────────────────
const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const PIE_COLORS = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#00b894'];

const studyDistribution = [
  { name: 'Lettura',      value: 30 },
  { name: 'Esercizi',     value: 25 },
  { name: 'Ripasso',      value: 20 },
  { name: 'Simulazioni',  value: 15 },
  { name: 'Mappe',        value: 10 },
];

const monthlyData = [
  { month: 'Set', ore: 45 },
  { month: 'Ott', ore: 62 },
  { month: 'Nov', ore: 55 },
  { month: 'Dic', ore: 78 },
  { month: 'Gen', ore: 85 },
  { month: 'Feb', ore: 92 },
];

const examHistory = [
  { name: 'Diritto Privato', grade: 28, max: 30, status: 'superato'    as const },
  { name: 'Microeconomia',   grade: 25, max: 30, status: 'superato'    as const },
  { name: 'Macroeconomia',   grade: null,         status: 'preparazione' as const },
];

// ─── Floating orbs ────────────────────────────────────────────────────
function BgOrbs({ color = '#6c5ce7' }: { color?: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-15 blur-2xl"
          style={{
            width: 100 + i * 60, height: 100 + i * 60,
            background: color,
            top: `${5 + i * 40}%`, right: `${5 + i * 5}%`,
          }}
          animate={{ x: [0, 15, -8, 0], y: [0, -12, 8, 0], scale: [1, 1.12, 0.94, 1] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
        />
      ))}
    </div>
  );
}

// ─── Animated stat card ───────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  rawValue: number;
  displayFn?: (n: number) => string;
  color: string;
  delay: number;
  suffix?: string;
}

function StatCard({ icon: Icon, label, rawValue, displayFn, color, delay, suffix = '' }: StatCardProps) {
  const counted = useCountUp(rawValue, 900, delay);
  const display = displayFn ? displayFn(counted) : `${counted}${suffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000 + 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border: `1px solid ${color}30`,
      }}
    >
      <BgOrbs color={color} />
      <div className="relative z-10 flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}25`, boxShadow: `0 0 18px ${color}35` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: delay / 1000 }}
        />
      </div>
      <p className="relative z-10 text-2xl font-bold text-text-primary">{display}</p>
      <p className="relative z-10 text-xs text-text-muted mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Heatmap day cell ─────────────────────────────────────────────────
function HeatCell({ day, hours, max, index }: { day: string; hours: number; max: number; index: number }) {
  const ratio = max > 0 ? hours / max : 0;
  const bg = ratio === 0 ? 'rgba(108,92,231,0.08)'
    : ratio < 0.4 ? '#6c5ce760'
    : ratio < 0.7 ? '#6c5ce7aa'
    : '#6c5ce7';

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.07 }}
    >
      <motion.div
        className="w-9 h-9 rounded-xl cursor-default relative group"
        style={{ background: bg, border: '1px solid rgba(108,92,231,0.2)' }}
        whileHover={{ scale: 1.2 }}
      >
        {hours > 0 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-bg-card border border-border text-[10px] text-text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {hours}h
          </div>
        )}
      </motion.div>
      <span className="text-[11px] text-text-muted font-medium">{day}</span>
    </motion.div>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────
function AreaBar({ label, pct, color, index }: { label: string; pct: number; color: string; index: number }) {
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.08 }}
    >
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.5 + index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

// ─── Grade donut ──────────────────────────────────────────────────────
function GradeDonut({ grade, max = 30 }: { grade: number; max?: number }) {
  const pct = grade / max;
  const color = pct >= 0.9 ? '#00b894' : pct >= 0.75 ? '#fdcb6e' : '#e17055';
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-14 h-14">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{grade}</span>
      </div>
    </div>
  );
}

// ─── Custom tooltips ──────────────────────────────────────────────────
function Tip({ active, payload, label, unit }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs font-semibold"
      style={{ background: 'rgba(15,10,40,0.95)', border: '1px solid rgba(108,92,231,0.35)' }}>
      <p className="text-text-muted mb-0.5">{label}</p>
      <p className="text-accent-light">{payload[0].value}{unit}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function ProgressView({ progress }: { progress: UserProgress }) {
  const weeklyData = DAY_LABELS.map((day, i) => ({ day, ore: progress.weeklyHours[i] ?? 0 }));
  const maxWeeklyHours = Math.max(...(progress.weeklyHours ?? [1]), 1);
  const totalWeekly = progress.weeklyHours.reduce((s, h) => s + h, 0);
  const xp = progress.totalHoursStudied * 10 + progress.passedExams * 250;
  const level = Math.floor(xp / 1000) + 1;
  const xpInLevel = xp % 1000;

  const statsCards: StatCardProps[] = [
    { icon: Star,     label: 'Media Voti',           rawValue: progress.averageGrade,          displayFn: (n) => n.toFixed(1),    color: '#6c5ce7', delay: 0   },
    { icon: Award,    label: 'Esami Superati',        rawValue: progress.passedExams,           displayFn: (n) => `${n}/${progress.totalExams}`, color: '#00b894', delay: 100 },
    { icon: Clock,    label: 'Ore Totali di Studio',  rawValue: progress.totalHoursStudied,     suffix: 'h',                       color: '#00cec9', delay: 200 },
    { icon: Flame,    label: 'Studio Streak',         rawValue: progress.studyStreak,           suffix: ' gg',                     color: '#fdcb6e', delay: 300 },
    { icon: BookOpen, label: 'Argomenti Completati',  rawValue: progress.topicsCompleted,       color: '#74b9ff', delay: 400 },
    { icon: Brain,    label: 'Simulazioni Esame',     rawValue: progress.simulationsCompleted,  color: '#fd79a8', delay: 500 },
  ];

  const strongScores = [85, 78, 91];
  const weakScores   = [42, 35, 58];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* ── Hero banner ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl p-7"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.22) 0%, rgba(0,206,201,0.12) 60%, rgba(253,121,168,0.08) 100%)',
          border: '1px solid rgba(108,92,231,0.25)',
        }}
      >
        <BgOrbs color="#6c5ce7" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Left: title + streak */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6c5ce7,#00cec9)', boxShadow: '0 0 30px rgba(108,92,231,0.4)' }}>
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">I Tuoi Progressi</h1>
                <p className="text-sm text-text-secondary mt-0.5">Monitora il tuo percorso universitario</p>
              </div>
            </div>

            {/* Streak flame row */}
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >🔥</motion.span>
              <span className="text-lg font-bold text-orange-300">{progress.studyStreak} giorni di streak</span>
              <span className="text-text-muted text-sm">· continua così!</span>
            </div>
          </div>

          {/* Right: Level + XP */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-1 relative"
                style={{ background: 'linear-gradient(135deg,#fdcb6e,#e17055)', boxShadow: '0 0 24px #fdcb6e55' }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🏆
                <motion.div
                  className="absolute -inset-1 rounded-2xl"
                  style={{ border: '2px solid #fdcb6e' }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-xs text-text-muted font-semibold uppercase tracking-widest">Livello</span>
              <span className="text-2xl font-bold text-accent-light">{level}</span>
            </div>
            <div className="w-40">
              <div className="flex justify-between text-xs text-text-muted mb-1.5">
                <span>XP</span>
                <span>{xpInLevel} / 1000</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#fdcb6e,#e17055)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpInLevel / 10}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-1.5 text-right">{xp} XP totali</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats grid ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── Weekly heatmap ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(108,92,231,0.15)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Settimana Corrente</h3>
            <p className="text-xs text-text-muted mt-0.5">Ore di studio per giorno</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(0,206,201,0.12)', color: '#00cec9', border: '1px solid rgba(0,206,201,0.2)' }}>
            <Zap size={13} />
            {totalWeekly}h questa settimana
          </div>
        </div>
        <div className="flex items-end justify-between gap-2">
          {weeklyData.map((d, i) => (
            <HeatCell key={d.day} day={d.day} hours={d.ore} max={maxWeeklyHours} index={i} />
          ))}
        </div>
      </motion.div>

      {/* ── Charts ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,92,231,0.15)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-text-primary">Ore Settimanali</h3>
              <p className="text-xs text-text-muted mt-0.5">Andamento corrente</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6c5ce7" />
                    <stop offset="100%" stopColor="#00cec9" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6c6c85' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6c6c85' }} />
                <Tooltip content={<Tip unit="h" />} />
                <Area type="monotone" dataKey="ore"
                  stroke="url(#lineGrad)" strokeWidth={2.5} fill="url(#areaGrad)"
                  dot={{ fill: '#6c5ce7', stroke: '#0a0a0f', strokeWidth: 2, r: 3 }}
                  activeDot={{ fill: '#00cec9', r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,92,231,0.15)' }}
        >
          <h3 className="text-base font-bold text-text-primary mb-1">Distribuzione Tempo</h3>
          <p className="text-xs text-text-muted mb-4">Come usi il tuo tempo di studio</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={studyDistribution} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {studyDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]}
                      style={{ filter: `drop-shadow(0 0 6px ${PIE_COLORS[i]}55)` }} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => (
                  active && payload?.length ? (
                    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(15,10,40,0.95)', border: '1px solid rgba(108,92,231,0.35)' }}>
                      <p className="text-text-muted">{payload[0].name}</p>
                      <p className="text-accent-light font-bold">{payload[0].value}%</p>
                    </div>
                  ) : null
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
            {studyDistribution.map((e, i) => (
              <div key={e.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-[11px] text-text-secondary">{e.name} {e.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Monthly bar chart ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="relative overflow-hidden rounded-3xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,92,231,0.15)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-text-primary">Panoramica Mensile</h3>
            <p className="text-xs text-text-muted mt-0.5">Ore negli ultimi 6 mesi</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(108,92,231,0.12)', color: '#a29bfe', border: '1px solid rgba(108,92,231,0.2)' }}>
            <TrendingUp size={13} />
            +8% questo mese
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#00cec9" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6c6c85' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6c6c85' }} />
              <Tooltip content={<Tip unit=" ore" />} />
              <Bar dataKey="ore" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Strong / Weak areas ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(0,184,148,0.04)', border: '1px solid rgba(0,184,148,0.18)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-accent-success" />
            <h3 className="text-base font-bold text-text-primary">Punti di Forza</h3>
          </div>
          {progress.strongAreas.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              Continua a studiare per scoprire i tuoi punti di forza
            </p>
          ) : (
            progress.strongAreas.map((area, i) => (
              <AreaBar key={area} label={area} pct={strongScores[i] ?? 70} color="#00b894" index={i} />
            ))
          )}
        </motion.div>

        {/* Weak */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
          className="relative overflow-hidden rounded-3xl p-6 space-y-4"
          style={{ background: 'rgba(253,203,110,0.04)', border: '1px solid rgba(253,203,110,0.18)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-accent-warning" />
            <h3 className="text-base font-bold text-text-primary">Aree da Migliorare</h3>
          </div>
          {progress.weakAreas.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              Nessuna area debole. Ottimo lavoro!
            </p>
          ) : (
            progress.weakAreas.map((area, i) => (
              <AreaBar key={area} label={area} pct={weakScores[i] ?? 35} color="#fdcb6e" index={i} />
            ))
          )}
        </motion.div>
      </div>

      {/* ── Exam history ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <Trophy size={18} className="text-accent-light" />
          <h3 className="text-lg font-bold text-text-primary">Storico Esami</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="space-y-3">
          {examHistory.map((exam, i) => (
            <motion.div
              key={exam.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.1, duration: 0.4 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden flex items-center gap-5 rounded-2xl p-5"
              style={{
                background: exam.status === 'superato'
                  ? 'rgba(0,184,148,0.06)'
                  : 'rgba(116,185,255,0.06)',
                border: `1px solid ${exam.status === 'superato' ? 'rgba(0,184,148,0.2)' : 'rgba(116,185,255,0.2)'}`,
              }}
            >
              {/* Colored left strip */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: exam.status === 'superato' ? '#00b894' : '#74b9ff' }}
              />

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: exam.status === 'superato' ? 'rgba(0,184,148,0.15)' : 'rgba(116,185,255,0.15)',
                }}>
                {exam.status === 'superato'
                  ? <Award size={18} className="text-accent-success" />
                  : <BookOpen size={18} style={{ color: '#74b9ff' }} />
                }
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{exam.name}</p>
                <AnimatePresence>
                  {exam.status === 'superato' ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-accent-success font-medium"
                    >Esame superato</motion.span>
                  ) : (
                    <span className="text-xs font-medium" style={{ color: '#74b9ff' }}>In preparazione</span>
                  )}
                </AnimatePresence>
              </div>

              {/* Grade donut */}
              {exam.grade != null ? (
                <GradeDonut grade={exam.grade} />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(116,185,255,0.1)', border: '1px dashed rgba(116,185,255,0.3)' }}>
                  <span className="text-[10px] text-text-muted font-semibold text-center leading-tight px-1">In corso</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
