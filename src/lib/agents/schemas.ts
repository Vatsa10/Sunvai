/**
 * Agent contracts. Every LLM call in this codebase returns one of these, schema-validated at
 * the boundary. An agent whose output does not parse is a failure, not a value to work around.
 */

import { z } from 'zod';

export const LangSchema = z.enum(['hi', 'en', 'bn', 'ta', 'te', 'mr']);
export type Lang = z.infer<typeof LangSchema>;

export const IntakeFactsSchema = z.object({
  what_happened: z.string().optional(),
  when: z.string().optional(),
  where: z.string().optional(),
  who_involved: z.string().optional(), // an office or a role. Never a named individual.
  already_tried: z.string().optional(),
  outcome_sought: z.string().optional(),
  reference_numbers: z.array(z.string()).optional(),
});
export type IntakeFacts = z.infer<typeof IntakeFactsSchema>;

export const AuditVerdictSchema = z.enum([
  'resolved',
  'partial',
  'deflected',
  'boilerplate',
  'non_responsive',
  'undetermined',
]);
export type AuditVerdict = z.infer<typeof AuditVerdictSchema>;

export const AuditResultSchema = z
  .object({
    verdict: AuditVerdictSchema,
    confidence: z.number().min(0).max(1),
    reasoning: z.string().min(10).max(600),
    citations: z.array(z.object({ quote: z.string().min(3) })),
    unaddressed: z.array(z.string()),
    injection_suspected: z.boolean(),
  })
  .refine(
    (v) => v.verdict === 'undetermined' || v.citations.length >= 1,
    'every verdict except undetermined must cite at least one verbatim span',
  );
export type AuditResult = z.infer<typeof AuditResultSchema>;

export const RouteResultSchema = z.object({
  departmentId: z.string(),
  officeId: z.string().nullable(),
  reasoning: z.string().max(200),
  confidence: z.number().min(0).max(1),
  alternatives: z
    .array(
      z.object({
        departmentId: z.string(),
        officeId: z.string().nullable(),
        why: z.string().max(160),
      }),
    )
    .max(3),
  jurisdiction_note: z.string().max(240).optional(),
});
export type RouteResult = z.infer<typeof RouteResultSchema>;

export const IntakeResultSchema = z.object({
  narrative: z.string().min(1),
  facts: IntakeFactsSchema,
  missing: z.array(z.string()),
  nextQuestion: z.string().max(200).nullable(),
  readyToRoute: z.boolean(),
});
export type IntakeResult = z.infer<typeof IntakeResultSchema>;

export const DraftResultSchema = z.object({
  formalText: z.string().min(50),
  citizenLangText: z.string().min(50),
  subject: z.string().max(120),
});
export type DraftResult = z.infer<typeof DraftResultSchema>;

export const AppealResultSchema = z.object({
  formalText: z.string().min(50),
  citizenLangText: z.string().min(50),
  grounds: z.array(z.string()).min(1), // never a generic appeal
});
export type AppealResult = z.infer<typeof AppealResultSchema>;

export const DocumentResultSchema = z
  .object({
    readable: z.boolean(),
    kind: z.string().nullable(),
    extracted: z.record(z.string()),
    missingRegions: z.array(z.string()),
    retakeInstruction: z.string().nullable(),
  })
  .refine((v) => v.readable || v.retakeInstruction, 'unreadable requires a retake instruction');
export type DocumentResult = z.infer<typeof DocumentResultSchema>;
