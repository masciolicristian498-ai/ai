// ==========================================
// POST /api/generate/presentation
// Genera una presentazione slide-by-slide
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { PresentationRequest, PresentationResponse, Slide } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body: PresentationRequest = await req.json();
    const {
      topic,
      context = '',
      slideCount = 8,
      style = 'accademico',
      language = 'italiano',
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Il campo "topic" è obbligatorio' }, { status: 400 });
    }

    const safeSlideCount = Math.min(Math.max(slideCount, 3), 20);

    const styleDesc: Record<string, string> = {
      accademico: 'formale e accademico, con terminologia tecnica appropriata e riferimenti precisi',
      semplice: 'semplice e diretto, con linguaggio accessibile e concetti ben spiegati',
      dettagliato: 'dettagliato e approfondito, con esempi pratici e spiegazioni complete',
    };

    const prompt = `Sei un docente universitario esperto. Crea una presentazione di ${safeSlideCount} slide in ${language} sull'argomento "${topic}".
${context ? `Contesto: ${context}` : ''}
Stile: ${styleDesc[style] || styleDesc.accademico}.

La presentazione deve seguire questa struttura:
- Slide 1: "title" - Titolo e sottotitolo della presentazione
- Slide 2: "content" - Introduzione e obiettivi (3-4 punti)
- Slide 3 a ${safeSlideCount - 2}: "bullets" o "definition" - Contenuto principale
- Slide ${safeSlideCount - 1}: "content" - Sintesi/conclusioni
- Slide ${safeSlideCount}: "summary" - Punti chiave da ricordare

Per ogni slide specifica:
- "slideNumber": numero progressivo
- "title": titolo della slide
- "type": "title" | "content" | "bullets" | "summary" | "definition"
- "content": testo principale (per type "content")
- "bullets": array di punti elenco (per type "bullets", max 5 punti)
- "keyPoints": punti chiave (per type "summary", max 4 punti)
- "speakerNotes": note per il presentatore (1-3 frasi)

Rispondi SOLO con JSON valido. Formato:
{
  "title": "Titolo della presentazione",
  "slides": [
    {
      "slideNumber": 1,
      "title": "...",
      "type": "title",
      "content": "...",
      "speakerNotes": "..."
    },
    {
      "slideNumber": 2,
      "title": "...",
      "type": "bullets",
      "bullets": ["punto 1", "punto 2", "punto 3"],
      "speakerNotes": "..."
    }
  ]
}`;

    const raw = await generateJSON<{ title: string; slides: Omit<Slide, 'id'>[] }>(prompt);

    const slides: Slide[] = raw.slides.map((s) => ({
      ...s,
      id: uuidv4(),
    }));

    // Stima tempo di presentazione: ~2 min per slide
    const estimatedMinutes = slides.length * 2;

    const response: PresentationResponse = {
      slides,
      title: raw.title || topic,
      topic,
      totalSlides: slides.length,
      estimatedMinutes,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione della presentazione', details: message }, { status: 500 });
  }
}
