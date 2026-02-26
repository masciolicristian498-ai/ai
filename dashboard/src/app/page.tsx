'use client';

import { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '@/components/layout/Sidebar';
import DashboardView from '@/components/dashboard/DashboardView';
import OnboardingView from '@/components/onboarding/OnboardingView';
import ProfessorCreator from '@/components/professor/ProfessorCreator';
import UploadView from '@/components/upload/UploadView';
import StudyPlanView from '@/components/study-plan/StudyPlanView';
import ExamSimulatorView from '@/components/exam-simulator/ExamSimulatorView';
import ProgressView from '@/components/progress/ProgressView';
import NotebookView from '@/components/notebook/NotebookView';
import { useAppStore } from '@/store/useStore';
import { generateStudyPlan, generateExamSimulation } from '@/lib/algorithm';
import type { OnboardingData, Professor } from '@/types';

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export default function Home() {
  const {
    state,
    setView,
    toggleSidebar,
    addProfessor,
    addMaterial,
    removeMaterial,
    setStudyPlan,
    completeTask,
    setOnboardingData,
    addSimulation,
  } = useAppStore();

  const handleOnboardingComplete = useCallback(
    (data: OnboardingData) => {
      setOnboardingData(data);

      // If we have a professor, generate the study plan
      const professor = state.professors.find((p) => p.id === data.professorId) || state.professors[0];
      if (professor) {
        const plan = generateStudyPlan(data, professor, state.materials);
        setStudyPlan(plan);
        setView('study-plan');
      } else {
        // Navigate to professor creation first
        setView('professor');
      }
    },
    [state.professors, state.materials, setOnboardingData, setStudyPlan, setView]
  );

  const handleStartSimulation = useCallback(
    (professorId: string) => {
      const professor = state.professors.find((p) => p.id === professorId);
      if (!professor) return;

      const topics = professor.preferredTopics.length > 0
        ? professor.preferredTopics
        : ['Argomento generale del corso'];

      const simulation = generateExamSimulation(professor, topics);
      addSimulation(simulation);
    },
    [state.professors, addSimulation]
  );

  const handleSaveProfessor = useCallback(
    (professor: Professor) => {
      addProfessor(professor);

      // If we have pending onboarding data without a professor, generate plan now
      if (state.onboardingData && !state.onboardingData.professorId) {
        const updatedOnboarding = { ...state.onboardingData, professorId: professor.id };
        setOnboardingData(updatedOnboarding);
        const plan = generateStudyPlan(updatedOnboarding, professor, state.materials);
        setStudyPlan(plan);
      }
    },
    [addProfessor, state.onboardingData, state.materials, setOnboardingData, setStudyPlan]
  );

  const handleCompleteTask = useCallback(
    (planId: string, dayId: string, taskId: string) => {
      completeTask(planId, dayId, taskId);
    },
    [completeTask]
  );

  const currentPlan = useMemo(
    () => state.studyPlans[state.studyPlans.length - 1] || null,
    [state.studyPlans]
  );

  const renderView = () => {
    switch (state.currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={(v) => setView(v as typeof state.currentView)}
          />
        );
      case 'onboarding':
        return (
          <OnboardingView
            onComplete={handleOnboardingComplete}
            onNavigate={(v) => setView(v as typeof state.currentView)}
          />
        );
      case 'professor':
        return (
          <ProfessorCreator
            onSave={handleSaveProfessor}
            existingProfessors={state.professors}
          />
        );
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
            onCompleteTask={handleCompleteTask}
            onNavigate={(v) => setView(v as typeof state.currentView)}
          />
        );
      case 'exam':
        return (
          <ExamSimulatorView
            professors={state.professors}
            simulations={state.simulations}
            onStartSimulation={handleStartSimulation}
            onNavigate={(v) => setView(v as typeof state.currentView)}
          />
        );
      case 'notebook':
        return <NotebookView />;
      case 'progress':
        return <ProgressView progress={state.userProgress} />;
      default:
        return (
          <DashboardView
            onNavigate={(v) => setView(v as typeof state.currentView)}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        currentView={state.currentView}
        sidebarOpen={state.sidebarOpen}
        onNavigate={setView}
        onToggle={toggleSidebar}
      />

      <main
        className="flex-1 relative z-10 transition-all duration-300"
        style={{
          marginLeft: state.sidebarOpen ? 260 : 76,
        }}
      >
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
      </main>
    </div>
  );
}
