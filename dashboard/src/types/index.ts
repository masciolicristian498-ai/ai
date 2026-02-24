// ==========================================
// CORE TYPES - StudyAI Platform
// ==========================================

export interface University {
  id: string;
  name: string;
  city: string;
  type: 'statale' | 'telematica' | 'privata';
}

export interface Professor {
  id: string;
  name: string;
  universityId: string;
  department: string;
  examStyle: ExamStyle;
  teachingStyle: TeachingStyle;
  typicalQuestions: string[];
  preferredTopics: string[];
  examFormat: ExamFormat;
  difficulty: 1 | 2 | 3 | 4 | 5;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamStyle {
  oralWeight: number; // 0-100 percentage
  writtenWeight: number; // 0-100 percentage
  practicalWeight: number; // 0-100 percentage
  multipleChoice: boolean;
  openQuestions: boolean;
  exercises: boolean;
  caseStudies: boolean;
  averageQuestions: number;
  timeMinutes: number;
  strictGrading: boolean;
  focusOnDetails: boolean;
  focusOnConcepts: boolean;
  focusOnApplications: boolean;
}

export interface TeachingStyle {
  usesSlides: boolean;
  usesWhiteboard: boolean;
  interactive: boolean;
  theoreticalFocus: boolean;
  practicalExamples: boolean;
  referencesBook: boolean;
  goesOffTopic: boolean;
  speedPace: 'lento' | 'medio' | 'veloce';
  explanation: 'dettagliata' | 'sintetica' | 'mista';
}

export type ExamFormat = 'orale' | 'scritto' | 'misto' | 'progetto' | 'laboratorio';

export interface Course {
  id: string;
  name: string;
  cfu: number;
  universityId: string;
  professorId: string;
  semester: 1 | 2;
  year: 1 | 2 | 3 | 4 | 5;
  degreeType: 'triennale' | 'magistrale' | 'ciclo_unico';
}

export interface Exam {
  id: string;
  courseId: string;
  professorId: string;
  date: string; // ISO date
  daysRemaining: number;
  targetGrade: number; // 18-30
  status: 'da_preparare' | 'in_preparazione' | 'pronto' | 'sostenuto';
  result?: number;
  passed?: boolean;
}

export interface StudyMaterial {
  id: string;
  examId: string;
  type: 'libro' | 'dispensa' | 'appunti' | 'slide' | 'video' | 'audio' | 'esame_passato' | 'esercizi' | 'altro';
  name: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  chapters?: number;
  pages?: number;
  processed: boolean;
  summary?: string;
}

export interface StudyPlan {
  id: string;
  examId: string;
  professorId: string;
  totalDays: number;
  startDate: string;
  examDate: string;
  phases: StudyPhase[];
  dailyTasks: DailyTask[];
  overallProgress: number;
  adaptiveAdjustments: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPhase {
  id: string;
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  type: 'comprensione' | 'approfondimento' | 'pratica' | 'ripasso' | 'simulazione';
  weight: number; // percentage of total time
  topics: string[];
  completed: boolean;
}

export interface DailyTask {
  id: string;
  day: number;
  date: string;
  phaseId: string;
  tasks: TaskItem[];
  estimatedHours: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: 'lettura' | 'riassunto' | 'esercizi' | 'ripasso' | 'simulazione' | 'mappa_concettuale' | 'flashcard';
  materialRef?: string;
  chapter?: string;
  pages?: string;
  duration: number; // minutes
  completed: boolean;
  priority: 'alta' | 'media' | 'bassa';
}

export interface ExamSimulation {
  id: string;
  examId: string;
  professorId: string;
  type: ExamFormat;
  questions: SimulationQuestion[];
  totalScore: number;
  maxScore: number;
  grade: number;
  completedAt?: string;
  timeSpent?: number;
  feedback?: string;
}

export interface SimulationQuestion {
  id: string;
  text: string;
  type: 'aperta' | 'multipla' | 'esercizio' | 'caso_studio';
  topic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  options?: string[];
  correctAnswer?: string;
  userAnswer?: string;
  score?: number;
  maxScore: number;
  feedback?: string;
}

export interface UserProgress {
  totalExams: number;
  passedExams: number;
  averageGrade: number;
  studyStreak: number;
  totalHoursStudied: number;
  weeklyHours: number[];
  topicsCompleted: number;
  simulationsCompleted: number;
  averageSimulationScore: number;
  strongAreas: string[];
  weakAreas: string[];
}

export interface OnboardingData {
  university: string;
  courseName: string;
  cfu: number;
  professorId?: string;
  examDate: string;
  targetGrade: number;
  books: string[];
  hoursPerDay: number;
  examFormat: ExamFormat;
  degreeType: 'triennale' | 'magistrale' | 'ciclo_unico';
  year: number;
  semester: 1 | 2;
}
