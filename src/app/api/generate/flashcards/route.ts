// ==========================================
// POST /api/generate/flashcards
// Genera flashcard su un argomento con Gemini
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { FlashcardsRequest, FlashcardsResponse, Flashcard } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body: FlashcardsRequest = await req.json();
    const {
      topic,
      context = '',
      count = 10,
      difficulty = 'medio',
      language = 'italiano',
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Il campo "topic" è obbligatorio' }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(count, 3), 30);

    const prompt = `Sei un esperto didattico universitario. Crea ${safeCount} flashcard di studio in ${language} sull'argomento "${topic}".
${context ? `Contesto aggiuntivo: ${context}` : ''}
Difficoltà: ${difficulty}.

Ogni flashcard deve avere:
- "front": la domanda/termine/concetto (breve, max 2 righe)
- "back": la risposta/definizione/spiegazione (chiara e completa)
- "topic": il sotto-argomento specifico
- "difficulty": "${difficulty}"
- "hint": (opzionale) un suggerimento mnemonico o collegamento utile

Rispondi SOLO con un JSON valido, nessun altro testo. Formato:
{
  "flashcards": [
    {
      "front": "...",
      "back": "...",
      "topic": "...",
      "difficulty": "${difficulty}",
      "hint": "..."
    }
  ]
}`;

    const raw = await generateJSON<{ flashcards: Omit<Flashcard, 'id'>[] }>(prompt);

    const flashcards: Flashcard[] = raw.flashcards.map((f) => ({
      ...f,
      id: uuidv4(),
      difficulty: f.difficulty || difficulty,
    }));

    const response: FlashcardsResponse = {
      flashcards,
      topic,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione delle flashcard', details: message }, { status: 500 });
  }
}
