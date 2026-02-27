'use client';

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Professor,
  StudyMaterial,
  StudyPlan,
  Exam,
  OnboardingData,
  UserProgress,
  ExamSimulation,
  ChatMessage,
} from '@/types';

export type AppView =
  | 'home'
  | 'chat'
  | 'create-professor'
  | 'notebook'
  | 'progress'
  | 'upload'
  | 'study-plan'
  | 'exam'
  | 'dashboard'
  | 'onboarding'
  | 'professor';

export interface AppState {
  professors: Professor[];
  selectedProfessorId: string | null;
  materials: StudyMaterial[];
  studyPlans: StudyPlan[];
  exams: Exam[];
  simulations: ExamSimulation[];
  currentExamId: string | null;
  onboardingData: OnboardingData | null;
  userProgress: UserProgress;
  sidebarOpen: boolean;
  currentView: AppView;
}

const defaultProgress: UserProgress = {
  totalExams: 0,
  passedExams: 0,
  averageGrade: 0,
  studyStreak: 0,
  totalHoursStudied: 0,
  weeklyHours: [0, 0, 0, 0, 0, 0, 0],
  topicsCompleted: 0,
  simulationsCompleted: 0,
  averageSimulationScore: 0,
  strongAreas: [],
  weakAreas: [],
};

const initialState: AppState = {
  professors: [],
  selectedProfessorId: null,
  materials: [],
  studyPlans: [],
  exams: [],
  simulations: [],
  currentExamId: null,
  onboardingData: null,
  userProgress: defaultProgress,
  sidebarOpen: true,
  currentView: 'home',
};

const STORAGE_KEY = 'studyai-v2';

function loadFromStorage(): Partial<AppState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      professors: parsed.professors || [],
      materials: parsed.materials || [],
      studyPlans: parsed.studyPlans || [],
      exams: parsed.exams || [],
      simulations: parsed.simulations || [],
      userProgress: { ...defaultProgress, ...(parsed.userProgress || {}) },
      onboardingData: parsed.onboardingData || null,
    };
  } catch {
    return {};
  }
}

function saveToStorage(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      professors: state.professors,
      materials: state.materials,
      studyPlans: state.studyPlans,
      exams: state.exams,
      simulations: state.simulations,
      userProgress: state.userProgress,
      onboardingData: state.onboardingData,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // storage quota exceeded or unavailable
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadFromStorage();
    return { ...initialState, ...saved };
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const setView = useCallback((view: AppView) => {
    setState((prev) => ({ ...prev, currentView: view }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const selectProfessor = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedProfessorId: id, currentView: id ? 'chat' : 'home' }));
  }, []);

  const addProfessor = useCallback((professor: Professor) => {
    setState((prev) => {
      const exists = prev.professors.find((p) => p.id === professor.id);
      const professors = exists
        ? prev.professors.map((p) => (p.id === professor.id ? professor : p))
        : [...prev.professors, professor];
      return { ...prev, professors };
    });
  }, []);

  const updateProfessor = useCallback((id: string, updates: Partial<Professor>) => {
    setState((prev) => ({
      ...prev,
      professors: prev.professors.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)),
    }));
  }, []);

  const deleteProfessor = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      professors: prev.professors.filter((p) => p.id !== id),
      selectedProfessorId: prev.selectedProfessorId === id ? null : prev.selectedProfessorId,
      currentView: prev.selectedProfessorId === id ? 'home' : prev.currentView,
    }));
  }, []);

  const addChatMessage = useCallback((professorId: string, message: Omit<ChatMessage, 'id'>) => {
    const newMsg: ChatMessage = { ...message, id: uuidv4() };
    setState((prev) => ({
      ...prev,
      professors: prev.professors.map((p) =>
        p.id === professorId
          ? { ...p, chatHistory: [...(p.chatHistory || []), newMsg] }
          : p
      ),
    }));
    return newMsg;
  }, []);

  const clearChatHistory = useCallback((professorId: string) => {
    setState((prev) => ({
      ...prev,
      professors: prev.professors.map((p) =>
        p.id === professorId ? { ...p, chatHistory: [] } : p
      ),
    }));
  }, []);

  const addMaterial = useCallback((material: StudyMaterial) => {
    setState((prev) => ({ ...prev, materials: [...prev.materials, material] }));
  }, []);

  const removeMaterial = useCallback((id: string) => {
    setState((prev) => ({ ...prev, materials: prev.materials.filter((m) => m.id !== id) }));
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
    setState((prev) => ({ ...prev, simulations: [...prev.simulations, sim] }));
  }, []);

  const selectedProfessor = state.professors.find((p) => p.id === state.selectedProfessorId) || null;

  return {
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
  };
}
