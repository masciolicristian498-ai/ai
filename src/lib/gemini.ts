// ==========================================
// GEMINI CLIENT - Singleton utility
// ==========================================
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

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
