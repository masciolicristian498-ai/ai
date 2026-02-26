'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot, MoreVertical, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store/useStore';
import { generateChatResponse } from '@/lib/gemini';
import type { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function ProfessorChat() {
  const { state, addMessageToProfessor } = useAppStore();
  const [selectedProfessorId, setSelectedProfessorId] = useState<string | null>(
    state.professors.length > 0 ? state.professors[0].id : null
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedProfessor = state.professors.find((p) => p.id === selectedProfessorId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedProfessor?.chatHistory, isLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedProfessor || isLoading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessageToProfessor(selectedProfessor.id, userMsg);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = selectedProfessor.chatHistory || [];
      const responseText = await generateChatResponse(
        selectedProfessor,
        [...history, userMsg],
        userMsg.content
      );

      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      addMessageToProfessor(selectedProfessor.id, aiMsg);
    } catch (error) {
      console.error('Error generating response:', error);
      // Optionally add an error message to the chat
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (state.professors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-bg-card rounded-full flex items-center justify-center mb-4">
          <User size={32} className="text-text-muted" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Nessun professore trovato</h2>
        <p className="text-text-secondary max-w-md">
          Crea prima un profilo professore nella sezione &quot;Professore&quot; per iniziare a chattare.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-[calc(100vh-140px)] gap-6"
    >
      {/* Sidebar - List of Professors */}
      <div className="w-1/3 min-w-[250px] max-w-[350px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text-primary px-2">I tuoi Professori</h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {state.professors.map((prof) => (
            <button
              key={prof.id}
              onClick={() => setSelectedProfessorId(prof.id)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${
                selectedProfessorId === prof.id
                  ? 'bg-accent/10 border-accent/30 shadow-lg shadow-accent/5'
                  : 'bg-bg-card/50 border-transparent hover:bg-bg-card hover:border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedProfessorId === prof.id ? 'bg-accent text-white' : 'bg-bg-secondary text-text-muted'
                }`}>
                    <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate ${
                      selectedProfessorId === prof.id ? 'text-accent-light' : 'text-text-primary'
                  }`}>
                    {prof.name}
                  </h3>
                  <p className="text-xs text-text-muted truncate">{prof.department}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-bg-card/30 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-2xl">
        {selectedProfessor ? (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-bg-card/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-teal flex items-center justify-center text-white shadow-lg">
                  <Bot size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">{selectedProfessor.name}</h2>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-bg-secondary rounded-lg transition-colors text-text-muted hover:text-text-primary">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {selectedProfessor.chatHistory?.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-accent">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Inizia la conversazione
                  </h3>
                  <p className="text-sm text-text-secondary max-w-sm mx-auto">
                    Chiedi al Prof. {selectedProfessor.name.split(' ').pop()} spiegazioni,
                    consigli per l&apos;esame o simulazioni di domande.
                  </p>
                </div>
              )}

              {selectedProfessor.chatHistory?.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-accent text-white rounded-tr-none shadow-lg shadow-accent/20'
                        : 'bg-bg-secondary text-text-primary rounded-tl-none border border-border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/70' : 'text-text-muted'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-bg-secondary p-4 rounded-2xl rounded-tl-none border border-border flex gap-1">
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-bg-card/50">
              <div className="relative flex items-center gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Scrivi un messaggio al Prof. ${selectedProfessor.name.split(' ').pop()}...`}
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none max-h-32 min-h-[50px] custom-scrollbar"
                  rows={1}
                  style={{ minHeight: '50px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 bg-accent text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-all shadow-lg shadow-accent/20"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-text-muted text-center mt-2">
                Il professore AI puo commettere errori. Verifica sempre le informazioni importanti.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <User size={48} className="mb-4 opacity-20" />
            <p>Seleziona un professore per iniziare a chattare</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
