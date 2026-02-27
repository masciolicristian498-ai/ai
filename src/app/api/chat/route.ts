import { NextRequest, NextResponse } from 'next/server';
import { getModel } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      professorName,
      subject,
      examFormat,
      difficulty,
      teachingStyle,
      preferredTopics,
      chatHistory,
      userMessage,
    } = body;

    if (!userMessage?.trim()) {
      return NextResponse.json({ error: 'Messaggio mancante' }, { status: 400 });
    }

    const model = getModel();

    const styleDesc = teachingStyle
      ? [
          teachingStyle.theoreticalFocus ? 'approccio teorico' : '',
          teachingStyle.practicalExamples ? 'esempi pratici' : '',
          teachingStyle.interactive ? 'interattivo' : '',
          `ritmo ${teachingStyle.speedPace || 'medio'}`,
          `spiegazione ${teachingStyle.explanation || 'mista'}`,
        ]
          .filter(Boolean)
          .join(', ')
      : 'stile equilibrato';

    const topicsHint =
      preferredTopics?.length > 0
        ? `\nArgomenti chiave del corso: ${preferredTopics.slice(0, 5).join(', ')}.`
        : '';

    const historyText =
      chatHistory && chatHistory.length > 0
        ? '\nConversazione recente:\n' +
          chatHistory
            .slice(-8)
            .map((m: { role: string; content: string }) =>
              `${m.role === 'user' ? 'Studente' : 'Prof. ' + professorName}: ${m.content}`
            )
            .join('\n')
        : '';

    const prompt = `Sei il Prof. ${professorName || 'Assistente'}, docente universitario di ${subject || 'questa materia'}.
Stile d'insegnamento: ${styleDesc}.
Tipo di esame: ${examFormat || 'orale'}, livello di difficoltà: ${difficulty || 3}/5.${topicsHint}

Il tuo compito è aiutare lo studente a prepararsi per l'esame di ${subject || 'questa materia'}.
Rispondi SEMPRE in italiano. Sii ${(difficulty || 3) >= 4 ? 'preciso, rigoroso e accademico' : 'chiaro, incoraggiante e accessibile'}.
Mantieni le risposte concise ma complete (massimo 250 parole). Usa elenchi puntati quando utile.
Se lo studente chiede di generare flashcard, quiz o materiali di studio, descrivi brevemente il contenuto e suggerisci di usare i pulsanti degli strumenti nel pannello laterale.${historyText}

Studente: ${userMessage}

Prof. ${professorName}:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Errore nel generare la risposta', details: String(error) },
      { status: 500 }
    );
  }
}
