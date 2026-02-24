'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCog,
  Brain,
  BookOpen,
  Target,
  ClipboardList,
  Plus,
  Trash2,
  Save,
  Sparkles,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Professor,
  ExamStyle,
  TeachingStyle,
  ExamFormat,
} from '@/types';

// ─── Props ──────────────────────────────────────────────────────────
interface ProfessorCreatorProps {
  onSave: (professor: Professor) => void;
  existingProfessors: Professor[];
}

// ─── Defaults ───────────────────────────────────────────────────────
const defaultExamStyle: ExamStyle = {
  oralWeight: 40,
  writtenWeight: 40,
  practicalWeight: 20,
  multipleChoice: false,
  openQuestions: true,
  exercises: false,
  caseStudies: false,
  averageQuestions: 5,
  timeMinutes: 60,
  strictGrading: false,
  focusOnDetails: false,
  focusOnConcepts: true,
  focusOnApplications: false,
};

const defaultTeachingStyle: TeachingStyle = {
  usesSlides: true,
  usesWhiteboard: false,
  interactive: false,
  theoreticalFocus: true,
  practicalExamples: false,
  referencesBook: true,
  goesOffTopic: false,
  speedPace: 'medio',
  explanation: 'mista',
};

// ─── Animation variants ─────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35 },
  },
};

// ─── Sub-components ─────────────────────────────────────────────────

function AnimatedToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-3 w-full py-2 group"
    >
      <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
        {label}
      </span>
      <div
        className="relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
        style={{
          background: value
            ? 'linear-gradient(135deg, #6c5ce7, #00cec9)'
            : 'rgba(108, 92, 231, 0.15)',
          boxShadow: value ? '0 0 12px rgba(108, 92, 231, 0.35)' : 'none',
        }}
      >
        <motion.div
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-md"
          animate={{ left: value ? 23 : 3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.25), rgba(0,206,201,0.15))',
          border: '1px solid rgba(108,92,231,0.2)',
        }}
      >
        <Icon size={18} className="text-accent-light" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function GradientSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-bg-card overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 12px ${color}44`,
          }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none bg-transparent cursor-pointer relative -mt-5 h-3 opacity-0"
        style={{ zIndex: 2 }}
      />
    </div>
  );
}

function RadioPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border"
            style={{
              background: active
                ? 'linear-gradient(135deg, #6c5ce7, #00cec9)'
                : 'rgba(26,26,46,0.6)',
              borderColor: active
                ? 'transparent'
                : 'rgba(108,92,231,0.15)',
              color: active ? '#fff' : '#a0a0b8',
              boxShadow: active
                ? '0 4px 15px rgba(108,92,231,0.3)'
                : 'none',
            }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          whileHover={{ scale: 1.25, rotate: 12 }}
          whileTap={{ scale: 0.85 }}
          className="relative"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={star <= value ? 'url(#starGrad)' : 'none'}
            stroke={star <= value ? 'none' : '#6c6c85'}
            strokeWidth={1.5}
          >
            <defs>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdcb6e" />
                <stop offset="100%" stopColor="#fd79a8" />
              </linearGradient>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {star <= value && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(253,203,110,0.3)' }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

function TagList({
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <motion.button
          type="button"
          onClick={handleAdd}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
            boxShadow: '0 4px 12px rgba(108,92,231,0.3)',
          }}
        >
          <Plus size={18} className="text-white" />
        </motion.button>
      </div>
      <AnimatePresence mode="popLayout">
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
              layout
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: 'rgba(108,92,231,0.15)',
                border: '1px solid rgba(108,92,231,0.25)',
                color: '#a29bfe',
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="hover:text-accent-danger transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </motion.span>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function ProfessorCreator({
  onSave,
  existingProfessors,
}: ProfessorCreatorProps) {
  // ── State ──────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [examFormat, setExamFormat] = useState<ExamFormat>('orale');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [examStyle, setExamStyle] = useState<ExamStyle>({ ...defaultExamStyle });
  const [teachingStyle, setTeachingStyle] = useState<TeachingStyle>({ ...defaultTeachingStyle });
  const [typicalQuestions, setTypicalQuestions] = useState<string[]>([]);
  const [preferredTopics, setPreferredTopics] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  // ── Handlers ───────────────────────────────
  const updateExamStyle = <K extends keyof ExamStyle>(key: K, value: ExamStyle[K]) => {
    setExamStyle((prev) => ({ ...prev, [key]: value }));
  };

  const updateTeachingStyle = <K extends keyof TeachingStyle>(key: K, value: TeachingStyle[K]) => {
    setTeachingStyle((prev) => ({ ...prev, [key]: value }));
  };

  const loadProfessor = (prof: Professor) => {
    setEditingId(prof.id);
    setName(prof.name);
    setDepartment(prof.department);
    setExamFormat(prof.examFormat);
    setDifficulty(prof.difficulty);
    setExamStyle({ ...prof.examStyle });
    setTeachingStyle({ ...prof.teachingStyle });
    setTypicalQuestions([...prof.typicalQuestions]);
    setPreferredTopics([...prof.preferredTopics]);
    setNotes(prof.notes);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDepartment('');
    setExamFormat('orale');
    setDifficulty(3);
    setExamStyle({ ...defaultExamStyle });
    setTeachingStyle({ ...defaultTeachingStyle });
    setTypicalQuestions([]);
    setPreferredTopics([]);
    setNotes('');
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const now = new Date().toISOString();
    const professor: Professor = {
      id: editingId ?? uuidv4(),
      name: name.trim(),
      universityId: '',
      department: department.trim(),
      examStyle,
      teachingStyle,
      typicalQuestions,
      preferredTopics,
      examFormat,
      difficulty,
      notes,
      createdAt: editingId
        ? existingProfessors.find((p) => p.id === editingId)?.createdAt ?? now
        : now,
      updatedAt: now,
    };

    onSave(professor);
    resetForm();
  };

  const isValid = name.trim().length > 0;

  // ── Render ─────────────────────────────────
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      {/* ── Page Header ────────────────────────── */}
      <motion.div variants={cardVariants} className="flex items-center gap-4 mb-2">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
            boxShadow: '0 8px 25px rgba(108,92,231,0.35)',
          }}
        >
          <UserCog size={26} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {editingId ? 'Modifica Professore' : 'Crea Profilo Professore'}
          </h1>
          <p className="text-sm text-text-muted">
            Definisci lo stile del tuo professore per simulazioni realistiche
          </p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════
          SECTION 1 - Informazioni Base
          ═══════════════════════════════════════════ */}
      <motion.section variants={cardVariants} className="glass-card p-6">
        <SectionHeader
          icon={GraduationCap}
          title="Informazioni Base"
          subtitle="I dati fondamentali del professore"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {/* Name */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nome del Professore
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Prof. Mario Rossi"
            />
          </motion.div>

          {/* Department */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Dipartimento / Corso di Laurea
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="es. Ingegneria Informatica"
            />
          </motion.div>

          {/* Exam format */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Formato Esame
            </label>
            <select
              value={examFormat}
              onChange={(e) => setExamFormat(e.target.value as ExamFormat)}
            >
              <option value="orale">Orale</option>
              <option value="scritto">Scritto</option>
              <option value="misto">Misto</option>
              <option value="progetto">Progetto</option>
              <option value="laboratorio">Laboratorio</option>
            </select>
          </motion.div>

          {/* Difficulty */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Difficolta
            </label>
            <StarRating value={difficulty} onChange={setDifficulty} />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          SECTION 2 - Stile d'Esame
          ═══════════════════════════════════════════ */}
      <motion.section variants={cardVariants} className="glass-card p-6">
        <SectionHeader
          icon={Target}
          title="Stile d'Esame"
          subtitle="Come il professore valuta e struttura gli esami"
        />

        {/* Weight sliders */}
        <div className="space-y-5 mb-8">
          <GradientSlider
            label="Peso Orale"
            value={examStyle.oralWeight}
            onChange={(v) => updateExamStyle('oralWeight', v)}
            color="#6c5ce7"
          />
          <GradientSlider
            label="Peso Scritto"
            value={examStyle.writtenWeight}
            onChange={(v) => updateExamStyle('writtenWeight', v)}
            color="#00cec9"
          />
          <GradientSlider
            label="Peso Pratico"
            value={examStyle.practicalWeight}
            onChange={(v) => updateExamStyle('practicalWeight', v)}
            color="#fd79a8"
          />

          {/* Weight sum warning */}
          {(() => {
            const sum =
              examStyle.oralWeight +
              examStyle.writtenWeight +
              examStyle.practicalWeight;
            if (sum !== 100) {
              return (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{
                    background: 'rgba(253,203,110,0.1)',
                    border: '1px solid rgba(253,203,110,0.25)',
                    color: '#fdcb6e',
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>
                    Totale pesi: {sum}% &mdash; la somma dovrebbe essere 100%
                  </span>
                </motion.div>
              );
            }
            return null;
          })()}
        </div>

        {/* Toggles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mb-8">
          <AnimatedToggle
            label="Scelta multipla"
            value={examStyle.multipleChoice}
            onChange={(v) => updateExamStyle('multipleChoice', v)}
          />
          <AnimatedToggle
            label="Domande aperte"
            value={examStyle.openQuestions}
            onChange={(v) => updateExamStyle('openQuestions', v)}
          />
          <AnimatedToggle
            label="Esercizi"
            value={examStyle.exercises}
            onChange={(v) => updateExamStyle('exercises', v)}
          />
          <AnimatedToggle
            label="Casi studio"
            value={examStyle.caseStudies}
            onChange={(v) => updateExamStyle('caseStudies', v)}
          />
        </div>

        {/* Number inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Domande medie per esame
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={examStyle.averageQuestions}
              onChange={(e) =>
                updateExamStyle('averageQuestions', Math.max(1, Number(e.target.value)))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Durata esame (minuti)
            </label>
            <input
              type="number"
              min={5}
              max={480}
              value={examStyle.timeMinutes}
              onChange={(e) =>
                updateExamStyle('timeMinutes', Math.max(5, Number(e.target.value)))
              }
            />
          </div>
        </div>

        {/* Focus toggles */}
        <h4 className="text-sm font-semibold text-text-secondary mb-3">
          Focus della Valutazione
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          <AnimatedToggle
            label="Valutazione severa"
            value={examStyle.strictGrading}
            onChange={(v) => updateExamStyle('strictGrading', v)}
          />
          <AnimatedToggle
            label="Focus sui dettagli"
            value={examStyle.focusOnDetails}
            onChange={(v) => updateExamStyle('focusOnDetails', v)}
          />
          <AnimatedToggle
            label="Focus sui concetti"
            value={examStyle.focusOnConcepts}
            onChange={(v) => updateExamStyle('focusOnConcepts', v)}
          />
          <AnimatedToggle
            label="Focus sulle applicazioni"
            value={examStyle.focusOnApplications}
            onChange={(v) => updateExamStyle('focusOnApplications', v)}
          />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          SECTION 3 - Stile di Insegnamento
          ═══════════════════════════════════════════ */}
      <motion.section variants={cardVariants} className="glass-card p-6">
        <SectionHeader
          icon={Brain}
          title="Stile di Insegnamento"
          subtitle="Come il professore tiene le lezioni"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mb-8">
          <AnimatedToggle
            label="Usa le slide"
            value={teachingStyle.usesSlides}
            onChange={(v) => updateTeachingStyle('usesSlides', v)}
          />
          <AnimatedToggle
            label="Usa la lavagna"
            value={teachingStyle.usesWhiteboard}
            onChange={(v) => updateTeachingStyle('usesWhiteboard', v)}
          />
          <AnimatedToggle
            label="Lezioni interattive"
            value={teachingStyle.interactive}
            onChange={(v) => updateTeachingStyle('interactive', v)}
          />
          <AnimatedToggle
            label="Approccio teorico"
            value={teachingStyle.theoreticalFocus}
            onChange={(v) => updateTeachingStyle('theoreticalFocus', v)}
          />
          <AnimatedToggle
            label="Esempi pratici"
            value={teachingStyle.practicalExamples}
            onChange={(v) => updateTeachingStyle('practicalExamples', v)}
          />
          <AnimatedToggle
            label="Riferimenti al libro"
            value={teachingStyle.referencesBook}
            onChange={(v) => updateTeachingStyle('referencesBook', v)}
          />
          <AnimatedToggle
            label="Divaga spesso"
            value={teachingStyle.goesOffTopic}
            onChange={(v) => updateTeachingStyle('goesOffTopic', v)}
          />
        </div>

        {/* Speed pace */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Velocita della lezione
          </label>
          <RadioPills
            options={[
              { label: 'Lento', value: 'lento' as const },
              { label: 'Medio', value: 'medio' as const },
              { label: 'Veloce', value: 'veloce' as const },
            ]}
            value={teachingStyle.speedPace}
            onChange={(v) => updateTeachingStyle('speedPace', v)}
          />
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tipo di spiegazione
          </label>
          <RadioPills
            options={[
              { label: 'Dettagliata', value: 'dettagliata' as const },
              { label: 'Sintetica', value: 'sintetica' as const },
              { label: 'Mista', value: 'mista' as const },
            ]}
            value={teachingStyle.explanation}
            onChange={(v) => updateTeachingStyle('explanation', v)}
          />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          SECTION 4 - Domande e Argomenti
          ═══════════════════════════════════════════ */}
      <motion.section variants={cardVariants} className="glass-card p-6">
        <SectionHeader
          icon={MessageSquare}
          title="Domande Tipiche e Argomenti Preferiti"
          subtitle="Le domande ricorrenti e gli argomenti su cui insiste"
        />

        {/* Typical questions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <ClipboardList size={14} className="inline mr-1.5 -mt-0.5" />
            Domande tipiche all&apos;esame
          </label>
          <TagList
            items={typicalQuestions}
            onAdd={(q) => setTypicalQuestions((prev) => [...prev, q])}
            onRemove={(i) =>
              setTypicalQuestions((prev) => prev.filter((_, idx) => idx !== i))
            }
            placeholder="Scrivi una domanda tipica..."
          />
        </div>

        {/* Preferred topics */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            <BookOpen size={14} className="inline mr-1.5 -mt-0.5" />
            Argomenti preferiti
          </label>
          <TagList
            items={preferredTopics}
            onAdd={(t) => setPreferredTopics((prev) => [...prev, t])}
            onRemove={(i) =>
              setPreferredTopics((prev) => prev.filter((_, idx) => idx !== i))
            }
            placeholder="Aggiungi un argomento..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Note aggiuntive
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Appunti liberi sul professore, consigli, particolarita..."
          />
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          SECTION 5 - Professori Salvati
          ═══════════════════════════════════════════ */}
      {existingProfessors.length > 0 && (
        <motion.section variants={cardVariants} className="glass-card p-6">
          <button
            type="button"
            onClick={() => setShowSaved((prev) => !prev)}
            className="w-full"
          >
            <SectionHeader
              icon={Save}
              title={`Professori Salvati (${existingProfessors.length})`}
              subtitle="Clicca su un professore per modificarlo"
            />
          </button>

          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {existingProfessors.map((prof, i) => {
                    const isEditing = editingId === prof.id;
                    return (
                      <motion.button
                        key={prof.id}
                        type="button"
                        onClick={() => loadProfessor(prof)}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-left p-4 rounded-xl transition-all duration-200"
                        style={{
                          background: isEditing
                            ? 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(0,206,201,0.1))'
                            : 'rgba(26,26,46,0.6)',
                          border: isEditing
                            ? '1px solid rgba(108,92,231,0.4)'
                            : '1px solid rgba(108,92,231,0.1)',
                          boxShadow: isEditing
                            ? '0 0 20px rgba(108,92,231,0.15)'
                            : 'none',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">
                              {prof.name}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {prof.department || 'Nessun dipartimento'}
                            </p>
                          </div>
                          <div className="flex gap-0.5">
                            {([1, 2, 3, 4, 5] as const).map((s) => (
                              <svg
                                key={s}
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill={s <= prof.difficulty ? '#fdcb6e' : 'none'}
                                stroke={s <= prof.difficulty ? 'none' : '#6c6c85'}
                                strokeWidth={1.5}
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          <span className="tag text-[10px] py-0.5 px-2">{prof.examFormat}</span>
                          {isEditing && (
                            <span
                              className="text-[10px] py-0.5 px-2 rounded-full font-medium"
                              style={{
                                background: 'rgba(0,206,201,0.15)',
                                color: '#00cec9',
                                border: '1px solid rgba(0,206,201,0.3)',
                              }}
                            >
                              In modifica
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════
          SAVE BUTTON
          ═══════════════════════════════════════════ */}
      <motion.div variants={cardVariants} className="flex gap-3">
        {editingId && (
          <motion.button
            type="button"
            onClick={resetForm}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300"
            style={{
              background: 'rgba(26,26,46,0.7)',
              border: '1px solid rgba(108,92,231,0.2)',
              color: '#a0a0b8',
            }}
          >
            Annulla modifica
          </motion.button>
        )}

        <motion.button
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.03, y: -2 } : {}}
          whileTap={isValid ? { scale: 0.97 } : {}}
          className="glow-button flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-300"
          style={{
            opacity: isValid ? 1 : 0.4,
            cursor: isValid ? 'pointer' : 'not-allowed',
          }}
        >
          <Sparkles size={20} />
          <span>{editingId ? 'Aggiorna Professore' : 'Salva Professore'}</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
