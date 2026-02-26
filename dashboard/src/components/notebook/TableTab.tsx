'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Table2, Sparkles, RefreshCw, Download } from 'lucide-react';
import { generateTable } from '@/lib/api-client';
import type { TableData } from '@/types/api';

const TABLE_TYPE_OPTIONS = [
  { id: 'auto', label: 'Automatico', desc: 'Gemini sceglie il tipo migliore', icon: '✨' },
  { id: 'confronto', label: 'Confronto', desc: 'Metti a confronto più elementi', icon: '⚖️' },
  { id: 'definizioni', label: 'Definizioni', desc: 'Termini e significati', icon: '📖' },
  { id: 'timeline', label: 'Timeline', desc: 'Ordine cronologico degli eventi', icon: '📅' },
  { id: 'proprieta', label: 'Proprietà', desc: 'Attributi e valori', icon: '🔬' },
] as const;

type TableType = typeof TABLE_TYPE_OPTIONS[number]['id'];

export default function TableTab() {
  const [topic, setTopic] = useState('');
  const [tableType, setTableType] = useState<TableType>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [table, setTable] = useState<TableData | null>(null);
  const [tableTopic, setTableTopic] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateTable({ topic, tableType });
      setTable(result.table);
      setTableTopic(topic);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nella generazione');
    } finally {
      setLoading(false);
    }
  };

  // Copy as CSV for easy export
  const copyAsCSV = () => {
    if (!table) return;
    const rows = [table.headers, ...table.rows];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    navigator.clipboard.writeText(csv).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Table2 size={18} className="text-[#e17055]" />
          <h2 className="font-semibold text-text-primary">Genera Tabella di Studio</h2>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Argomento *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. Tipi di contratti, Fasi della mitosi, Correnti filosofiche..."
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-text-muted mb-2 block">Tipo di tabella</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TABLE_TYPE_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTableType(t.id)}
                className={`p-3 rounded-xl text-left text-xs transition-all border ${
                  tableType === t.id
                    ? 'bg-[#e17055]/15 border-[#e17055]/50 text-text-primary'
                    : 'bg-bg-card border-border text-text-muted hover:border-[#e17055]/30 hover:text-text-secondary'
                }`}
              >
                <div className="text-base mb-1">{t.icon}</div>
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-text-muted mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#e17055] to-[#fd79a8] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta generando...</>
          ) : (
            <><Sparkles size={16} /> Genera Tabella</>
          )}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Table display */}
      {table && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          {/* Table header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-text-primary">{table.title}</h3>
              <p className="text-text-muted text-xs mt-0.5">{table.description}</p>
            </div>
            <button
              onClick={copyAsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-text-muted hover:text-text-secondary text-xs transition-colors shrink-0"
              title="Copia come CSV"
            >
              <Download size={12} /> CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'rgba(108,92,231,0.06)' }}>
                  {table.headers.map((header, i) => (
                    <th
                      key={i}
                      className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-border"
                      style={{
                        color: i === (table.keyColumn ?? 0) ? '#e17055' : 'var(--text-secondary)',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <motion.tr
                    key={ri}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ri * 0.04 }}
                    className="border-b border-border/40 hover:bg-bg-card/60 transition-colors"
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-3 align-top"
                        style={{
                          color:
                            ci === (table.keyColumn ?? 0)
                              ? 'var(--text-primary)'
                              : 'var(--text-secondary)',
                          fontWeight: ci === (table.keyColumn ?? 0) ? 600 : 400,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-text-muted mt-3">
            Generata da Gemini · {table.rows.length} righe · argomento: {tableTopic}
          </p>
        </motion.div>
      )}
    </div>
  );
}
