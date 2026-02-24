'use client';

import { useState, useCallback } from 'react';
import type {
  Professor,
  StudyMaterial,
  StudyPlan,
  Exam,
  OnboardingData,
  UserProgress,
  ExamSimulation,
} from '@/types';

// Simple client-side store using React state
// In production, this would be backed by a database

export interface AppState {
  professors: Professor[];
  materials: StudyMaterial[];
  studyPlans: StudyPlan[];
  exams: Exam[];
  simulations: ExamSimulation[];
  currentExamId: string | null;
  onboardingData: OnboardingData | null;
  userProgress: UserProgress;
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'onboarding' | 'professor' | 'upload' | 'study-plan' | 'exam' | 'progress';
}

const defaultProgress: UserProgress = {
  totalExams: 3,
  passedExams: 2,
  averageGrade: 26.5,
  studyStreak: 7,
  totalHoursStudied: 142,
  weeklyHours: [4, 5, 3, 6, 4, 2, 5],
  topicsCompleted: 48,
  simulationsCompleted: 12,
  averageSimulationScore: 78,
  strongAreas: ['Diritto Privato', 'Microeconomia', 'Statistica descrittiva'],
  weakAreas: ['Macroeconomia avanzata', 'Diritto Costituzionale comparato'],
};

const initialState: AppState = {
  professors: [],
  materials: [],
  studyPlans: [],
  exams: [],
  simulations: [],
  currentExamId: null,
  onboardingData: null,
  userProgress: defaultProgress,
  sidebarOpen: true,
  currentView: 'dashboard',
};

export function useAppStore() {
  const [state, setState] = useState<AppState>(initialState);

  const setView = useCallback((view: AppState['currentView']) => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const addProfessor = useCallback((professor: Professor) => {
    setState((prev) => ({
      ...prev,
      professors: [...prev.professors, professor],
    }));
  }, []);

  const updateProfessor = useCallback((id: string, updates: Partial<Professor>) => {
    setState((prev) => ({
      ...prev,
      professors: prev.professors.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const addMaterial = useCallback((material: StudyMaterial) => {
    setState((prev) => ({
      ...prev,
      materials: [...prev.materials, material],
    }));
  }, []);

  const removeMaterial = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== id),
    }));
  }, []);

  const setStudyPlan = useCallback((plan: StudyPlan) => {
    setState((prev) => ({
      ...prev,
      studyPlans: [...prev.studyPlans.filter((p) => p.id !== plan.id), plan],
    }));
  }, []);

  const completeTask = useCallback((planId: string, dayId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      studyPlans: prev.studyPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        const dailyTasks = plan.dailyTasks.map((day) => {
          if (day.id !== dayId) return day;
          const tasks = day.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          const allDone = tasks.every((t) => t.completed);
          return { ...day, tasks, completed: allDone, completedAt: allDone ? new Date().toISOString() : undefined };
        });
        const completed = dailyTasks.filter((d) => d.completed).length;
        return {
          ...plan,
          dailyTasks,
          overallProgress: plan.totalDays > 0 ? (completed / plan.totalDays) * 100 : 0,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  }, []);

  const setOnboardingData = useCallback((data: OnboardingData) => {
    setState((prev) => ({ ...prev, onboardingData: data }));
  }, []);

  const addSimulation = useCallback((sim: ExamSimulation) => {
    setState((prev) => ({
      ...prev,
      simulations: [...prev.simulations, sim],
    }));
  }, []);

  return {
    state,
    setView,
    toggleSidebar,
    addProfessor,
    updateProfessor,
    addMaterial,
    removeMaterial,
    setStudyPlan,
    completeTask,
    setOnboardingData,
    addSimulation,
  };
}
