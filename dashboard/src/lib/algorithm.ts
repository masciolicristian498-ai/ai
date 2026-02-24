// ==========================================
// CORE ALGORITHM - Study Plan Generator
// ==========================================
// Generates personalized study plans based on:
// - Professor behavior & exam style
// - Available days until exam
// - Material uploaded by student
// - CFU weight and course difficulty

import { v4 as uuidv4 } from 'uuid';
import type {
  Professor,
  StudyPlan,
  StudyPhase,
  DailyTask,
  TaskItem,
  StudyMaterial,
  OnboardingData,
  ExamSimulation,
  SimulationQuestion,
} from '@/types';

// ---- PHASE DISTRIBUTION ALGORITHM ----
// Distributes study time across phases based on professor style and available days

interface PhaseConfig {
  name: string;
  type: StudyPhase['type'];
  description: string;
  baseWeight: number; // base percentage
}

const BASE_PHASES: PhaseConfig[] = [
  {
    name: 'Comprensione',
    type: 'comprensione',
    description: 'Lettura e comprensione dei concetti fondamentali',
    baseWeight: 30,
  },
  {
    name: 'Approfondimento',
    type: 'approfondimento',
    description: 'Studio dettagliato dei temi chiave del professore',
    baseWeight: 25,
  },
  {
    name: 'Pratica',
    type: 'pratica',
    description: 'Esercizi, casi studio e applicazioni pratiche',
    baseWeight: 20,
  },
  {
    name: 'Ripasso',
    type: 'ripasso',
    description: 'Consolidamento e ripasso generale',
    baseWeight: 15,
  },
  {
    name: 'Simulazione',
    type: 'simulazione',
    description: "Simulazioni d'esame nello stile del professore",
    baseWeight: 10,
  },
];

function adjustPhaseWeights(
  phases: PhaseConfig[],
  professor: Professor,
  totalDays: number
): PhaseConfig[] {
  const adjusted = phases.map((p) => ({ ...p }));
  const { examStyle } = professor;

  // If professor focuses on exercises/practical, increase practice phase
  if (examStyle.exercises || examStyle.caseStudies) {
    const practiceIdx = adjusted.findIndex((p) => p.type === 'pratica');
    const compIdx = adjusted.findIndex((p) => p.type === 'comprensione');
    adjusted[practiceIdx].baseWeight += 10;
    adjusted[compIdx].baseWeight -= 5;
    adjusted[adjusted.findIndex((p) => p.type === 'approfondimento')].baseWeight -= 5;
  }

  // If exam is oral, increase ripasso (revision) for verbal rehearsal
  if (examStyle.oralWeight > 50) {
    const ripassoIdx = adjusted.findIndex((p) => p.type === 'ripasso');
    const simIdx = adjusted.findIndex((p) => p.type === 'simulazione');
    adjusted[ripassoIdx].baseWeight += 5;
    adjusted[simIdx].baseWeight += 5;
    adjusted[adjusted.findIndex((p) => p.type === 'pratica')].baseWeight -= 10;
  }

  // If professor is strict, increase simulation time
  if (examStyle.strictGrading) {
    const simIdx = adjusted.findIndex((p) => p.type === 'simulazione');
    adjusted[simIdx].baseWeight += 5;
    adjusted[adjusted.findIndex((p) => p.type === 'comprensione')].baseWeight -= 5;
  }

  // If few days, compress understanding phase, boost revision + simulation
  if (totalDays <= 7) {
    const compIdx = adjusted.findIndex((p) => p.type === 'comprensione');
    const ripassoIdx = adjusted.findIndex((p) => p.type === 'ripasso');
    const simIdx = adjusted.findIndex((p) => p.type === 'simulazione');
    adjusted[compIdx].baseWeight -= 10;
    adjusted[ripassoIdx].baseWeight += 5;
    adjusted[simIdx].baseWeight += 5;
  }

  // If professor focuses on details, increase approfondimento
  if (examStyle.focusOnDetails) {
    const appIdx = adjusted.findIndex((p) => p.type === 'approfondimento');
    adjusted[appIdx].baseWeight += 8;
    adjusted[adjusted.findIndex((p) => p.type === 'ripasso')].baseWeight -= 4;
    adjusted[adjusted.findIndex((p) => p.type === 'comprensione')].baseWeight -= 4;
  }

  // Normalize weights to 100
  const total = adjusted.reduce((s, p) => s + p.baseWeight, 0);
  adjusted.forEach((p) => {
    p.baseWeight = Math.round((p.baseWeight / total) * 100);
  });

  return adjusted;
}

// ---- TOPIC EXTRACTION ----
// Generates topics based on professor's preferred topics and material

function generateTopicsForPhase(
  phase: PhaseConfig,
  professor: Professor,
  materials: StudyMaterial[],
  onboarding: OnboardingData
): string[] {
  const profTopics = professor.preferredTopics;
  const hasBooks = materials.some((m) => m.type === 'libro');
  const hasSlides = materials.some((m) => m.type === 'slide');

  const baseTopics: string[] = [];

  switch (phase.type) {
    case 'comprensione':
      baseTopics.push(
        ...profTopics.slice(0, Math.ceil(profTopics.length / 2)).map((t) => `Introduzione: ${t}`)
      );
      if (hasBooks) baseTopics.push('Lettura capitoli fondamentali del libro di testo');
      if (hasSlides) baseTopics.push('Revisione slide del professore');
      baseTopics.push(`Schema generale del corso di ${onboarding.courseName}`);
      break;

    case 'approfondimento':
      baseTopics.push(
        ...profTopics.map((t) => `Approfondimento: ${t}`)
      );
      if (professor.examStyle.focusOnDetails) {
        baseTopics.push('Dettagli e definizioni specifiche richieste dal professore');
      }
      break;

    case 'pratica':
      if (professor.examStyle.exercises) {
        baseTopics.push('Esercizi tipo esame');
      }
      if (professor.examStyle.caseStudies) {
        baseTopics.push('Casi studio pratici');
      }
      baseTopics.push('Esercizi sui temi principali del professore');
      profTopics.slice(0, 3).forEach((t) => baseTopics.push(`Esercitazione: ${t}`));
      break;

    case 'ripasso':
      baseTopics.push('Ripasso concetti chiave');
      baseTopics.push('Revisione mappe concettuali');
      if (professor.examStyle.oralWeight > 30) {
        baseTopics.push("Preparazione esposizione orale");
      }
      baseTopics.push('Ripasso argomenti deboli');
      break;

    case 'simulazione':
      baseTopics.push(`Simulazione esame ${professor.examFormat}`);
      if (professor.examStyle.oralWeight > 0) {
        baseTopics.push('Simulazione domande orali tipiche del professore');
      }
      if (professor.examStyle.writtenWeight > 0) {
        baseTopics.push('Simulazione prova scritta');
      }
      baseTopics.push('Revisione errori simulazioni precedenti');
      break;
  }

  return baseTopics;
}

// ---- TASK GENERATION ----
// Generates specific daily tasks

function generateTasksForDay(
  day: number,
  phase: StudyPhase,
  hoursPerDay: number,
  professor: Professor,
  topics: string[]
): TaskItem[] {
  const tasks: TaskItem[] = [];
  const minutesAvailable = hoursPerDay * 60;
  let minutesUsed = 0;

  const topicIndex = day % topics.length;
  const currentTopic = topics[topicIndex] || topics[0];

  switch (phase.type) {
    case 'comprensione': {
      tasks.push({
        id: uuidv4(),
        title: 'Lettura materiale',
        description: `Leggere e sottolineare: ${currentTopic}`,
        type: 'lettura',
        duration: Math.min(90, minutesAvailable * 0.5),
        completed: false,
        priority: 'alta',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      tasks.push({
        id: uuidv4(),
        title: 'Creazione riassunto',
        description: `Riassumere i punti chiave di: ${currentTopic}`,
        type: 'riassunto',
        duration: Math.min(45, (minutesAvailable - minutesUsed) * 0.4),
        completed: false,
        priority: 'media',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      if (minutesAvailable - minutesUsed > 30) {
        tasks.push({
          id: uuidv4(),
          title: 'Mappa concettuale',
          description: `Creare mappa concettuale per: ${currentTopic}`,
          type: 'mappa_concettuale',
          duration: Math.min(30, minutesAvailable - minutesUsed),
          completed: false,
          priority: 'bassa',
        });
      }
      break;
    }

    case 'approfondimento': {
      tasks.push({
        id: uuidv4(),
        title: 'Studio approfondito',
        description: `Approfondire: ${currentTopic}`,
        type: 'lettura',
        duration: Math.min(60, minutesAvailable * 0.4),
        completed: false,
        priority: 'alta',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      tasks.push({
        id: uuidv4(),
        title: 'Flashcard',
        description: `Creare flashcard per definizioni e concetti: ${currentTopic}`,
        type: 'flashcard',
        duration: Math.min(30, (minutesAvailable - minutesUsed) * 0.3),
        completed: false,
        priority: 'media',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      if (professor.examStyle.focusOnDetails) {
        tasks.push({
          id: uuidv4(),
          title: 'Dettagli specifici',
          description: 'Memorizzare definizioni, date, formule specifiche richieste dal professore',
          type: 'ripasso',
          duration: Math.min(45, minutesAvailable - minutesUsed),
          completed: false,
          priority: 'alta',
        });
      }
      break;
    }

    case 'pratica': {
      tasks.push({
        id: uuidv4(),
        title: 'Esercizi pratici',
        description: `Svolgere esercizi su: ${currentTopic}`,
        type: 'esercizi',
        duration: Math.min(90, minutesAvailable * 0.6),
        completed: false,
        priority: 'alta',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      tasks.push({
        id: uuidv4(),
        title: 'Correzione e analisi errori',
        description: 'Rivedere gli errori fatti e capire dove migliorare',
        type: 'ripasso',
        duration: Math.min(30, minutesAvailable - minutesUsed),
        completed: false,
        priority: 'media',
      });
      break;
    }

    case 'ripasso': {
      tasks.push({
        id: uuidv4(),
        title: 'Ripasso veloce',
        description: 'Ripasso di tutti gli argomenti principali con flashcard',
        type: 'ripasso',
        duration: Math.min(60, minutesAvailable * 0.4),
        completed: false,
        priority: 'alta',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      tasks.push({
        id: uuidv4(),
        title: 'Autoverifica',
        description: 'Test rapido sugli argomenti chiave del professore',
        type: 'esercizi',
        duration: Math.min(45, (minutesAvailable - minutesUsed) * 0.5),
        completed: false,
        priority: 'alta',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      if (professor.examStyle.oralWeight > 30) {
        tasks.push({
          id: uuidv4(),
          title: 'Esposizione orale',
          description: "Esercitarsi nell'esposizione orale cronometrata",
          type: 'simulazione',
          duration: Math.min(30, minutesAvailable - minutesUsed),
          completed: false,
          priority: 'media',
        });
      }
      break;
    }

    case 'simulazione': {
      tasks.push({
        id: uuidv4(),
        title: `Simulazione esame ${professor.examFormat}`,
        description: `Eseguire simulazione completa nello stile del Prof. ${professor.name}`,
        type: 'simulazione',
        duration: Math.min(professor.examStyle.timeMinutes || 90, minutesAvailable * 0.6),
        completed: false,
        priority: 'alta',
      });
      minutesUsed += tasks[tasks.length - 1].duration;

      tasks.push({
        id: uuidv4(),
        title: 'Analisi risultati',
        description: 'Analizzare errori e lacune dalla simulazione',
        type: 'ripasso',
        duration: Math.min(30, minutesAvailable - minutesUsed),
        completed: false,
        priority: 'alta',
      });
      break;
    }
  }

  return tasks;
}

// ---- MAIN PLAN GENERATOR ----

export function generateStudyPlan(
  onboarding: OnboardingData,
  professor: Professor,
  materials: StudyMaterial[]
): StudyPlan {
  const examDate = new Date(onboarding.examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalDays = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // 1. Adjust phase weights based on professor
  const adjustedPhases = adjustPhaseWeights(BASE_PHASES, professor, totalDays);

  // 2. Create phases with day ranges
  let currentDay = 1;
  const phases: StudyPhase[] = adjustedPhases.map((config) => {
    const phaseDays = Math.max(1, Math.round((config.baseWeight / 100) * totalDays));
    const topics = generateTopicsForPhase(config, professor, materials, onboarding);
    const phase: StudyPhase = {
      id: uuidv4(),
      name: config.name,
      description: config.description,
      startDay: currentDay,
      endDay: currentDay + phaseDays - 1,
      type: config.type,
      weight: config.baseWeight,
      topics,
      completed: false,
    };
    currentDay += phaseDays;
    return phase;
  });

  // Adjust last phase to cover remaining days
  if (phases.length > 0) {
    phases[phases.length - 1].endDay = totalDays;
  }

  // 3. Generate daily tasks
  const dailyTasks: DailyTask[] = [];
  for (let day = 1; day <= totalDays; day++) {
    const phase = phases.find((p) => day >= p.startDay && day <= p.endDay) || phases[phases.length - 1];
    const taskDate = new Date(today);
    taskDate.setDate(taskDate.getDate() + day - 1);

    const tasks = generateTasksForDay(day, phase, onboarding.hoursPerDay, professor, phase.topics);

    dailyTasks.push({
      id: uuidv4(),
      day,
      date: taskDate.toISOString().split('T')[0],
      phaseId: phase.id,
      tasks,
      estimatedHours: tasks.reduce((sum, t) => sum + t.duration, 0) / 60,
      completed: false,
    });
  }

  return {
    id: uuidv4(),
    examId: uuidv4(),
    professorId: professor.id,
    totalDays,
    startDate: today.toISOString().split('T')[0],
    examDate: onboarding.examDate,
    phases,
    dailyTasks,
    overallProgress: 0,
    adaptiveAdjustments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ---- EXAM SIMULATION GENERATOR ----

export function generateExamSimulation(
  professor: Professor,
  topics: string[]
): ExamSimulation {
  const questions: SimulationQuestion[] = [];
  const numQuestions = professor.examStyle.averageQuestions || 5;

  for (let i = 0; i < numQuestions; i++) {
    const topic = topics[i % topics.length] || 'Argomento generale';
    const difficulty = Math.min(5, Math.max(1, Math.round(professor.difficulty * (0.7 + Math.random() * 0.6)))) as 1 | 2 | 3 | 4 | 5;

    let type: SimulationQuestion['type'] = 'aperta';
    if (professor.examStyle.multipleChoice && Math.random() > 0.5) type = 'multipla';
    if (professor.examStyle.exercises && Math.random() > 0.6) type = 'esercizio';
    if (professor.examStyle.caseStudies && Math.random() > 0.7) type = 'caso_studio';

    const question: SimulationQuestion = {
      id: uuidv4(),
      text: generateQuestionText(topic, type, professor),
      type,
      topic,
      difficulty,
      maxScore: type === 'caso_studio' ? 8 : type === 'esercizio' ? 6 : type === 'aperta' ? 5 : 3,
      options: type === 'multipla' ? generateOptions(topic) : undefined,
    };

    questions.push(question);
  }

  return {
    id: uuidv4(),
    examId: '',
    professorId: professor.id,
    type: professor.examFormat,
    questions,
    totalScore: 0,
    maxScore: questions.reduce((s, q) => s + q.maxScore, 0),
    grade: 0,
  };
}

function generateQuestionText(
  topic: string,
  type: SimulationQuestion['type'],
  professor: Professor
): string {
  const templates: Record<SimulationQuestion['type'], string[]> = {
    aperta: [
      `Illustra in modo dettagliato il concetto di "${topic}" e le sue implicazioni.`,
      `Descrivi "${topic}" evidenziando i punti fondamentali trattati a lezione.`,
      `Spiega "${topic}" e fornisci esempi concreti.`,
      `Analizza criticamente "${topic}" e le sue applicazioni nel contesto del corso.`,
    ],
    multipla: [
      `Quale delle seguenti affermazioni riguardo "${topic}" è corretta?`,
      `In relazione a "${topic}", individua l'affermazione FALSA:`,
      `Riguardo a "${topic}", seleziona la risposta più completa:`,
    ],
    esercizio: [
      `Risolvi il seguente esercizio riguardante "${topic}".`,
      `Applica i concetti di "${topic}" per risolvere il seguente problema.`,
      `Dato il seguente scenario su "${topic}", calcola e motiva la risposta.`,
    ],
    caso_studio: [
      `Analizza il seguente caso pratico relativo a "${topic}" e proponi una soluzione motivata.`,
      `Applicando i principi di "${topic}", valuta il caso descritto e indica il percorso risolutivo.`,
    ],
  };

  const options = templates[type];
  const template = options[Math.floor(Math.random() * options.length)];

  if (professor.examStyle.focusOnDetails) {
    return template + ' Presta particolare attenzione ai dettagli e alle definizioni precise.';
  }
  if (professor.examStyle.focusOnConcepts) {
    return template + ' Concentra la risposta sui concetti fondamentali e i collegamenti tra di essi.';
  }
  return template;
}

function generateOptions(topic: string): string[] {
  return [
    `Opzione A - Definizione corretta di ${topic}`,
    `Opzione B - Definizione parzialmente corretta`,
    `Opzione C - Definizione errata comune`,
    `Opzione D - Nessuna delle precedenti`,
  ];
}

// ---- ADAPTIVE ALGORITHM ----
// Adjusts the study plan based on completed tasks and performance

export function calculateAdaptiveProgress(plan: StudyPlan): {
  progress: number;
  behindSchedule: boolean;
  daysAhead: number;
  recommendation: string;
  phaseProgress: { phase: string; progress: number }[];
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(plan.startDate);
  const currentDay = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const completedTasks = plan.dailyTasks.filter((d) => d.completed).length;
  const expectedTasks = Math.min(currentDay, plan.totalDays);
  const progress = plan.totalDays > 0 ? (completedTasks / plan.totalDays) * 100 : 0;
  const behindSchedule = completedTasks < expectedTasks - 1;
  const daysAhead = completedTasks - expectedTasks;

  const phaseProgress = plan.phases.map((phase) => {
    const phaseTasks = plan.dailyTasks.filter((d) => d.phaseId === phase.id);
    const completedPhaseTasks = phaseTasks.filter((d) => d.completed).length;
    return {
      phase: phase.name,
      progress: phaseTasks.length > 0 ? (completedPhaseTasks / phaseTasks.length) * 100 : 0,
    };
  });

  let recommendation: string;
  if (behindSchedule && daysAhead < -3) {
    recommendation = 'Sei molto indietro. Considera di aumentare le ore giornaliere o concentrarti sugli argomenti chiave del professore.';
  } else if (behindSchedule) {
    recommendation = 'Sei leggermente indietro. Prova a recuperare nei prossimi giorni dedicando un po\' più di tempo.';
  } else if (daysAhead > 2) {
    recommendation = 'Ottimo ritmo! Sei in anticipo. Puoi approfondire gli argomenti più complessi.';
  } else {
    recommendation = 'Sei perfettamente in linea con il piano. Continua così!';
  }

  return { progress, behindSchedule, daysAhead, recommendation, phaseProgress };
}
