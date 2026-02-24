'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Clock,
  Target,
  Sparkles,
  Building2,
  BookMarked,
  Timer,
  Star,
  Rocket,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { OnboardingData } from '@/types';

interface OnboardingViewProps {
  onComplete: (data: OnboardingData) => void;
  onNavigate: (view: string) => void;
}

const steps = [
  { id: 1, title: 'Universita e Corso', icon: GraduationCap },
  { id: 2, title: 'Dettagli Esame', icon: CalendarDays },
  { id: 3, title: 'Materiale di Studio', icon: BookOpen },
  { id: 4, title: 'Riepilogo', icon: ClipboardCheck },
];

const examFormatOptions: { value: OnboardingData['examFormat']; label: string; icon: string }[] = [
  { value: 'orale', label: 'Orale', icon: '🎤' },
  { value: 'scritto', label: 'Scritto', icon: '✍️' },
  { value: 'misto', label: 'Misto', icon: '📋' },
  { value: 'progetto', label: 'Progetto', icon: '💻' },
  { value: 'laboratorio', label: 'Laboratorio', icon: '🔬' },
];

const degreeTypeOptions: { value: OnboardingData['degreeType']; label: string }[] = [
  { value: 'triennale', label: 'Triennale' },
  { value: 'magistrale', label: 'Magistrale' },
  { value: 'ciclo_unico', label: 'Ciclo Unico' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function OnboardingView({ onComplete, onNavigate }: OnboardingViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [bookInput, setBookInput] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    university: '',
    courseName: '',
    cfu: 6,
    degreeType: 'triennale',
    year: 1,
    semester: 1,
    examDate: '',
    targetGrade: 24,
    examFormat: 'scritto',
    books: [],
    hoursPerDay: 4,
  });

  const updateField = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const addBook = () => {
    const trimmed = bookInput.trim();
    if (trimmed && !formData.books.includes(trimmed)) {
      updateField('books', [...formData.books, trimmed]);
      setBookInput('');
    }
  };

  const removeBook = (index: number) => {
    updateField(
      'books',
      formData.books.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const getDaysRemaining = (): number | null => {
    if (!formData.examDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(formData.examDate);
    exam.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getGradeLabel = (grade: number): string => {
    if (grade === 31) return '30 e Lode';
    return grade.toString();
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.university.trim() !== '' && formData.courseName.trim() !== '';
      case 2:
        return formData.examDate !== '';
      case 3:
        return formData.books.length > 0;
      default:
        return true;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  // -------------------------------------------------
  // STEP RENDERERS
  // -------------------------------------------------

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* University */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Building2 size={15} className="text-accent-light" />
          Universita
        </label>
        <input
          type="text"
          placeholder="es. Universita degli Studi di Roma La Sapienza"
          value={formData.university}
          onChange={(e) => updateField('university', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Course Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <BookMarked size={15} className="text-accent-light" />
          Nome del Corso
        </label>
        <input
          type="text"
          placeholder="es. Analisi Matematica I"
          value={formData.courseName}
          onChange={(e) => updateField('courseName', e.target.value)}
          className="w-full"
        />
      </div>

      {/* CFU & Degree Type row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">CFU</label>
          <select
            value={formData.cfu}
            onChange={(e) => updateField('cfu', Number(e.target.value))}
          >
            {[6, 9, 12, 15].map((v) => (
              <option key={v} value={v}>
                {v} CFU
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Tipo di Laurea</label>
          <select
            value={formData.degreeType}
            onChange={(e) => updateField('degreeType', e.target.value as OnboardingData['degreeType'])}
          >
            {degreeTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Year & Semester row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Anno</label>
          <select
            value={formData.year}
            onChange={(e) => updateField('year', Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>
                {v}° Anno
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Semestre</label>
          <select
            value={formData.semester}
            onChange={(e) => updateField('semester', Number(e.target.value) as 1 | 2)}
          >
            <option value={1}>1° Semestre</option>
            <option value={2}>2° Semestre</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const daysRemaining = getDaysRemaining();

    return (
      <div className="space-y-8">
        {/* Exam Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <CalendarDays size={15} className="text-accent-light" />
            Data dell&apos;Esame
          </label>
          <input
            type="date"
            value={formData.examDate}
            onChange={(e) => updateField('examDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>

        {/* Countdown Display */}
        {daysRemaining !== null && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="gradient-border"
          >
            <div className="glass-card-static p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Timer size={22} className="text-accent-teal" />
                <span className="text-sm font-medium text-text-secondary">Tempo Rimanente</span>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span
                  className="text-6xl font-bold gradient-text tabular-nums"
                  style={{ lineHeight: 1.1 }}
                >
                  {daysRemaining > 0 ? daysRemaining : 0}
                </span>
                <span className="text-xl text-text-secondary font-medium">
                  {daysRemaining === 1 ? 'giorno' : 'giorni'}
                </span>
              </div>
              {daysRemaining <= 0 && (
                <p className="mt-2 text-sm text-accent-danger font-medium">
                  La data selezionata e gia passata!
                </p>
              )}
              {daysRemaining > 0 && daysRemaining <= 7 && (
                <p className="mt-2 text-sm text-accent-warning font-medium">
                  Poco tempo rimasto, inizia subito!
                </p>
              )}
              {daysRemaining > 7 && (
                <p className="mt-2 text-sm text-text-muted">
                  Hai ancora tempo, ma non rimandare!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Target Grade Slider */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <Target size={15} className="text-accent-light" />
            Voto Obiettivo
          </label>
          <div className="glass-card-static p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted text-xs">18</span>
              <motion.div
                key={formData.targetGrade}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl font-bold gradient-text">
                  {getGradeLabel(formData.targetGrade)}
                </span>
                {formData.targetGrade === 31 && (
                  <Star size={20} className="text-accent-warning fill-accent-warning" />
                )}
              </motion.div>
              <span className="text-text-muted text-xs">30L</span>
            </div>
            <input
              type="range"
              min={18}
              max={31}
              value={formData.targetGrade}
              onChange={(e) => updateField('targetGrade', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6c5ce7 0%, #00cec9 ${
                  ((formData.targetGrade - 18) / 13) * 100
                }%, rgba(108,92,231,0.15) ${((formData.targetGrade - 18) / 13) * 100}%)`,
              }}
            />
          </div>
        </div>

        {/* Exam Format */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text-secondary">Formato Esame</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {examFormatOptions.map((opt) => {
              const isActive = formData.examFormat === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField('examFormat', opt.value)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl text-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-accent/20 border-accent shadow-lg shadow-accent/10'
                      : 'bg-bg-card border-border hover:border-accent/40'
                  } border`}
                >
                  <span className="text-2xl block mb-1">{opt.icon}</span>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? 'text-accent-light' : 'text-text-secondary'
                    }`}
                  >
                    {opt.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="examFormatIndicator"
                      className="absolute inset-0 rounded-xl border-2 border-accent pointer-events-none"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Book Input */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <BookOpen size={15} className="text-accent-light" />
          Libri di Testo
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Titolo del libro..."
            value={bookInput}
            onChange={(e) => setBookInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addBook();
              }
            }}
            className="flex-1"
          />
          <motion.button
            type="button"
            onClick={addBook}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!bookInput.trim()}
            className="glow-button px-5 py-3 flex items-center gap-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Plus size={16} />
            Aggiungi libro
          </motion.button>
        </div>
      </div>

      {/* Book List */}
      <AnimatePresence mode="popLayout">
        {formData.books.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {formData.books.map((book, index) => (
              <motion.div
                key={`${book}-${index}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                className="glass-card-static flex items-center justify-between p-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <BookMarked size={14} className="text-accent-light" />
                  </div>
                  <span className="text-sm text-text-primary font-medium">{book}</span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => removeBook(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {formData.books.length === 0 && (
        <div className="glass-card-static p-8 text-center">
          <BookOpen size={40} className="mx-auto text-text-muted mb-3 opacity-40" />
          <p className="text-text-muted text-sm">Aggiungi almeno un libro per continuare</p>
        </div>
      )}

      {/* Hours per Day Slider */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Clock size={15} className="text-accent-light" />
          Ore di Studio al Giorno
        </label>
        <div className="glass-card-static p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-xs">1 ora</span>
            <motion.span
              key={formData.hoursPerDay}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold gradient-text"
            >
              {formData.hoursPerDay}h
            </motion.span>
            <span className="text-text-muted text-xs">10 ore</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={formData.hoursPerDay}
            onChange={(e) => updateField('hoursPerDay', Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #6c5ce7 0%, #00cec9 ${
                ((formData.hoursPerDay - 1) / 9) * 100
              }%, rgba(108,92,231,0.15) ${((formData.hoursPerDay - 1) / 9) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-text-muted">
            <span>Relax</span>
            <span>Intenso</span>
            <span>Hardcore</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const daysRemaining = getDaysRemaining();

    const summaryItems = [
      { label: 'Universita', value: formData.university, icon: Building2 },
      { label: 'Corso', value: formData.courseName, icon: BookMarked },
      { label: 'CFU', value: `${formData.cfu} CFU`, icon: GraduationCap },
      {
        label: 'Tipo di Laurea',
        value: degreeTypeOptions.find((d) => d.value === formData.degreeType)?.label || '',
        icon: GraduationCap,
      },
      { label: 'Anno / Semestre', value: `${formData.year}° Anno - ${formData.semester}° Semestre`, icon: CalendarDays },
      { label: 'Data Esame', value: formData.examDate ? new Date(formData.examDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '-', icon: CalendarDays },
      {
        label: 'Giorni Rimanenti',
        value: daysRemaining !== null ? `${daysRemaining} giorni` : '-',
        icon: Timer,
      },
      {
        label: 'Voto Obiettivo',
        value: getGradeLabel(formData.targetGrade),
        icon: Target,
      },
      {
        label: 'Formato',
        value: examFormatOptions.find((f) => f.value === formData.examFormat)?.label || '',
        icon: ClipboardCheck,
      },
      {
        label: 'Libri',
        value: formData.books.join(', '),
        icon: BookOpen,
      },
      {
        label: 'Ore al Giorno',
        value: `${formData.hoursPerDay} ore`,
        icon: Clock,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="gradient-border">
          <div className="glass-card-static p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Riepilogo Esame</h3>
                <p className="text-xs text-text-muted">Verifica che i dati siano corretti</p>
              </div>
            </div>

            <div className="space-y-3">
              {summaryItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={13} className="text-accent-light" />
                      </div>
                      <span className="text-sm text-text-muted">{item.label}</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary text-right max-w-[55%] truncate">
                      {item.value}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glow-button w-full py-4 text-lg font-bold flex items-center justify-center gap-3 pulse-glow"
        >
          <Rocket size={22} />
          Genera Piano di Studio
        </motion.button>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  // -------------------------------------------------
  // MAIN RENDER
  // -------------------------------------------------

  return (
    <div className="min-h-screen flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold gradient-text mb-1">Configura Nuovo Esame</h1>
          <p className="text-text-muted text-sm">
            Compila i dati e genereremo il tuo piano di studio personalizzato
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-bg-card overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #6c5ce7, #00cec9)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className="flex flex-col items-center relative"
                  animate={{ scale: isActive ? 1 : 0.95 }}
                >
                  <motion.div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive
                        ? 'border-transparent'
                        : isCompleted
                        ? 'border-accent-teal bg-accent-teal/20'
                        : 'border-border bg-bg-card'
                    }`}
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, #6c5ce7, #00cec9)',
                          }
                        : undefined
                    }
                  >
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-white'
                          : isCompleted
                          ? 'text-accent-teal'
                          : 'text-text-muted'
                      }
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                      isActive
                        ? 'text-accent-light'
                        : isCompleted
                        ? 'text-accent-teal'
                        : 'text-text-muted'
                    }`}
                  >
                    {step.title}
                  </span>
                </motion.div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="w-12 sm:w-20 h-0.5 mx-1 mt-[-18px] rounded-full overflow-hidden bg-bg-card">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #6c5ce7, #00cec9)',
                      }}
                      initial={{ width: '0%' }}
                      animate={{
                        width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="glass-card p-6 sm:p-8 relative overflow-hidden min-h-[420px]">
          {/* Step Title */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                  {(() => {
                    const StepIcon = steps[currentStep - 1].icon;
                    return <StepIcon size={18} className="text-accent-light" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-xs text-text-muted">
                    Passo {currentStep} di {steps.length}
                  </p>
                </div>
              </div>

              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between">
            <motion.button
              type="button"
              onClick={prevStep}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border"
            >
              <ChevronLeft size={16} />
              Indietro
            </motion.button>

            <motion.button
              type="button"
              onClick={nextStep}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={!canProceed()}
              className="glow-button flex items-center gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              Avanti
              <ChevronRight size={16} />
            </motion.button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="flex items-center justify-start">
            <motion.button
              type="button"
              onClick={prevStep}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all text-sm font-medium"
            >
              <ChevronLeft size={16} />
              Modifica
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
