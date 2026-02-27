// ==========================================
// API CLIENT - Frontend helper
// Chiama tutti gli endpoint /api/generate/*
// Importa e usa queste funzioni nei tuoi componenti React.
// ==========================================

import type {
  FlashcardsRequest,
  FlashcardsResponse,
  QuizRequest,
  QuizResponse,
  MindMapRequest,
  MindMapResponse,
  TableRequest,
  TableResponse,
  ReportRequest,
  ReportResponse,
  VideoScriptRequest,
  VideoScriptResponse,
  PresentationRequest,
  PresentationResponse,
  StudyPlanAIRequest,
  StudyPlanAIResponse,
  ExamSimulationAIRequest,
  ExamSimulationAIResponse,
  ApiError,
} from '@/types/api';

// Base URL: in Next.js usa sempre percorsi relativi nelle API route
const BASE = '/api/generate';

async function post<TReq, TRes>(endpoint: string, body: TReq): Promise<TRes> {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err.details ? `${err.error}: ${err.details}` : err.error);
  }

  return data as TRes;
}

// ---------- FLASHCARDS ----------

/**
 * Genera flashcard su un argomento.
 * @example
 * const result = await generateFlashcards({ topic: 'Diritto Privato', count: 15 });
 * result.flashcards.forEach(f => console.log(f.front, f.back));
 */
export async function generateFlashcards(req: FlashcardsRequest): Promise<FlashcardsResponse> {
  return post<FlashcardsRequest, FlashcardsResponse>('flashcards', req);
}

// ---------- QUIZ ----------

/**
 * Genera un quiz con domande multiple, vero/falso e aperte.
 * @example
 * const result = await generateQuiz({ topic: 'Microeconomia', questionCount: 10 });
 * result.questions.forEach(q => console.log(q.text));
 */
export async function generateQuiz(req: QuizRequest): Promise<QuizResponse> {
  return post<QuizRequest, QuizResponse>('quiz', req);
}

// ---------- MIND MAP ----------

/**
 * Genera una mappa concettuale gerarchica.
 * @example
 * const result = await generateMindMap({ topic: 'Macroeconomia', depth: 3 });
 * console.log(result.root); // albero di MindMapNode
 */
export async function generateMindMap(req: MindMapRequest): Promise<MindMapResponse> {
  return post<MindMapRequest, MindMapResponse>('mindmap', req);
}

// ---------- TABLE ----------

/**
 * Genera una tabella di studio strutturata.
 * @example
 * const result = await generateTable({ topic: 'Tipi di contratti', tableType: 'confronto' });
 * console.log(result.table.headers, result.table.rows);
 */
export async function generateTable(req: TableRequest): Promise<TableResponse> {
  return post<TableRequest, TableResponse>('table', req);
}

// ---------- PRESENTATION ----------

/**
 * Genera una presentazione slide-by-slide.
 * @example
 * const result = await generatePresentation({ topic: 'Il sistema bancario', slideCount: 10 });
 * result.slides.forEach(s => console.log(s.slideNumber, s.title));
 */
export async function generatePresentation(req: PresentationRequest): Promise<PresentationResponse> {
  return post<PresentationRequest, PresentationResponse>('presentation', req);
}

// ---------- STUDY PLAN ----------

/**
 * Genera un piano di studio AI-enhanced.
 * @example
 * const result = await generateStudyPlan({
 *   courseName: 'Diritto Privato',
 *   examDate: '2025-06-15',
 *   targetGrade: 28,
 *   hoursPerDay: 4,
 *   topics: ['Contratti', 'Obbligazioni', 'Proprietà'],
 * });
 */
export async function generateStudyPlan(req: StudyPlanAIRequest): Promise<StudyPlanAIResponse> {
  return post<StudyPlanAIRequest, StudyPlanAIResponse>('study-plan', req);
}

// ---------- EXAM SIMULATION ----------

/**
 * Genera una simulazione d'esame realistica.
 * @example
 * const result = await generateExamSimulation({
 *   courseName: 'Economia Politica',
 *   topics: ['PIL', 'Inflazione', 'Disoccupazione'],
 *   examFormat: 'scritto',
 *   difficulty: 4,
 * });
 * result.questions.forEach(q => console.log(q.text));
 */
export async function generateExamSimulation(
  req: ExamSimulationAIRequest
): Promise<ExamSimulationAIResponse> {
  return post<ExamSimulationAIRequest, ExamSimulationAIResponse>('exam-simulation', req);
}

// ---------- REPORT ----------

/**
 * Genera un report accademico strutturato su un argomento.
 * @example
 * const result = await generateReport({ topic: 'Il contratto di locazione', reportType: 'analisi', length: 'medio' });
 * result.sections.forEach(s => console.log(s.title, s.content));
 */
export async function generateReport(req: ReportRequest): Promise<ReportResponse> {
  return post<ReportRequest, ReportResponse>('report', req);
}

// ---------- VIDEO SCRIPT ----------

/**
 * Genera uno script/storyboard per un video di panoramica su un argomento.
 * @example
 * const result = await generateVideoScript({ topic: 'Reti neurali', durationMinutes: 5, style: 'divulgativo' });
 * result.scenes.forEach(s => console.log(s.sceneNumber, s.narration));
 */
export async function generateVideoScript(req: VideoScriptRequest): Promise<VideoScriptResponse> {
  return post<VideoScriptRequest, VideoScriptResponse>('video-script', req);
}
