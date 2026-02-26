'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  UserCog,
  Upload,
  CalendarClock,
  FileQuestion,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  BookMarked,
} from 'lucide-react';

type View = 'dashboard' | 'onboarding' | 'professor' | 'upload' | 'study-plan' | 'exam' | 'progress' | 'notebook';

interface SidebarProps {
  currentView: View;
  sidebarOpen: boolean;
  onNavigate: (view: View) => void;
  onToggle: () => void;
}

const navItems: { id: View; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Panoramica' },
  { id: 'onboarding', label: 'Nuovo Esame', icon: GraduationCap, description: 'Configura esame' },
  { id: 'professor', label: 'Professore', icon: UserCog, description: 'Crea profilo prof' },
  { id: 'upload', label: 'Materiali', icon: Upload, description: 'Carica file' },
  { id: 'study-plan', label: 'Piano Studio', icon: CalendarClock, description: 'Piano giornaliero' },
  { id: 'exam', label: 'Simulazione', icon: FileQuestion, description: "Simula l'esame" },
  { id: 'notebook', label: 'Notebook AI', icon: BookMarked, description: 'Flashcard, Quiz, Mappe' },
  { id: 'progress', label: 'Progressi', icon: BarChart3, description: 'Statistiche' },
];

export default function Sidebar({ currentView, sidebarOpen, onNavigate, onToggle }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 76 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{
        background: 'rgba(12, 12, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(108, 92, 231, 0.1)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-success border-2 border-bg-primary" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-bold gradient-text tracking-tight">StudyAI</h1>
              <p className="text-[10px] text-text-muted -mt-0.5">Piano studio intelligente</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-accent/15 text-accent-light'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isActive ? 'bg-accent/20' : 'bg-bg-card group-hover:bg-bg-card-hover'
              }`}>
                <Icon size={16} />
              </div>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[10px] text-text-muted">{item.description}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-border">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent-teal/10 border border-accent/20"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-accent-warning" />
                <span className="text-xs font-semibold text-text-primary">Studio Streak</span>
              </div>
              <p className="text-2xl font-bold gradient-text">7 giorni</p>
              <p className="text-[10px] text-text-muted mt-0.5">Continua cosi!</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
