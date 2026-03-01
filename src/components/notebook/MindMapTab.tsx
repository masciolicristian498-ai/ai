'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Sparkles, RefreshCw, ChevronDown, ChevronRight, GitBranch, List } from 'lucide-react';
import { generateMindMap } from '@/lib/api-client';
import type { MindMapNode } from '@/types/api';

// ==========================================
// TREE VIEW (collapsible)
// ==========================================

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

// ==========================================
// VISUAL SVG VIEW
// ==========================================

const PALETTE = ['#6c5ce7', '#0984e3', '#00cec9', '#00b894', '#e17055', '#fd79a8', '#fdcb6e', '#a29bfe', '#d63031'];

interface NodePosition {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  color: string;
  depth: number;
  parentId: string | null;
  description?: string;
}

function layoutNodes(root: MindMapNode): NodePosition[] {
  const W = 880;
  const H = 580;
  const cx = W / 2;
  const cy = H / 2;
  const positions: NodePosition[] = [];

  positions.push({
    id: root.id, x: cx, y: cy, r: 36,
    label: root.label, color: root.color || PALETTE[0],
    depth: 0, parentId: null, description: root.description,
  });

  const lvl1 = root.children ?? [];
  const R1 = Math.min(175, Math.max(110, lvl1.length * 24));

  lvl1.forEach((child, i) => {
    const angle = (2 * Math.PI * i) / lvl1.length - Math.PI / 2;
    const color = child.color || PALETTE[(i + 1) % PALETTE.length];
    const x1 = cx + R1 * Math.cos(angle);
    const y1 = cy + R1 * Math.sin(angle);

    positions.push({ id: child.id, x: x1, y: y1, r: 22, label: child.label, color, depth: 1, parentId: root.id, description: child.description });

    const lvl2 = child.children ?? [];
    const R2 = Math.min(100, Math.max(72, lvl2.length * 15));
    const away = Math.atan2(y1 - cy, x1 - cx);
    const spread2 = Math.PI * 0.8;

    lvl2.forEach((gc, j) => {
      const t = lvl2.length === 1 ? 0.5 : j / (lvl2.length - 1);
      const gcAngle = away - spread2 / 2 + t * spread2;
      const x2 = x1 + R2 * Math.cos(gcAngle);
      const y2 = y1 + R2 * Math.sin(gcAngle);
      positions.push({ id: gc.id, x: x2, y: y2, r: 14, label: gc.label, color, depth: 2, parentId: child.id, description: gc.description });

      const lvl3 = gc.children ?? [];
      const R3 = 58;
      const away3 = Math.atan2(y2 - y1, x2 - x1);
      const spread3 = Math.PI * 0.55;

      lvl3.forEach((ggc, k) => {
        const t3 = lvl3.length === 1 ? 0.5 : k / (lvl3.length - 1);
        const ggcAngle = away3 - spread3 / 2 + t3 * spread3;
        positions.push({
          id: ggc.id,
          x: x2 + R3 * Math.cos(ggcAngle),
          y: y2 + R3 * Math.sin(ggcAngle),
          r: 9, label: ggc.label, color, depth: 3, parentId: gc.id, description: ggc.description,
        });
      });
    });
  });

  return positions;
}

function MindMapCanvas({ root }: { root: MindMapNode }) {
  const positions = layoutNodes(root);
  const posById = new Map(positions.map((p) => [p.id, p]));

  const pad = 70;
  const allX = positions.map((p) => p.x);
  const allY = positions.map((p) => p.y);
  const minX = Math.min(...allX) - pad;
  const minY = Math.min(...allY) - pad;
  const maxX = Math.max(...allX) + pad;
  const maxY = Math.max(...allY) + pad;
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  return (
    <div
      className="overflow-auto rounded-xl border border-border"
      style={{ background: 'rgba(15,12,30,0.6)', maxHeight: 480 }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox={`${minX} ${minY} ${svgW} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection lines */}
        {positions
          .filter((p) => p.parentId !== null)
          .map((p) => {
            const parent = posById.get(p.parentId!);
            if (!parent) return null;
            const mx = (parent.x + p.x) / 2;
            const my = (parent.y + p.y) / 2;
            return (
              <path
                key={`line-${p.id}`}
                d={`M ${parent.x} ${parent.y} Q ${mx} ${my} ${p.x} ${p.y}`}
                stroke={p.color}
                strokeWidth={p.depth === 1 ? 2 : 1.5}
                strokeOpacity={p.depth === 1 ? 0.5 : 0.35}
                fill="none"
              />
            );
          })}

        {/* Nodes */}
        {positions.map((p) => {
          const maxChars = p.depth === 0 ? 20 : p.depth === 1 ? 15 : 12;
          const label = p.label.length > maxChars ? p.label.slice(0, maxChars - 1) + '…' : p.label;
          const fontSize = p.depth === 0 ? 12 : p.depth === 1 ? 10 : 8.5;
          const fontWeight = p.depth <= 1 ? '600' : '400';
          const labelY = p.y + p.r + fontSize + 4;

          return (
            <g key={p.id}>
              {p.description && <title>{p.label}: {p.description}</title>}
              {/* Glow ring for root */}
              {p.depth === 0 && (
                <circle cx={p.x} cy={p.y} r={p.r + 8} fill={`${p.color}18`} />
              )}
              {/* Main circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.r}
                fill={`${p.color}20`}
                stroke={p.color}
                strokeWidth={p.depth === 0 ? 2.5 : 1.5}
              />
              {/* Inner fill for root */}
              {p.depth === 0 && (
                <circle cx={p.x} cy={p.y} r={p.r * 0.6} fill={`${p.color}30`} />
              )}
              {/* Label below circle */}
              <text
                x={p.x}
                y={labelY}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={fontWeight}
                fill={p.depth === 0 ? p.color : p.depth === 1 ? '#e2e8f0' : '#94a3b8'}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function MindMapTab() {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [root, setRoot] = useState<MindMapNode | null>(null);
  const [mapTopic, setMapTopic] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'visual'>('visual');

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

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-bg-card border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('visual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'visual'
                    ? 'bg-[#0984e3] text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <GitBranch size={12} />
                Visuale
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'tree'
                    ? 'bg-[#0984e3] text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <List size={12} />
                Albero
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'visual' ? (
              <motion.div
                key="visual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MindMapCanvas root={root} />
                <p className="text-[10px] text-text-muted mt-2 text-center">
                  Passa il mouse sui nodi per i dettagli · Scrolla per esplorare
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="tree"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-text-muted mb-3">Clicca i nodi per espandere</p>
                <MapNode node={root} depth={0} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
