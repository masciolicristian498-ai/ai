'use client';

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import HomeView from '@/components/home/HomeView';
import QuickProfessorCreator from '@/components/professor/QuickProfessorCreator';
import ProfessorChatView from '@/components/chat/ProfessorChatView';
import UploadView from '@/components/upload/UploadView';
import StudyPlanView from '@/components/study-plan/StudyPlanView';
import ExamSimulatorView from '@/components/exam-simulator/ExamSimulatorView';
import ProgressView from '@/components/progress/ProgressView';
import NotebookView from '@/components/notebook/NotebookView';
import { useAppStore } from '@/store/useStore';
import { generateStudyPlan, generateExamSimulation } from '@/lib/algorithm';
import type { Professor } from '@/types';

const pageVariants = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 32,
};

export default function Home() {
  const {
    state,
    selectedProfessor,
    setView,
    toggleSidebar,
    selectProfessor,
    addProfessor,
    updateProfessor,
    deleteProfessor,
    addChatMessage,
    clearChatHistory,
    addMaterial,
    removeMaterial,
    setStudyPlan,
    completeTask,
    setOnboardingData,
    addSimulation,
  } = useAppStore();

  const handleSaveProfessor = useCallback(
    (professor: Professor) => {
      addProfessor(professor);
      selectProfessor(professor.id);
    },
    [addProfessor, selectProfessor]
  );

  const handleDeleteProfessor = useCallback(
    (id: string) => {
      deleteProfessor(id);
      setView('home');
    },
    [deleteProfessor, setView]
  );

  const handleStartSimulation = useCallback(
    (professorId: string) => {
      const professor = state.professors.find((p) => p.id === professorId);
      if (!professor) return;
      const topics = professor.preferredTopics.length > 0
        ? professor.preferredTopics
        : [professor.subject || professor.department || 'Argomento generale'];
      const simulation = generateExamSimulation(professor, topics);
      addSimulation(simulation);
    },
    [state.professors, addSimulation]
  );

  const navigate = useCallback((view: string) => setView(view as import('@/store/useStore').AppView), [setView]);

  const currentPlan = useMemo(
    () => state.studyPlans[state.studyPlans.length - 1] || null,
    [state.studyPlans]
  );

  // Chat view is full-screen (no sidebar padding needed for the chat area)
  const isChatView = state.currentView === 'chat' && selectedProfessor;

  const renderView = () => {
    switch (state.currentView) {
      case 'home':
        return (
          <HomeView
            professors={state.professors}
            onSelectProfessor={selectProfessor}
            onCreateProfessor={() => setView('create-professor')}
            onDeleteProfessor={handleDeleteProfessor}
            onNavigate={navigate}
          />
        );

      case 'create-professor':
        return (
          <QuickProfessorCreator
            onSave={handleSaveProfessor}
            onCancel={() => setView('home')}
          />
        );

      case 'chat':
        if (!selectedProfessor) {
          setView('home');
          return null;
        }
        return (
          <ProfessorChatView
            professor={selectedProfessor}
            onBack={() => setView('home')}
            onAddMessage={addChatMessage}
            onClearHistory={clearChatHistory}
            onNavigate={navigate}
          />
        );

      case 'notebook':
        return <NotebookView />;

      case 'progress':
        return <ProgressView progress={state.userProgress} />;

      case 'upload':
        return (
          <UploadView
            materials={state.materials}
            onUpload={addMaterial}
            onRemove={removeMaterial}
          />
        );

      case 'study-plan':
        return (
          <StudyPlanView
            plan={currentPlan}
            onCompleteTask={(planId, dayId, taskId) => completeTask(planId, dayId, taskId)}
            onNavigate={navigate}
          />
        );

      case 'exam':
        return (
          <ExamSimulatorView
            professors={state.professors}
            simulations={state.simulations}
            onStartSimulation={handleStartSimulation}
            onNavigate={navigate}
          />
        );

      // Legacy views
      case 'dashboard':
        setView('home');
        return null;

      default:
        return (
          <HomeView
            professors={state.professors}
            onSelectProfessor={selectProfessor}
            onCreateProfessor={() => setView('create-professor')}
            onDeleteProfessor={handleDeleteProfessor}
            onNavigate={navigate}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentView={state.currentView}
        selectedProfessorId={state.selectedProfessorId}
        sidebarOpen={state.sidebarOpen}
        professors={state.professors}
        onNavigate={setView}
        onSelectProfessor={selectProfessor}
        onCreateProfessor={() => setView('create-professor')}
        onToggle={toggleSidebar}
        studyStreak={state.userProgress.studyStreak}
      />

      <main
        className="flex-1 relative z-10 transition-all duration-300"
        style={{ marginLeft: state.sidebarOpen ? 248 : 64 }}
      >
        {isChatView ? (
          // Chat view: no padding, full height
          <div className="h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentView + state.selectedProfessorId}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          // Other views: padded content
          <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
