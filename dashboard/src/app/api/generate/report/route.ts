// ==========================================
// POST /api/generate/report
// Genera un report accademico strutturato
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { ReportRequest, ReportResponse, ReportSection } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

const LENGTH_TARGETS: Record<string, { words: string; sections: number }> = {
  breve: { words: '400-600', sections: 3 },
  medio: { words: '800-1200', sections: 5 },
  lungo: { words: '1500-2200', sections: 7 },
};

const TYPE_DESC: Record<string, string> = {
  saggio: 'saggio accademico con tesi, argomentazione e conclusione critica',
  relazione: 'relazione tecnica con metodologia, risultati e discussione',
  analisi: 'analisi critica approfondita con sezioni tematiche e valutazioni',
  riassunto: 'riassunto strutturato che sintetizza i concetti fondamentali',
};

export async function POST(req: NextRequest) {
  try {
    const body: ReportRequest = await req.json();
    const {
      topic,
      context = '',
      reportType = 'analisi',
      length = 'medio',
      language = 'italiano',
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Il campo "topic" è obbligatorio' }, { status: 400 });
    }

    const target = LENGTH_TARGETS[length] || LENGTH_TARGETS.medio;
    const typeDesc = TYPE_DESC[reportType] || TYPE_DESC.analisi;

    const prompt = `Sei un professore universitario esperto. Scrivi un ${typeDesc} in ${language} sull'argomento "${topic}".
${context ? `Contesto aggiuntivo: ${context}` : ''}
Lunghezza target: ${target.words} parole totali. Struttura: ${target.sections} sezioni principali.

Il documento deve avere:
- Un titolo accademico preciso
- Un abstract di 2-3 frasi che sintetizza il contenuto
- Sezioni principali con titoli chiari (livello 1)
- Eventuali sottosezioni (livello 2) per sezioni complesse
- In ogni sezione: content (testo completo, min 80 parole), keyPoints (3-5 punti chiave)
- Una bibliografia con 4-6 riferimenti accademici plausibili
- Stima realistica del word count totale

Rispondi SOLO con JSON valido. Formato:
{
  "title": "Titolo del documento",
  "abstract": "Sintesi breve del documento...",
  "reportType": "${reportType}",
  "sections": [
    {
      "title": "1. Titolo sezione",
      "content": "Testo della sezione...",
      "keyPoints": ["punto 1", "punto 2", "punto 3"],
      "level": 1
    },
    {
      "title": "1.1 Sottosezione",
      "content": "Testo sottosezione...",
      "keyPoints": ["punto 1"],
      "level": 2
    }
  ],
  "bibliography": [
    "Cognome, N. (anno). Titolo. Editore.",
    "..."
  ],
  "wordCount": 950
}`;

    const raw = await generateJSON<{
      title: string;
      abstract: string;
      reportType: string;
      sections: Omit<ReportSection, 'id'>[];
      bibliography: string[];
      wordCount: number;
    }>(prompt);

    const sections: ReportSection[] = raw.sections.map((s) => ({
      ...s,
      id: uuidv4(),
      level: s.level ?? 1,
    }));

    const response: ReportResponse = {
      title: raw.title,
      abstract: raw.abstract,
      reportType: raw.reportType || reportType,
      sections,
      bibliography: raw.bibliography || [],
      wordCount: raw.wordCount || 0,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione del report', details: message }, { status: 500 });
  }
}
