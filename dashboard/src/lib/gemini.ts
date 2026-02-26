// ==========================================
// GEMINI CLIENT - Singleton utility
// ==========================================
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type { Professor, ChatMessage } from '@/types';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY non configurata. Aggiungi la chiave in .env.local');
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export function getModel(): GenerativeModel {
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return getClient().getGenerativeModel({ model: modelName });
}

/**
 * Genera testo con Gemini e restituisce JSON parsato.
 * Il prompt DEVE chiedere output JSON valido.
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Pulisce eventuali markdown code fences che Gemini aggiunge
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Gemini ha restituito JSON non valido:\n${cleaned}`);
  }
}

/**
 * Genera testo libero con Gemini.
 */
export async function generateText(prompt: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateChatResponse(
  professor: Professor,
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
  const client = getClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const systemInstruction = `Sei il Professor ${professor.name}, docente di ${professor.department}.
Il tuo stile di insegnamento è: ${JSON.stringify(professor.teachingStyle)}.
Il tuo stile d'esame è: ${JSON.stringify(professor.examStyle)}.
Argomenti preferiti: ${professor.preferredTopics.join(', ')}.
Domande tipiche: ${professor.typicalQuestions.join(', ')}.
Note: ${professor.notes}.

Rispondi alle domande dello studente comportandoti esattamente come questo professore.
Sii coerente con la tua difficoltà (${professor.difficulty}/5).
`;

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessage(newMessage);
  return result.response.text();
}
