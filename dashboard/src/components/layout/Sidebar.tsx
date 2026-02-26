'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  BookMarked,
  BarChart3,
  Upload,
  ChevronLeft,
  ChevronRight,
  Zap,
  Home,
  GraduationCap,
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
      animate={{ width: sidebarOpen ? 248 : 64 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        background: '#0a0f1c',
        borderRight: '1px solid rgba(16,185,129,0.1)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3.5 h-14 border-b flex-shrink-0" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
        <div className="relative flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#000' }}
          >
            S
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-primary"
            style={{ background: '#10b981' }} />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <h1 className="text-sm font-extrabold tracking-tight gradient-text leading-none">StudyAI</h1>
              <p className="text-[9px] mt-0.5" style={{ color: '#4a5568' }}>Piano studio intelligente</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Home button */}
      <div className="px-2 pt-3 flex-shrink-0">
        <motion.button
          onClick={() => onNavigate('home')}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 relative"
          style={{
            background: currentView === 'home' || currentView === 'create-professor'
              ? 'rgba(16,185,129,0.1)'
              : 'transparent',
            color: currentView === 'home' || currentView === 'create-professor'
              ? '#6ee7b7'
              : '#8899b0',
          }}
        >
          {(currentView === 'home' || currentView === 'create-professor') && (
            <motion.div
              layoutId="sidebarActivePill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
              style={{ background: 'linear-gradient(180deg,#10b981,#06b6d4)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: currentView === 'home' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
            }}
          >
            <Home size={15} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-semibold"
              >
                Home
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Professors section */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {/* Section label */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 pt-3 pb-1.5"
              style={{ color: '#4a5568' }}
            >
              Professori
            </motion.p>
          )}
        </AnimatePresence>

        {/* Professor items */}
        {professors.map((prof) => {
          const isActive = selectedProfessorId === prof.id && currentView === 'chat';
          const color = prof.color || '#10b981';
          const emoji = prof.emoji || '🎓';

          return (
            <motion.button
              key={prof.id}
              onClick={() => onSelectProfessor(prof.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 relative"
              style={{
                background: isActive ? `${color}14` : 'transparent',
                color: isActive ? color : '#8899b0',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeProfPill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: `linear-gradient(180deg,${color},${color}88)` }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  fontSize: '15px',
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
                    <p className="text-xs font-semibold truncate leading-tight" style={{ color: isActive ? color : '#e2e8f0' }}>
                      {prof.name}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: '#4a5568' }}>
                      {prof.subject || prof.department || 'Materia'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* Add professor */}
        <motion.button
          onClick={onCreateProfessor}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 group"
          style={{ color: '#4a5568' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-dashed transition-colors group-hover:border-green-500/40"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <Plus size={13} className="group-hover:text-green-400 transition-colors" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium group-hover:text-green-400 transition-colors"
              >
                Aggiungi professore
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Divider */}
        <div className="mx-2 my-2 border-t" style={{ borderColor: 'rgba(16,185,129,0.08)' }} />

        {/* Tools section */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 pt-1 pb-1.5"
              style={{ color: '#4a5568' }}
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
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 relative"
              style={{
                background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                color: isActive ? '#6ee7b7' : '#8899b0',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg,#10b981,#06b6d4)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)' }}
              >
                <Icon size={14} />
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-xs font-semibold leading-tight">{item.label}</span>
                    <span className="text-[9px]" style={{ color: '#4a5568' }}>{item.description}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom footer */}
      <div className="p-2 border-t flex-shrink-0" style={{ borderColor: 'rgba(16,185,129,0.08)' }}>
        <AnimatePresence>
          {sidebarOpen && studyStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <div className="flex items-center gap-1.5">
                <Zap size={10} style={{ color: '#fbbf24' }} />
                <span className="text-[10px] font-bold" style={{ color: '#e2e8f0' }}>
                  {studyStreak} giorni streak
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sidebarOpen && (
          <div className="flex justify-center mb-2">
            <GraduationCap size={14} style={{ color: '#4a5568' }} />
          </div>
        )}

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg transition-colors"
          style={{ color: '#4a5568' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a5568')}
        >
          {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </motion.aside>
  );
}
