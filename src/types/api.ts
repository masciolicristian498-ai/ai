// ==========================================
// API TYPES - Request & Response shapes
// per tutti gli endpoint /api/generate/*
// ==========================================

// ---------- COMMON ----------

export interface ApiError {
  error: string;
  details?: string;
}

// ---------- FLASHCARDS ----------

export interface FlashcardsRequest {
  /** Testo/argomento da cui generare le flashcard */
  topic: string;
  /** Contesto aggiuntivo (es. nome del corso, note) */
  context?: string;
  /** Numero di flashcard da generare (default: 10) */
  count?: number;
  /** Difficoltà: 'base' | 'medio' | 'avanzato' */
  difficulty?: 'base' | 'medio' | 'avanzato';
  /** Lingua (default: 'italiano') */
  language?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'base' | 'medio' | 'avanzato';
  hint?: string;
}

export interface FlashcardsResponse {
  flashcards: Flashcard[];
  topic: string;
  generatedAt: string;
}

// ---------- QUIZ ----------

export interface QuizRequest {
  topic: string;
  context?: string;
  /** Numero di domande (default: 5) */
  questionCount?: number;
  /** Tipo di domande */
  types?: ('multipla' | 'vera_falsa' | 'aperta')[];
  difficulty?: 'base' | 'medio' | 'avanzato';
  language?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multipla' | 'vera_falsa' | 'aperta';
  options?: string[];      // solo per 'multipla'
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'base' | 'medio' | 'avanzato';
  points: number;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  topic: string;
  totalPoints: number;
  estimatedMinutes: number;
  generatedAt: string;
}

// ---------- MIND MAP ----------

export interface MindMapRequest {
  topic: string;
  context?: string;
  /** Profondità massima dell'albero (default: 3) */
  depth?: number;
  language?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
  color?: string;
  level: number;
}

export interface MindMapResponse {
  root: MindMapNode;
  topic: string;
  generatedAt: string;
}

// ---------- TABLE ----------

export interface TableRequest {
  topic: string;
  context?: string;
  /** Tipo di tabella: confronto, definizioni, timeline, proprietà */
  tableType?: 'confronto' | 'definizioni' | 'timeline' | 'proprieta' | 'auto';
  language?: string;
}

export interface TableData {
  title: string;
  description: string;
  headers: string[];
  rows: string[][];
  /** Indice colonna chiave da evidenziare (opzionale) */
  keyColumn?: number;
  tableType: string;
}

export interface TableResponse {
  table: TableData;
  topic: string;
  generatedAt: string;
}

// ---------- PRESENTATION ----------

export interface PresentationRequest {
  topic: string;
  context?: string;
  /** Numero di slide (default: 8) */
  slideCount?: number;
  /** Stile: 'accademico' | 'semplice' | 'dettagliato' */
  style?: 'accademico' | 'semplice' | 'dettagliato';
  language?: string;
}

export interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  type: 'title' | 'content' | 'bullets' | 'summary' | 'definition';
  content: string;
  bullets?: string[];
  speakerNotes?: string;
  keyPoints?: string[];
}

export interface PresentationResponse {
  slides: Slide[];
  title: string;
  topic: string;
  totalSlides: number;
  estimatedMinutes: number;
  generatedAt: string;
}

// ---------- STUDY PLAN (AI-enhanced) ----------

export interface StudyPlanAIRequest {
  courseName: string;
  examDate: string;
  targetGrade: number;
  hoursPerDay: number;
  topics: string[];
  professorNotes?: string;
  examFormat?: string;
  difficulty?: number;
  language?: string;
}

export interface StudyDayAI {
  day: number;
  date: string;
  phase: string;
  activities: {
    type: string;
    title: string;
    description: string;
    durationMinutes: number;
    priority: 'alta' | 'media' | 'bassa';
    topics: string[];
  }[];
  totalHours: number;
  focus: string;
  tips: string;
}

export interface StudyPlanAIResponse {
  courseName: string;
  totalDays: number;
  phases: {
    name: string;
    type: string;
    description: string;
    startDay: number;
    endDay: number;
    weight: number;
    objective: string;
  }[];
  dailyPlan: StudyDayAI[];
  generalTips: string[];
  examDayTips: string[];
  generatedAt: string;
}

// ---------- EXAM SIMULATION (AI-enhanced) ----------

export interface ExamSimulationAIRequest {
  courseName: string;
  topics: string[];
  examFormat: 'orale' | 'scritto' | 'misto' | 'progetto' | 'laboratorio';
  difficulty: number; // 1-5
  professorStyle?: string;
  questionCount?: number;
  language?: string;
}

export interface SimulationQuestionAI {
  id: string;
  text: string;
  type: 'aperta' | 'multipla' | 'esercizio' | 'caso_studio';
  topic: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  options?: string[];
  correctAnswer?: string;
  modelAnswer: string;
  evaluationCriteria: string[];
  maxScore: number;
  hints?: string[];
}

export interface ExamSimulationAIResponse {
  courseName: string;
  examFormat: string;
  questions: SimulationQuestionAI[];
  totalMaxScore: number;
  estimatedMinutes: number;
  examTips: string[];
  generatedAt: string;
}

// ---------- REPORT ----------

export interface ReportRequest {
  topic: string;
  context?: string;
  /** Tipo: 'saggio' | 'relazione' | 'analisi' | 'riassunto' */
  reportType?: 'saggio' | 'relazione' | 'analisi' | 'riassunto';
  /** Lunghezza: 'breve' (~500 parole) | 'medio' (~1000) | 'lungo' (~2000) */
  length?: 'breve' | 'medio' | 'lungo';
  language?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  keyPoints?: string[];
  level: 1 | 2; // 1 = sezione principale, 2 = sottosezione
}

export interface ReportResponse {
  title: string;
  abstract: string;
  reportType: string;
  sections: ReportSection[];
  bibliography: string[];
  wordCount: number;
  generatedAt: string;
}

// ---------- VIDEO SCRIPT ----------

export interface VideoScriptRequest {
  topic: string;
  context?: string;
  /** Durata in minuti: 3 | 5 | 10 */
  durationMinutes?: 3 | 5 | 10;
  /** Stile: 'divulgativo' | 'accademico' | 'storytelling' */
  style?: 'divulgativo' | 'accademico' | 'storytelling';
  language?: string;
}

export interface VideoScene {
  id: string;
  sceneNumber: number;
  title: string;
  narration: string;
  visuals: string;
  durationSeconds: number;
  keyPoints?: string[];
  transition?: string;
}

export interface VideoScriptResponse {
  title: string;
  topic: string;
  style: string;
  totalDurationSeconds: number;
  hook: string;
  scenes: VideoScene[];
  closingLine: string;
  productionNotes: string[];
  generatedAt: string;
}
