'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, RotateCcw, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { generateFlashcards } from '@/lib/api-client';
import type { Flashcard } from '@/types/api';

type CardStatus = 'unknown' | 'known' | 'skipped';

interface FlashcardsTabProps {
  accentColor?: string;
  accentGradient?: string;
}

export default function FlashcardsTab({
  accentColor = '#a855f7',
  accentGradient = 'linear-gradient(135deg,#7c3aed,#a855f7)',
}: FlashcardsTabProps) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'base' | 'medio' | 'avanzato'>('medio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, CardStatus>>({});

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateFlashcards({ topic, count, difficulty });
      setFlashcards(result.flashcards);
      setCurrentIndex(0);
      setFlipped(false);
      setStatuses({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nella generazione');
    } finally {
      setLoading(false);
    }
  };

  const goTo = (index: number) => { setFlipped(false); setTimeout(() => setCurrentIndex(index), 50); };
  const goNext = () => { if (currentIndex < flashcards.length - 1) goTo(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) goTo(currentIndex - 1); };
  const markCard = (status: CardStatus) => {
    setStatuses((prev) => ({ ...prev, [flashcards[currentIndex].id]: status }));
    goNext();
  };

  const knownCount = Object.values(statuses).filter((s) => s === 'known').length;
  const unknownCount = Object.values(statuses).filter((s) => s === 'unknown').length;
  const currentCard = flashcards[currentIndex];
  const difficultyColors = { base: '#4ade80', medio: accentColor, avanzato: '#f87171' };

  return (
    <div className="space-y-5">
      {/* Config form */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{ background: '#0d1220', border: `1px solid ${accentColor}28` }}
      >
        <div>
          <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: accentColor }}>
            Argomento
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Diritto dei Contratti, Macroeconomia, Calcolo integrale..."
            className="w-full rounded-xl px-4 py-3.5 text-sm"
            style={{
              background: '#111827',
              border: `1px solid ${accentColor}30`,
              color: '#e2e8f0',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}18`; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = `${accentColor}30`; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <div className="flex gap-5 flex-wrap items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#8899b0' }}>
              Carte: <span style={{ color: accentColor }} className="font-bold">{count}</span>
            </label>
            <input
              type="range" min={5} max={25} step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor }}
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: '#4a5568' }}>
              <span>5</span><span>25</span>
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

        <motion.button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: accentGradient, color: '#fff', boxShadow: loading ? 'none' : `0 4px 20px ${accentColor}40` }}
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta generando...</>
          ) : (
            <><Sparkles size={16} /> Genera {count} Flashcard</>
          )}
        </motion.button>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            ⚠ {error}
          </p>
        )}
      </div>

      {/* Flashcard player */}
      {flashcards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#4ade80' }}>
                <CheckCircle2 size={13} /> {knownCount} sapute
              </span>
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#f87171' }}>
                <XCircle size={13} /> {unknownCount} da rivedere
              </span>
            </div>
            <span className="text-sm font-bold" style={{ color: '#e2e8f0' }}>
              {currentIndex + 1} <span style={{ color: '#4a5568' }}>/ {flashcards.length}</span>
            </span>
          </div>

          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: accentGradient }}
              animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>

          {/* Card flip */}
          <div
            className="relative cursor-pointer select-none"
            style={{ perspective: 1400 }}
            onClick={() => setFlipped((f) => !f)}
          >
            <motion.div
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative min-h-[260px]"
            >
              {/* Front */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-2xl p-8"
                style={{
                  background: '#111827',
                  border: `1px solid ${accentColor}22`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div
                  className="text-[9px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
                  style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}
                >
                  {currentCard.topic} · {currentCard.difficulty}
                </div>
                <p className="text-xl font-bold leading-relaxed" style={{ color: '#e2e8f0' }}>
                  {currentCard.front}
                </p>
                <p className="text-xs mt-6 flex items-center gap-1.5" style={{ color: '#4a5568' }}>
                  <RotateCcw size={11} /> Tocca per vedere la risposta
                </p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-2xl p-8"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}14, ${accentColor}06)`,
                  border: `1px solid ${accentColor}40`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  boxShadow: `0 0 40px ${accentColor}18`,
                }}
              >
                <div
                  className="text-[9px] font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
                  style={{ background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}45` }}
                >
                  Risposta
                </div>
                <p className="text-lg leading-relaxed font-medium" style={{ color: '#e2e8f0' }}>
                  {currentCard.back}
                </p>
                {currentCard.hint && (
                  <p className="text-xs mt-5 italic px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: '#8899b0' }}>
                    💡 {currentCard.hint}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Action buttons */}
          <AnimatePresence mode="wait">
            {flipped ? (
              <motion.div
                key="know-buttons"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <motion.button
                  onClick={() => markCard('unknown')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(248,113,113,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <XCircle size={15} /> Non sapevo
                </motion.button>
                <motion.button
                  onClick={() => markCard('known')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 16px rgba(74,222,128,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <CheckCircle2 size={15} /> Sapevo!
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="nav-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-3"
              >
                <motion.button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#8899b0' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ChevronLeft size={16} /> Prec.
                </motion.button>

                <motion.button
                  onClick={() => setFlipped(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}35`, color: accentColor }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <RotateCcw size={13} /> Gira
                </motion.button>

                <motion.button
                  onClick={goNext}
                  disabled={currentIndex === flashcards.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#8899b0' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Succ. <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dot navigation */}
          <div className="flex gap-1.5 justify-center flex-wrap pt-1">
            {flashcards.map((card, i) => {
              const status = statuses[card.id];
              return (
                <motion.button
                  key={card.id}
                  onClick={() => goTo(i)}
                  whileHover={{ scale: 1.3 }}
                  className="rounded-full transition-all"
                  style={{
                    width: i === currentIndex ? 22 : 8,
                    height: 8,
                    background:
                      status === 'known' ? '#4ade80'
                        : status === 'unknown' ? '#f87171'
                        : i === currentIndex ? accentColor
                        : 'rgba(255,255,255,0.08)',
                    boxShadow: i === currentIndex ? `0 0 8px ${accentColor}` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
