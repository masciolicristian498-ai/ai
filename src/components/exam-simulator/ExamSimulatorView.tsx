'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileQuestion,
  Brain,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Award,
  Target,
  Sparkles,
  RotateCcw,
  Play,
  AlertTriangle,
} from 'lucide-react';
import type {
  Professor,
  ExamSimulation,
  SimulationQuestion,
} from '@/types';

// ==========================================
// PROPS & LOCAL TYPES
// ==========================================

interface ExamSimulatorViewProps {
  professors: Professor[];
  simulations: ExamSimulation[];
  onStartSimulation: (professorId: string) => void;
  onNavigate: (view: string) => void;
}

type SimulatorState = 'selection' | 'active' | 'results';

// ==========================================
// MOCK QUESTION GENERATOR
// ==========================================

const questionTemplates: Record<string, { text: string; type: SimulationQuestion['type']; options?: string[] }[]> = {
  default: [
    {
      text: 'Definisci e spiega il concetto principale, fornendo almeno due esempi concreti.',
      type: 'aperta',
    },
    {
      text: 'Quale delle seguenti affermazioni e\u0300 corretta riguardo al tema trattato?',
      type: 'multipla',
      options: [
        'La prima affermazione e\u0300 vera solo in condizioni specifiche',
        'La seconda affermazione e\u0300 sempre valida nel contesto dato',
        'Entrambe le affermazioni sono corrette',
        'Nessuna delle precedenti',
      ],
    },
    {
      text: 'Risolvi il seguente esercizio applicando la metodologia studiata. Mostra tutti i passaggi.',
      type: 'esercizio',
    },
    {
      text: 'Analizza il seguente scenario e proponi una soluzione giustificata.',
      type: 'caso_studio',
    },
    {
      text: 'Confronta e contrasta i due approcci principali, evidenziando vantaggi e svantaggi.',
      type: 'aperta',
    },
    {
      text: 'Quale metodo e\u0300 piu\u0300 appropriato per risolvere questo tipo di problema?',
      type: 'multipla',
      options: [
        'Metodo analitico diretto',
        'Metodo iterativo con approssimazione',
        'Metodo grafico semplificato',
        'Dipende dal contesto specifico del problema',
      ],
    },
    {
      text: 'Dato il seguente dataset, calcola i parametri richiesti e interpreta i risultati ottenuti.',
      type: 'esercizio',
    },
    {
      text: 'Analizza criticamente il caso presentato, identificando problematiche e proponendo strategie risolutive.',
      type: 'caso_studio',
    },
  ],
};

function generateMockQuestions(professor: Professor): SimulationQuestion[] {
  const topics = professor.preferredTopics.length > 0
    ? professor.preferredTopics
    : ['Argomento Generale', 'Teoria di Base', 'Applicazioni Pratiche', 'Analisi Critica'];

  const numQuestions = Math.floor(Math.random() * 4) + 5; // 5-8
  const templates = questionTemplates.default;
  const questions: SimulationQuestion[] = [];

  for (let i = 0; i < numQuestions; i++) {
    const template = templates[i % templates.length];
    const topic = topics[i % topics.length];
    const difficulty = Math.min(5, Math.max(1, professor.difficulty + Math.floor(Math.random() * 3) - 1)) as 1 | 2 | 3 | 4 | 5;
    const maxScore = template.type === 'multipla' ? 3 : template.type === 'aperta' ? 5 : template.type === 'esercizio' ? 6 : 8;

    questions.push({
      id: `q-${Date.now()}-${i}`,
      text: `[${topic}] ${template.text}`,
      type: template.type,
      topic,
      difficulty,
      options: template.options,
      maxScore,
    });
  }

  return questions;
}

function calculateResults(questions: SimulationQuestion[], answers: Record<string, string>): {
  gradedQuestions: SimulationQuestion[];
  totalScore: number;
  maxScore: number;
  grade: number;
  feedback: string;
  strongAreas: string[];
  weakAreas: string[];
} {
  const topicScores: Record<string, { earned: number; max: number }> = {};
  let totalScore = 0;
  let maxScore = 0;

  const gradedQuestions = questions.map((q) => {
    const answered = !!answers[q.id]?.trim();
    // Demo: 60-95% correct rate, slightly random per question
    const correctRate = answered ? 0.6 + Math.random() * 0.35 : 0;
    const score = Math.round(q.maxScore * correctRate * 10) / 10;

    totalScore += score;
    maxScore += q.maxScore;

    if (!topicScores[q.topic]) topicScores[q.topic] = { earned: 0, max: 0 };
    topicScores[q.topic].earned += score;
    topicScores[q.topic].max += q.maxScore;

    const feedbacks = answered
      ? [
          'Risposta buona, ma potresti approfondire alcuni aspetti.',
          'Ottima comprensione del concetto chiave.',
          'Risposta corretta ma incompleta. Aggiungi piu\u0300 dettagli.',
          'Ben strutturata, continua cosi\u0300!',
          'Buon approccio, ma attenzione ai dettagli tecnici.',
        ]
      : ['Domanda non risposta. Prova a formulare almeno un tentativo.'];

    return {
      ...q,
      userAnswer: answers[q.id] || '',
      score,
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
    };
  });

  const percentage = maxScore > 0 ? totalScore / maxScore : 0;
  const grade = Math.round(18 + percentage * 12); // 18-30 range

  const strongAreas: string[] = [];
  const weakAreas: string[] = [];

  Object.entries(topicScores).forEach(([topic, scores]) => {
    const topicPercentage = scores.max > 0 ? scores.earned / scores.max : 0;
    if (topicPercentage >= 0.75) strongAreas.push(topic);
    else if (topicPercentage < 0.6) weakAreas.push(topic);
  });

  let feedback: string;
  if (grade >= 28) feedback = 'Eccellente! Hai dimostrato una preparazione solida e approfondita.';
  else if (grade >= 24) feedback = 'Buona preparazione. Ci sono margini di miglioramento su alcuni argomenti.';
  else if (grade >= 18) feedback = 'Sufficiente, ma necessiti di ripassare diversi argomenti chiave.';
  else feedback = 'Insufficiente. Ti consiglio di rivedere attentamente tutto il programma.';

  return { gradedQuestions, totalScore, maxScore, grade, feedback, strongAreas, weakAreas };
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function DifficultyStars({ level, size = 12 }: { level: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= level ? '#fdcb6e' : 'rgba(108,108,133,0.3)'}
          stroke={star <= level ? '#fdcb6e' : 'rgba(108,108,133,0.3)'}
          strokeWidth="1"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function GradeBadge({ grade, size = 'md' }: { grade: number; size?: 'sm' | 'md' | 'lg' }) {
  let colorClass = '';
  let bgClass = '';

  if (grade < 18) {
    colorClass = 'text-accent-danger';
    bgClass = 'bg-accent-danger/15 border-accent-danger/30';
  } else if (grade <= 24) {
    colorClass = 'text-accent-warning';
    bgClass = 'bg-accent-warning/15 border-accent-warning/30';
  } else {
    colorClass = 'text-accent-success';
    bgClass = 'bg-accent-success/15 border-accent-success/30';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-2 font-bold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${bgClass} ${colorClass} ${sizeClasses[size]} font-semibold`}>
      {grade}/30
    </span>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function ExamSimulatorView({
  professors,
  simulations,
  onStartSimulation,
  onNavigate,
}: ExamSimulatorViewProps) {
  // --- State ---
  const [simulatorState, setSimulatorState] = useState<SimulatorState>('selection');
  const [selectedProfessorId, setSelectedProfessorId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<SimulationQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [results, setResults] = useState<ReturnType<typeof calculateResults> | null>(null);
  const [animatedGrade, setAnimatedGrade] = useState(0);

  // --- Timer ---
  useEffect(() => {
    if (simulatorState !== 'active') return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [simulatorState, startTime]);

  // --- Grade animation ---
  useEffect(() => {
    if (simulatorState !== 'results' || !results) return;
    const target = results.grade;
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= target) {
        setAnimatedGrade(target);
        clearInterval(interval);
      } else {
        setAnimatedGrade(current);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [simulatorState, results]);

  // --- Handlers ---
  const selectedProfessor = professors.find((p) => p.id === selectedProfessorId) || null;

  const handleStartSimulation = useCallback(() => {
    if (!selectedProfessor) return;
    const mockQuestions = generateMockQuestions(selectedProfessor);
    setQuestions(mockQuestions);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStartTime(Date.now());
    setElapsedSeconds(0);
    setResults(null);
    setAnimatedGrade(0);
    setSimulatorState('active');
    onStartSimulation(selectedProfessor.id);
  }, [selectedProfessor, onStartSimulation]);

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleCompleteSimulation = useCallback(() => {
    const res = calculateResults(questions, answers);
    setResults(res);
    setSimulatorState('results');
  }, [questions, answers]);

  const handleRestart = useCallback(() => {
    setSimulatorState('selection');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    setAnimatedGrade(0);
  }, []);

  // --- Animation variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
  };

  // ==========================================
  // STATE 1: SELECTION
  // ==========================================

  const renderSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center shadow-lg shadow-accent/20">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Simulatore d&apos;Esame</h1>
              <p className="text-text-secondary text-sm mt-0.5">
                Mettiti alla prova con domande nello stile del tuo professore
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="tag">
            <Sparkles size={12} className="mr-1.5" />
            AI-Powered
          </div>
        </div>
      </motion.div>

      {/* No professors state */}
      {professors.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-accent-warning/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={36} className="text-accent-warning" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Nessun Professore Disponibile
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Per avviare una simulazione devi prima creare il profilo di un professore.
            Questo ci permette di generare domande nel suo stile.
          </p>
          <button
            onClick={() => onNavigate('professor')}
            className="glow-button px-6 py-3 text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              Crea Profilo Professore
              <ChevronRight size={16} />
            </span>
          </button>
        </motion.div>
      ) : (
        <>
          {/* Professor selection */}
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Target size={18} className="text-accent-light" />
              Scegli il Professore
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professors.map((prof) => {
                const isSelected = selectedProfessorId === prof.id;
                const profSimulations = simulations.filter((s) => s.professorId === prof.id);
                return (
                  <motion.button
                    key={prof.id}
                    onClick={() => setSelectedProfessorId(prof.id)}
                    className={`text-left p-5 rounded-2xl transition-all duration-300 ${
                      isSelected
                        ? 'gradient-border bg-accent/10 shadow-lg shadow-accent/10'
                        : 'glass-card'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                            isSelected
                              ? 'bg-gradient-to-br from-accent to-accent-teal text-white'
                              : 'bg-bg-elevated text-text-secondary'
                          }`}
                        >
                          {prof.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary text-sm">{prof.name}</h3>
                          <p className="text-xs text-text-muted">{prof.department}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-accent flex items-center justify-center"
                        >
                          <CheckCircle2 size={14} className="text-white" />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <DifficultyStars level={prof.difficulty} />
                      <span className="text-[10px] text-text-muted">Difficolta\u0300</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="tag text-[10px]">{prof.examFormat}</span>
                      <span className="text-[10px] text-text-muted">
                        {prof.preferredTopics.length} argomenti
                      </span>
                      {profSimulations.length > 0 && (
                        <span className="text-[10px] text-accent-light">
                          {profSimulations.length} simulazioni
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Start button */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <motion.button
              onClick={handleStartSimulation}
              disabled={!selectedProfessorId}
              className={`glow-button px-10 py-4 text-base font-bold rounded-2xl flex items-center gap-3 ${
                !selectedProfessorId ? 'opacity-40 cursor-not-allowed' : 'pulse-glow'
              }`}
              whileHover={selectedProfessorId ? { scale: 1.05 } : {}}
              whileTap={selectedProfessorId ? { scale: 0.95 } : {}}
            >
              <Play size={20} />
              Inizia Simulazione
            </motion.button>
          </motion.div>

          {/* Past simulations */}
          {simulations.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Clock size={18} className="text-accent-light" />
                Simulazioni Passate
              </h2>
              <div className="glass-card-static overflow-hidden">
                <div className="divide-y divide-border">
                  {simulations
                    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
                    .map((sim) => {
                      const prof = professors.find((p) => p.id === sim.professorId);
                      return (
                        <motion.div
                          key={sim.id}
                          className="flex items-center justify-between px-5 py-4 hover:bg-bg-card-hover/30 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center">
                              <FileQuestion size={18} className="text-accent-light" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {prof?.name || 'Professore'}
                              </p>
                              <p className="text-xs text-text-muted">
                                {sim.completedAt
                                  ? new Date(sim.completedAt).toLocaleDateString('it-IT', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })
                                  : 'Data non disponibile'}
                                {sim.timeSpent && ` \u2022 ${formatTime(sim.timeSpent)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-text-secondary">
                                {sim.totalScore}/{sim.maxScore}
                              </p>
                            </div>
                            <GradeBadge grade={sim.grade} size="sm" />
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );

  // ==========================================
  // STATE 2: ACTIVE SIMULATION
  // ==========================================

  const renderActiveSimulation = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Top bar */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Simulazione in Corso</h2>
              <p className="text-xs text-text-muted">
                {selectedProfessor?.name} &bull; {selectedProfessor?.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Answered counter */}
            <div className="tag">
              <CheckCircle2 size={12} className="mr-1.5 text-accent-success" />
              {answeredCount}/{questions.length} risposte
            </div>
            {/* Timer */}
            <div className="glass-card-static px-4 py-2 flex items-center gap-2">
              <Clock size={16} className="text-accent-warning" />
              <span className="text-sm font-mono font-semibold text-text-primary">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">
              Domanda {currentQuestionIndex + 1} di {questions.length}
            </span>
            <span className="text-xs text-text-muted">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full progress-shimmer"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8"
          >
            {/* Question header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-sm font-bold text-accent-light">
                  {currentQuestionIndex + 1}
                </span>
                <span className="tag">{currentQuestion.topic}</span>
                <span className="tag text-[10px]" style={{
                  background: currentQuestion.type === 'multipla' ? 'rgba(0,206,201,0.15)' : currentQuestion.type === 'aperta' ? 'rgba(108,92,231,0.15)' : currentQuestion.type === 'esercizio' ? 'rgba(253,203,110,0.15)' : 'rgba(253,121,168,0.15)',
                  color: currentQuestion.type === 'multipla' ? '#00cec9' : currentQuestion.type === 'aperta' ? '#a29bfe' : currentQuestion.type === 'esercizio' ? '#fdcb6e' : '#fd79a8',
                  borderColor: currentQuestion.type === 'multipla' ? 'rgba(0,206,201,0.3)' : currentQuestion.type === 'aperta' ? 'rgba(108,92,231,0.3)' : currentQuestion.type === 'esercizio' ? 'rgba(253,203,110,0.3)' : 'rgba(253,121,168,0.3)',
                }}>
                  {currentQuestion.type === 'multipla'
                    ? 'Scelta Multipla'
                    : currentQuestion.type === 'aperta'
                    ? 'Risposta Aperta'
                    : currentQuestion.type === 'esercizio'
                    ? 'Esercizio'
                    : 'Caso Studio'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DifficultyStars level={currentQuestion.difficulty} size={14} />
                <span className="text-xs text-text-muted ml-1">
                  {currentQuestion.maxScore} pt
                </span>
              </div>
            </div>

            {/* Question text */}
            <p className="text-text-primary text-base leading-relaxed mb-8">
              {currentQuestion.text}
            </p>

            {/* Answer area */}
            {currentQuestion.type === 'multipla' && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option;
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleAnswer(currentQuestion.id, option)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-md shadow-accent/10'
                          : 'border-border hover:border-accent/40 hover:bg-bg-card-hover/30'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'border-accent bg-accent text-white'
                            : 'border-text-muted'
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <span className="text-xs font-semibold text-text-muted">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${isSelected ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : currentQuestion.type === 'aperta' ? (
              <div>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Scrivi la tua risposta qui..."
                  rows={6}
                  className="w-full resize-none text-sm"
                />
              </div>
            ) : currentQuestion.type === 'esercizio' ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-accent-warning/20 flex items-center justify-center">
                    <Sparkles size={10} className="text-accent-warning" />
                  </div>
                  <span className="text-xs text-accent-warning font-medium">
                    Mostra il procedimento completo
                  </span>
                </div>
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Risolvi l'esercizio mostrando tutti i passaggi intermedi..."
                  rows={8}
                  className="w-full resize-none text-sm font-mono"
                />
              </div>
            ) : (
              /* caso_studio */
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-accent-pink/20 flex items-center justify-center">
                    <Target size={10} className="text-accent-pink" />
                  </div>
                  <span className="text-xs text-accent-pink font-medium">
                    Analisi strutturata richiesta
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-text-muted space-y-1 mb-2 p-3 rounded-lg bg-bg-elevated/50">
                    <p>Struttura consigliata:</p>
                    <p className="text-text-secondary">1. Identificazione del problema</p>
                    <p className="text-text-secondary">2. Analisi dei dati e del contesto</p>
                    <p className="text-text-secondary">3. Proposta di soluzione</p>
                    <p className="text-text-secondary">4. Giustificazione e conclusioni</p>
                  </div>
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    placeholder="Analizza il caso studio seguendo la struttura suggerita..."
                    rows={10}
                    className="w-full resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentQuestionIndex === 0
                ? 'opacity-30 cursor-not-allowed text-text-muted'
                : 'glass-card text-text-secondary hover:text-text-primary'
            }`}
          >
            <ChevronRight size={16} className="rotate-180" />
            Precedente
          </button>

          {/* Question dots */}
          <div className="flex items-center gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]?.trim();
              const isCurrent = idx === currentQuestionIndex;
              return (
                <motion.button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    isCurrent
                      ? 'bg-accent scale-125 shadow-md shadow-accent/40'
                      : isAnswered
                      ? 'bg-accent-success/70'
                      : 'bg-bg-elevated hover:bg-text-muted'
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  title={`Domanda ${idx + 1}`}
                />
              );
            })}
          </div>

          {isLastQuestion ? (
            <motion.button
              onClick={handleCompleteSimulation}
              className="glow-button px-6 py-2.5 text-sm font-semibold flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award size={16} />
              Concludi Simulazione
            </motion.button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="glow-button px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
            >
              Prossima Domanda
              <ChevronRight size={16} />
            </button>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // ==========================================
  // STATE 3: RESULTS
  // ==========================================

  const renderResults = () => {
    if (!results) return null;

    const percentage = results.maxScore > 0 ? (results.totalScore / results.maxScore) * 100 : 0;

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Hero grade */}
        <motion.div
          variants={itemVariants}
          className="glass-card p-10 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
              style={{
                background: results.grade >= 25
                  ? 'radial-gradient(circle, rgba(0,184,148,0.3), transparent 70%)'
                  : results.grade >= 18
                  ? 'radial-gradient(circle, rgba(253,203,110,0.3), transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,118,117,0.3), transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award size={24} className="text-accent-warning" />
              <h2 className="text-lg font-semibold text-text-secondary">
                Risultato Simulazione
              </h2>
            </div>

            {/* Animated grade */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <span
                className="text-8xl font-black"
                style={{
                  background: results.grade >= 25
                    ? 'linear-gradient(135deg, #00b894, #00cec9)'
                    : results.grade >= 18
                    ? 'linear-gradient(135deg, #fdcb6e, #e17055)'
                    : 'linear-gradient(135deg, #ff7675, #d63031)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {animatedGrade}
              </span>
              <span className="text-3xl font-bold text-text-muted">/30</span>
            </motion.div>

            {/* Score bar */}
            <div className="max-w-md mx-auto mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted">Punteggio</span>
                <span className="text-sm font-semibold text-text-secondary">
                  {results.totalScore.toFixed(1)} / {results.maxScore}
                </span>
              </div>
              <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: results.grade >= 25
                      ? 'linear-gradient(90deg, #00b894, #00cec9)'
                      : results.grade >= 18
                      ? 'linear-gradient(90deg, #fdcb6e, #e17055)'
                      : 'linear-gradient(90deg, #ff7675, #d63031)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Time spent */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock size={14} className="text-text-muted" />
              <span className="text-sm text-text-muted">
                Tempo impiegato: {formatTime(elapsedSeconds)}
              </span>
            </div>

            {/* Feedback */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-text-secondary text-base max-w-lg mx-auto"
            >
              {results.feedback}
            </motion.p>
          </div>
        </motion.div>

        {/* Strong / Weak areas */}
        {(results.strongAreas.length > 0 || results.weakAreas.length > 0) && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.strongAreas.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-success/15 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-accent-success" />
                  </div>
                  <h3 className="font-semibold text-text-primary">Punti di Forza</h3>
                </div>
                <div className="space-y-2">
                  {results.strongAreas.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-success/5 border border-accent-success/15"
                    >
                      <Sparkles size={12} className="text-accent-success" />
                      <span className="text-sm text-text-secondary">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {results.weakAreas.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-danger/15 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-accent-danger" />
                  </div>
                  <h3 className="font-semibold text-text-primary">Da Migliorare</h3>
                </div>
                <div className="space-y-2">
                  {results.weakAreas.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-danger/5 border border-accent-danger/15"
                    >
                      <Target size={12} className="text-accent-danger" />
                      <span className="text-sm text-text-secondary">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Per-question breakdown */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FileQuestion size={18} className="text-accent-light" />
            Dettaglio Domande
          </h2>
          <div className="space-y-3">
            {results.gradedQuestions.map((q, idx) => {
              const scorePercentage = q.maxScore > 0 ? ((q.score || 0) / q.maxScore) * 100 : 0;
              const isGood = scorePercentage >= 70;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isGood ? 'bg-accent-success/15' : 'bg-accent-danger/15'
                        }`}
                      >
                        {isGood ? (
                          <CheckCircle2 size={16} className="text-accent-success" />
                        ) : (
                          <XCircle size={16} className="text-accent-danger" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          Domanda {idx + 1}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="tag text-[10px]">{q.topic}</span>
                          <DifficultyStars level={q.difficulty} size={10} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isGood ? 'text-accent-success' : 'text-accent-danger'}`}>
                        {q.score?.toFixed(1)} / {q.maxScore}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {Math.round(scorePercentage)}%
                      </p>
                    </div>
                  </div>
                  {q.feedback && (
                    <p className="text-xs text-text-secondary pl-11">
                      {q.feedback}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 pb-8">
          <motion.button
            onClick={handleRestart}
            className="glass-card px-6 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={16} />
            Ripeti Simulazione
          </motion.button>
          <motion.button
            onClick={() => onNavigate('dashboard')}
            className="glow-button px-6 py-3 text-sm font-semibold flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Torna alla Dashboard
            <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      </motion.div>
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {simulatorState === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderSelection()}
          </motion.div>
        )}
        {simulatorState === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderActiveSimulation()}
          </motion.div>
        )}
        {simulatorState === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderResults()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
