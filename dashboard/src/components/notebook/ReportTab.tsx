'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, RefreshCw, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { generateReport } from '@/lib/api-client';
import type { ReportResponse, ReportSection } from '@/types/api';

// Single section with expand/collapse for long content
function SectionBlock({ section, index }: { section: ReportSection; index: number }) {
  const [open, setOpen] = useState(index < 2);
  const isSubsection = section.level === 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border rounded-xl overflow-hidden transition-colors ${
        isSubsection ? 'border-border/50 ml-4' : 'border-border'
      }`}
    >
      {/* Section header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-3 text-left transition-colors ${
          isSubsection ? 'bg-bg-card/40' : 'bg-bg-card hover:bg-bg-card-hover'
        }`}
      >
        <span
          className={`font-semibold ${
            isSubsection ? 'text-sm text-text-secondary' : 'text-text-primary'
          }`}
        >
          {section.title}
        </span>
        {open ? (
          <ChevronDown size={14} className="text-text-muted shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-text-muted shrink-0" />
        )}
      </button>

      {/* Section content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 space-y-3">
              <p className="text-text-secondary text-sm leading-relaxed">{section.content}</p>
              {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
                    Punti chiave
                  </p>
                  <ul className="space-y-1">
                    {section.keyPoints.map((kp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="text-[#a29bfe] mt-0.5 shrink-0">▸</span>
                        {kp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ReportTab() {
  const [topic, setTopic] = useState('');
  const [reportType, setReportType] = useState<'saggio' | 'relazione' | 'analisi' | 'riassunto'>('analisi');
  const [length, setLength] = useState<'breve' | 'medio' | 'lungo'>('medio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateReport({ topic, reportType, length });
      setReport(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore nella generazione');
    } finally {
      setLoading(false);
    }
  };

  const copyFullReport = () => {
    if (!report) return;
    const text = [
      report.title,
      '',
      'Abstract',
      report.abstract,
      '',
      ...report.sections.flatMap((s) => [
        s.title,
        s.content,
        '',
      ]),
      'Bibliografia',
      ...report.bibliography,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const typeOptions = [
    { id: 'analisi', label: 'Analisi', icon: '🔍', desc: 'Analisi critica approfondita' },
    { id: 'saggio', label: 'Saggio', icon: '✍️', desc: 'Tesi e argomentazione' },
    { id: 'relazione', label: 'Relazione', icon: '📊', desc: 'Metodologia e risultati' },
    { id: 'riassunto', label: 'Riassunto', icon: '📝', desc: 'Sintesi dei concetti chiave' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-[#a29bfe]" />
          <h2 className="font-semibold text-text-primary">Genera Report</h2>
        </div>

        <div>
          <label className="text-xs text-text-muted mb-1 block">Argomento *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="es. L'influenza del Rinascimento sulla scienza moderna, La crisi del 2008..."
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Type selector */}
        <div>
          <label className="text-xs text-text-muted mb-2 block">Tipo di documento</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {typeOptions.map((t) => (
              <button
                key={t.id}
                onClick={() => setReportType(t.id)}
                className={`p-3 rounded-xl text-left text-xs transition-all border ${
                  reportType === t.id
                    ? 'bg-[#a29bfe]/15 border-[#a29bfe]/50 text-text-primary'
                    : 'bg-bg-card border-border text-text-muted hover:border-[#a29bfe]/30 hover:text-text-secondary'
                }`}
              >
                <div className="text-base mb-1">{t.icon}</div>
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-text-muted mt-0.5 leading-tight">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div>
          <label className="text-xs text-text-muted mb-1 block">Lunghezza</label>
          <div className="flex gap-2">
            {([
              { id: 'breve', label: 'Breve', sub: '~500 parole' },
              { id: 'medio', label: 'Medio', sub: '~1000 parole' },
              { id: 'lungo', label: 'Lungo', sub: '~2000 parole' },
            ] as const).map((l) => (
              <button
                key={l.id}
                onClick={() => setLength(l.id)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs text-center transition-all border ${
                  length === l.id
                    ? 'bg-[#a29bfe] text-white border-[#a29bfe]'
                    : 'bg-bg-card border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="font-semibold">{l.label}</div>
                <div className={`mt-0.5 ${length === l.id ? 'text-white/70' : 'text-text-muted'}`}>
                  {l.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#a29bfe] to-[#6c5ce7] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><RefreshCw size={16} className="animate-spin" /> Gemini sta scrivendo...</>
          ) : (
            <><Sparkles size={16} /> Genera Report</>
          )}
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>

      {/* Report display */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Header card */}
          <div
            className="glass-card p-6 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(162,155,254,0.08), rgba(108,92,231,0.1))' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-[10px] text-[#a29bfe] uppercase tracking-widest font-medium mb-2">
                  {report.reportType} · {report.wordCount} parole stimate
                </div>
                <h2 className="text-xl font-bold text-text-primary leading-tight">{report.title}</h2>
                <p className="text-text-secondary text-sm mt-3 leading-relaxed italic">
                  {report.abstract}
                </p>
              </div>
              <button
                onClick={copyFullReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card border border-border text-text-muted hover:text-text-secondary text-xs transition-colors shrink-0"
                title="Copia tutto il testo"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Copiato!' : 'Copia'}
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-2">
            {report.sections.map((section, i) => (
              <SectionBlock key={section.id} section={section} index={i} />
            ))}
          </div>

          {/* Bibliography */}
          {report.bibliography.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-xs text-text-muted uppercase tracking-widest font-semibold mb-3">
                📚 Bibliografia
              </h3>
              <ul className="space-y-1.5">
                {report.bibliography.map((ref, i) => (
                  <li key={i} className="text-xs text-text-secondary pl-4 relative">
                    <span className="absolute left-0 text-text-muted">[{i + 1}]</span>
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-text-muted text-right">
            Generato da Gemini · {new Date(report.generatedAt).toLocaleString('it-IT')}
          </p>
        </motion.div>
      )}
    </div>
  );
}
