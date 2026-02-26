'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Sparkles, RefreshCw, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { generatePresentation } from '@/lib/api-client';
import type { Slide } from '@/types/api';

// ---- Single slide renderer ----
function SlideCard({ slide, showNotes }: { slide: Slide; showNotes: boolean }) {
  const isTitleSlide = slide.type === 'title';
  const isSummary = slide.type === 'summary';

  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card p-8 min-h-[300px] flex flex-col rounded-2xl"
      style={{
        background: isTitleSlide
          ? 'linear-gradient(135deg, rgba(253,121,168,0.08), rgba(108,92,231,0.1))'
          : isSummary
          ? 'linear-gradient(135deg, rgba(108,92,231,0.08), rgba(0,206,201,0.08))'
          : undefined,
      }}
    >
      {/* Top meta */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
          {slide.type}
        </span>
        <span className="text-xs bg-bg-card border border-border rounded-lg px-2 py-0.5 text-text-muted">
          {slide.slideNumber}
        </span>
      </div>

      {/* Title */}
      <h2
        className={`font-bold leading-tight mb-5 ${
          isTitleSlide ? 'text-3xl gradient-text' : 'text-xl text-text-primary'
        }`}
      >
        {slide.title}
      </h2>

      {/* Body */}
      <div className="flex-1">
        {slide.content && !slide.bullets && !slide.keyPoints && (
          <p className="text-text-secondary leading-relaxed">{slide.content}</p>
        )}

        {slide.bullets && slide.bullets.length > 0 && (
          <ul className="space-y-3">
            {slide.bullets.map((b, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 text-text-secondary"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ background: '#fd79a8' }}
                />
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>
        )}

        {slide.keyPoints && slide.keyPoints.length > 0 && (
          <div className="grid gap-2">
            {slide.keyPoints.map((kp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20"
              >
                <span className="text-accent font-bold text-sm w-5 shrink-0 text-center">{i + 1}</span>
                <span className="text-text-primary text-sm">{kp}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Speaker notes */}
      {showNotes && slide.speakerNotes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 pt-4 border-t border-border"
        >
          <p className="text-xs text-text-muted italic">
            <MessageSquare size={11} className="inline mr-1 opacity-60" />
            {slide.speakerNotes}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ---- Main component ----
export default function PresentationTab() {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(8);
  const [style, setStyle] = useState<'accademico' | 'semplice' | 'dettagliato'>('accademico');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [title, setTitle] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generatePresentation({ topic, slideCount, style });
      setSlides(result.slides);
      setTitle(result.title);
      setCurrentSlide(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nella generazione');
    } finally {
      setLoading(false);
    }
  };

  const goTo = (i: number) =>
    setCurrentSlide(Math.min(Math.max(i, 0), slides.length - 1));

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Monitor size={18} className="text-[#fd79a8]" />
          <h2 className="font-semibold text-text-primary">Genera Presentazione</h2>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Argomento *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Il Rinascimento italiano, Reti neurali, Economia circolare..."
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex gap-6 flex-wrap items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-text-muted mb-1 block">Slide: {slideCount}</label>
            <input
              type="range"
              min={4}
              max={16}
              step={2}
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              className="w-full accent-[#fd79a8]"
            />
            <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
              <span>4</span><span>16</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Stile</label>
            <div className="flex gap-1.5">
              {(['semplice', 'accademico', 'dettagliato'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    style === s
                      ? 'bg-[#fd79a8] text-white'
                      : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#fd79a8] to-[#6c5ce7] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta generando...</>
          ) : (
            <><Sparkles size={16} /> Genera {slideCount} Slide</>
          )}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Presentation player */}
      {slides.length > 0 && (
        <div className="space-y-4">
          {/* Presentation header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary truncate max-w-sm">{title}</h3>
              <p className="text-xs text-text-muted">
                {slides.length} slide · ~{slides.length * 2} min presentazione
              </p>
            </div>
            <button
              onClick={() => setShowNotes((n) => !n)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                showNotes
                  ? 'bg-accent/15 border-accent/40 text-accent-light'
                  : 'bg-bg-card border-border text-text-muted hover:text-text-secondary'
              }`}
            >
              <MessageSquare size={12} /> Note
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 flex-wrap">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === currentSlide ? 24 : 8,
                  height: 8,
                  background:
                    i === currentSlide
                      ? '#fd79a8'
                      : i < currentSlide
                      ? 'rgba(253,121,168,0.35)'
                      : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          {/* Slide */}
          <AnimatePresence mode="wait">
            <SlideCard
              key={slides[currentSlide].id}
              slide={slides[currentSlide]}
              showNotes={showNotes}
            />
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <motion.button
              onClick={() => goTo(currentSlide - 1)}
              disabled={currentSlide === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <ChevronLeft size={16} /> Precedente
            </motion.button>

            <span className="text-sm text-text-muted tabular-nums">
              {currentSlide + 1} / {slides.length}
            </span>

            <motion.button
              onClick={() => goTo(currentSlide + 1)}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg-card border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Successiva <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
