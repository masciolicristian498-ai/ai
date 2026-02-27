// ==========================================
// POST /api/generate/table
// Genera una tabella di studio strutturata
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';
import type { TableRequest, TableResponse, TableData } from '@/types/api';

const TABLE_TYPE_DESCRIPTIONS: Record<string, string> = {
  confronto: 'tabella di confronto tra concetti/elementi diversi (colonne = elementi, righe = criteri)',
  definizioni: 'tabella con termine in prima colonna, definizione nella seconda, esempio nella terza',
  timeline: 'tabella cronologica con colonne: Data/Periodo, Evento/Fatto, Importanza/Conseguenze',
  proprieta: 'tabella con proprietà/caratteristiche nelle righe e valori nelle colonne',
  auto: 'scegli il tipo più adatto all\'argomento',
};

export async function POST(req: NextRequest) {
  try {
    const body: TableRequest = await req.json();
    const {
      topic,
      context = '',
      tableType = 'auto',
      language = 'italiano',
    } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Il campo "topic" è obbligatorio' }, { status: 400 });
    }

    const typeDesc = TABLE_TYPE_DESCRIPTIONS[tableType] || TABLE_TYPE_DESCRIPTIONS.auto;

    const prompt = `Sei un esperto didattico universitario. Crea una tabella di studio in ${language} sull'argomento "${topic}".
${context ? `Contesto: ${context}` : ''}
Tipo di tabella: ${typeDesc}.

La tabella deve essere:
- Completa e informativa (almeno 4 righe, massimo 10)
- Con intestazioni chiare e brevi
- Con celle che contengono informazioni concise ma significative
- Utile per lo studio e il ripasso

Rispondi SOLO con JSON valido. Formato:
{
  "table": {
    "title": "Titolo descrittivo della tabella",
    "description": "Breve descrizione di cosa mostra la tabella",
    "headers": ["Colonna 1", "Colonna 2", "Colonna 3"],
    "rows": [
      ["valore 1.1", "valore 1.2", "valore 1.3"],
      ["valore 2.1", "valore 2.2", "valore 2.3"]
    ],
    "keyColumn": 0,
    "tableType": "${tableType === 'auto' ? 'auto-selezionato' : tableType}"
  }
}`;

    const raw = await generateJSON<{ table: TableData }>(prompt);

    const response: TableResponse = {
      table: raw.table,
      topic,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    return NextResponse.json({ error: 'Errore nella generazione della tabella', details: message }, { status: 500 });
  }
}
