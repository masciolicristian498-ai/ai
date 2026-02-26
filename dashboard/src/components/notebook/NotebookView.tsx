'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Brain, Network, Table2, Monitor } from 'lucide-react';
import FlashcardsTab from './FlashcardsTab';
import QuizTab from './QuizTab';
import MindMapTab from './MindMapTab';
import TableTab from './TableTab';
import PresentationTab from './PresentationTab';

type NotebookTab = 'flashcards' | 'quiz' | 'mindmap' | 'table' | 'presentation';

const tabs: {
  id: NotebookTab;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}[] = [
  { id: 'flashcards', label: 'Flashcard', icon: Layers, color: '#6c5ce7', description: 'Ripasso rapido' },
  { id: 'quiz', label: 'Quiz', icon: Brain, color: '#00b894', description: 'Verifica le conoscenze' },
  { id: 'mindmap', label: 'Mappa Mentale', icon: Network, color: '#0984e3', description: 'Visualizza i concetti' },
  { id: 'table', label: 'Tabella', icon: Table2, color: '#e17055', description: 'Organizza e confronta' },
  { id: 'presentation', label: 'Presentazione', icon: Monitor, color: '#fd79a8', description: 'Studia per slide' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function NotebookView() {
  const [activeTab, setActiveTab] = useState<NotebookTab>('flashcards');
  const activeColor = tabs.find((t) => t.id === activeTab)?.color ?? '#6c5ce7';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold gradient-text">Notebook AI</h1>
        <p className="text-text-muted text-sm mt-1">
          Genera strumenti di studio personalizzati con Gemini AI
        </p>
      </motion.div>

      {/* Tab bar */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'bg-bg-card text-text-secondary hover:text-text-primary hover:bg-bg-card-hover border-border'
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${tab.color}cc, ${tab.color}88)`,
                      borderColor: `${tab.color}66`,
                    }
                  : {}
              }
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Active tab description */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs text-text-muted"
        style={{ borderColor: `${activeColor}30`, background: `${activeColor}08` }}
      >
        <span style={{ color: activeColor }}>●</span>
        {tabs.find((t) => t.id === activeTab)?.description}
        {' — '}inserisci un argomento e Gemini genererà il contenuto in pochi secondi.
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={itemVariants}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {activeTab === 'flashcards' && <FlashcardsTab />}
            {activeTab === 'quiz' && <QuizTab />}
            {activeTab === 'mindmap' && <MindMapTab />}
            {activeTab === 'table' && <TableTab />}
            {activeTab === 'presentation' && <PresentationTab />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
