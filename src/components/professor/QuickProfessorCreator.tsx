'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ArrowRight, GraduationCap, Sparkles, Star } from 'lucide-react';
import { PROFESSOR_COLORS } from '@/types';
import type { Professor, ExamFormat } from '@/types';

// ─── Avatar catalogue ────────────────────────────────────────────────
const PROFESSOR_AVATARS = [
  { emoji: '👨‍🏫', label: 'Classico',   bg: '#6c5ce7' },
  { emoji: '👩‍🏫', label: 'Moderna',    bg: '#fd79a8' },
  { emoji: '🧙‍♂️', label: 'Saggio',     bg: '#00b894' },
  { emoji: '👴',   label: 'Esperto',    bg: '#e17055' },
  { emoji: '👩‍🔬', label: 'Scienziata', bg: '#00cec9' },
  { emoji: '🦉',   label: 'Filosofo',   bg: '#a29bfe' },
  { emoji: '🎩',   label: 'Elegante',   bg: '#fdcb6e' },
  { emoji: '🧑‍💻', label: 'Tech',       bg: '#0984e3' },
  { emoji: '👩‍💼', label: 'Manager',    bg: '#d63031' },
  { emoji: '🧑‍🎓', label: 'Ricercatore',bg: '#6c5ce7' },
  { emoji: '🧑‍⚕️', label: 'Medico',     bg: '#00b894' },
  { emoji: '⚖️',   label: 'Giurista',   bg: '#fdcb6e' },
];

const EXAM_FORMATS: { value: ExamFormat; label: string; icon: string }[] = [
  { value: 'orale',       label: 'Orale',       icon: '🗣️' },
  { value: 'scritto',     label: 'Scritto',     icon: '✍️' },
  { value: 'misto',       label: 'Misto',       icon: '📝' },
  { value: 'progetto',    label: 'Progetto',    icon: '💡' },
  { value: 'laboratorio', label: 'Lab',         icon: '🔬' },
];

const DIFFICULTY_LABELS = ['', 'Facile', 'Semplice', 'Medio', 'Difficile', 'Pazzesco'];
const DIFFICULTY_ICONS  = ['', '🌱', '📗', '⭐', '🔥', '💀'];

interface FormData {
  subject:       string;
  professorName: string;
  examDate:      string;
  targetGrade:   number;
  color:         string;
  avatarEmoji:   string;
  examFormat:    ExamFormat;
  difficulty:    1 | 2 | 3 | 4 | 5;
  topics:        string;
}

interface Props {
  onSave:   (professor: Professor) => void;
  onCancel: () => void;
}

// ─── Floating orb background ─────────────────────────────────────────
function FloatingOrbs({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20 blur-2xl"
          style={{
            width:  80 + i * 40,
            height: 80 + i * 40,
            background: color,
            top:  `${10 + i * 30}%`,
            left: `${60 + i * 10}%`,
          }}
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}

// ─── Live professor card ──────────────────────────────────────────────
function ProfessorPreviewCard({ form }: { form: FormData }) {
  const avatar = PROFESSOR_AVATARS.find((a) => a.emoji === form.avatarEmoji);
  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${form.color}18, ${form.color}08)`,
        border: `1.5px solid ${form.color}35`,
      }}
    >
      <FloatingOrbs color={form.color} />

      {/* Avatar circle */}
      <motion.div
        layout
        className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
        style={{ background: `${form.color}25`, boxShadow: `0 0 20px ${form.color}40` }}
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {form.avatarEmoji}
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          style={{ border: `2px solid ${form.color}`, opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>

      <div className="relative z-10 min-w-0">
        <p className="font-bold text-text-primary truncate">
          Prof. {form.professorName || 'Professore'}
        </p>
        <p className="text-sm truncate font-medium" style={{ color: form.color }}>
          {form.subject || 'Nessuna materia'}
        </p>
        {avatar && (
          <p className="text-[11px] text-text-muted mt-0.5">{avatar.label}</p>
        )}
      </div>

      {/* Difficulty stars */}
      <div className="relative z-10 ml-auto flex flex-col items-end gap-1">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              size={11}
              fill={s <= form.difficulty ? form.color : 'transparent'}
              stroke={s <= form.difficulty ? form.color : '#888'}
            />
          ))}
        </div>
        <span className="text-[11px] text-text-muted capitalize">{form.examFormat}</span>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────
export default function QuickProfessorCreator({ onSave, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    subject:       '',
    professorName: '',
    examDate:      '',
    targetGrade:   28,
    color:         PROFESSOR_COLORS[0].hex,
    avatarEmoji:   '👨‍🏫',
    examFormat:    'orale',
    difficulty:    3,
    topics:        '',
  });

  const update = <K extends keyof FormData>(field: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const step1Valid = form.subject.trim().length > 0;

  const handleSave = () => {
    const now = new Date().toISOString();
    const professor: Professor = {
      id:           uuidv4(),
      name:         form.professorName || 'Professore',
      subject:      form.subject,
      emoji:        form.avatarEmoji,
      color:        form.color,
      examDate:     form.examDate || undefined,
      targetGrade:  form.targetGrade,
      chatHistory:  [],
      universityId: '',
      department:   form.subject,
      examStyle: {
        oralWeight:         form.examFormat === 'orale'   ? 100 : form.examFormat === 'scritto' ? 0 : 50,
        writtenWeight:      form.examFormat === 'scritto' ? 100 : form.examFormat === 'orale'   ? 0 : 50,
        practicalWeight:    ['progetto','laboratorio'].includes(form.examFormat) ? 50 : 0,
        multipleChoice:     form.examFormat === 'scritto',
        openQuestions:      true,
        exercises:          ['misto','scritto','laboratorio'].includes(form.examFormat),
        caseStudies:        false,
        averageQuestions:   5,
        timeMinutes:        45,
        strictGrading:      form.difficulty >= 4,
        focusOnDetails:     form.difficulty >= 4,
        focusOnConcepts:    true,
        focusOnApplications: ['progetto','laboratorio'].includes(form.examFormat),
      },
      teachingStyle: {
        usesSlides:       true,
        usesWhiteboard:   false,
        interactive:      form.difficulty <= 3,
        theoreticalFocus: true,
        practicalExamples: form.difficulty <= 3,
        referencesBook:   true,
        goesOffTopic:     false,
        speedPace:        'medio',
        explanation:      'mista',
      },
      typicalQuestions: [],
      preferredTopics:  form.topics.split(',').map((t) => t.trim()).filter(Boolean),
      examFormat:       form.examFormat,
      difficulty:       form.difficulty,
      notes:            '',
      createdAt:        now,
      updatedAt:        now,
    };
    onSave(professor);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        {/* ── Top bar ─────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            style={{ background: 'rgba(108,92,231,0.12)', border: '1px solid rgba(108,92,231,0.2)' }}
          >
            <ArrowLeft size={18} />
          </motion.button>

          <div className="flex-1">
            <h1 className="text-xl font-bold gradient-text">Nuovo Professore</h1>
            <p className="text-xs text-text-muted">Passo {step} di 2</p>
          </div>

          {/* Animated progress pills */}
          <div className="flex gap-2 items-center">
            {[1, 2].map((s) => (
              <motion.div
                key={s}
                animate={{ width: s === step ? 32 : 10, opacity: s <= step ? 1 : 0.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="h-2 rounded-full"
                style={{ background: s <= step ? '#6c5ce7' : 'rgba(108,92,231,0.3)' }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ════════════════════════════════════════
              STEP 1 — Info base
              ════════════════════════════════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div
                className="relative overflow-hidden rounded-3xl p-6 space-y-5"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(108,92,231,0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Faint gradient blob */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-10 blur-3xl"
                  style={{ background: 'radial-gradient(circle, #6c5ce7, #00cec9)' }}
                />

                {/* Subject */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
                    Materia / Corso *
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Diritto Privato, Matematica..."
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    className="text-base font-medium"
                    autoFocus
                  />
                </div>

                {/* Professor name */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
                    Nome del Professore
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Rossi, Bianchi..."
                    value={form.professorName}
                    onChange={(e) => update('professorName', e.target.value)}
                  />
                </div>

                {/* Date + grade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
                      Data Esame
                    </label>
                    <input
                      type="date"
                      value={form.examDate}
                      onChange={(e) => update('examDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
                      Voto Obiettivo{' '}
                      <span className="text-accent font-bold normal-case">
                        {form.targetGrade === 31 ? '30L' : form.targetGrade}
                      </span>
                    </label>
                    <input
                      type="range"
                      min={18}
                      max={31}
                      value={form.targetGrade}
                      onChange={(e) => update('targetGrade', parseInt(e.target.value))}
                      className="w-full h-2 rounded-full cursor-pointer mt-2"
                      style={{ accentColor: '#6c5ce7' }}
                    />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                      <span>18</span><span>28</span><span>30L</span>
                    </div>
                  </div>
                </div>

                {/* Topics */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
                    Argomenti principali (facoltativo)
                  </label>
                  <input
                    type="text"
                    placeholder="Contratti, Obbligazioni... (separati da virgola)"
                    value={form.topics}
                    onChange={(e) => update('topics', e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                onClick={() => step1Valid && setStep(2)}
                disabled={!step1Valid}
                whileHover={step1Valid ? { scale: 1.02, y: -2 } : {}}
                whileTap={step1Valid ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  background: step1Valid
                    ? 'linear-gradient(135deg, #6c5ce7, #00cec9)'
                    : 'rgba(108,92,231,0.2)',
                  color: step1Valid ? '#fff' : '#888',
                  boxShadow: step1Valid ? '0 8px 30px rgba(108,92,231,0.35)' : 'none',
                  cursor: step1Valid ? 'pointer' : 'not-allowed',
                }}
              >
                <span>Personalizza avatar</span>
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ════════════════════════════════════════
              STEP 2 — Avatar, colore, stile
              ════════════════════════════════════════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* Live preview */}
              <ProfessorPreviewCard form={form} />

              <div
                className="relative overflow-hidden rounded-3xl p-6 space-y-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(108,92,231,0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* ── Avatar picker ─────────────────── */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                    Scegli il tuo Professore
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PROFESSOR_AVATARS.map((av, i) => {
                      const selected = form.avatarEmoji === av.emoji;
                      return (
                        <motion.button
                          key={i}
                          type="button"
                          onClick={() => update('avatarEmoji', av.emoji)}
                          whileHover={{ scale: 1.12, y: -3 }}
                          whileTap={{ scale: 0.92 }}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-200"
                          style={{
                            background: selected ? `${form.color}20` : 'rgba(255,255,255,0.04)',
                            border: selected
                              ? `2px solid ${form.color}`
                              : '2px solid rgba(255,255,255,0.07)',
                          }}
                          title={av.label}
                        >
                          <span className="text-2xl leading-none">{av.emoji}</span>
                          <span
                            className="text-[9px] font-medium leading-none truncate w-full text-center"
                            style={{ color: selected ? form.color : '#888' }}
                          >
                            {av.label}
                          </span>

                          {/* Selection glow ring */}
                          {selected && (
                            <motion.div
                              className="absolute inset-0 rounded-2xl pointer-events-none"
                              style={{ boxShadow: `0 0 16px ${form.color}55` }}
                              animate={{ opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 1.8, repeat: Infinity }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Color picker ──────────────────── */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                    Colore Accent
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {PROFESSOR_COLORS.map((c) => {
                      const selected = form.color === c.hex;
                      return (
                        <motion.button
                          key={c.id}
                          type="button"
                          onClick={() => update('color', c.hex)}
                          whileHover={{ scale: 1.18, y: -2 }}
                          whileTap={{ scale: 0.88 }}
                          className="relative w-9 h-9 rounded-xl transition-all"
                          style={{
                            background: c.hex,
                            boxShadow: selected ? `0 0 14px ${c.hex}88, 0 0 4px ${c.hex}` : 'none',
                            transform: selected ? 'scale(1.15)' : undefined,
                          }}
                          title={c.name}
                        >
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold"
                            >
                              ✓
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Exam format ───────────────────── */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                    Tipo di esame
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EXAM_FORMATS.map((f) => {
                      const active = form.examFormat === f.value;
                      return (
                        <motion.button
                          key={f.value}
                          type="button"
                          onClick={() => update('examFormat', f.value)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                          style={{
                            background: active ? `${form.color}25` : 'rgba(255,255,255,0.05)',
                            border: `1.5px solid ${active ? form.color : 'rgba(255,255,255,0.1)'}`,
                            color: active ? form.color : '#888',
                            boxShadow: active ? `0 4px 16px ${form.color}30` : 'none',
                          }}
                        >
                          <span>{f.icon}</span>
                          <span>{f.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Difficulty ────────────────────── */}
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                    Difficoltà
                  </label>
                  <div className="flex gap-2">
                    {([1, 2, 3, 4, 5] as const).map((d) => {
                      const active = form.difficulty === d;
                      return (
                        <motion.button
                          key={d}
                          type="button"
                          onClick={() => update('difficulty', d)}
                          whileHover={{ scale: 1.1, y: -3 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-xl transition-all duration-200"
                          style={{
                            background: active ? `${form.color}25` : 'rgba(255,255,255,0.04)',
                            border: `2px solid ${active ? form.color : 'rgba(255,255,255,0.07)'}`,
                            boxShadow: active ? `0 6px 20px ${form.color}30` : 'none',
                          }}
                        >
                          {DIFFICULTY_ICONS[d]}
                          {active && (
                            <span
                              className="text-[9px] font-bold leading-none"
                              style={{ color: form.color }}
                            >
                              {DIFFICULTY_LABELS[d]}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Action buttons ────────────────────── */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-sm font-semibold text-text-secondary hover:text-text-primary transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(108,92,231,0.2)',
                  }}
                >
                  <ArrowLeft size={16} />
                  Indietro
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${form.color}, ${form.color}cc)`,
                    boxShadow: `0 8px 30px ${form.color}45`,
                    color: '#fff',
                  }}
                >
                  <Sparkles size={18} />
                  Crea Professore
                  <GraduationCap size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
