// ==========================================
// POST /api/generate/video-script
// Genera uno script/storyboard per video educativo
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { VideoScriptRequest, VideoScriptResponse, VideoScene } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

const DURATION_SCENES: Record<number, { scenes: number; secPerScene: number }> = {
  3: { scenes: 5, secPerScene: 36 },
  5: { scenes: 8, secPerScene: 37 },
  10: { scenes: 14, secPerScene: 43 },
};

const STYLE_DESC: Record<string, string> = {
  divulgativo: 'divulgativo e accessibile, come un video YouTube educativo per il grande pubblico. Linguaggio chiaro, esempi concreti, tono coinvolgente',
  accademico: 'accademico e rigoroso, adatto a una lezione universitaria. Terminologia tecnica precisa, struttura logica formale',
  storytelling: 'narrativo e coinvolgente, con struttura a storia. Usa metafore, aneddoti, e progressione drammatica per spiegare i concetti',
};

export async function POST(req: NextRequest) {
  try {
    const body: VideoScriptRequest = await req.json();
    const {
      topic,
      context = '',
      durationMinutes = 5,
      style = 'divulgativo',
      language = 'italiano',
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Il campo "topic" è obbligatorio' }, { status: 400 });
    }

    const safeDuration = ([3, 5, 10] as const).includes(durationMinutes as 3 | 5 | 10)
      ? durationMinutes
      : 5;
    const { scenes: sceneCount, secPerScene } = DURATION_SCENES[safeDuration];
    const styleDesc = STYLE_DESC[style] || STYLE_DESC.divulgativo;
    const totalSeconds = safeDuration * 60;

    const prompt = `Sei un esperto di produzione video educativa. Crea lo script completo e lo storyboard per un video di ${safeDuration} minuti in ${language} sull'argomento "${topic}".
${context ? `Contesto: ${context}` : ''}
Stile: ${styleDesc}.

Il video deve avere ${sceneCount} scene, ognuna circa ${secPerScene} secondi.

Struttura obbligatoria:
- Hook iniziale (prima frase che cattura l'attenzione)
- ${sceneCount} scene con narrazione e indicazioni visive
- Closing line memorabile

Per ogni scena specifica:
- "sceneNumber": numero progressivo (1, 2, 3...)
- "title": titolo breve della scena (es. "Introduzione", "Il problema centrale")
- "narration": il testo COMPLETO da leggere/recitare (min 50 parole per scena)
- "visuals": descrizione dettagliata di cosa appare sullo schermo (animazioni, grafici, testi sovrapposti, B-roll, ecc.)
- "durationSeconds": durata in secondi (tra 25 e 60)
- "keyPoints": array di 2-3 concetti chiave della scena
- "transition": tipo di transizione alla scena successiva (es. "dissolvenza", "taglio netto", "zoom out")

Rispondi SOLO con JSON valido. Formato:
{
  "title": "Titolo del video",
  "style": "${style}",
  "hook": "Frase hook iniziale...",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Titolo scena",
      "narration": "Testo completo da narrare...",
      "visuals": "Descrizione di cosa si vede...",
      "durationSeconds": ${secPerScene},
      "keyPoints": ["punto 1", "punto 2"],
      "transition": "taglio netto"
    }
  ],
  "closingLine": "Frase finale memorabile...",
  "productionNotes": ["nota produzione 1", "nota produzione 2"]
}`;

    const raw = await generateJSON<{
      title: string;
      style: string;
      hook: string;
      scenes: Omit<VideoScene, 'id'>[];
      closingLine: string;
      productionNotes: string[];
    }>(prompt);

    const scenes: VideoScene[] = raw.scenes.map((s) => ({
      ...s,
      id: uuidv4(),
    }));

    // Ricalcola la durata totale dai dati reali
    const realDuration = scenes.reduce((sum, s) => sum + (s.durationSeconds || secPerScene), 0);

    const response: VideoScriptResponse = {
      title: raw.title || topic,
      topic,
      style: raw.style || style,
      totalDurationSeconds: realDuration || totalSeconds,
      hook: raw.hook || '',
      scenes,
      closingLine: raw.closingLine || '',
      productionNotes: raw.productionNotes || [],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione dello script video', details: message }, { status: 500 });
  }
}
