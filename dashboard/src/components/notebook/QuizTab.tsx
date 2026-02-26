'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { generateQuiz } from '@/lib/api-client';
import type { QuizQuestion } from '@/types/api';

type Phase = 'setup' | 'quiz' | 'results';

interface QuizTabProps {
  accentColor?: string;
  accentGradient?: string;
}

export default function QuizTab({
  accentColor = '#10b981',
  accentGradient = 'linear-gradient(135deg,#047857,#10b981)',
}: QuizTabProps) {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'base' | 'medio' | 'avanzato'>('medio');
  const [types, setTypes] = useState<('multipla' | 'vera_falsa' | 'aperta')[]>(['multipla', 'vera_falsa', 'aperta']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<Phase>('setup');

  const toggleType = (t: 'multipla' | 'vera_falsa' | 'aperta') =>
    setTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

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

  const handleSubmit = (qId: string) => setSubmitted((prev) => ({ ...prev, [qId]: true }));
  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ((i) => i + 1);
    else setPhase('results');
  };

  const computeScore = () =>
    questions.reduce((score, q) => {
      if (!submitted[q.id]) return score;
      const answer = userAnswers[q.id] || '';
      if (q.type !== 'aperta') return score + (answer === q.correctAnswer ? (q.points || 1) : 0);
      return score + (answer.trim().length > 15 ? Math.floor((q.points || 3) / 2) : 0);
    }, 0);

  const difficultyColors = { base: '#4ade80', medio: accentColor, avanzato: '#f87171' };

  // RESULTS
  if (phase === 'results') {
    const score = computeScore();
    const pct = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const grade = pct >= 90 ? '30L' : pct >= 80 ? '29–30' : pct >= 70 ? '27–28' : pct >= 60 ? '24–26' : pct >= 50 ? '21–23' : '< 21';
    const emoji = pct >= 70 ? '🎉 Ottimo!' : pct >= 50 ? '📚 Buono, continua.' : '💪 Riprova!';
    const gradeColor = pct >= 70 ? '#4ade80' : pct >= 50 ? accentColor : '#f87171';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-10 text-center space-y-6"
        style={{ background: '#0d1220', border: `1px solid ${accentColor}28` }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: `${gradeColor}18`, border: `1px solid ${gradeColor}30` }}
        >
          <Trophy size={40} style={{ color: gradeColor }} />
        </div>
        <div>
          <h2 className="text-5xl font-black mb-1" style={{ color: gradeColor }}>{pct}%</h2>
          <p className="text-sm" style={{ color: '#8899b0' }}>
            {score} / {totalPoints} punti · voto stimato:{' '}
            <strong style={{ color: '#e2e8f0' }}>{grade}</strong>
          </p>
        </div>
        <div className="h-3 rounded-full overflow-hidden max-w-xs mx-auto" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg,${gradeColor},${gradeColor}88)`, boxShadow: `0 0 12px ${gradeColor}` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>
        <p className="text-base font-semibold" style={{ color: '#e2e8f0' }}>{emoji}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setPhase('setup'); setQuestions([]); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#8899b0' }}
          >
            Nuovo Quiz
          </button>
          <button
            onClick={() => { setCurrentQ(0); setSubmitted({}); setUserAnswers({}); setPhase('quiz'); }}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: accentGradient, boxShadow: `0 4px 16px ${accentColor}40` }}
          >
            Riprova
          </button>
        </div>
      </motion.div>
    );
  }

  // SETUP
  if (phase === 'setup') {
    return (
      <div className="rounded-2xl p-6 space-y-5" style={{ background: '#0d1220', border: `1px solid ${accentColor}28` }}>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: accentColor }}>
            Argomento
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Teoria dei giochi, Diritto Penale, Matematica discreta..."
            className="w-full rounded-xl px-4 py-3.5 text-sm"
            style={{ background: '#111827', border: `1px solid ${accentColor}30`, color: '#e2e8f0', outline: 'none' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}18`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = `${accentColor}30`; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="flex gap-5 flex-wrap items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#8899b0' }}>
              Domande: <span style={{ color: accentColor }} className="font-bold">{questionCount}</span>
            </label>
            <input
              type="range" min={3} max={15} step={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor }}
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: '#4a5568' }}>
              <span>3</span><span>15</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#8899b0' }}>Difficoltà</label>
            <div className="flex gap-1.5">
              {(['base', 'medio', 'avanzato'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={
                    difficulty === d
                      ? { background: difficultyColors[d], color: '#000', boxShadow: `0 2px 12px ${difficultyColors[d]}55` }
                      : { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#8899b0' }
                  }
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: '#8899b0' }}>Tipi di domanda</label>
          <div className="flex gap-2 flex-wrap">
            {(['multipla', 'vera_falsa', 'aperta'] as const).map((t) => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all border"
                style={
                  types.includes(t)
                    ? { background: `${accentColor}18`, borderColor: `${accentColor}50`, color: accentColor }
                    : { background: '#111827', borderColor: 'rgba(255,255,255,0.08)', color: '#4a5568' }
                }
              >
                {t === 'multipla' ? '◉ Scelta multipla' : t === 'vera_falsa' ? '◎ Vero / Falso' : '✏ Risposta aperta'}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading || types.length === 0}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: accentGradient, color: '#fff', boxShadow: loading ? 'none' : `0 4px 20px ${accentColor}40` }}
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta generando...</>
          ) : (
            <><Sparkles size={16} /> Genera {questionCount} Domande</>
          )}
        </motion.button>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            ⚠ {error}
          </p>
        )}
      </div>
    );
  }

  // QUIZ
  const q = questions[currentQ];
  const isSubmitted = submitted[q.id];
  const userAnswer = userAnswers[q.id] || '';
  const isCorrect = q.type !== 'aperta' && isSubmitted && userAnswer === q.correctAnswer;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: '#8899b0' }}>
          Domanda {currentQ + 1} di {questions.length}
        </span>
        <button
          onClick={() => setPhase('setup')}
          className="text-xs px-2.5 py-1 rounded-lg transition-colors"
          style={{ background: '#111827', color: '#4a5568', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          ✕ Esci
        </button>
      </div>

      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: accentGradient }}
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
          className="rounded-2xl p-6 space-y-5"
          style={{ background: '#0d1220', border: `1px solid ${accentColor}22` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div
                className="inline-flex text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
                style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
              >
                {q.topic} · {q.type.replace('_', '/')} · {q.difficulty}
              </div>
              <p className="text-base font-bold leading-snug" style={{ color: '#e2e8f0' }}>{q.text}</p>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
              style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
            >
              {q.points || 1}pt
            </span>
          </div>

          {/* Multiple choice / True-False */}
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
                    className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all font-medium"
                    style={
                      isCorrectOpt ? { background: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.4)', color: '#4ade80' }
                        : isWrongOpt ? { background: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.4)', color: '#f87171' }
                        : isSelected ? { background: `${accentColor}18`, borderColor: `${accentColor}50`, color: accentColor }
                        : { background: '#111827', borderColor: 'rgba(255,255,255,0.07)', color: '#8899b0' }
                    }
                  >
                    <span className="flex items-center gap-2">
                      {isCorrectOpt && <CheckCircle2 size={13} className="shrink-0" style={{ color: '#4ade80' }} />}
                      {isWrongOpt && <XCircle size={13} className="shrink-0" style={{ color: '#f87171' }} />}
                      {!isCorrectOpt && !isWrongOpt && (
                        <span
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[9px] font-black"
                          style={{ borderColor: isSelected ? accentColor : 'rgba(255,255,255,0.15)' }}
                        />
                      )}
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
              onChange={(e) => !isSubmitted && setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              disabled={isSubmitted}
              placeholder="Scrivi la tua risposta..."
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none disabled:opacity-60"
              style={{
                background: '#111827',
                border: `1px solid ${accentColor}30`,
                color: '#e2e8f0',
                outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = `${accentColor}30`; }}
            />
          )}

          {/* Feedback */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 text-sm space-y-1"
              style={
                q.type === 'aperta'
                  ? { background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }
                  : isCorrect
                  ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }
                  : { background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }
              }
            >
              {q.type !== 'aperta' && (
                <p className="font-bold" style={{ color: isCorrect ? '#4ade80' : '#f87171' }}>
                  {isCorrect ? '✓ Corretto!' : `✗ Sbagliato — Risposta: "${q.correctAnswer}"`}
                </p>
              )}
              {q.type === 'aperta' && <p className="font-bold" style={{ color: '#60a5fa' }}>📖 Risposta modello:</p>}
              <p style={{ color: '#8899b0' }}>{q.explanation}</p>
            </motion.div>
          )}

          {!isSubmitted ? (
            <motion.button
              onClick={() => handleSubmit(q.id)}
              disabled={q.type !== 'aperta' && !userAnswer}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: accentGradient, color: '#fff', boxShadow: `0 4px 16px ${accentColor}35` }}
            >
              Conferma risposta
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: accentGradient, color: '#fff', boxShadow: `0 4px 16px ${accentColor}35` }}
            >
              {currentQ < questions.length - 1 ? 'Prossima domanda →' : '🏆 Vedi risultati'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
