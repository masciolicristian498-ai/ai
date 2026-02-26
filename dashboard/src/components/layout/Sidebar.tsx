'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  BookMarked,
  BarChart3,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Home,
} from 'lucide-react';
import type { Professor } from '@/types';
import type { AppView } from '@/store/useStore';

interface SidebarProps {
  currentView: AppView;
  selectedProfessorId: string | null;
  sidebarOpen: boolean;
  professors: Professor[];
  onNavigate: (view: AppView) => void;
  onSelectProfessor: (id: string) => void;
  onCreateProfessor: () => void;
  onToggle: () => void;
  studyStreak: number;
}

const bottomNav: { id: AppView; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'notebook', label: 'Notebook AI', icon: BookMarked, description: 'Flashcard, Quiz, Mappe' },
  { id: 'progress', label: 'Progressi', icon: BarChart3, description: 'Statistiche' },
  { id: 'upload', label: 'Materiali', icon: Upload, description: 'Carica file' },
];

export default function Sidebar({
  currentView,
  selectedProfessorId,
  sidebarOpen,
  professors,
  onNavigate,
  onSelectProfessor,
  onCreateProfessor,
  onToggle,
  studyStreak,
}: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 68 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        background: 'rgba(10, 10, 15, 0.97)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(108, 92, 231, 0.12)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-border flex-shrink-0">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-success border-2 border-bg-primary" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <h1 className="text-base font-bold gradient-text tracking-tight leading-none">StudyAI</h1>
              <p className="text-[9px] text-text-muted mt-0.5">Piano studio intelligente</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Home button */}
      <div className="px-2 pt-3 flex-shrink-0">
        <motion.button
          onClick={() => onNavigate('home')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 ${
            currentView === 'home' || currentView === 'create-professor'
              ? 'bg-accent/15 text-accent-light'
              : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/60'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
            currentView === 'home' ? 'bg-accent/25' : 'bg-bg-card'
          }`}>
            <Home size={14} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Home
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Professors section */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {/* Section header */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-2 pt-2 pb-1"
            >
              I miei professori
            </motion.p>
          )}
        </AnimatePresence>

        {/* Professor items */}
        {professors.map((prof) => {
          const isActive = selectedProfessorId === prof.id && currentView === 'chat';
          const color = prof.color || '#6c5ce7';
          const emoji = prof.emoji || '🎓';

          return (
            <motion.button
              key={prof.id}
              onClick={() => onSelectProfessor(prof.id)}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 relative group"
              style={{
                background: isActive ? `${color}18` : 'transparent',
                border: isActive ? `1px solid ${color}30` : '1px solid transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeProf"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ background: color }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  background: `${color}20`,
                  border: `1px solid ${color}30`,
                }}
              >
                {emoji}
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-xs font-semibold text-text-primary truncate leading-tight">{prof.name}</p>
                    <p className="text-[10px] text-text-muted truncate" style={{ color: isActive ? color : undefined }}>
                      {prof.subject || prof.department || 'Materia'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Add professor button */}
        <motion.button
          onClick={onCreateProfessor}
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-text-muted hover:text-accent transition-all duration-200 group"
        >
          <div className="w-7 h-7 rounded-lg bg-bg-card group-hover:bg-accent/15 flex items-center justify-center flex-shrink-0 transition-colors border border-dashed border-border group-hover:border-accent/40">
            <Plus size={13} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                Aggiungi professore
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Divider */}
        {professors.length > 0 && (
          <div className="my-2 mx-2 border-t border-border" />
        )}

        {/* Bottom nav items */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-2 pt-1 pb-1"
            >
              Strumenti
            </motion.p>
          )}
        </AnimatePresence>

        {bottomNav.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-accent/15 text-accent-light'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-accent/25' : 'bg-bg-card'
              }`}>
                <Icon size={13} />
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                    <span className="text-[9px] text-text-muted">{item.description}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="p-2 border-t border-border flex-shrink-0">
        <AnimatePresence>
          {sidebarOpen && studyStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 px-3 py-2 rounded-xl bg-gradient-to-br from-accent/10 to-accent-teal/10 border border-accent/20"
            >
              <div className="flex items-center gap-1.5">
                <Zap size={11} className="text-accent-warning" />
                <span className="text-[10px] font-bold text-text-primary">{studyStreak} giorni streak</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
