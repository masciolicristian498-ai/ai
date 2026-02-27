// ==========================================
// POST /api/generate/study-plan
// Genera un piano di studio AI-enhanced con Gemini
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { StudyPlanAIRequest, StudyPlanAIResponse, StudyDayAI } from '@/types/api';
import { addDays, format, differenceInDays, parseISO } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const body: StudyPlanAIRequest = await req.json();
    const {
      courseName,
      examDate,
      targetGrade,
      hoursPerDay,
      topics,
      professorNotes = '',
      examFormat = 'scritto',
      difficulty = 3,
      language = 'italiano',
    } = body;

    if (!courseName || !examDate || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: 'Campi obbligatori: courseName, examDate, topics' },
        { status: 400 }
      );
    }

    const today = new Date();
    const examDateObj = parseISO(examDate);
    const totalDays = Math.max(differenceInDays(examDateObj, today), 1);

    // Per piani lunghi generiamo solo il dettaglio settimanale per risparmiare token
    const detailDays = Math.min(totalDays, 14);
    const topicsStr = topics.join(', ');

    const prompt = `Sei un coach universitario esperto. Crea un piano di studio dettagliato in ${language} per l'esame di "${courseName}".

Parametri:
- Data esame: ${examDate} (${totalDays} giorni disponibili)
- Voto target: ${targetGrade}/30
- Ore di studio al giorno: ${hoursPerDay}
- Formato esame: ${examFormat}
- Difficoltà del professore: ${difficulty}/5
- Argomenti da studiare: ${topicsStr}
${professorNotes ? `- Note sul professore: ${professorNotes}` : ''}

Crea un piano con:
1. Fasi di studio (comprensione → approfondimento → pratica → ripasso → simulazione)
2. Piano giornaliero dettagliato per i primi ${detailDays} giorni
3. Consigli generali e per il giorno dell'esame

Per ogni giorno specifica:
- "day": numero del giorno (1, 2, 3...)
- "date": data in formato YYYY-MM-DD
- "phase": nome della fase
- "activities": array di attività con type, title, description, durationMinutes, priority, topics
- "totalHours": ore totali del giorno
- "focus": tema principale del giorno
- "tips": consiglio specifico per quel giorno

Rispondi SOLO con JSON valido. Formato:
{
  "phases": [
    {
      "name": "Comprensione",
      "type": "comprensione",
      "description": "...",
      "startDay": 1,
      "endDay": 5,
      "weight": 30,
      "objective": "..."
    }
  ],
  "dailyPlan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "phase": "Comprensione",
      "activities": [
        {
          "type": "lettura",
          "title": "...",
          "description": "...",
          "durationMinutes": 60,
          "priority": "alta",
          "topics": ["..."]
        }
      ],
      "totalHours": 3,
      "focus": "...",
      "tips": "..."
    }
  ],
  "generalTips": ["...", "..."],
  "examDayTips": ["...", "..."]
}`;

    const raw = await generateJSON<Omit<StudyPlanAIResponse, 'courseName' | 'totalDays' | 'generatedAt'>>(prompt);

    // Normalizza le date del piano giornaliero a partire da oggi
    const dailyPlan: StudyDayAI[] = raw.dailyPlan.map((d, i) => ({
      ...d,
      day: i + 1,
      date: format(addDays(today, i), 'yyyy-MM-dd'),
    }));

    const response: StudyPlanAIResponse = {
      courseName,
      totalDays,
      phases: raw.phases,
      dailyPlan,
      generalTips: raw.generalTips || [],
      examDayTips: raw.examDayTips || [],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione del piano di studio', details: message }, { status: 500 });
  }
}
