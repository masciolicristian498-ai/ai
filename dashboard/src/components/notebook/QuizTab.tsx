'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, RefreshCw, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { generateQuiz } from '@/lib/api-client';
import type { QuizQuestion } from '@/types/api';

type Phase = 'setup' | 'quiz' | 'results';

export default function QuizTab() {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'base' | 'medio' | 'avanzato'>('medio');
  const [types, setTypes] = useState<('multipla' | 'vera_falsa' | 'aperta')[]>([
    'multipla',
    'vera_falsa',
    'aperta',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<Phase>('setup');

  const toggleType = (t: 'multipla' | 'vera_falsa' | 'aperta') => {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim() || types.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateQuiz({ topic, questionCount, difficulty, types });
      setQuestions(result.questions);
      setTotalPoints(result.totalPoints);
      setUserAnswers({});
      setSubmitted({});
      setCurrentQ(0);
      setPhase('quiz');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nella generazione');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (qId: string) => {
    setSubmitted((prev) => ({ ...prev, [qId]: true }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((i) => i + 1);
    } else {
      setPhase('results');
    }
  };

  const computeScore = () =>
    questions.reduce((score, q) => {
      if (!submitted[q.id]) return score;
      const answer = userAnswers[q.id] || '';
      if (q.type !== 'aperta') {
        return score + (answer === q.correctAnswer ? (q.points || 1) : 0);
      }
      // For open questions: give partial credit if they wrote something meaningful
      return score + (answer.trim().length > 15 ? Math.floor((q.points || 3) / 2) : 0);
    }, 0);

  // ---- RESULTS ----
  if (phase === 'results') {
    const score = computeScore();
    const pct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const grade =
      pct >= 90 ? '30L' : pct >= 80 ? '29–30' : pct >= 70 ? '27–28' : pct >= 60 ? '24–26' : pct >= 50 ? '21–23' : '< 21';
    const emoji =
      pct >= 70 ? '🎉 Ottimo risultato!' : pct >= 50 ? '📚 Buono, continua a ripassare.' : '💪 Riprova dopo un altro ripasso!';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 text-center space-y-6"
      >
        <Trophy size={52} className="mx-auto text-yellow-400" />
        <div>
          <h2 className="text-3xl font-bold gradient-text">{pct}%</h2>
          <p className="text-text-muted text-sm mt-1">
            {score} / {totalPoints} punti · voto stimato: <strong className="text-text-primary">{grade}</strong>
          </p>
        </div>
        <div className="h-3 bg-bg-card rounded-full overflow-hidden max-w-xs mx-auto">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#00b894] to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <p className="text-text-secondary text-sm">{emoji}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setPhase('setup'); setQuestions([]); }}
            className="px-5 py-2.5 rounded-xl bg-bg-card border border-border text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Nuovo Quiz
          </button>
          <button
            onClick={() => { setCurrentQ(0); setSubmitted({}); setUserAnswers({}); setPhase('quiz'); }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00b894] to-[#00cec9] text-white text-sm font-semibold"
          >
            Riprova
          </button>
        </div>
      </motion.div>
    );
  }

  // ---- SETUP ----
  if (phase === 'setup') {
    return (
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={18} className="text-[#00b894]" />
          <h2 className="font-semibold text-text-primary">Genera Quiz</h2>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Argomento *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Teoria dei giochi, Diritto Penale, Matematica discreta..."
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex gap-6 flex-wrap items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-text-muted mb-1 block">Domande: {questionCount}</label>
            <input
              type="range"
              min={3}
              max={15}
              step={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-[#00b894]"
            />
            <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
              <span>3</span><span>15</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Difficoltà</label>
            <div className="flex gap-1.5">
              {(['base', 'medio', 'avanzato'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    difficulty === d
                      ? 'bg-[#00b894] text-white'
                      : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-2 block">Tipi di domanda</label>
          <div className="flex gap-2 flex-wrap">
            {(['multipla', 'vera_falsa', 'aperta'] as const).map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  types.includes(t)
                    ? 'bg-[#00b894]/15 border-[#00b894]/50 text-[#00b894]'
                    : 'bg-bg-card border-border text-text-muted hover:text-text-secondary'
                }`}
              >
                {t === 'multipla' ? 'Scelta multipla' : t === 'vera_falsa' ? 'Vero / Falso' : 'Risposta aperta'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading || types.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00b894] to-[#00cec9] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta generando...</>
          ) : (
            <><Sparkles size={16} /> Genera {questionCount} Domande</>
          )}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    );
  }

  // ---- QUIZ ----
  const q = questions[currentQ];
  const isSubmitted = submitted[q.id];
  const userAnswer = userAnswers[q.id] || '';
  const isCorrect = q.type !== 'aperta' && isSubmitted && userAnswer === q.correctAnswer;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">Domanda {currentQ + 1} di {questions.length}</span>
        <button
          onClick={() => setPhase('setup')}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          ✕ Esci
        </button>
      </div>
      <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00b894] to-accent rounded-full"
          animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="glass-card p-6 space-y-4"
        >
          {/* Question header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-[10px] text-text-muted uppercase tracking-widest">
                {q.topic} · {q.type.replace('_', '/')} · {q.difficulty}
              </span>
              <p className="text-text-primary font-semibold mt-1.5 text-lg leading-snug">{q.text}</p>
            </div>
            <span className="text-xs bg-bg-card border border-border rounded-lg px-2 py-1 text-text-muted shrink-0">
              {q.points || 1}pt
            </span>
          </div>

          {/* Multiple choice / True-False options */}
          {(q.type === 'multipla' || q.type === 'vera_falsa') && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = userAnswer === opt;
                const isCorrectOpt = isSubmitted && opt === q.correctAnswer;
                const isWrongOpt = isSubmitted && isSelected && opt !== q.correctAnswer;
                return (
                  <button
                    key={opt}
                    onClick={() => !isSubmitted && setUserAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    disabled={isSubmitted}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      isCorrectOpt
                        ? 'bg-green-500/15 border-green-500/50 text-green-400'
                        : isWrongOpt
                        ? 'bg-red-500/15 border-red-500/50 text-red-400'
                        : isSelected
                        ? 'bg-accent/15 border-accent/50 text-accent-light'
                        : 'bg-bg-card border-border text-text-secondary hover:border-accent/30 hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isCorrectOpt && <CheckCircle2 size={13} className="shrink-0 text-green-400" />}
                      {isWrongOpt && <XCircle size={13} className="shrink-0 text-red-400" />}
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Open question */}
          {q.type === 'aperta' && (
            <textarea
              value={userAnswer}
              onChange={(e) =>
                !isSubmitted && setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              disabled={isSubmitted}
              placeholder="Scrivi la tua risposta..."
              rows={4}
              className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none disabled:opacity-60 transition-colors"
            />
          )}

          {/* Feedback */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 text-sm space-y-1 ${
                q.type === 'aperta'
                  ? 'bg-blue-500/10 border border-blue-500/30'
                  : isCorrect
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              {q.type !== 'aperta' && (
                <p className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '✓ Corretto!' : `✗ Sbagliato. Risposta: "${q.correctAnswer}"`}
                </p>
              )}
              {q.type === 'aperta' && (
                <p className="font-semibold text-blue-400">📖 Risposta modello:</p>
              )}
              <p className="text-text-secondary">{q.explanation}</p>
            </motion.div>
          )}

          {/* CTA */}
          {!isSubmitted ? (
            <button
              onClick={() => handleSubmit(q.id)}
              disabled={q.type !== 'aperta' && !userAnswer}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00b894] to-[#00cec9] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Conferma risposta
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00b894] to-[#00cec9] text-white text-sm font-semibold"
            >
              {currentQ < questions.length - 1 ? 'Prossima domanda →' : 'Vedi risultati'}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
