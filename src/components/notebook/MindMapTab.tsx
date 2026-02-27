'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { generateMindMap } from '@/lib/api-client';
import type { MindMapNode } from '@/types/api';

// Recursive node renderer
function MapNode({ node, depth = 0 }: { node: MindMapNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = (node.children?.length ?? 0) > 0;

  const dotSize = depth === 0 ? 14 : depth === 1 ? 11 : 8;
  const fontSize = depth === 0 ? 18 : depth === 1 ? 15 : depth === 2 ? 13 : 12;
  const fontWeight = depth <= 1 ? 600 : 400;
  const textColor =
    depth === 0 ? 'var(--text-primary)' : depth === 1 ? 'var(--text-primary)' : 'var(--text-secondary)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth * 0.04, duration: 0.25 }}
      className="select-none"
    >
      <div
        className={`flex items-start gap-2 py-1.5 group ${hasChildren ? 'cursor-pointer' : ''}`}
        onClick={() => hasChildren && setOpen((o) => !o)}
      >
        {/* Arrow + Dot */}
        <div className="flex items-center gap-1 shrink-0 mt-1">
          {hasChildren ? (
            <span className="text-text-muted w-3 inline-flex justify-center">
              {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </span>
          ) : (
            <span className="w-3" />
          )}
          <div
            className="rounded-full shrink-0"
            style={{
              width: dotSize,
              height: dotSize,
              background: node.color || '#6c5ce7',
              boxShadow: depth === 0 ? `0 0 8px ${node.color || '#6c5ce7'}66` : undefined,
            }}
          />
        </div>

        {/* Label + description */}
        <div className="flex-1 min-w-0">
          <span
            style={{ fontSize, fontWeight, color: textColor }}
            className={`leading-snug ${hasChildren && depth > 0 ? 'group-hover:text-white transition-colors' : ''}`}
          >
            {node.label}
          </span>
          {node.description && depth > 0 && (
            <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{node.description}</p>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="children"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="ml-7 pl-3 border-l-2 overflow-hidden"
              style={{ borderColor: node.color ? `${node.color}35` : 'rgba(108,92,231,0.2)' }}
            >
              {node.children!.map((child) => (
                <MapNode key={child.id} node={child} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export default function MindMapTab() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [root, setRoot] = useState<MindMapNode | null>(null);
  const [mapTopic, setMapTopic] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateMindMap({ topic, depth });
      setRoot(result.root);
      setMapTopic(topic);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nella generazione');
    } finally {
      setLoading(false);
    }
  };

  const depthLabels = ['', '', 'Sintetica (2 livelli)', 'Standard (3 livelli)', 'Dettagliata (4 livelli)'];

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Network size={18} className="text-[#0984e3]" />
          <h2 className="font-semibold text-text-primary">Genera Mappa Mentale</h2>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Argomento *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Sistema nervoso, Rivoluzione industriale, Algoritmi di sorting..."
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">
            Profondità: {depthLabels[depth]}
          </label>
          <input
            type="range"
            min={2}
            max={4}
            step={1}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full accent-[#0984e3]"
          />
          <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
            <span>Sintetica</span>
            <span>Dettagliata</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#0984e3] to-[#6c5ce7] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta generando...</>
          ) : (
            <><Sparkles size={16} /> Genera Mappa Mentale</>
          )}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Map display */}
      {root && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-text-primary">{mapTopic}</h3>
            <span className="text-xs text-text-muted bg-bg-card border border-border rounded-lg px-2 py-1">
              Clicca i nodi per espandere
            </span>
          </div>
          <MapNode node={root} depth={0} />
        </motion.div>
      )}
    </div>
  );
}
