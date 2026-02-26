// ==========================================
// POST /api/generate/mindmap
// Genera una mappa concettuale gerarchica
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { MindMapRequest, MindMapResponse, MindMapNode } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

// Assegna colori per livello per aiutare il frontend a visualizzare
const LEVEL_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

type RawNode = Omit<MindMapNode, 'id' | 'level' | 'color'> & { children?: RawNode[] };

function assignIds(node: RawNode, level: number = 0): MindMapNode {
  return {
    ...node,
    id: uuidv4(),
    level,
    color: LEVEL_COLORS[Math.min(level, LEVEL_COLORS.length - 1)],
    children: node.children?.map((child) => assignIds(child, level + 1)),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: MindMapRequest = await req.json();
    const {
      topic,
      context = '',
      depth = 3,
      language = 'italiano',
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Il campo "topic" è obbligatorio' }, { status: 400 });
    }

    const safeDepth = Math.min(Math.max(depth, 2), 4);

    const prompt = `Sei un esperto didattico. Crea una mappa concettuale strutturata in ${language} per l'argomento "${topic}".
${context ? `Contesto: ${context}` : ''}
Profondità massima: ${safeDepth} livelli (nodo radice = livello 0).

Struttura:
- Il nodo radice rappresenta l'argomento principale
- Il primo livello: 4-6 macro-concetti fondamentali
- Il secondo livello: 2-4 sotto-concetti per ogni nodo di primo livello
- Il terzo livello (se richiesto): esempi o dettagli specifici

Per ogni nodo specifica:
- "label": etichetta breve del concetto (max 5 parole)
- "description": breve spiegazione (1-2 frasi, opzionale per nodi profondi)
- "children": array di nodi figli (vuoto [] per le foglie)

Rispondi SOLO con JSON valido. Formato:
{
  "root": {
    "label": "${topic}",
    "description": "Argomento principale",
    "children": [
      {
        "label": "Concetto 1",
        "description": "...",
        "children": [
          {
            "label": "Sotto-concetto 1.1",
            "description": "...",
            "children": []
          }
        ]
      }
    ]
  }
}`;

    const raw = await generateJSON<{ root: RawNode }>(prompt);

    const root = assignIds(raw.root, 0);

    const response: MindMapResponse = {
      root,
      topic,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione della mappa concettuale', details: message }, { status: 500 });
  }
}
