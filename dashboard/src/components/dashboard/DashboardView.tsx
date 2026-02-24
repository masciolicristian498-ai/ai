'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  Award,
  TrendingUp,
  FileQuestion,
  GraduationCap,
  Upload,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';

// ==========================================
// Types
// ==========================================

interface DashboardViewProps {
  onNavigate: (view: string) => void;
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

const scaleTap = {
  scale: 0.97,
};

// ==========================================
// Data
// ==========================================

const weeklyData = [
  { day: 'Lun', ore: 4 },
  { day: 'Mar', ore: 5 },
  { day: 'Mer', ore: 3 },
  { day: 'Gio', ore: 6 },
  { day: 'Ven', ore: 4 },
  { day: 'Sab', ore: 2 },
  { day: 'Dom', ore: 5 },
];

const studyAreasData = [
  { name: 'Diritto Privato', value: 78, fill: '#6c5ce7' },
  { name: 'Microeconomia', value: 55, fill: '#00cec9' },
  { name: 'Statistica', value: 42, fill: '#fd79a8' },
];

const statsData = [
  {
    label: 'Ore Studiate',
    value: '142h',
    icon: Clock,
    color: '#00cec9',
    bg: 'rgba(0, 206, 201, 0.1)',
    borderColor: 'rgba(0, 206, 201, 0.2)',
  },
  {
    label: 'Esami Superati',
    value: '2/3',
    icon: Award,
    color: '#00b894',
    bg: 'rgba(0, 184, 148, 0.1)',
    borderColor: 'rgba(0, 184, 148, 0.2)',
  },
  {
    label: 'Media Voti',
    value: '26.5',
    icon: TrendingUp,
    color: '#a29bfe',
    bg: 'rgba(162, 155, 254, 0.1)',
    borderColor: 'rgba(162, 155, 254, 0.2)',
  },
  {
    label: 'Simulazioni',
    value: '12',
    icon: FileQuestion,
    color: '#fd79a8',
    bg: 'rgba(253, 121, 168, 0.1)',
    borderColor: 'rgba(253, 121, 168, 0.2)',
  },
];

const quickActions = [
  {
    label: 'Nuovo Esame',
    description: 'Configura un nuovo esame da preparare',
    icon: GraduationCap,
    view: 'onboarding',
    gradient: 'from-accent to-accent-teal',
  },
  {
    label: 'Carica Materiali',
    description: 'Importa appunti, slide e libri',
    icon: Upload,
    view: 'upload',
    gradient: 'from-accent-teal to-accent-success',
  },
  {
    label: 'Simulazione',
    description: 'Metti alla prova la tua preparazione',
    icon: FileQuestion,
    view: 'exam',
    gradient: 'from-accent-pink to-accent',
  },
];

// ==========================================
// Helper
// ==========================================

function getItalianDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const formatted = now.toLocaleDateString('it-IT', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// ==========================================
// Custom Recharts Tooltip
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
      className="glass-card px-3 py-2"
      style={{ border: '1px solid rgba(108, 92, 231, 0.3)' }}
    >
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-sm font-bold text-accent-light">
        {payload[0].value} ore
      </p>
    </div>
  );
}

// ==========================================
// Sub-components
// ==========================================

function ProgressRing({
  percentage,
  size = 100,
  strokeWidth = 8,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(108, 92, 231, 0.1)"
        strokeWidth={strokeWidth}
      />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6c5ce7" />
          <stop offset="100%" stopColor="#00cec9" />
        </linearGradient>
      </defs>
      {/* Animated progress arc */}
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
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
      />
    </svg>
  );
}

// ==========================================
// Main Component
// ==========================================

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const todayDate = getItalianDate();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* ====== HEADER ====== */}
      <motion.div variants={itemVariants} className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-2xl"
              >
                <Sparkles size={28} className="text-accent-warning" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="gradient-text">Ciao, studente!</span>
              </h1>
            </div>
            <p className="text-text-secondary text-sm md:text-base">
              Continua il tuo percorso di studio. Ogni giorno conta!
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card/60 border border-border">
            <Calendar size={16} className="text-accent-light" />
            <span className="text-sm text-text-secondary">{todayDate}</span>
          </div>
        </div>
      </motion.div>

      {/* ====== COUNTDOWN HERO CARD ====== */}
      <motion.div variants={itemVariants}>
        <div className="glass-card gradient-border p-6 md:p-8">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side: exam info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-accent/15 border border-accent/20">
                  <span className="text-xs font-semibold text-accent-light uppercase tracking-wider">
                    Prossimo Esame
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-warning/10 border border-accent-warning/20">
                  <Flame size={12} className="text-accent-warning" />
                  <span className="text-[10px] font-semibold text-accent-warning">7 giorni streak</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                  Diritto Privato
                </h2>
                <p className="text-text-muted text-sm mt-1 flex items-center gap-2">
                  <BookOpen size={14} />
                  Prof. Rossi
                </p>
              </div>

              {/* Big countdown */}
              <div className="flex items-end gap-3">
                <motion.div
                  className="pulse-glow rounded-2xl px-6 py-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(0, 206, 201, 0.1))',
                    border: '1px solid rgba(108, 92, 231, 0.2)',
                  }}
                >
                  <span className="text-5xl md:text-6xl font-extrabold gradient-text">12</span>
                  <span className="text-lg md:text-xl font-semibold text-text-secondary ml-2">
                    giorni
                  </span>
                </motion.div>
              </div>

              <motion.button
                className="glow-button px-6 py-3 text-sm font-semibold flex items-center gap-2"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('study-plan')}
              >
                Continua a studiare
                <ArrowRight size={16} />
              </motion.button>
            </div>

            {/* Right side: progress ring */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <ProgressRing percentage={68} size={140} strokeWidth={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold gradient-text">68%</span>
                  <span className="text-xs text-text-muted">completato</span>
                </div>
              </div>
              <p className="text-xs text-text-muted text-center max-w-[160px]">
                Preparazione complessiva per l&apos;esame
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ====== STATS GRID ====== */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              custom={index}
              whileHover={scaleHover}
              className="glass-card p-5 cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: stat.bg,
                    border: `1px solid ${stat.borderColor}`,
                  }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: stat.color }}
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
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ====== CHARTS ROW ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly activity chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Attivita Settimanale
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Ore di studio giornaliere
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-teal/10 border border-accent-teal/20">
              <div className="w-2 h-2 rounded-full bg-accent-teal" />
              <span className="text-xs font-medium text-accent-teal">29h totali</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#00cec9" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#00cec9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
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
                  domain={[0, 8]}
                  ticks={[0, 2, 4, 6, 8]}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="ore"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  fill="url(#areaGradient)"
                  dot={{
                    fill: '#6c5ce7',
                    stroke: '#1a1a2e',
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: '#00cec9',
                    stroke: '#1a1a2e',
                    strokeWidth: 2,
                    r: 6,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Study areas radial chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Aree di Studio
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Progresso per materia
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-[200px] w-[200px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="100%"
                  barSize={14}
                  data={studyAreasData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    background={{ fill: 'rgba(108, 92, 231, 0.08)' }}
                    dataKey="value"
                    cornerRadius={8}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {studyAreasData.map((area) => (
                <div key={area.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: area.fill }}
                      />
                      <span className="text-sm text-text-secondary">
                        {area.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: area.fill }}>
                      {area.value}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-bg-card overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: area.fill }}
                      initial={{ width: 0 }}
                      animate={{ width: `${area.value}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ====== QUICK ACTIONS ====== */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-text-primary">Azioni Rapide</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                variants={itemVariants}
                custom={index}
                whileHover={scaleHover}
                whileTap={scaleTap}
                onClick={() => onNavigate(action.view)}
                className="glass-card p-6 text-left group relative overflow-hidden"
              >
                {/* Gradient background glow on hover */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${action.gradient}`}
                  style={{ opacity: 0 }}
                />
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0`}
                  whileHover={{ opacity: 0.05 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <h4 className="text-base font-bold text-text-primary mb-1">
                    {action.label}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-accent-light text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Inizia</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
