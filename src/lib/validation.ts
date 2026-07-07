import { z } from "zod";
import { QUESTION_IDS } from "./questionnaire";

const answerValue = z.number().int().min(1).max(4);

// { q1: 1..4, ..., q10: 1..4 } con exactamente las 10 claves esperadas.
const answersSchema = z
  .object(
    Object.fromEntries(QUESTION_IDS.map((id) => [id, answerValue])) as Record<
      string,
      typeof answerValue
    >,
  )
  .strict();

export const submissionSchema = z.object({
  orgName: z.string().trim().min(1, "El nombre de la organización es obligatorio.").max(300),
  yearsFounded: z
    .number({ invalid_type_error: "Los años de constitución deben ser un número." })
    .int()
    .min(0)
    .max(300),
  hasDonataria: z.boolean(),
  respondentRole: z
    .string()
    .trim()
    .min(1, "El puesto de quien contesta es obligatorio.")
    .max(200),
  answers: answersSchema,
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const enrollSchema = z.object({
  contactName: z.string().trim().min(1, "El nombre de contacto es obligatorio.").max(200),
  contactEmail: z.string().trim().email("Correo electrónico inválido.").max(200),
  contactPhone: z.string().trim().max(50).optional().or(z.literal("")),
});

export type EnrollInput = z.infer<typeof enrollSchema>;
