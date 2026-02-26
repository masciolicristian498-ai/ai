'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ArrowRight, Check, GraduationCap } from 'lucide-react';
import { PROFESSOR_COLORS, SUBJECT_EMOJIS } from '@/types';
import type { Professor, ExamFormat } from '@/types';

interface QuickProfessorCreatorProps {
  onSave: (professor: Professor) => void;
  onCancel: () => void;
}

interface FormData {
  subject: string;
  professorName: string;
  examDate: string;
  targetGrade: number;
  color: string;
  emoji: string;
  examFormat: ExamFormat;
  difficulty: 1 | 2 | 3 | 4 | 5;
  topics: string;
}

const EXAM_FORMATS: { value: ExamFormat; label: string; icon: string }[] = [
  { value: 'orale', label: 'Orale', icon: '🗣️' },
  { value: 'scritto', label: 'Scritto', icon: '✍️' },
  { value: 'misto', label: 'Misto', icon: '📝' },
  { value: 'progetto', label: 'Progetto', icon: '💡' },
  { value: 'laboratorio', label: 'Laboratorio', icon: '🔬' },
];

export default function QuickProfessorCreator({ onSave, onCancel }: QuickProfessorCreatorProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    subject: '',
    professorName: '',
    examDate: '',
    targetGrade: 28,
    color: PROFESSOR_COLORS[0].hex,
    emoji: '🎓',
    examFormat: 'orale',
    difficulty: 3,
    topics: '',
  });

  const update = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !form.subject.trim()) return;
    setStep(2);
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const professor: Professor = {
      id: uuidv4(),
      name: form.professorName || 'Professore',
      subject: form.subject,
      emoji: form.emoji,
      color: form.color,
      examDate: form.examDate || undefined,
      targetGrade: form.targetGrade,
      chatHistory: [],
      universityId: '',
      department: form.subject,
      examStyle: {
        oralWeight: form.examFormat === 'orale' ? 100 : form.examFormat === 'scritto' ? 0 : 50,
        writtenWeight: form.examFormat === 'scritto' ? 100 : form.examFormat === 'orale' ? 0 : 50,
        practicalWeight: ['progetto', 'laboratorio'].includes(form.examFormat) ? 50 : 0,
        multipleChoice: form.examFormat === 'scritto',
        openQuestions: true,
        exercises: ['misto', 'scritto', 'laboratorio'].includes(form.examFormat),
        caseStudies: false,
        averageQuestions: 5,
        timeMinutes: 45,
        strictGrading: form.difficulty >= 4,
        focusOnDetails: form.difficulty >= 4,
        focusOnConcepts: true,
        focusOnApplications: ['progetto', 'laboratorio'].includes(form.examFormat),
      },
      teachingStyle: {
        usesSlides: true,
        usesWhiteboard: false,
        interactive: form.difficulty <= 3,
        theoreticalFocus: true,
        practicalExamples: form.difficulty <= 3,
        referencesBook: true,
        goesOffTopic: false,
        speedPace: 'medio',
        explanation: 'mista',
      },
      typicalQuestions: [],
      preferredTopics: form.topics.split(',').map((t) => t.trim()).filter(Boolean),
      examFormat: form.examFormat,
      difficulty: form.difficulty,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    onSave(professor);
  };

  const step1Valid = form.subject.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Nuovo Professore</h1>
            <p className="text-text-muted text-sm">Passo {step} di 2</p>
          </div>
          <div className="ml-auto flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className="h-1.5 w-10 rounded-full transition-all duration-300"
                style={{ background: s <= step ? '#6c5ce7' : 'rgba(108,92,231,0.2)' }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              <div className="glass-card-static p-6 space-y-5">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Materia / Corso *
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Diritto Privato, Matematica, Economia..."
                    value={form.subject}
                    onChange={(e) => update('subject', e.target.value)}
                    className="text-base font-medium"
                    autoFocus
                  />
                </div>

                {/* Professor Name */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Nome del Professore
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Rossi, Bianchi, Ferrari..."
                    value={form.professorName}
                    onChange={(e) => update('professorName', e.target.value)}
                  />
                </div>

                {/* Two columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Data Esame
                    </label>
                    <input
                      type="date"
                      value={form.examDate}
                      onChange={(e) => update('examDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                      Voto Obiettivo: <span className="text-accent font-bold">{form.targetGrade === 31 ? '30L' : form.targetGrade}</span>
                    </label>
                    <input
                      type="range"
                      min={18}
                      max={31}
                      value={form.targetGrade}
                      onChange={(e) => update('targetGrade', parseInt(e.target.value) as number)}
                      className="w-full h-2 rounded-full cursor-pointer"
                      style={{ accentColor: form.color }}
                    />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                      <span>18</span><span>28</span><span>30L</span>
                    </div>
                  </div>
                </div>

                {/* Topics hint */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Argomenti principali (facoltativo)
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Contratti, Obbligazioni, Proprietà (separati da virgola)"
                    value={form.topics}
                    onChange={(e) => update('topics', e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                onClick={handleNext}
                disabled={!step1Valid}
                whileHover={step1Valid ? { scale: 1.02 } : {}}
                whileTap={step1Valid ? { scale: 0.98 } : {}}
                className="w-full glow-button py-4 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Personalizza stile
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-5"
            >
              <div className="glass-card-static p-6 space-y-6">
                {/* Preview */}
                <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: `${form.color}12`, border: `1.5px solid ${form.color}30` }}>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: `${form.color}25` }}
                  >
                    {form.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">Prof. {form.professorName || 'Professore'}</p>
                    <p className="text-sm" style={{ color: form.color }}>{form.subject}</p>
                  </div>
                </div>

                {/* Emoji picker */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-3">Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECT_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => update('emoji', e)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-150 hover:scale-110"
                        style={{
                          background: form.emoji === e ? `${form.color}30` : 'rgba(26,26,46,0.8)',
                          border: form.emoji === e ? `2px solid ${form.color}` : '2px solid transparent',
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-3">Colore</label>
                  <div className="flex gap-3 flex-wrap">
                    {PROFESSOR_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => update('color', c.hex)}
                        className="w-9 h-9 rounded-xl transition-all duration-150 hover:scale-110 relative"
                        style={{ background: c.hex }}
                        title={c.name}
                      >
                        {form.color === c.hex && (
                          <Check size={14} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam format */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-3">Tipo di esame</label>
                  <div className="flex flex-wrap gap-2">
                    {EXAM_FORMATS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => update('examFormat', f.value)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                        style={{
                          background: form.examFormat === f.value ? `${form.color}25` : 'rgba(26,26,46,0.8)',
                          border: `1.5px solid ${form.examFormat === f.value ? form.color : 'rgba(108,92,231,0.15)'}`,
                          color: form.examFormat === f.value ? form.color : '#a0a0b8',
                        }}
                      >
                        <span>{f.icon}</span>
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-3">
                    Difficoltà dell&apos;esame
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <button
                        key={d}
                        onClick={() => update('difficulty', d as 1 | 2 | 3 | 4 | 5)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                        style={{
                          background: form.difficulty >= d ? `${form.color}25` : 'rgba(26,26,46,0.8)',
                          border: `1.5px solid ${form.difficulty >= d ? form.color : 'rgba(108,92,231,0.15)'}`,
                          color: form.difficulty >= d ? form.color : '#6c6c85',
                        }}
                      >
                        {d === 1 ? '⭐' : d === 2 ? '⭐⭐' : d === 3 ? '⭐⭐⭐' : d === 4 ? '🔥' : '💀'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2 text-center">
                    {form.difficulty === 1 ? 'Facile' : form.difficulty === 2 ? 'Abbastanza facile' : form.difficulty === 3 ? 'Medio' : form.difficulty === 4 ? 'Difficile' : 'Molto difficile'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-4 rounded-xl border border-border text-text-secondary font-semibold hover:text-text-primary hover:bg-bg-card transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Indietro
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-[2] glow-button py-4 text-base font-semibold flex items-center justify-center gap-2"
                >
                  <GraduationCap size={18} />
                  Crea Professore
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
