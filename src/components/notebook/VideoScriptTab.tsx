'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Sparkles, RefreshCw, Play, ChevronDown, ChevronRight, Clock, Eye, Mic } from 'lucide-react';
import { generateVideoScript } from '@/lib/api-client';
import type { VideoScriptResponse, VideoScene } from '@/types/api';

// Format seconds → "1:23"
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Single scene card
function SceneCard({ scene, index, isActive, onClick }: {
  scene: VideoScene;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`border rounded-xl overflow-hidden transition-all cursor-pointer ${
        isActive ? 'border-[#fd79a8]/60 bg-[#fd79a8]/5' : 'border-border hover:border-border/80 bg-bg-card/30'
      }`}
      onClick={onClick}
    >
      {/* Scene header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: isActive ? '#fd79a8' : 'rgba(255,255,255,0.06)',
            color: isActive ? 'white' : 'var(--text-muted)',
          }}
        >
          {scene.sceneNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
            {scene.title}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
          <Clock size={11} />
          {formatTime(scene.durationSeconds)}
        </div>
        {isActive ? (
          <ChevronDown size={13} className="text-text-muted shrink-0" />
        ) : (
          <ChevronRight size={13} className="text-text-muted shrink-0" />
        )}
      </div>

      {/* Scene details */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
              {/* Narration */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase tracking-widest font-medium">
                  <Mic size={10} /> Narrazione
                </div>
                <p className="text-text-primary text-sm leading-relaxed bg-bg-card rounded-lg px-3 py-2.5">
                  {scene.narration}
                </p>
              </div>

              {/* Visuals */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted uppercase tracking-widest font-medium">
                  <Eye size={10} /> Visuale
                </div>
                <p className="text-text-secondary text-xs leading-relaxed italic">
                  {scene.visuals}
                </p>
              </div>

              {/* Key points */}
              {scene.keyPoints && scene.keyPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {scene.keyPoints.map((kp, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-[#fd79a8]/30 text-[#fd79a8] bg-[#fd79a8]/5"
                    >
                      {kp}
                    </span>
                  ))}
                </div>
              )}

              {/* Transition */}
              {scene.transition && (
                <p className="text-[10px] text-text-muted">
                  Transizione: <span className="text-text-secondary italic">{scene.transition}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function VideoScriptTab() {
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<3 | 5 | 10>(5);
  const [style, setStyle] = useState<'divulgativo' | 'accademico' | 'storytelling'>('divulgativo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [script, setScript] = useState<VideoScriptResponse | null>(null);
  const [activeScene, setActiveScene] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateVideoScript({ topic, durationMinutes, style });
      setScript(result);
      setActiveScene(result.scenes[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nella generazione');
    } finally {
      setLoading(false);
    }
  };

  const toggleScene = (id: string) =>
    setActiveScene((prev) => (prev === id ? null : id));

  const styleOptions = [
    { id: 'divulgativo', label: 'Divulgativo', icon: '📺', desc: 'Stile YouTube, accessibile' },
    { id: 'accademico', label: 'Accademico', icon: '🎓', desc: 'Lezione universitaria' },
    { id: 'storytelling', label: 'Storytelling', icon: '📖', desc: 'Narrativo e coinvolgente' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Video size={18} className="text-[#00cec9]" />
          <h2 className="font-semibold text-text-primary">Genera Script Video</h2>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Argomento *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Come funziona il DNA, La crisi finanziaria del 2008, I buchi neri..."
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Duration selector */}
        <div>
          <label className="text-xs text-text-muted mb-1 block">Durata del video</label>
          <div className="flex gap-2">
            {([3, 5, 10] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDurationMinutes(d)}
                className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  durationMinutes === d
                    ? 'bg-[#00cec9] text-white border-[#00cec9]'
                    : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Style selector */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">Stile di presentazione</label>
          <div className="grid grid-cols-3 gap-2">
            {styleOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`p-3 rounded-xl text-left text-xs transition-all border ${
                  style === s.id
                    ? 'bg-[#00cec9]/15 border-[#00cec9]/50 text-text-primary'
                    : 'bg-bg-card border-border text-text-muted hover:border-[#00cec9]/30 hover:text-text-secondary'
                }`}
              >
                <div className="text-base mb-1">{s.icon}</div>
                <div className="font-medium">{s.label}</div>
                <div className="text-text-muted mt-0.5 leading-tight">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00cec9] to-[#0984e3] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta scrivendo lo script...</>
          ) : (
            <><Sparkles size={16} /> Genera Script {durationMinutes} min</>
          )}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Script display */}
      {script && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Video header */}
          <div
            className="glass-card p-6 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(0,206,201,0.08), rgba(9,132,227,0.1))' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#00cec9]/20 flex items-center justify-center shrink-0">
                <Play size={18} className="text-[#00cec9]" />
              </div>
              <div>
                <p className="text-[10px] text-[#00cec9] uppercase tracking-widest font-medium mb-1">
                  {script.style} · {script.scenes.length} scene · {formatTime(script.totalDurationSeconds)}
                </p>
                <h2 className="text-xl font-bold text-text-primary leading-tight">{script.title}</h2>
              </div>
            </div>

            {/* Hook */}
            <div className="bg-bg-card rounded-xl px-4 py-3 border border-border">
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-1.5">
                🎣 Hook di apertura
              </p>
              <p className="text-text-primary text-sm font-medium italic">
                &ldquo;{script.hook}&rdquo;
              </p>
            </div>
          </div>

          {/* Timeline progress bar */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-text-muted">0:00</span>
            <div className="flex-1 flex h-2 rounded-full overflow-hidden gap-px">
              {script.scenes.map((scene, i) => {
                const pct = (scene.durationSeconds / script.totalDurationSeconds) * 100;
                const hues = ['#fd79a8', '#a29bfe', '#00cec9', '#00b894', '#fdcb6e', '#e17055', '#0984e3'];
                return (
                  <div
                    key={scene.id}
                    style={{ width: `${pct}%`, background: hues[i % hues.length] }}
                    title={`${scene.title} (${formatTime(scene.durationSeconds)})`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-text-muted">{formatTime(script.totalDurationSeconds)}</span>
          </div>

          {/* Scenes */}
          <div className="space-y-2">
            {script.scenes.map((scene, i) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={i}
                isActive={activeScene === scene.id}
                onClick={() => toggleScene(scene.id)}
              />
            ))}
          </div>

          {/* Closing line */}
          {script.closingLine && (
            <div className="glass-card px-5 py-4 border border-[#00cec9]/20">
              <p className="text-[10px] text-[#00cec9] uppercase tracking-widest font-medium mb-1.5">
                🎬 Frase finale
              </p>
              <p className="text-text-primary text-sm italic">&ldquo;{script.closingLine}&rdquo;</p>
            </div>
          )}

          {/* Production notes */}
          {script.productionNotes.length > 0 && (
            <div className="glass-card p-5">
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-3">
                🎥 Note di produzione
              </p>
              <ul className="space-y-1.5">
                {script.productionNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="text-[#00cec9] shrink-0 mt-0.5">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-text-muted text-right">
            Generato da Gemini · {new Date(script.generatedAt).toLocaleString('it-IT')}
          </p>
        </motion.div>
      )}
    </div>
  );
}
