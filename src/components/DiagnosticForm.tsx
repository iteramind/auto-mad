"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Block, Question, Option } from "@/lib/questionnaire";

interface Props {
  blocks: Block[];
  questions: Question[];
}

interface Intake {
  contactName: string;
  respondentRole: string;
  contactEmail: string;
  contactPhone: string;
  orgName: string;
  yearsFounded: string;
  hasDonataria: "" | "si" | "no";
}

// Barajado determinista (estable entre servidor y cliente) para no presentar
// siempre la opción "más madura" en primer lugar.
function stableShuffle(options: Option[], seed: string): Option[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    const j = Math.abs(h) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DiagnosticForm({ blocks, questions }: Props) {
  const router = useRouter();
  const totalSteps = questions.length + 1; // intake + preguntas

  const [step, setStep] = useState(0); // 0 = intro
  const [intake, setIntake] = useState<Intake>({
    contactName: "",
    respondentRole: "",
    contactEmail: "",
    contactPhone: "",
    orgName: "",
    yearsFounded: "",
    hasDonataria: "",
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const shuffled = useMemo(() => {
    const map: Record<string, Option[]> = {};
    for (const q of questions) map[q.id] = stableShuffle(q.options, q.id);
    return map;
  }, [questions]);

  const blockName = (blockId: string) =>
    blocks.find((b) => b.id === blockId)?.name ?? "";

  // step 1 = intake; step 2..(N+1) = preguntas
  const isIntro = step === 0;
  const isIntake = step === 1;
  const questionIndex = step - 2;
  const currentQuestion = questionIndex >= 0 ? questions[questionIndex] : null;

  const progressPct =
    step === 0 ? 0 : Math.round(((step - 1) / totalSteps) * 100);

  function validateIntake(): boolean {
    // Datos de contacto
    if (!intake.contactName.trim())
      return err("Ingresa el nombre de contacto.");
    if (!intake.respondentRole.trim())
      return err("Ingresa el puesto de quien contesta.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(intake.contactEmail.trim()))
      return err("Ingresa un correo electrónico válido.");
    if (!intake.contactPhone.trim())
      return err("Ingresa un teléfono de contacto.");
    // Datos de la organización
    if (!intake.orgName.trim()) return err("Ingresa el nombre de la organización.");
    const years = Number(intake.yearsFounded);
    if (intake.yearsFounded === "" || Number.isNaN(years) || years < 0)
      return err("Ingresa un número válido de años de constitución.");
    if (!Number.isInteger(years))
      return err("Los años de constitución deben ser un número entero.");
    if (years > 300)
      return err(
        "Ingresa la antigüedad en años (no el año de fundación). Por ejemplo, 5.",
      );
    if (intake.hasDonataria === "")
      return err("Indica si cuenta con donataria autorizada.");
    setError(null);
    return true;
  }

  function err(msg: string): boolean {
    setError(msg);
    return false;
  }

  function next() {
    setError(null);
    if (isIntake && !validateIntake()) return;
    if (currentQuestion && answers[currentQuestion.id] === undefined) {
      setError("Selecciona una opción para continuar.");
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function selectOption(qid: string, score: number) {
    setError(null);
    setAnswers((a) => ({ ...a, [qid]: score }));
  }

  async function submit() {
    setError(null);
    // Verifica que todas las preguntas estén contestadas.
    const missing = questions.find((q) => answers[q.id] === undefined);
    if (missing) {
      setError("Faltan preguntas por contestar.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: intake.orgName.trim(),
          yearsFounded: Number(intake.yearsFounded),
          hasDonataria: intake.hasDonataria === "si",
          respondentRole: intake.respondentRole.trim(),
          contactName: intake.contactName.trim(),
          contactEmail: intake.contactEmail.trim(),
          contactPhone: intake.contactPhone.trim(),
          answers,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const fieldErrors: string[] = Object.values(
          data.issues?.fieldErrors ?? {},
        )
          .flat()
          .filter((m): m is string => typeof m === "string");
        const detail = fieldErrors.length ? ` ${fieldErrors.join(" ")}` : "";
        throw new Error(
          (data.error ?? "No se pudo enviar el diagnóstico.") + detail,
        );
      }
      const { id } = await res.json();
      router.push(`/reporte/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar.");
      setSubmitting(false);
    }
  }

  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined,
  ).length;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      {/* Barra de progreso */}
      {!isIntro && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
            <span>{isIntake ? "Datos de contacto y organización" : `Pregunta ${questionIndex + 1} de ${questions.length}`}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {isIntro && (
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Fortalecimiento Institucional
          </p>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Autodiagnóstico de Madurez Institucional
          </h1>
          <p className="text-gray-600">
            Esta herramienta ayuda a tu organización de la sociedad civil a
            conocer su nivel de madurez institucional en 5 áreas clave y a
            identificar el programa de acompañamiento más adecuado para su
            siguiente etapa.
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 10 preguntas · aproximadamente 5–8 minutos.</li>
            <li>• No requiere usuario ni contraseña.</li>
            <li>• Al terminar recibirás un reporte con tu resultado y recomendación.</li>
          </ul>
          <button
            onClick={() => setStep(1)}
            className="w-full rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 sm:w-auto"
          >
            Comenzar diagnóstico
          </button>
        </div>
      )}

      {isIntake && (
        <div className="space-y-8">
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Datos de contacto
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Con estos datos la Fundación del Empresariado Coahuilense podrá
                compartirte las convocatorias y becas disponibles.
              </p>
            </div>
            <Field label="Nombre de contacto">
              <input
                type="text"
                value={intake.contactName}
                onChange={(e) =>
                  setIntake({ ...intake, contactName: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Nombre de quien contesta"
              />
            </Field>
            <Field label="Puesto de quien contesta">
              <input
                type="text"
                value={intake.respondentRole}
                onChange={(e) =>
                  setIntake({ ...intake, respondentRole: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Ej. Dirección, Coordinación, Administración"
              />
            </Field>
            <Field label="Correo electrónico">
              <input
                type="email"
                value={intake.contactEmail}
                onChange={(e) =>
                  setIntake({ ...intake, contactEmail: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="nombre@organizacion.org"
              />
            </Field>
            <Field label="Teléfono">
              <input
                type="tel"
                value={intake.contactPhone}
                onChange={(e) =>
                  setIntake({ ...intake, contactPhone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Ej. 844 123 4567"
              />
            </Field>
          </div>

          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900">
              Datos de la organización
            </h2>
            <Field label="Nombre de la organización">
              <input
                type="text"
                value={intake.orgName}
                onChange={(e) =>
                  setIntake({ ...intake, orgName: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Nombre legal o comercial"
              />
            </Field>
            <Field label="Antigüedad de la organización (años desde su constitución)">
              <input
                type="number"
                min={0}
                max={300}
                step={1}
                value={intake.yearsFounded}
                onChange={(e) =>
                  setIntake({ ...intake, yearsFounded: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Ej. 5 (no el año de fundación)"
              />
            </Field>
            <Field label="¿Cuenta con donataria autorizada?">
              <div className="flex gap-3">
                {(["si", "no"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setIntake({ ...intake, hasDonataria: v })}
                    className={`flex-1 rounded-lg border px-4 py-2 font-medium capitalize transition ${
                      intake.hasDonataria === v
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {v === "si" ? "Sí" : "No"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>
      )}

      {currentQuestion && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {blockName(currentQuestion.blockId)}
          </p>
          <h2 className="text-lg font-bold text-gray-900">
            {currentQuestion.title}
          </h2>
          <p className="text-sm text-gray-500">
            Elige la afirmación que mejor describe a tu organización.
          </p>
          <div className="space-y-3">
            {shuffled[currentQuestion.id].map((opt) => {
              const selected = answers[currentQuestion.id] === opt.score;
              return (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => selectOption(currentQuestion.id, opt.score)}
                  className={`w-full rounded-xl border p-4 text-left text-sm transition ${
                    selected
                      ? "border-brand-600 bg-brand-50 ring-1 ring-brand-200"
                      : "border-gray-200 hover:border-brand-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border ${
                        selected
                          ? "border-brand-600 bg-brand-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <span className="text-gray-700">{opt.text}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Navegación */}
      {!isIntro && (
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Atrás
          </button>
          {step < totalSteps ? (
            <button
              onClick={next}
              className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting || answeredCount < questions.length}
              className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Ver mi resultado"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
