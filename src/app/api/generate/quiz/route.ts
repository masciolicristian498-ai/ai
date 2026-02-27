// ==========================================
// POST /api/generate/quiz
// Genera un quiz con domande multiple, vero/falso e aperte
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { QuizRequest, QuizResponse, QuizQuestion } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body: QuizRequest = await req.json();
    const {
      topic,
      context = '',
      questionCount = 5,
      types = ['multipla', 'vera_falsa', 'aperta'],
      difficulty = 'medio',
      language = 'italiano',
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Il campo "topic" è obbligatorio' }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(questionCount, 2), 20);
    const typesList = types.join(', ');

    const prompt = `Sei un professore universitario. Crea ${safeCount} domande di quiz in ${language} sull'argomento "${topic}".
${context ? `Contesto: ${context}` : ''}
Difficoltà: ${difficulty}.
Tipi di domanda da usare (mescola quando possibile): ${typesList}.

Per ogni domanda specifica:
- "text": il testo della domanda
- "type": "multipla" | "vera_falsa" | "aperta"
- "options": array di 4 opzioni (SOLO per type "multipla"), per "vera_falsa" usa ["Vero", "Falso"]
- "correctAnswer": la risposta corretta (per multipla/vera_falsa: testo dell'opzione; per aperta: risposta modello)
- "explanation": spiegazione della risposta corretta
- "topic": il sotto-argomento
- "difficulty": "${difficulty}"
- "points": punteggio (multipla: 1, vera_falsa: 1, aperta: 3)

Rispondi SOLO con JSON valido. Formato:
{
  "questions": [
    {
      "text": "...",
      "type": "multipla",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "...",
      "topic": "...",
      "difficulty": "${difficulty}",
      "points": 1
    }
  ]
}`;

    const raw = await generateJSON<{ questions: Omit<QuizQuestion, 'id'>[] }>(prompt);

    const questions: QuizQuestion[] = raw.questions.map((q) => ({
      ...q,
      id: uuidv4(),
      difficulty: q.difficulty || difficulty,
    }));

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const estimatedMinutes = questions.reduce((sum, q) => {
      if (q.type === 'aperta') return sum + 5;
      if (q.type === 'vera_falsa') return sum + 1;
      return sum + 2;
    }, 0);

    const response: QuizResponse = {
      questions,
      topic,
      totalPoints,
      estimatedMinutes,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione del quiz', details: message }, { status: 500 });
  }
}
