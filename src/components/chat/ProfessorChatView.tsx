'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Layers,
  Brain,
  Network,
  Table2,
  Monitor,
  FileText,
  FileQuestion,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { differenceInDays, parseISO, isValid } from 'date-fns';
import type { Professor, ChatMessage } from '@/types';

interface ProfessorChatViewProps {
  professor: Professor;
  onBack: () => void;
  onAddMessage: (professorId: string, message: Omit<ChatMessage, 'id'>) => void;
  onClearHistory: (professorId: string) => void;
  onNavigate: (view: string) => void;
}

const TOOLS = [
  { id: 'flashcards', label: 'Flashcard', icon: Layers, color: '#6c5ce7', view: 'notebook', hint: 'Genera flashcard' },
  { id: 'quiz', label: 'Quiz', icon: Brain, color: '#00b894', view: 'notebook', hint: 'Crea un quiz' },
  { id: 'mindmap', label: 'Mappa Mentale', icon: Network, color: '#0984e3', view: 'notebook', hint: 'Mappa concettuale' },
  { id: 'table', label: 'Tabella', icon: Table2, color: '#e17055', view: 'notebook', hint: 'Tabella di studio' },
  { id: 'presentation', label: 'Presentazione', icon: Monitor, color: '#fd79a8', view: 'notebook', hint: 'Slide di studio' },
  { id: 'report', label: 'Report', icon: FileText, color: '#a29bfe', view: 'notebook', hint: 'Crea un report' },
  { id: 'exam', label: 'Simula Esame', icon: FileQuestion, color: '#fdcb6e', view: 'exam', hint: "Simula l'esame" },
];

const QUICK_QUESTIONS = [
  'Spiegami i concetti fondamentali',
  'Quali sono gli argomenti più importanti per l\'esame?',
  'Come preparo al meglio questo esame?',
  'Fammi un riepilogo della materia',
];

function getDaysLeft(examDate?: string): number | null {
  if (!examDate) return null;
  try {
    const d = parseISO(examDate);
    return isValid(d) ? differenceInDays(d, new Date()) : null;
  } catch { return null; }
}

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: `${color}20`, border: `1.5px solid ${color}30` }}
      >
        <Sparkles size={14} style={{ color }} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(26,26,46,0.9)', border: '1px solid rgba(108,92,231,0.15)' }}>
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: color }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfessorChatView({
  professor,
  onBack,
  onAddMessage,
  onClearHistory,
  onNavigate,
}: ProfessorChatViewProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const color = professor.color || '#6c5ce7';
  const emoji = professor.emoji || '🎓';
  const chatHistory = professor.chatHistory || [];
  const daysLeft = getDaysLeft(professor.examDate);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Welcome message if empty chat
  const hasMessages = chatHistory.length > 0;

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Add user message
    onAddMessage(professor.id, {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorName: professor.name,
          subject: professor.subject || professor.department,
          examFormat: professor.examFormat,
          difficulty: professor.difficulty,
          teachingStyle: professor.teachingStyle,
          preferredTopics: professor.preferredTopics,
          chatHistory: chatHistory.slice(-8),
          userMessage: trimmed,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Mi dispiace, non ho potuto generare una risposta. Riprova.';

      onAddMessage(professor.id, {
        role: 'professor',
        content: reply,
        timestamp: new Date().toISOString(),
      });
    } catch {
      onAddMessage(professor.id, {
        role: 'professor',
        content: 'Errore di connessione. Controlla che la chiave API Gemini sia configurata.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [professor, chatHistory, isLoading, onAddMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen flex-col" style={{ marginTop: '-32px', marginBottom: '-32px', marginLeft: '-32px', marginRight: '-32px' }}>
      {/* Top Bar */}
      <div
        className="flex items-center gap-4 px-5 py-3 flex-shrink-0 border-b"
        style={{
          background: 'rgba(12,12,20,0.95)',
          borderColor: `${color}20`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </motion.button>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${color}20`, border: `1.5px solid ${color}40` }}
        >
          {emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-text-primary text-sm truncate">Prof. {professor.name}</h2>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: `${color}20`, color }}
            >
              {professor.examFormat}
            </span>
          </div>
          <p className="text-xs text-text-muted truncate">{professor.subject || professor.department}</p>
        </div>

        {daysLeft !== null && (
          <div
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: daysLeft <= 7 ? '#ff767520' : daysLeft <= 20 ? '#fdcb6e20' : '#00b89420',
              color: daysLeft <= 7 ? '#ff7675' : daysLeft <= 20 ? '#fdcb6e' : '#00b894',
            }}
          >
            {daysLeft === 0 ? 'Oggi!' : daysLeft < 0 ? 'Passato' : `${daysLeft}g`}
          </div>
        )}

        <motion.button
          onClick={() => onClearHistory(professor.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center text-text-muted hover:text-accent-danger transition-colors flex-shrink-0"
          title="Cancella chat"
        >
          <Trash2 size={15} />
        </motion.button>

        <motion.button
          onClick={() => setToolsOpen(!toolsOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
          title="Strumenti"
        >
          {toolsOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </motion.button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {/* Welcome message */}
            {!hasMessages && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-16"
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-lg"
                  style={{ background: `${color}20`, border: `2px solid ${color}40` }}
                >
                  {emoji}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Ciao! Sono il Prof. {professor.name}
                </h3>
                <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
                  Sono qui per aiutarti a preparare l&apos;esame di{' '}
                  <span style={{ color }} className="font-semibold">
                    {professor.subject || professor.department}
                  </span>
                  . Chiedimi qualsiasi cosa!
                </p>
                {/* Quick questions */}
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {QUICK_QUESTIONS.map((q) => (
                    <motion.button
                      key={q}
                      onClick={() => sendMessage(q)}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-left px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all duration-200 border"
                      style={{
                        background: 'rgba(26,26,46,0.6)',
                        borderColor: 'rgba(108,92,231,0.15)',
                      }}
                    >
                      💬 {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Chat messages */}
            <AnimatePresence initial={false}>
              {chatHistory.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {msg.role === 'professor' && (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mb-1"
                      style={{ background: `${color}20`, border: `1.5px solid ${color}30` }}
                    >
                      {emoji}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className="max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? {
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            color: '#fff',
                            borderBottomRightRadius: 4,
                          }
                        : {
                            background: 'rgba(26,26,46,0.9)',
                            border: '1px solid rgba(108,92,231,0.15)',
                            color: '#f5f5f7',
                            borderBottomLeftRadius: 4,
                          }
                    }
                  >
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                    <p
                      className="text-[10px] mt-1.5 opacity-60"
                      style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isLoading && <TypingIndicator color={color} />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex-shrink-0 px-4 py-3 border-t"
            style={{ borderColor: `${color}15`, background: 'rgba(12,12,20,0.8)' }}
          >
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Scrivi a Prof. ${professor.name}...`}
                rows={1}
                className="flex-1 resize-none rounded-xl px-4 py-3 text-sm max-h-32 overflow-y-auto"
                style={{
                  background: 'rgba(26,26,46,0.9)',
                  border: `1px solid ${color}30`,
                  minHeight: 44,
                }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px';
                }}
                disabled={isLoading}
              />
              <motion.button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  background: input.trim() && !isLoading ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'rgba(26,26,46,0.8)',
                  border: `1px solid ${input.trim() ? color : 'rgba(108,92,231,0.2)'}30`,
                }}
              >
                {isLoading ? (
                  <Loader2 size={18} className="text-white animate-spin" />
                ) : (
                  <Send size={16} style={{ color: input.trim() ? '#fff' : '#6c6c85' }} />
                )}
              </motion.button>
            </div>
            <p className="text-[10px] text-text-muted mt-1.5 ml-1">Invio = invia · Shift+Invio = nuova riga</p>
          </div>
        </div>

        {/* Tools sidebar */}
        <AnimatePresence>
          {toolsOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 overflow-hidden border-l"
              style={{ borderColor: `${color}15`, background: 'rgba(12,12,20,0.5)' }}
            >
              <div className="p-4 w-[220px]">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">
                  Strumenti di Studio
                </p>
                <div className="space-y-2">
                  {TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <motion.button
                        key={tool.id}
                        onClick={() => onNavigate(tool.view)}
                        whileHover={{ x: 3, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left"
                        style={{
                          background: `${tool.color}10`,
                          border: `1px solid ${tool.color}20`,
                          color: tool.color,
                        }}
                      >
                        <Icon size={15} />
                        <span className="truncate">{tool.label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="my-4 border-t" style={{ borderColor: `${color}15` }} />

                {/* Quick info */}
                <div className="rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Esame</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">Formato</span>
                      <span className="text-[11px] font-medium capitalize" style={{ color }}>
                        {professor.examFormat}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">Difficoltà</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ background: i < professor.difficulty ? color : 'rgba(255,255,255,0.1)' }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-muted">Obiettivo</span>
                      <span className="text-[11px] font-bold" style={{ color }}>
                        {professor.targetGrade === 31 ? '30L' : professor.targetGrade || 28}
                      </span>
                    </div>
                    {daysLeft !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-muted">All&apos;esame</span>
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: daysLeft <= 7 ? '#ff7675' : daysLeft <= 20 ? '#fdcb6e' : '#00b894' }}
                        >
                          {daysLeft <= 0 ? 'Passato' : `${daysLeft}g`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
