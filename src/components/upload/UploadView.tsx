'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  File,
  FileText,
  Image,
  Music,
  Video,
  X,
  Check,
  FolderOpen,
  Sparkles,
  BookOpen,
  FileQuestion,
  StickyNote,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { StudyMaterial } from '@/types';

// ==========================================
// TYPES
// ==========================================

interface UploadViewProps {
  materials: StudyMaterial[];
  onUpload: (material: StudyMaterial) => void;
  onRemove: (id: string) => void;
}

type MaterialType = StudyMaterial['type'];

interface PendingFile {
  file: File;
  selectedType: MaterialType | null;
}

interface UploadingFile {
  id: string;
  fileName: string;
  fileSize: number;
  type: MaterialType;
  progress: number;
}

// ==========================================
// CONSTANTS
// ==========================================

const MATERIAL_TYPES: { type: MaterialType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { type: 'libro',         label: 'Libro',         icon: BookOpen,     color: '#6c5ce7', bg: 'rgba(108, 92, 231, 0.15)' },
  { type: 'dispensa',      label: 'Dispensa',      icon: FileText,     color: '#00cec9', bg: 'rgba(0, 206, 201, 0.15)' },
  { type: 'appunti',       label: 'Appunti',       icon: StickyNote,   color: '#fdcb6e', bg: 'rgba(253, 203, 110, 0.15)' },
  { type: 'slide',         label: 'Slide',         icon: Image,        color: '#fd79a8', bg: 'rgba(253, 121, 168, 0.15)' },
  { type: 'video',         label: 'Video',         icon: Video,        color: '#e17055', bg: 'rgba(225, 112, 85, 0.15)' },
  { type: 'audio',         label: 'Audio',         icon: Music,        color: '#00b894', bg: 'rgba(0, 184, 148, 0.15)' },
  { type: 'esame_passato', label: 'Esame Passato', icon: FileQuestion, color: '#ff7675', bg: 'rgba(255, 118, 117, 0.15)' },
  { type: 'esercizi',      label: 'Esercizi',      icon: File,         color: '#a29bfe', bg: 'rgba(162, 155, 254, 0.15)' },
  { type: 'altro',         label: 'Altro',         icon: FolderOpen,   color: '#636e72', bg: 'rgba(99, 110, 114, 0.15)' },
];

const ACCEPTED_FORMATS = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.mp3,.mp4,.wav,.m4a,.zip,.rar';

// ==========================================
// HELPERS
// ==========================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getMaterialMeta(type: MaterialType) {
  return MATERIAL_TYPES.find((m) => m.type === type) ?? MATERIAL_TYPES[MATERIAL_TYPES.length - 1];
}

function getTotalSize(materials: StudyMaterial[]): number {
  return materials.reduce((acc, m) => acc + m.fileSize, 0);
}

function getTypesBreakdown(materials: StudyMaterial[]): { label: string; count: number; color: string }[] {
  const map = new Map<MaterialType, number>();
  materials.forEach((m) => {
    map.set(m.type, (map.get(m.type) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([type, count]) => {
    const meta = getMaterialMeta(type);
    return { label: meta.label, count, color: meta.color };
  });
}

// ==========================================
// COMPONENT
// ==========================================

export default function UploadView({ materials, onUpload, onRemove }: UploadViewProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------
  // Drag & Drop handlers
  // ------------------------------------------

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setPendingFile({ file: files[0], selectedType: null });
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPendingFile({ file: files[0], selectedType: null });
    }
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ------------------------------------------
  // Type selection & simulated upload
  // ------------------------------------------

  const selectType = useCallback((type: MaterialType) => {
    setPendingFile((prev) => (prev ? { ...prev, selectedType: type } : null));
  }, []);

  const startUpload = useCallback(() => {
    if (!pendingFile || !pendingFile.selectedType) return;

    const id = uuidv4();
    const uploading: UploadingFile = {
      id,
      fileName: pendingFile.file.name,
      fileSize: pendingFile.file.size,
      type: pendingFile.selectedType,
      progress: 0,
    };

    setUploadingFile(uploading);
    setPendingFile(null);

    // Simulate upload progress over ~2 seconds
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Build material and notify parent
        const material: StudyMaterial = {
          id,
          examId: '',
          type: uploading.type,
          name: uploading.fileName.replace(/\.[^/.]+$/, ''),
          fileName: uploading.fileName,
          fileSize: uploading.fileSize,
          uploadedAt: new Date().toISOString(),
          processed: false,
        };

        setTimeout(() => {
          onUpload(material);
          setUploadingFile(null);
        }, 400);
      }

      setUploadingFile((prev) => (prev ? { ...prev, progress: Math.min(progress, 100) } : null));
    }, 150);
  }, [pendingFile, onUpload]);

  const cancelPending = useCallback(() => {
    setPendingFile(null);
  }, []);

  // ------------------------------------------
  // Derived data
  // ------------------------------------------

  const totalSize = getTotalSize(materials);
  const breakdown = getTypesBreakdown(materials);

  // ------------------------------------------
  // Render
  // ------------------------------------------

  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* ============ HERO ============ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              I Tuoi Materiali di Studio
            </h1>
          </div>
          <p className="text-text-secondary text-base max-w-xl mt-1">
            Carica libri, dispense, appunti, slide, audio e vecchi esami. Il sistema li analizzer&agrave; per creare il tuo piano di studio personalizzato.
          </p>
        </div>

        {/* ============ STATS BAR ============ */}
        {materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-static p-4 flex items-center gap-6 flex-shrink-0"
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{materials.length}</p>
              <p className="text-[11px] text-text-muted uppercase tracking-wider">File</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-light">{formatFileSize(totalSize)}</p>
              <p className="text-[11px] text-text-muted uppercase tracking-wider">Totale</p>
            </div>
            {breakdown.length > 0 && (
              <>
                <div className="w-px h-10 bg-border" />
                <div className="flex gap-2 flex-wrap">
                  {breakdown.map((b) => (
                    <span
                      key={b.label}
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}30` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
                      {b.label} ({b.count})
                    </span>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* ============ DRAG & DROP ZONE ============ */}
      <AnimatePresence mode="wait">
        {!pendingFile && !uploadingFile && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative cursor-pointer group mb-10"
          >
            {/* Outer glow on drag */}
            <div
              className="rounded-2xl p-[2px] transition-all duration-500"
              style={{
                background: isDragOver
                  ? 'linear-gradient(135deg, #6c5ce7, #00cec9, #fd79a8)'
                  : 'transparent',
              }}
            >
              <div
                className="rounded-2xl p-12 md:p-16 flex flex-col items-center justify-center text-center transition-all duration-500"
                style={{
                  background: isDragOver
                    ? 'rgba(108, 92, 231, 0.08)'
                    : 'rgba(26, 26, 46, 0.5)',
                  border: isDragOver ? 'none' : '2px dashed rgba(108, 92, 231, 0.25)',
                  boxShadow: isDragOver
                    ? '0 0 60px rgba(108, 92, 231, 0.2), inset 0 0 60px rgba(108, 92, 231, 0.05)'
                    : 'none',
                }}
              >
                {/* Floating cloud icon */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="mb-6"
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500"
                    style={{
                      background: isDragOver
                        ? 'linear-gradient(135deg, #6c5ce7, #00cec9)'
                        : 'rgba(108, 92, 231, 0.15)',
                      boxShadow: isDragOver
                        ? '0 8px 30px rgba(108, 92, 231, 0.4)'
                        : '0 4px 15px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <Upload
                      size={36}
                      className="transition-colors duration-500"
                      style={{ color: isDragOver ? '#ffffff' : '#a29bfe' }}
                    />
                  </div>
                </motion.div>

                <h3
                  className="text-xl font-semibold mb-2 transition-colors duration-300"
                  style={{ color: isDragOver ? '#a29bfe' : '#f5f5f7' }}
                >
                  {isDragOver ? 'Rilascia per caricare!' : 'Trascina i file qui'}
                </h3>

                {/* Divider */}
                <div className="flex items-center gap-4 my-4 w-full max-w-xs">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-text-muted text-sm">oppure</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="glow-button px-8 py-3 text-sm font-semibold rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <span className="flex items-center gap-2">
                    <FolderOpen size={16} />
                    Seleziona File
                  </span>
                </motion.div>

                <p className="text-text-muted text-xs mt-5">
                  PDF, DOCX, PPTX, TXT, JPG, PNG, MP3, MP4, ZIP &mdash; max 100MB
                </p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS}
              onChange={handleFileInput}
              className="hidden"
            />
          </motion.div>
        )}

        {/* ============ TYPE SELECTOR ============ */}
        {pendingFile && !uploadingFile && (
          <motion.div
            key="type-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass-card-static p-8 mb-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles size={18} className="text-accent-light" />
                  Seleziona il tipo di materiale
                </h3>
                <p className="text-text-secondary text-sm mt-1">
                  File selezionato:{' '}
                  <span className="text-accent-light font-medium">{pendingFile.file.name}</span>
                  <span className="text-text-muted ml-2">({formatFileSize(pendingFile.file.size)})</span>
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={cancelPending}
                className="w-8 h-8 rounded-lg bg-bg-card hover:bg-accent-danger/20 flex items-center justify-center text-text-muted hover:text-accent-danger transition-colors"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Type Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-8">
              {MATERIAL_TYPES.map((mt, i) => {
                const Icon = mt.icon;
                const isSelected = pendingFile.selectedType === mt.type;
                return (
                  <motion.button
                    key={mt.type}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectType(mt.type)}
                    className="relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300"
                    style={{
                      background: isSelected ? `${mt.color}20` : 'rgba(26, 26, 46, 0.6)',
                      border: isSelected
                        ? `2px solid ${mt.color}`
                        : '2px solid rgba(108, 92, 231, 0.1)',
                      boxShadow: isSelected
                        ? `0 0 20px ${mt.color}30, 0 4px 12px rgba(0,0,0,0.2)`
                        : '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="typeCheck"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: mt.color }}
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: mt.bg }}
                    >
                      <Icon size={20} style={{ color: mt.color }} />
                    </div>
                    <span
                      className="text-xs font-medium text-center leading-tight"
                      style={{ color: isSelected ? mt.color : '#a0a0b8' }}
                    >
                      {mt.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Confirm button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: pendingFile.selectedType ? 1.03 : 1 }}
                whileTap={{ scale: pendingFile.selectedType ? 0.97 : 1 }}
                onClick={startUpload}
                disabled={!pendingFile.selectedType}
                className="glow-button px-8 py-3 text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                style={{
                  filter: pendingFile.selectedType ? 'none' : 'grayscale(1)',
                }}
              >
                <Upload size={16} />
                Carica Materiale
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ============ UPLOAD PROGRESS ============ */}
        {uploadingFile && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass-card-static p-8 mb-10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                {(() => {
                  const meta = getMaterialMeta(uploadingFile.type);
                  const Icon = meta.icon;
                  return <Icon size={24} style={{ color: meta.color }} />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-text-primary truncate">
                  {uploadingFile.fileName}
                </h4>
                <p className="text-xs text-text-muted">
                  {formatFileSize(uploadingFile.fileSize)} &middot; {getMaterialMeta(uploadingFile.type).label}
                </p>
              </div>
              <span className="text-lg font-bold gradient-text">
                {Math.round(uploadingFile.progress)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-bg-card overflow-hidden">
              <motion.div
                className="h-full rounded-full progress-shimmer"
                initial={{ width: 0 }}
                animate={{ width: `${uploadingFile.progress}%` }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>

            {uploadingFile.progress >= 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-3"
              >
                <div className="w-5 h-5 rounded-full bg-accent-success/20 flex items-center justify-center">
                  <Check size={12} className="text-accent-success" />
                </div>
                <span className="text-sm text-accent-success font-medium">
                  Caricamento completato!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MATERIALS LIBRARY ============ */}
      {materials.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={20} className="text-accent-light" />
            <h2 className="text-xl font-semibold text-text-primary">Libreria Materiali</h2>
            <span className="tag">{materials.length} {materials.length === 1 ? 'file' : 'file'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {materials.map((material, index) => {
                const meta = getMaterialMeta(material.type);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={material.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -10 }}
                    transition={{ delay: index * 0.05, duration: 0.35, type: 'spring', stiffness: 300, damping: 25 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="glass-card p-5 relative group"
                  >
                    {/* Delete button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemove(material.id)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-bg-card/80 hover:bg-accent-danger/20 flex items-center justify-center text-text-muted hover:text-accent-danger transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </motion.button>

                    {/* Icon */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: meta.bg }}
                      >
                        <Icon size={22} style={{ color: meta.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-text-primary truncate leading-tight">
                          {material.name}
                        </h4>
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          {material.fileName}
                        </p>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                      <span>{formatFileSize(material.fileSize)}</span>
                      <span className="w-1 h-1 rounded-full bg-text-muted" />
                      <span>{formatDate(material.uploadedAt)}</span>
                    </div>

                    {/* Footer tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: `${meta.color}15`,
                          color: meta.color,
                          border: `1px solid ${meta.color}25`,
                        }}
                      >
                        <Icon size={11} />
                        {meta.label}
                      </span>

                      {material.processed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-accent-success/15 text-accent-success border border-accent-success/25">
                          <Check size={11} />
                          Elaborato
                        </span>
                      )}

                      {material.pages && (
                        <span className="text-[11px] text-text-muted">
                          {material.pages} pag.
                        </span>
                      )}
                      {material.chapters && (
                        <span className="text-[11px] text-text-muted">
                          {material.chapters} cap.
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ============ EMPTY STATE ============ */}
      {materials.length === 0 && !pendingFile && !uploadingFile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-bg-card mx-auto mb-4 flex items-center justify-center">
            <FolderOpen size={28} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-text-secondary mb-1">
            Nessun materiale caricato
          </h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Inizia caricando i tuoi libri, appunti o slide per permettere al sistema di creare un piano di studio ottimale.
          </p>
        </motion.div>
      )}
    </div>
  );
}
