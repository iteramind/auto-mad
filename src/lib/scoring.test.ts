import { describe, it, expect } from "vitest";
import {
  computeResult,
  levelFromScore,
  validateAnswers,
  type Answers,
} from "./scoring";
import { QUESTION_IDS } from "./questionnaire";

/** Construye respuestas cuya suma sea exactamente `total` (10..40). */
function answersForTotal(total: number): Answers {
  let remaining = total - QUESTION_IDS.length; // cada pregunta parte de 1
  const a: Answers = {};
  for (const id of QUESTION_IDS) {
    const add = Math.min(3, Math.max(0, remaining));
    a[id] = 1 + add;
    remaining -= add;
  }
  return a;
}

function answersAll(score: number): Answers {
  return Object.fromEntries(QUESTION_IDS.map((id) => [id, score]));
}

describe("levelFromScore - fronteras de rango", () => {
  const cases: [number, number][] = [
    [10, 1],
    [14, 1],
    [15, 2],
    [24, 2],
    [25, 3],
    [34, 3],
    [35, 4],
    [40, 4],
  ];
  it.each(cases)("puntaje %i -> nivel %i", (score, level) => {
    expect(levelFromScore(score).level).toBe(level);
  });

  it("lanza fuera de rango", () => {
    expect(() => levelFromScore(9)).toThrow();
    expect(() => levelFromScore(41)).toThrow();
  });
});

describe("computeResult - totales y niveles", () => {
  it("todas opción 1 => total 10, nivel 1, madurez 100%", () => {
    const r = computeResult(answersAll(1));
    expect(r.totalScore).toBe(10);
    expect(r.level).toBe(1);
    expect(r.globalPct).toBe(100);
  });

  it("todas opción 4 => total 40, nivel 4, madurez 0%", () => {
    const r = computeResult(answersAll(4));
    expect(r.totalScore).toBe(40);
    expect(r.level).toBe(4);
    expect(r.globalPct).toBe(0);
  });

  it("total 25 => nivel 3 y madurez global 50%", () => {
    const r = computeResult(answersForTotal(25));
    expect(r.totalScore).toBe(25);
    expect(r.level).toBe(3);
    expect(r.globalPct).toBe(50);
  });

  it("fronteras 14/15 y 34/35 caen en el nivel correcto", () => {
    expect(computeResult(answersForTotal(14)).level).toBe(1);
    expect(computeResult(answersForTotal(15)).level).toBe(2);
    expect(computeResult(answersForTotal(34)).level).toBe(3);
    expect(computeResult(answersForTotal(35)).level).toBe(4);
  });
});

describe("computeResult - porcentajes por bloque (araña)", () => {
  it("promedio 1 => 100% en cada bloque", () => {
    const r = computeResult(answersAll(1));
    expect(r.blocks).toHaveLength(5);
    for (const b of r.blocks) expect(b.pct).toBe(100);
  });

  it("promedio 4 => 0% en cada bloque", () => {
    const r = computeResult(answersAll(4));
    for (const b of r.blocks) expect(b.pct).toBe(0);
  });

  it("bloque de 3 preguntas (b3) promedia correctamente", () => {
    // b3 = q5,q6,q7. Mezcla 2,3,4 => avg 3 => pct = (4-3)/3*100 = 33.3
    const a = answersAll(1);
    a["q5"] = 2;
    a["q6"] = 3;
    a["q7"] = 4;
    const r = computeResult(a);
    const b3 = r.blocks.find((b) => b.blockId === "b3")!;
    expect(b3.avg).toBe(3);
    expect(b3.pct).toBe(33.3);
  });

  it("bloque de 1 pregunta (b4) refleja su única respuesta", () => {
    const a = answersAll(1);
    a["q8"] = 4; // b4 = q8
    const r = computeResult(a);
    const b4 = r.blocks.find((b) => b.blockId === "b4")!;
    expect(b4.avg).toBe(4);
    expect(b4.pct).toBe(0);
  });
});

describe("validateAnswers", () => {
  it("falla si falta una respuesta", () => {
    const a = answersAll(2);
    delete a["q7"];
    expect(() => validateAnswers(a)).toThrow(/q7/);
  });

  it("falla si una respuesta está fuera de 1..4", () => {
    const a = answersAll(2);
    a["q3"] = 5;
    expect(() => validateAnswers(a)).toThrow(/q3/);
  });

  it("falla si una respuesta no es entero", () => {
    const a = answersAll(2);
    a["q3"] = 2.5;
    expect(() => validateAnswers(a)).toThrow(/q3/);
  });
});
