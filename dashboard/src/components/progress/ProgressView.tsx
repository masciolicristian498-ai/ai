'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Target,
  Brain,
  Flame,
  BookOpen,
  CheckCircle2,
  Star,
  Zap,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import type { UserProgress } from '@/types';

// ==========================================
// Types
// ==========================================

interface ProgressViewProps {
  progress: UserProgress;
}

// ==========================================
// Animation Variants
// ==========================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const scaleHover = {
  scale: 1.03,
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

// ==========================================
// Constants
// ==========================================

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const PIE_COLORS = ['#6c5ce7', '#00cec9', '#fd79a8', '#fdcb6e', '#00b894'];

const studyDistribution = [
  { name: 'Lettura', value: 30 },
  { name: 'Esercizi', value: 25 },
  { name: 'Ripasso', value: 20 },
  { name: 'Simulazioni', value: 15 },
  { name: 'Mappe', value: 10 },
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
  {
    name: 'Diritto Privato',
    grade: '28/30',
    status: 'superato' as const,
  },
  {
    name: 'Microeconomia',
    grade: '25/30',
    status: 'superato' as const,
  },
  {
    name: 'Macroeconomia',
    grade: null,
    status: 'preparazione' as const,
  },
];

// ==========================================
// Custom Tooltips
// ==========================================

function CustomAreaTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="glass-card-static px-4 py-2.5"
      style={{ border: '1px solid rgba(108, 92, 231, 0.3)' }}
    >
      <p className="text-xs text-text-secondary mb-0.5">{label}</p>
      <p className="text-sm font-bold text-accent-light">
        {payload[0].value}h
      </p>
    </div>
  );
}

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="glass-card-static px-4 py-2.5"
      style={{ border: '1px solid rgba(108, 92, 231, 0.3)' }}
    >
      <p className="text-xs text-text-secondary mb-0.5">{label}</p>
      <p className="text-sm font-bold text-accent-teal">
        {payload[0].value} ore
      </p>
    </div>
  );
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="glass-card-static px-4 py-2.5"
      style={{ border: '1px solid rgba(108, 92, 231, 0.3)' }}
    >
      <p className="text-xs text-text-secondary mb-0.5">{payload[0].name}</p>
      <p className="text-sm font-bold text-accent-light">
        {payload[0].value}%
      </p>
    </div>
  );
}

// ==========================================
// Stat Card
// ==========================================

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  gradientFrom: string;
  gradientTo: string;
  index: number;
}

function StatCard({ icon: Icon, label, value, gradientFrom, gradientTo, index }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      whileHover={scaleHover}
      className="glass-card p-5 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          }}
        >
          <Icon size={20} className="text-white" />
        </div>
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ background: gradientFrom }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        />
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </motion.div>
  );
}

// ==========================================
// Custom Pie Legend
// ==========================================

function CustomPieLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {studyDistribution.map((entry, index) => (
        <div key={entry.name} className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: PIE_COLORS[index] }}
          />
          <span className="text-xs text-text-secondary">
            {entry.name} {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Main Component
// ==========================================

export default function ProgressView({ progress }: ProgressViewProps) {
  // Build weekly data from props
  const weeklyChartData = DAY_LABELS.map((day, i) => ({
    day,
    ore: progress.weeklyHours[i] ?? 0,
  }));

  const totalWeeklyHours = progress.weeklyHours.reduce((sum, h) => sum + h, 0);

  // Stats cards data
  const statsCards: StatCardProps[] = [
    {
      icon: Star,
      label: 'Media Voti',
      value: progress.averageGrade.toFixed(1),
      gradientFrom: '#6c5ce7',
      gradientTo: '#a29bfe',
      index: 0,
    },
    {
      icon: Award,
      label: 'Esami Superati',
      value: `${progress.passedExams}/${progress.totalExams}`,
      gradientFrom: '#00b894',
      gradientTo: '#55efc4',
      index: 1,
    },
    {
      icon: Clock,
      label: 'Ore Totali',
      value: `${progress.totalHoursStudied}h`,
      gradientFrom: '#00cec9',
      gradientTo: '#81ecec',
      index: 2,
    },
    {
      icon: Flame,
      label: 'Studio Streak',
      value: `${progress.studyStreak} giorni`,
      gradientFrom: '#fdcb6e',
      gradientTo: '#f39c12',
      index: 3,
    },
    {
      icon: BookOpen,
      label: 'Argomenti Completati',
      value: String(progress.topicsCompleted),
      gradientFrom: '#74b9ff',
      gradientTo: '#0984e3',
      index: 4,
    },
    {
      icon: Brain,
      label: 'Simulazioni',
      value: String(progress.simulationsCompleted),
      gradientFrom: '#fd79a8',
      gradientTo: '#e84393',
      index: 5,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* ====== HEADER ====== */}
      <motion.div variants={itemVariants} className="space-y-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">I Tuoi Progressi</span>
            </h1>
            <p className="text-text-secondary text-sm md:text-base">
              Monitora il tuo percorso e scopri come stai andando
            </p>
          </div>
        </div>
      </motion.div>

      {/* ====== TOP STATS ROW ====== */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {statsCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </motion.div>

      {/* ====== CHARTS ROW ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours - Area Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Ore di Studio Settimanali
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Andamento della settimana corrente
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-teal/10 border border-accent-teal/20">
              <div className="w-2 h-2 rounded-full bg-accent-teal" />
              <span className="text-xs font-medium text-accent-teal">
                {totalWeeklyHours}h totali
              </span>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyChartData}
                margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
              >
                <defs>
                  <linearGradient id="progressAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#00cec9" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#00cec9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="progressLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6c5ce7" />
                    <stop offset="100%" stopColor="#00cec9" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6c6c85' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6c6c85' }}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ore"
                  stroke="url(#progressLineGradient)"
                  strokeWidth={3}
                  fill="url(#progressAreaGradient)"
                  dot={{
                    fill: '#6c5ce7',
                    stroke: '#0a0a0f',
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: '#00cec9',
                    stroke: '#0a0a0f',
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Study Distribution - Pie Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Distribuzione Tempo
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Come distribuisci il tuo tempo di studio
              </p>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studyDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {studyDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index]}
                      style={{ filter: 'drop-shadow(0 0 6px rgba(108, 92, 231, 0.3))' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <CustomPieLegend />
        </motion.div>
      </div>

      {/* ====== PERFORMANCE SECTION ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-accent-success" />
            <h3 className="text-lg font-bold text-text-primary">Punti di Forza</h3>
          </div>
          <div className="space-y-2">
            {progress.strongAreas.map((area, index) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                className="glass-card p-4 flex items-center gap-3"
                style={{
                  borderColor: 'rgba(0, 184, 148, 0.2)',
                  background: 'rgba(0, 184, 148, 0.05)',
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-accent-success/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={16} className="text-accent-success" />
                </div>
                <span className="text-sm font-medium text-text-primary">{area}</span>
                <div className="ml-auto">
                  <div className="px-2 py-0.5 rounded-full bg-accent-success/10 border border-accent-success/20">
                    <span className="text-[10px] font-semibold text-accent-success uppercase tracking-wider">
                      Ottimo
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {progress.strongAreas.length === 0 && (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-text-muted">
                  Continua a studiare per scoprire i tuoi punti di forza
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Weak Areas */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-accent-warning" />
            <h3 className="text-lg font-bold text-text-primary">Aree da Migliorare</h3>
          </div>
          <div className="space-y-2">
            {progress.weakAreas.map((area, index) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                className="glass-card p-4 flex items-center gap-3"
                style={{
                  borderColor: 'rgba(253, 203, 110, 0.2)',
                  background: 'rgba(253, 203, 110, 0.05)',
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-accent-warning/15 flex items-center justify-center flex-shrink-0">
                  <Target size={16} className="text-accent-warning" />
                </div>
                <span className="text-sm font-medium text-text-primary">{area}</span>
                <div className="ml-auto">
                  <div className="px-2 py-0.5 rounded-full bg-accent-warning/10 border border-accent-warning/20">
                    <span className="text-[10px] font-semibold text-accent-warning uppercase tracking-wider">
                      Da rivedere
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {progress.weakAreas.length === 0 && (
              <div className="glass-card p-6 text-center">
                <p className="text-sm text-text-muted">
                  Nessuna area debole rilevata. Ottimo lavoro!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ====== MONTHLY OVERVIEW ====== */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Panoramica Mensile
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Ore di studio negli ultimi 6 mesi
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
            <TrendingUp size={14} className="text-accent-light" />
            <span className="text-xs font-medium text-accent-light">
              +8% questo mese
            </span>
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#00cec9" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6c6c85' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6c6c85' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="ore"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ====== EXAM HISTORY ====== */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-text-primary">Storico Esami</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <div className="space-y-3">
          {examHistory.map((exam, index) => (
            <motion.div
              key={exam.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.12, duration: 0.4 }}
              className="glass-card p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      exam.status === 'superato'
                        ? 'rgba(0, 184, 148, 0.12)'
                        : 'rgba(116, 185, 255, 0.12)',
                    border:
                      exam.status === 'superato'
                        ? '1px solid rgba(0, 184, 148, 0.25)'
                        : '1px solid rgba(116, 185, 255, 0.25)',
                  }}
                >
                  {exam.status === 'superato' ? (
                    <Award
                      size={18}
                      className="text-accent-success"
                    />
                  ) : (
                    <BookOpen size={18} className="text-[#74b9ff]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {exam.name}
                  </p>
                  {exam.grade && (
                    <p className="text-xs text-text-muted mt-0.5">
                      Voto: <span className="font-bold text-accent-light">{exam.grade}</span>
                    </p>
                  )}
                </div>
              </div>
              <div>
                {exam.status === 'superato' ? (
                  <div className="px-3 py-1 rounded-full bg-accent-success/12 border border-accent-success/25">
                    <span className="text-xs font-semibold text-accent-success">
                      Superato
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-1 rounded-full bg-[#74b9ff]/12 border border-[#74b9ff]/25">
                    <span className="text-xs font-semibold text-[#74b9ff]">
                      In preparazione
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
