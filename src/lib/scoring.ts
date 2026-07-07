// Motor de puntaje del Autodiagnóstico SESFI.
// Regla central: menor puntaje total = mayor madurez institucional.

import { BLOCKS, QUESTIONS, QUESTION_IDS } from "./questionnaire";

export interface LevelInfo {
  /** 1 = más maduro, 4 = emergente. */
  level: 1 | 2 | 3 | 4;
  name: string;
  minScore: number;
  maxScore: number;
  description: string;
  /** Programa al cual se recomienda sumarse. */
  program: string;
  programDescription: string;
  /** Color de acento para el reporte. */
  color: string;
}

// Rangos y textos configurables (fuente: DOCX SESFI). Editar aquí no cambia la lógica.
export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    name: "Escalamiento e impacto transformador",
    minScore: 10,
    maxScore: 14,
    description:
      "La organización opera con la máxima excelencia técnica, contable y operativa. Excelente diversificación de ingresos y resiliencia institucional probada.",
    program: "Programa de Escalamiento e Impacto Transformador",
    programDescription:
      "Acompañamiento para escalar el impacto, fortalecer la incidencia en políticas públicas y consolidar la sostenibilidad y resiliencia del ecosistema.",
    color: "#16a34a",
  },
  {
    level: 2,
    name: "Innovación institucional",
    minScore: 15,
    maxScore: 24,
    description:
      "Estructura sólida, con procesos claros y un estricto cumplimiento fiscal por centros de costos. Lista para dar el salto hacia el escalamiento sistémico.",
    program: "Programa de Innovación Institucional",
    programDescription:
      "Acompañamiento para institucionalizar procesos, robustecer la medición de impacto y preparar a la organización para el escalamiento sistémico.",
    color: "#2563eb",
  },
  {
    level: 3,
    name: "Construcción y consolidación de capacidades",
    minScore: 25,
    maxScore: 34,
    description:
      "La OSC tiene bases documentadas, pero requiere independizar su operación de la discrecionalidad del equipo y profesionalizar de manera urgente su contabilidad por proyectos.",
    program: "Programa de Construcción y Consolidación de Capacidades",
    programDescription:
      "Acompañamiento para profesionalizar procesos administrativos y contables, formalizar la gobernanza y consolidar las bases institucionales.",
    color: "#d97706",
  },
  {
    level: 4,
    name: "Organización emergente",
    minScore: 35,
    maxScore: 40,
    description:
      "Alerta institucional alta. La organización opera en modo reactivo, con un esquema financiero/contable vulnerable que pone en riesgo crítico su permanencia legal y operativa.",
    program: "Programa de Impulso a OSC Emergentes",
    programDescription:
      "Acompañamiento para formalizar la estructura legal y fiscal, establecer controles básicos y sentar las bases mínimas de operación institucional.",
    color: "#dc2626",
  },
];

export const MIN_TOTAL = 10;
export const MAX_TOTAL = 40;

export interface BlockScore {
  blockId: string;
  name: string;
  shortName: string;
  /** Promedio de puntaje del bloque (1..4). */
  avg: number;
  /** Porcentaje de madurez del bloque (0..100). Mayor = más maduro. */
  pct: number;
}

export interface DiagnosisResult {
  totalScore: number;
  level: 1 | 2 | 3 | 4;
  levelName: string;
  levelDescription: string;
  program: string;
  programDescription: string;
  color: string;
  /** Madurez global 0..100 (mayor = más maduro). */
  globalPct: number;
  blocks: BlockScore[];
}

export type Answers = Record<string, number>;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Devuelve el nivel/programa correspondiente a un puntaje total (10..40). */
export function levelFromScore(totalScore: number): LevelInfo {
  const info = LEVELS.find(
    (l) => totalScore >= l.minScore && totalScore <= l.maxScore,
  );
  if (!info) {
    throw new Error(`Puntaje fuera de rango (10-40): ${totalScore}`);
  }
  return info;
}

/** Valida que existan las 10 respuestas y que cada una sea 1..4. */
export function validateAnswers(answers: Answers): void {
  for (const id of QUESTION_IDS) {
    const v = answers[id];
    if (v === undefined || v === null) {
      throw new Error(`Falta la respuesta de ${id}.`);
    }
    if (!Number.isInteger(v) || v < 1 || v > 4) {
      throw new Error(`Respuesta inválida para ${id}: ${v} (debe ser 1..4).`);
    }
  }
}

/** Calcula el diagnóstico completo a partir de las respuestas (q1..q10 -> 1..4). */
export function computeResult(answers: Answers): DiagnosisResult {
  validateAnswers(answers);

  const totalScore = QUESTION_IDS.reduce((sum, id) => sum + answers[id], 0);
  const info = levelFromScore(totalScore);

  const blocks: BlockScore[] = BLOCKS.map((block) => {
    const qs = QUESTIONS.filter((q) => q.blockId === block.id);
    const avg =
      qs.reduce((sum, q) => sum + answers[q.id], 0) / qs.length;
    // Madurez: promedio 1 -> 100%, promedio 4 -> 0%.
    const pct = ((4 - avg) / 3) * 100;
    return {
      blockId: block.id,
      name: block.name,
      shortName: block.shortName,
      avg: round1(avg),
      pct: round1(pct),
    };
  });

  const globalPct = round1(
    ((MAX_TOTAL - totalScore) / (MAX_TOTAL - MIN_TOTAL)) * 100,
  );

  return {
    totalScore,
    level: info.level,
    levelName: info.name,
    levelDescription: info.description,
    program: info.program,
    programDescription: info.programDescription,
    color: info.color,
    globalPct,
    blocks,
  };
}
