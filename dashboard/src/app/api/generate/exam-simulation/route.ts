// ==========================================
// POST /api/generate/exam-simulation
// Genera una simulazione d'esame realistica con Gemini
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { ExamSimulationAIRequest, ExamSimulationAIResponse, SimulationQuestionAI } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body: ExamSimulationAIRequest = await req.json();
    const {
      courseName,
      topics,
      examFormat,
      difficulty,
      professorStyle = '',
      questionCount = 5,
      language = 'italiano',
    } = body;

    if (!courseName || !topics || topics.length === 0 || !examFormat) {
      return NextResponse.json(
        { error: 'Campi obbligatori: courseName, topics, examFormat' },
        { status: 400 }
      );
    }

    const safeCount = Math.min(Math.max(questionCount, 2), 15);
    const topicsStr = topics.join(', ');

    // Determina i tipi di domanda in base al formato esame
    const questionTypesByFormat: Record<string, string> = {
      orale: 'aperta (domande a risposta aperta come in un esame orale)',
      scritto: 'misto tra multipla, aperta e esercizio',
      misto: 'aperta, multipla e caso_studio',
      progetto: 'caso_studio e aperta',
      laboratorio: 'esercizio e caso_studio',
    };

    const difficultyDesc: Record<number, string> = {
      1: 'molto semplice, concetti base',
      2: 'semplice, comprensione generale',
      3: 'medio, comprensione e applicazione',
      4: 'difficile, analisi critica richiesta',
      5: 'molto difficile, sintesi e valutazione avanzata',
    };

    const questionTypes = questionTypesByFormat[examFormat] || 'misto tra multipla, aperta e esercizio';
    const diffDesc = difficultyDesc[Math.min(Math.max(difficulty, 1), 5)] || difficultyDesc[3];

    const prompt = `Sei un professore universitario severo e preciso. Crea una simulazione d'esame realistica in ${language} per il corso "${courseName}".

Parametri:
- Formato esame: ${examFormat}
- Difficoltà: ${difficulty}/5 (${diffDesc})
- Argomenti: ${topicsStr}
- Numero domande: ${safeCount}
- Tipo di domande: ${questionTypes}
${professorStyle ? `- Stile del professore: ${professorStyle}` : ''}

Per ogni domanda specifica:
- "text": testo completo della domanda (come nella vera prova d'esame)
- "type": "aperta" | "multipla" | "esercizio" | "caso_studio"
- "topic": argomento specifico
- "difficulty": livello 1-5
- "options": array di 4 opzioni (SOLO per type "multipla")
- "correctAnswer": risposta corretta (per multipla: testo dell'opzione)
- "modelAnswer": risposta modello dettagliata (per tutte le domande)
- "evaluationCriteria": array di criteri di valutazione (3-4 punti)
- "maxScore": punteggio massimo (aperta: 6-8, multipla: 2-3, esercizio: 8-10, caso_studio: 10-15)
- "hints": array di suggerimenti per lo studente (opzionale, 1-2 hints)

Rispondi SOLO con JSON valido. Formato:
{
  "questions": [
    {
      "text": "...",
      "type": "aperta",
      "topic": "...",
      "difficulty": 3,
      "modelAnswer": "...",
      "evaluationCriteria": ["...", "..."],
      "maxScore": 7,
      "hints": ["..."]
    }
  ],
  "examTips": ["...", "..."]
}`;

    const raw = await generateJSON<{
      questions: Omit<SimulationQuestionAI, 'id'>[];
      examTips: string[];
    }>(prompt);

    const questions: SimulationQuestionAI[] = raw.questions.map((q) => ({
      ...q,
      id: uuidv4(),
      difficulty: q.difficulty as 1 | 2 | 3 | 4 | 5,
    }));

    const totalMaxScore = questions.reduce((sum, q) => sum + (q.maxScore || 0), 0);
    // Stima tempo: aperta 8min, multipla 3min, esercizio 12min, caso_studio 15min
    const estimatedMinutes = questions.reduce((sum, q) => {
      const mins: Record<string, number> = { aperta: 8, multipla: 3, esercizio: 12, caso_studio: 15 };
      return sum + (mins[q.type] || 8);
    }, 0);

    const response: ExamSimulationAIResponse = {
      courseName,
      examFormat,
      questions,
      totalMaxScore,
      estimatedMinutes,
      examTips: raw.examTips || [],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione della simulazione', details: message }, { status: 500 });
  }
}
