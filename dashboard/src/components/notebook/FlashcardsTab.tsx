'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, ChevronLeft, ChevronRight, RotateCcw, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { generateFlashcards } from '@/lib/api-client';
import type { Flashcard } from '@/types/api';

type CardStatus = 'unknown' | 'known' | 'skipped';

export default function FlashcardsTab() {
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

  const goTo = (index: number) => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex(index), 50);
  };

  const goNext = () => {
    if (currentIndex < flashcards.length - 1) goTo(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const markCard = (status: CardStatus) => {
    setStatuses((prev) => ({ ...prev, [flashcards[currentIndex].id]: status }));
    goNext();
  };

  const knownCount = Object.values(statuses).filter((s) => s === 'known').length;
  const unknownCount = Object.values(statuses).filter((s) => s === 'unknown').length;
  const currentCard = flashcards[currentIndex];

  return (
    <div className="space-y-6">
      {/* Config form */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={18} className="text-accent" />
          <h2 className="font-semibold text-text-primary">Genera Flashcard</h2>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Argomento *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Diritto dei Contratti, Macroeconomia, Calcolo integrale..."
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex gap-6 flex-wrap items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-text-muted mb-1 block">Numero di carte: {count}</label>
            <input
              type="range"
              min={5}
              max={25}
              step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-[#6c5ce7]"
            />
            <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
              <span>5</span><span>25</span>
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
                      ? 'bg-accent text-white'
                      : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="glow-button w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Gemini sta generando...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Genera {count} Flashcard
            </>
          )}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Flashcard Player */}
      {flashcards.length > 0 && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 size={12} /> {knownCount} sapute
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <XCircle size={12} /> {unknownCount} da rivedere
              </span>
            </div>
            <span className="text-text-secondary text-sm font-medium">
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-bg-card rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent-teal rounded-full"
              animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Card flip */}
          <div
            className="relative cursor-pointer select-none"
            style={{ perspective: 1200 }}
            onClick={() => setFlipped((f) => !f)}
          >
            <motion.div
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative min-h-[240px]"
            >
              {/* Front */}
              <div
                className="absolute inset-0 glass-card p-8 flex flex-col items-center justify-center text-center rounded-2xl"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="text-[10px] text-text-muted mb-3 uppercase tracking-widest font-medium">
                  {currentCard.topic} · {currentCard.difficulty}
                </div>
                <p className="text-xl font-semibold text-text-primary leading-relaxed">
                  {currentCard.front}
                </p>
                <p className="text-xs text-text-muted mt-5 opacity-60">↗ Tocca per vedere la risposta</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 glass-card p-8 flex flex-col items-center justify-center text-center rounded-2xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.12), rgba(0,206,201,0.08))',
                }}
              >
                <div className="text-[10px] text-accent mb-3 uppercase tracking-widest font-medium">
                  Risposta
                </div>
                <p className="text-lg text-text-primary leading-relaxed">{currentCard.back}</p>
                {currentCard.hint && (
                  <p className="text-xs text-text-muted mt-4 italic">💡 {currentCard.hint}</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Action buttons */}
          {flipped ? (
            <div className="flex gap-3">
              <motion.button
                onClick={() => markCard('unknown')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <XCircle size={15} /> Non sapevo
              </motion.button>
              <motion.button
                onClick={() => markCard('known')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <CheckCircle2 size={15} /> Sapevo!
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <motion.button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <ChevronLeft size={16} /> Prec.
              </motion.button>

              <button
                onClick={() => setFlipped(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent-light text-sm"
              >
                <RotateCcw size={13} /> Gira
              </button>

              <motion.button
                onClick={goNext}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Succ. <ChevronRight size={16} />
              </motion.button>
            </div>
          )}

          {/* Dot navigation */}
          <div className="flex gap-1 justify-center flex-wrap pt-1">
            {flashcards.map((card, i) => {
              const status = statuses[card.id];
              return (
                <button
                  key={card.id}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === currentIndex ? 20 : 8,
                    height: 8,
                    background:
                      status === 'known'
                        ? '#00b894'
                        : status === 'unknown'
                        ? '#d63031'
                        : i === currentIndex
                        ? '#6c5ce7'
                        : 'rgba(255,255,255,0.1)',
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
