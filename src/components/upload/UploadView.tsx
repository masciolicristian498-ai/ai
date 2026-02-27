'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, File, FileText, Image, Music, Video, X, Check,
  FolderOpen, Sparkles, BookOpen, FileQuestion, StickyNote, Library,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { StudyMaterial } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────
interface UploadViewProps {
  materials: StudyMaterial[];
  onUpload: (material: StudyMaterial) => void;
  onRemove: (id: string) => void;
}
type MaterialType = StudyMaterial['type'];
interface PendingFile  { file: File; selectedType: MaterialType | null }
interface UploadingFile { id: string; fileName: string; fileSize: number; type: MaterialType; progress: number }

// ─── Constants ────────────────────────────────────────────────────────
const MATERIAL_TYPES: { type: MaterialType; label: string; icon: React.ElementType; color: string; bg: string; emoji: string }[] = [
  { type: 'libro',         label: 'Libro',         icon: BookOpen,     color: '#6c5ce7', bg: 'rgba(108,92,231,0.15)',  emoji: '📕' },
  { type: 'dispensa',      label: 'Dispensa',      icon: FileText,     color: '#00cec9', bg: 'rgba(0,206,201,0.15)',   emoji: '📄' },
  { type: 'appunti',       label: 'Appunti',       icon: StickyNote,   color: '#fdcb6e', bg: 'rgba(253,203,110,0.15)', emoji: '✏️' },
  { type: 'slide',         label: 'Slide',         icon: Image,        color: '#fd79a8', bg: 'rgba(253,121,168,0.15)', emoji: '🖼️' },
  { type: 'video',         label: 'Video',         icon: Video,        color: '#e17055', bg: 'rgba(225,112,85,0.15)',  emoji: '🎬' },
  { type: 'audio',         label: 'Audio',         icon: Music,        color: '#00b894', bg: 'rgba(0,184,148,0.15)',   emoji: '🎧' },
  { type: 'esame_passato', label: 'Esame Passato', icon: FileQuestion, color: '#ff7675', bg: 'rgba(255,118,117,0.15)', emoji: '📝' },
  { type: 'esercizi',      label: 'Esercizi',      icon: File,         color: '#a29bfe', bg: 'rgba(162,155,254,0.15)', emoji: '🔢' },
  { type: 'altro',         label: 'Altro',         icon: FolderOpen,   color: '#636e72', bg: 'rgba(99,110,114,0.15)',  emoji: '📁' },
];
const ACCEPTED = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.mp3,.mp4,.wav,.m4a,.zip,.rar';

// ─── Helpers ──────────────────────────────────────────────────────────
function fmtSize(bytes: number) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1048576).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}
function getMeta(type: MaterialType) {
  return MATERIAL_TYPES.find((m) => m.type === type) ?? MATERIAL_TYPES[MATERIAL_TYPES.length - 1];
}

// ─── Animated particle ───────────────────────────────────────────────
function Particle({ i, color }: { i: number; color: string }) {
  const angle = (i / 8) * 360;
  const r = 60 + Math.random() * 40;
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{ background: color, top: '50%', left: '50%' }}
      animate={{
        x: Math.cos((angle * Math.PI) / 180) * r,
        y: Math.sin((angle * Math.PI) / 180) * r,
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18, ease: 'easeOut' }}
    />
  );
}

// ─── Drop Zone ───────────────────────────────────────────────────────
function DropZone({ isDrag, onDragOver, onDragLeave, onDrop, onClick }: {
  isDrag: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className="relative cursor-pointer select-none rounded-3xl overflow-hidden mb-8 group"
      style={{
        border: isDrag ? '2px solid rgba(108,92,231,0.8)' : '2px dashed rgba(108,92,231,0.25)',
        background: isDrag ? 'rgba(108,92,231,0.1)' : 'rgba(255,255,255,0.015)',
        transition: 'all 0.35s ease',
        boxShadow: isDrag ? '0 0 60px rgba(108,92,231,0.2), inset 0 0 60px rgba(108,92,231,0.06)' : 'none',
      }}
    >
      {/* Concentric pulsing rings on drag */}
      <AnimatePresence>
        {isDrag && [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ border: '2px solid rgba(108,92,231,0.4)' }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.85, 1.06, 1.15] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </AnimatePresence>

      <div className="relative p-12 md:p-16 flex flex-col items-center">
        {/* Floating icon */}
        <motion.div
          className="relative mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500"
            style={{
              background: isDrag
                ? 'linear-gradient(135deg,#6c5ce7,#00cec9)'
                : 'rgba(108,92,231,0.12)',
              boxShadow: isDrag ? '0 12px 40px rgba(108,92,231,0.5)' : '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <Upload size={40} style={{ color: isDrag ? '#fff' : '#a29bfe', transition: 'color 0.3s' }} />
          </div>
          {/* Particles */}
          <AnimatePresence>
            {isDrag && [...Array(8)].map((_, i) => (
              <Particle key={i} i={i} color={i % 2 === 0 ? '#6c5ce7' : '#00cec9'} />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.h3
          className="text-xl font-bold mb-2 transition-colors duration-300"
          style={{ color: isDrag ? '#a29bfe' : '#f5f5f7' }}
          animate={isDrag ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.8, repeat: isDrag ? Infinity : 0 }}
        >
          {isDrag ? '✨ Rilascia per caricare!' : 'Trascina i tuoi materiali qui'}
        </motion.h3>
        <p className="text-text-muted text-sm mb-6">oppure</p>

        <motion.div
          className="px-8 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg,#6c5ce7,#00cec9)',
            boxShadow: '0 6px 24px rgba(108,92,231,0.4)',
            color: '#fff',
          }}
          whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 32px rgba(108,92,231,0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          <FolderOpen size={16} />
          Seleziona File
        </motion.div>

        <p className="text-text-muted text-xs mt-5 opacity-70">
          PDF · DOCX · PPTX · TXT · JPG · PNG · MP3 · MP4 — max 100MB
        </p>
      </div>
    </motion.div>
  );
}

// ─── Material type picker ────────────────────────────────────────────
function TypePicker({ pendingFile, onSelect, onCancel, onConfirm }: {
  pendingFile: PendingFile;
  onSelect: (t: MaterialType) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      key="type-selector"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24, scale: 0.97 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl p-7 mb-8"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(108,92,231,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-accent-light" />
            <h3 className="text-lg font-bold text-text-primary">Che tipo di materiale è?</h3>
          </div>
          <p className="text-sm text-text-secondary">
            File: <span className="text-accent-light font-semibold">{pendingFile.file.name}</span>
            <span className="text-text-muted ml-2">({fmtSize(pendingFile.file.size)})</span>
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCancel}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-white transition-colors flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <X size={16} />
        </motion.button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-7">
        {MATERIAL_TYPES.map((mt, i) => {
          const Icon = mt.icon;
          const sel = pendingFile.selectedType === mt.type;
          return (
            <motion.button
              key={mt.type}
              initial={{ opacity: 0, scale: 0.75, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(mt.type)}
              className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200"
              style={{
                background: sel ? `${mt.color}22` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${sel ? mt.color : 'rgba(255,255,255,0.07)'}`,
                boxShadow: sel ? `0 0 20px ${mt.color}40, 0 4px 12px rgba(0,0,0,0.2)` : 'none',
              }}
            >
              {sel && (
                <motion.div
                  layoutId="selBadge"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: mt.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check size={11} className="text-white" />
                </motion.div>
              )}
              <div className="text-2xl">{mt.emoji}</div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: mt.bg }}>
                <Icon size={16} style={{ color: mt.color }} />
              </div>
              <span className="text-[11px] font-medium text-center leading-tight"
                style={{ color: sel ? mt.color : '#a0a0b8' }}>
                {mt.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <motion.button
          onClick={onConfirm}
          disabled={!pendingFile.selectedType}
          whileHover={pendingFile.selectedType ? { scale: 1.04, y: -2 } : {}}
          whileTap={pendingFile.selectedType ? { scale: 0.96 } : {}}
          className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold transition-all"
          style={{
            background: pendingFile.selectedType
              ? 'linear-gradient(135deg,#6c5ce7,#00cec9)'
              : 'rgba(108,92,231,0.15)',
            color: pendingFile.selectedType ? '#fff' : '#555',
            boxShadow: pendingFile.selectedType ? '0 8px 28px rgba(108,92,231,0.38)' : 'none',
            cursor: pendingFile.selectedType ? 'pointer' : 'not-allowed',
          }}
        >
          <Upload size={16} />
          Carica Materiale
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Upload progress ─────────────────────────────────────────────────
function UploadProgress({ file }: { file: UploadingFile }) {
  const meta = getMeta(file.type);
  const Icon = meta.icon;
  return (
    <motion.div
      key="uploading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative overflow-hidden rounded-3xl p-7 mb-8"
      style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}30` }}
    >
      {/* Animated background shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${meta.color}12, transparent)`,
          transform: 'skewX(-15deg)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative flex items-center gap-5 mb-5">
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: meta.bg, boxShadow: `0 0 24px ${meta.color}50` }}
          animate={{ rotate: file.progress < 100 ? [0, 5, -5, 0] : 0 }}
          transition={{ duration: 1.5, repeat: file.progress < 100 ? Infinity : 0 }}
        >
          <Icon size={26} style={{ color: meta.color }} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-text-primary truncate">{file.fileName}</h4>
          <p className="text-xs text-text-muted mt-0.5">{fmtSize(file.fileSize)} · {meta.label}</p>
        </div>
        <motion.span
          className="text-2xl font-black tabular-nums"
          style={{ color: meta.color }}
          key={Math.round(file.progress)}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
        >
          {Math.round(file.progress)}%
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)` }}
          animate={{ width: `${file.progress}%` }}
          transition={{ duration: 0.15, ease: 'linear' }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {file.progress >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4"
          >
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#00b894' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check size={14} className="text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-accent-success">Caricamento completato!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────
export default function UploadView({ materials, onUpload, onRemove }: UploadViewProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) setPendingFile({ file: e.dataTransfer.files[0], selectedType: null });
  }, []);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setPendingFile({ file: e.target.files[0], selectedType: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);
  const selectType = useCallback((t: MaterialType) => {
    setPendingFile((p) => p ? { ...p, selectedType: t } : null);
  }, []);
  const startUpload = useCallback(() => {
    if (!pendingFile?.selectedType) return;
    const id = uuidv4();
    const upl: UploadingFile = { id, fileName: pendingFile.file.name, fileSize: pendingFile.file.size, type: pendingFile.selectedType, progress: 0 };
    setUploadingFile(upl);
    setPendingFile(null);
    let prog = 0;
    const iv = setInterval(() => {
      prog += Math.random() * 15 + 5;
      if (prog >= 100) {
        prog = 100;
        clearInterval(iv);
        const mat: StudyMaterial = {
          id, examId: '', type: upl.type,
          name: upl.fileName.replace(/\.[^/.]+$/, ''),
          fileName: upl.fileName, fileSize: upl.fileSize,
          uploadedAt: new Date().toISOString(), processed: false,
        };
        setTimeout(() => { onUpload(mat); setUploadingFile(null); }, 500);
      }
      setUploadingFile((p) => p ? { ...p, progress: Math.min(prog, 100) } : null);
    }, 150);
  }, [pendingFile, onUpload]);

  const totalSize = materials.reduce((a, m) => a + m.fileSize, 0);

  return (
    <div className="space-y-0 pb-12">
      {/* ── Hero header ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl p-7 mb-8"
        style={{
          background: 'linear-gradient(135deg,rgba(108,92,231,0.18),rgba(0,206,201,0.1))',
          border: '1px solid rgba(108,92,231,0.2)',
        }}
      >
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle,#6c5ce7,#00cec9)' }} />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6c5ce7,#00cec9)', boxShadow: '0 0 28px rgba(108,92,231,0.45)' }}>
                <Upload size={22} className="text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text">Materiali di Studio</h1>
            </div>
            <p className="text-text-secondary text-sm max-w-md">
              Carica libri, dispense, appunti, slide, audio e vecchi esami per creare il tuo piano personalizzato.
            </p>
          </div>

          {/* Stats pills */}
          <AnimatePresence>
            {materials.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 flex-shrink-0"
              >
                <div className="flex flex-col items-center px-5 py-3 rounded-2xl"
                  style={{ background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.25)' }}>
                  <span className="text-2xl font-black text-text-primary">{materials.length}</span>
                  <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">File</span>
                </div>
                <div className="flex flex-col items-center px-5 py-3 rounded-2xl"
                  style={{ background: 'rgba(0,206,201,0.12)', border: '1px solid rgba(0,206,201,0.22)' }}>
                  <span className="text-2xl font-black" style={{ color: '#00cec9' }}>{fmtSize(totalSize)}</span>
                  <span className="text-[11px] text-text-muted font-semibold uppercase tracking-wider">Totale</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Hidden file input ─────────────────── */}
      <input ref={fileInputRef} type="file" accept={ACCEPTED} onChange={handleFileInput} className="hidden" />

      {/* ── Drag/Upload/Progress zone ──────────── */}
      <AnimatePresence mode="wait">
        {!pendingFile && !uploadingFile && (
          <DropZone
            key="drop"
            isDrag={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          />
        )}
        {pendingFile && !uploadingFile && (
          <TypePicker
            key="picker"
            pendingFile={pendingFile}
            onSelect={selectType}
            onCancel={() => setPendingFile(null)}
            onConfirm={startUpload}
          />
        )}
        {uploadingFile && (
          <UploadProgress key="progress" file={uploadingFile} />
        )}
      </AnimatePresence>

      {/* ── Material library ──────────────────── */}
      <AnimatePresence>
        {materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <Library size={19} className="text-accent-light" />
              <h2 className="text-lg font-bold text-text-primary">Libreria</h2>
              <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe', border: '1px solid rgba(108,92,231,0.25)' }}>
                {materials.length}
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {materials.map((mat, idx) => {
                  const meta = getMeta(mat.type);
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={mat.id}
                      layout
                      initial={{ opacity: 0, scale: 0.88, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88, y: -10 }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="relative group rounded-2xl overflow-hidden cursor-default"
                      style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: `1px solid ${meta.color}22`,
                      }}
                    >
                      {/* Colored top strip */}
                      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${meta.color},${meta.color}66)` }} />

                      <div className="p-5">
                        {/* Delete button */}
                        <motion.button
                          initial={{ opacity: 0 }}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemove(mat.id)}
                          className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center text-text-muted hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          style={{ background: 'rgba(255,118,117,0.18)', border: '1px solid rgba(255,118,117,0.25)' }}
                        >
                          <X size={13} />
                        </motion.button>

                        {/* Icon + name */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                            style={{ background: meta.bg }}>
                            {meta.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-text-primary truncate leading-tight">{mat.name}</h4>
                            <p className="text-[11px] text-text-muted truncate mt-0.5">{mat.fileName}</p>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-[11px] text-text-muted mb-3">
                          <span>{fmtSize(mat.fileSize)}</span>
                          <span className="w-1 h-1 rounded-full bg-text-muted" />
                          <span>{fmtDate(mat.uploadedAt)}</span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}28` }}>
                            <Icon size={10} />
                            {meta.label}
                          </span>
                          {mat.processed && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent-success/15 text-accent-success border border-accent-success/25">
                              <Check size={10} />
                              Elaborato
                            </span>
                          )}
                          {mat.pages && <span className="text-[11px] text-text-muted">{mat.pages} pag.</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ───────────────────────── */}
      <AnimatePresence>
        {materials.length === 0 && !pendingFile && !uploadingFile && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <motion.div
              className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.18)' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FolderOpen size={32} className="text-accent-light opacity-60" />
            </motion.div>
            <h3 className="text-base font-bold text-text-secondary mb-2">Nessun materiale ancora</h3>
            <p className="text-sm text-text-muted max-w-xs mx-auto">
              Carica libri, appunti o slide per iniziare a costruire il tuo piano di studio.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
